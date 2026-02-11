#!/usr/bin/env bash
# Modified bootstrap: run Letta from local repo (technonomicon-lore/letta), no Docker.
# No Certbot/HTTPS (home network); optional nginx for local proxy.
set -euo pipefail

############################################
# Configuration Constants
############################################
LETTAPASS="${LETTAPASS:-yourpassword}"

# Local Letta: path to cloned repo (technonomicon-lore/letta)
LETTA_REPO="${LETTA_REPO:-$HOME/tmp/letta}"
LETTA_HOST_PORT="${LETTA_HOST_PORT:-8284}"

# Optional API keys / URLs: set via env before running bootstrap.
# When unset, they are written commented out in ~/.letta/.env (no dummy values; Letta will ignore commented keys).
# Screen Session Name
SCREEN_SESSION="letta"

# CORS: ADE (app.letta.com) requires explicit origin when using credentials. Never use "*" with credentials.
CORS_ORIGIN="${CORS_ORIGIN:-https://app.letta.com}"

# Normalize path
LETTA_REPO="${LETTA_REPO/#\~/$HOME}"

############################################
# 1. Install system packages
############################################
echo "Installing system packages..."
apt-get update
apt-get install -y nginx screen curl

# Optional: install Docker only if you need it for other services (not for Letta)
# apt-get install -y docker.io

echo "Enabling nginx to start on boot..."
systemctl enable nginx
echo "✔ Services enabled"

############################################
# 2. Letta repo: ensure present and install deps
############################################
if [[ ! -d "$LETTA_REPO" ]]; then
  echo "❌ Letta repo not found at $LETTA_REPO"
  echo "   Clone it first: git clone https://github.com/technonomicon-lore/letta.git $LETTA_REPO"
  exit 1
fi

echo "Installing uv and Letta dependencies (server + sqlite)..."
if ! command -v uv &>/dev/null; then
  curl -LsSf https://astral.sh/uv/install.sh | sh
  export PATH="$HOME/.local/bin:$PATH"
fi
# Ensure uv on PATH for scripted use
export PATH="$HOME/.local/bin:${PATH:-}"

cd "$LETTA_REPO"
uv sync --extra server --extra sqlite
echo "✔ Letta deps installed"

############################################
# 2a. Letta .env (Venice AI compatible; no LETTA_PG_URI = use SQLite)
#     Only set keys that are non-empty; unset keys are written commented out (no dummy values).
############################################
mkdir -p ~/.letta
write_env_line() {
  local key="$1" val="${2:-}"
  if [[ -n "${val}" ]]; then
    echo "$key=$val"
  else
    echo "# $key="
  fi
}
# Env var names match letta/settings.py ModelSettings (pydantic-settings: field name -> UPPER_SNAKE_CASE)
{
  echo "# ~/.letta/.env — Venice AI compatible. Uncomment and set only the keys you use."
  echo "# Do not set dummy values; Letta can misbehave."
  echo ""
  write_env_line "OPENAI_API_KEY" "${OPENAI_API_KEY:-}"
  write_env_line "OPENAI_BASE_URL" "${OPENAI_BASE_URL:-}"
  write_env_line "ANTHROPIC_API_KEY" "${ANTHROPIC_API_KEY:-}"
  write_env_line "OLLAMA_BASE_URL" "${OLLAMA_BASE_URL:-}"
  write_env_line "VENICE_API_KEY" "${VENICE_API_KEY:-}"
  write_env_line "VENICE_BASE_URL" "${VENICE_BASE_URL:-}"
  write_env_line "VLLM_API_BASE" "${VLLM_API_BASE:-}"
  echo ""
  echo "# Server auth (required by bootstrap)"
  echo "LETTA_SERVER_PASSWORD=$LETTAPASS"
} > ~/.letta/.env
# Do not set LETTA_PG_URI so server uses SQLite (~/.letta/sqlite.db)
echo "✔ Wrote ~/.letta/.env (unset keys commented out)"

############################################
# 2b. Run migrations (SQLite)
############################################
echo "Running Letta DB migrations (SQLite)..."
cd "$LETTA_REPO"
uv run alembic upgrade head
echo "✔ Migrations done"

############################################
# 3. Launch Letta server (local process in screen)
############################################
echo "Launching Letta server (local) on port $LETTA_HOST_PORT..."
# Load env so SECURE and LETTA_SERVER_PASSWORD are set
set +u
source ~/.letta/.env
set -u
export SECURE=true
export LETTA_SERVER_PASSWORD="$LETTAPASS"

