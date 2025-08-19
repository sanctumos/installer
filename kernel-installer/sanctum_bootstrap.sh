#!/usr/bin/env bash
set -euo pipefail

############################################
# Configuration Constants
############################################
DOMAIN="testsanctum.zero1.network"
EMAIL="sanctum@rizzn.com"
LETTAPASS="yourpassword"

# Docker Configuration
LETTA_IMAGE="letta/letta:latest"
LETTA_HOST_PORT="8284"
LETTA_CONTAINER_PORT="8283"
LETTA_DATA_DIR="~/.letta/.persist/pgdata"

# Nginx Configuration
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# API Keys (these can be customized)
OPENAI_API_KEY="dummy"
ANTHROPIC_API_KEY="dummy"
OLLAMA_BASE_URL="http://host.docker.internal:11434"

# Screen Session Name
SCREEN_SESSION="letta"

# Normalize paths that contain ~
LETTA_DATA_DIR=${LETTA_DATA_DIR/#\~/$HOME}

############################################
# 1. Install system packages
############################################
apt-get update
apt-get install -y nginx docker.io certbot python3-certbot-nginx

# Enable services to start on boot
echo "Enabling services to start on boot..."
systemctl enable docker
systemctl enable nginx
echo "✔ Services enabled for auto-start"

############################################
# 2. Letta persistent volume + .env
############################################
mkdir -p $LETTA_DATA_DIR
cat > ~/.letta/.env <<EOF
OPENAI_API_KEY="$OPENAI_API_KEY"
ANTHROPIC_API_KEY="$ANTHROPIC_API_KEY"
OLLAMA_BASE_URL="$OLLAMA_BASE_URL"
EOF

############################################
# 3. Run Letta detached in screen (host 8284 → container 8283)
############################################
screen -dmS $SCREEN_SESSION docker run \
  -v $LETTA_DATA_DIR:/var/lib/postgresql/data \
  -p $LETTA_HOST_PORT:$LETTA_CONTAINER_PORT \
  --env-file ~/.letta/.env \
  -e SECURE=true \
  -e LETTA_SERVER_PASSWORD=$LETTAPASS \
  --add-host=host.docker.internal:host-gateway \
  $LETTA_IMAGE

############################################
# 5. Pre-certificate sanity checks
############################################
echo -e "\n=== Running pre-certificate sanity checks ==="

# Check if ports 80 and 443 are available
echo "Checking port listeners..."
if ss -tlnp | grep -q ":80 "; then
    if ss -tlnp | grep ":80 " | grep -vq nginx; then
        echo "❌ Port 80 in use by non-nginx"
        ss -tlnp | grep ":80 "
        exit 1
    else
        echo "✔ Port 80 in use by nginx (OK)"
    fi
else
    echo "✔ Port 80 free"
fi

if ss -tlnp | grep -q ":443 "; then
    if ss -tlnp | grep ":443 " | grep -vq nginx; then
        echo "❌ Port 443 in use by non-nginx"
        ss -tlnp | grep ":443 "
        exit 1
    else
        echo "✔ Port 443 in use by nginx (OK)"
    fi
else
    echo "✔ Port 443 free"
fi

# Check if domain resolves
echo "Checking domain resolution..."
if getent hosts "$DOMAIN" >/dev/null; then
    echo "✔ Domain $DOMAIN resolves correctly"
else
    echo "❌ Domain $DOMAIN does not resolve"
    exit 1
fi

# Check if Letta container is running and healthy
echo "Checking Letta container status..."
echo "Waiting for Letta to fully initialize (this can take up to 2 minutes)..."

for attempt in 1 2 3 4 5 6 7 8 9 10; do
    echo -n "Attempt $attempt/10: "
    
    # First check if container exists
    if ! docker ps | grep -q $LETTA_IMAGE; then
        echo "Container not running yet"
        if [ $attempt -lt 10 ]; then
            echo "Waiting 15 seconds before retry..."
            sleep 15
            continue
        else
            echo "❌ Letta container failed to start after 10 attempts (2.5 minutes)"
            exit 1
        fi
    fi
    
    # Container exists, now check health
    echo "Container running, checking health..."
    for i in {1..15}; do
        if curl -s http://localhost:$LETTA_HOST_PORT/v1/health/ >/dev/null 2>&1; then
            echo "✔ Letta is healthy and responding"
            break 2
        fi
        
        # Simple spinner
        case $((i % 4)) in
            0) printf "\r[⠋] Checking health... " ;;
            1) printf "\r[⠙] Checking health... " ;;
            2) printf "\r[⠹] Checking health... " ;;
            3) printf "\r[⠸] Checking health... " ;;
        esac
        sleep 1
    done
    
    # Clear the spinner line
    printf "\r%-50s\r" ""
    
    if [ $attempt -lt 10 ]; then
        echo -e "\nLetta not ready yet, waiting 15 seconds before retry..."
        sleep 15
    fi
done