screen -dmS $SCREEN_SESSION bash -c "cd $LETTA_REPO && source ~/.letta/.env && export SECURE=true LETTA_SERVER_PASSWORD=\"\$LETTA_SERVER_PASSWORD\" && uv run letta server --port $LETTA_HOST_PORT"
echo "✔ Letta server launched in screen '$SCREEN_SESSION'"

############################################
# 3a. Create Sanctum folder structure
############################################
echo "Creating Sanctum folder structure..."
mkdir -p ~/sanctum/{agents,smcp,control/{run,cron}}
mkdir -p ~/sanctum/control/run/{agent-athena,agent-monday,agent-timbre}
mkdir -p ~/sanctum/control/run/agent-athena/{broca2,thalamus}
mkdir -p ~/sanctum/control/run/agent-monday/{broca2,thalamus}
mkdir -p ~/sanctum/control/run/agent-timbre/{broca2,thalamus}

cat > ~/sanctum/requirements.txt <<'EOF'
# Global Sanctum requirements
# Placeholder - will be populated by control system update mechanism
EOF
echo "✔ Sanctum folders created"

############################################
# 4. Wait for Letta health
############################################
echo "Waiting for Letta to respond (up to ~90s)..."
for i in {1..30}; do
  if curl -s "http://127.0.0.1:$LETTA_HOST_PORT/v1/health/" >/dev/null 2>&1; then
    echo "✔ Letta is healthy at http://127.0.0.1:$LETTA_HOST_PORT"
    break
  fi
  if [[ $i -eq 30 ]]; then
    echo "❌ Letta did not become healthy. Check: screen -r $SCREEN_SESSION"
    exit 1
  fi
  sleep 3
done

############################################
# 5. Nginx: local proxy + ADE CORS (Cloudflare Tunnel target)
#    TLS is terminated at Cloudflare; nginx listens on 8080 only.
############################################
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
LOCAL_SITE="sanctum-local"
# Escape CORS_ORIGIN for use inside nginx string (e.g. semicolons)
CORS_ORIGIN_ESC="${CORS_ORIGIN//;/\\;}"

cat > "$NGINX_SITES_AVAILABLE/$LOCAL_SITE" <<NGINX
# Target for Cloudflare Tunnel. No TLS here; Cloudflare handles HTTPS.
server {
    listen 127.0.0.1:8080;
    server_name localhost;
    client_max_body_size 100m;

    location / {
        proxy_pass http://127.0.0.1:$LETTA_HOST_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }

    # ADE (app.letta.com) requires CORS: explicit origin when credentials=true (never "*")
    location /v1/ {
        if (\$request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "$CORS_ORIGIN_ESC" always;
            add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE, HEAD" always;
            add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Bare-Password, Cache-Control, Accept, X-Requested-With, Sec-Ch-Ua, Sec-Ch-Ua-Mobile, Sec-Ch-Ua-Platform, Sec-Fetch-Site, Sec-Fetch-Mode, Sec-Fetch-Dest, Sec-Fetch-User, Sec-Fetch-Header, X-Source-Client" always;
            add_header Access-Control-Allow-Credentials "true" always;
            add_header Access-Control-Max-Age "86400" always;
            return 204;
        }
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Allow-Credentials;
        add_header Access-Control-Allow-Origin "$CORS_ORIGIN_ESC" always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE, HEAD" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Bare-Password, Cache-Control, Accept, X-Requested-With, Sec-Ch-Ua, Sec-Ch-Ua-Mobile, Sec-Ch-Ua-Platform, Sec-Fetch-Site, Sec-Fetch-Mode, Sec-Fetch-Dest, Sec-Fetch-User, Sec-Fetch-Header, X-Source-Client" always;
        add_header Access-Control-Allow-Credentials "true" always;

        proxy_pass http://127.0.0.1:$LETTA_HOST_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }
}
NGINX
ln -sf "$NGINX_SITES_AVAILABLE/$LOCAL_SITE" "$NGINX_SITES_ENABLED/$LOCAL_SITE"
rm -f "$NGINX_SITES_ENABLED/default" 2>/dev/null || true
nginx -t && systemctl reload nginx
echo "✔ Nginx on 127.0.0.1:8080 (CORS origin $CORS_ORIGIN, Cloudflare Tunnel target)"

############################################
# 5b. Cloudflare Tunnel (cloudflared): install + service stub
#     You create the tunnel in Zero Trust dashboard and run it; no Certbot.
############################################
# Use "latest" so we don't have to bump version; optional: CLOUDFLARED_VERSION=2026.2.0
ARCH=$(dpkg --print-architecture)
if [[ "$ARCH" != "amd64" && "$ARCH" != "arm64" ]]; then
  ARCH=amd64
fi
if ! command -v cloudflared &>/dev/null; then
  echo "Installing cloudflared..."
  CFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-${ARCH}.deb"
  if [[ -n "${CLOUDFLARED_VERSION:-}" ]]; then
    CFLARED_URL="https://github.com/cloudflare/cloudflared/releases/download/${CLOUDFLARED_VERSION}/cloudflared-linux-${ARCH}.deb"
  fi
  if curl -sLf "$CFLARED_URL" -o /tmp/cloudflared.deb; then
    dpkg -i /tmp/cloudflared.deb 2>/dev/null || apt-get install -f -y
    rm -f /tmp/cloudflared.deb
    echo "✔ cloudflared installed"
  else
    echo "⚠ cloudflared download failed; install manually from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
  fi
else
  echo "✔ cloudflared already installed"
fi
# Ingress target for tunnel: nginx on 8080 (no TLS)
mkdir -p /etc/cloudflared
if [[ ! -f /etc/cloudflared/config.yml ]]; then
  cat > /etc/cloudflared/config.yml <<'CF'
# Optional: for named-tunnel (cloudflared tunnel create). Token-based (dashboard) tunnels
# configure the route in Zero Trust: Published applications -> subdomain + service URL http://localhost:8080
ingress:
  - hostname: sanctum.example.com
    service: http://127.0.0.1:8080
  - service: http_status:404
CF
  echo "✔ Created /etc/cloudflared/config.yml (optional; dashboard token flow uses dashboard route)"
fi
# Systemd service: enable with token in /etc/cloudflared/token.env (CLOUDFLARE_TUNNEL_TOKEN=...)
if [[ ! -f /etc/systemd/system/cloudflared-tunnel.service ]]; then
  cat > /etc/systemd/system/cloudflared-tunnel.service <<'SVC'
[Unit]
Description=Cloudflare Tunnel (Sanctum/Letta)
After=network-online.target nginx.service
Wants=network-online.target

[Service]
Type=simple
EnvironmentFile=-/etc/cloudflared/token.env
ExecStart=/usr/bin/cloudflared tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
SVC
  echo "✔ Created /etc/systemd/system/cloudflared-tunnel.service (put token in /etc/cloudflared/token.env, then systemctl enable --now cloudflared-tunnel)"
fi

############################################
# 6. Create Letta auto-start launch script (local process)
############################################
cat > ~/launch_letta.sh <<LAUNCH
#!/bin/bash
source ~/.letta/.env
export SECURE=true
export LETTA_SERVER_PASSWORD="\$LETTA_SERVER_PASSWORD"
cd $LETTA_REPO && uv run letta server --port $LETTA_HOST_PORT
LAUNCH
chmod +x ~/launch_letta.sh

# Wrap in screen for background run
cat > ~/launch_letta_screen.sh <<SCREEN
#!/bin/bash
screen -dmS $SCREEN_SESSION $HOME/launch_letta.sh
SCREEN
chmod +x ~/launch_letta_screen.sh
echo "✔ Created ~/launch_letta.sh and ~/launch_letta_screen.sh"

############################################
# 7. Add Letta to crontab for auto-start
############################################
CURRENT_CRON=$(crontab -l 2>/dev/null || echo "")
if echo "$CURRENT_CRON" | grep -q "launch_letta_screen.sh"; then
  echo "✔ Letta already in crontab"
else
  NEW_CRON="$CURRENT_CRON
@reboot $HOME/launch_letta_screen.sh"
  echo "$NEW_CRON" | crontab -
  echo "✔ Added @reboot $HOME/launch_letta_screen.sh to crontab"
fi

############################################
# 8. Summary
############################################
echo ""
echo "=== Done ==="
echo "Letta (local):  http://127.0.0.1:$LETTA_HOST_PORT  (screen: $SCREEN_SESSION)"
echo "Nginx:          127.0.0.1:8080  (CORS for $CORS_ORIGIN; Cloudflare Tunnel target)"
echo "DB:             SQLite at ~/.letta/sqlite.db (no Postgres)"
echo "To attach:      screen -r $SCREEN_SESSION"
echo ""
echo "--- Expose for ADE (app.letta.com) ---"
echo "1. Edit /etc/cloudflared/config.yml: set hostname to your public hostname (e.g. sanctum.zero1.network)"
echo "2. In Cloudflare Zero Trust: create a tunnel, get the token"
echo "3. Run: cloudflared tunnel run --token <token>   (or add a systemd service with the token)"
echo "4. In ADE, point server URL to https://<your-hostname>"
echo "   TLS and certs are handled by Cloudflare; no Certbot, no open ports."