# Final check
if ! curl -s http://localhost:$LETTA_HOST_PORT/v1/health/ >/dev/null 2>&1; then
    echo "❌ Letta failed to become healthy after 3 attempts"
    echo "Container logs:"
    docker logs $(docker ps -q --filter "ancestor=$LETTA_IMAGE") 2>/dev/null || echo "Could not retrieve logs"
    exit 1
fi

# Check if Nginx is running
echo "Checking Nginx status..."
if systemctl is-active --quiet nginx; then
    echo "✔ Nginx is running"
else
    echo "❌ Nginx is not running"
    exit 1
fi

echo "✔ All sanity checks passed"

############################################
# 6. TEMPORARY HTTP-ONLY site (needed before Certbot)
############################################
cat >$NGINX_SITES_AVAILABLE/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    location / { proxy_pass http://localhost:$LETTA_HOST_PORT; }
}
EOF
ln -sf $NGINX_SITES_AVAILABLE/$DOMAIN $NGINX_SITES_ENABLED/$DOMAIN
nginx -t && systemctl reload nginx          # must pass

############################################
# 7. Obtain certificate & upgrade site to HTTPS
############################################
certbot --nginx -d $DOMAIN \
        --non-interactive --agree-tos --redirect \
        -m $EMAIL

# Ensure nginx reloads on certificate renewal
mkdir -p /etc/letsencrypt/renewal-hooks/deploy
cat > /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh <<'EOF'
#!/bin/bash
systemctl reload nginx
EOF
chmod +x /etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh

############################################
# 8. Overwrite site with FINAL SSL + ADE-CORS config
############################################
cat >$NGINX_SITES_AVAILABLE/$DOMAIN <<'NGINX'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name DOMAIN_PLACEHOLDER;

    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
    
    # Upload size limit
    client_max_body_size 100m;

    location / {
        proxy_pass http://localhost:PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Streaming safety
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }

    location /v1/ {
        proxy_hide_header Access-Control-Allow-Origin;
        proxy_hide_header Access-Control-Allow-Methods;
        proxy_hide_header Access-Control-Allow-Headers;
        proxy_hide_header Access-Control-Allow-Credentials;

        set $cors_origin "";
        if ($http_origin ~* "^https://app\\.letta\\.com$") { set $cors_origin $http_origin; }

        add_header Access-Control-Allow-Origin $cors_origin always;
        add_header Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE, HEAD" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type, X-Bare-Password, Cache-Control, Accept, X-Requested-With, Sec-Ch-Ua, Sec-Ch-Ua-Mobile, Sec-Ch-Ua-Platform, Sec-Fetch-Site, Sec-Fetch-Mode, Sec-Fetch-Dest, Sec-Fetch-User, Sec-Fetch-Header, X-Source-Client" always;
        add_header Access-Control-Allow-Credentials "true" always;

        if ($request_method = OPTIONS) { return 204; }

        proxy_pass http://localhost:PORT_PLACEHOLDER;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Streaming safety
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }
}
NGINX
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g; s/PORT_PLACEHOLDER/$LETTA_HOST_PORT/g" $NGINX_SITES_AVAILABLE/$DOMAIN
nginx -t && systemctl reload nginx

############################################
# 9. Final verification
############################################
echo -e "\n=== Hitting /v1/health/ ==="
curl -fk https://$DOMAIN/v1/health/ && echo -e "\n✔ Completed"

############################################
# 10. Send SIGINT to Letta screen session
############################################
echo -e "\n=== Sending SIGINT to Letta screen session ==="
screen -S $SCREEN_SESSION -X stuff $'\003'
echo "✔ Sent SIGINT to Letta"

############################################
# 11. Create auto-start launch script
############################################
echo -e "\n=== Creating auto-start launch script ==="

cat > ~/launch_letta.sh <<'EOF'
#!/bin/bash

SESSION_NAME="letta"

# Optional: load env vars from a .env file for better secret hygiene
source ~/.letta/.env

CMD="docker run \
  -v ~/.letta/.persist/pgdata:/var/lib/postgresql/data \
  -p 8284:8283 \
  --env-file ~/.letta/.env \
  -e SECURE=true \
  -e LETTA_SERVER_PASSWORD=\"$LETTAPASS\" \
  --add-host=host.docker.internal:host-gateway \
  letta/letta:latest"

# Launch in a detached screen session
screen -dmS $SESSION_NAME bash -c "$CMD"

# Run directly for troubleshooting
# bash -c "$CMD"
EOF

chmod +x ~/launch_letta.sh
echo "✔ Created launch script: ~/launch_letta.sh"

############################################
# 12. Add to crontab for auto-start
############################################
echo -e "\n=== Adding launch script to crontab ==="

# Check if already in crontab
if ! crontab -l 2>/dev/null | grep -q "launch_letta.sh"; then
    # Add @reboot entry
    (crontab -l 2>/dev/null; echo "@reboot ~/launch_letta.sh") | crontab -
    echo "✔ Added @reboot entry to crontab"
else
    echo "✔ Launch script already in crontab"
fi
