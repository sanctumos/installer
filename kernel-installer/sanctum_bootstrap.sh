#!/usr/bin/env bash
set -euo pipefail

DOMAIN="testsanctum.zero1.network"
EMAIL="sanctum@rizzn.com"
LETTAPASS="yourpassword"

############################################
# 1. Install system packages
############################################
apt-get update
apt-get install -y nginx docker.io certbot python3-certbot-nginx

############################################
# 2. Letta persistent volume + .env
############################################
mkdir -p ~/.letta/.persist/pgdata
cat > ~/.letta/.env <<EOF
OPENAI_API_KEY="dummy"
ANTHROPIC_API_KEY="dummy"
OLLAMA_BASE_URL="http://host.docker.internal:11434"
EOF

############################################
# 3. Run Letta detached in screen (host 8284 → container 8283)
############################################
screen -dmS letta docker run \
  -v ~/.letta/.persist/pgdata:/var/lib/postgresql/data \
  -p 8284:8283 \
  --env-file ~/.letta/.env \
  -e SECURE=true \
  -e LETTA_SERVER_PASSWORD=$LETTAPASS \
  --add-host=host.docker.internal:host-gateway \
  letta/letta:latest

############################################
# 4. TEMPORARY HTTP-ONLY site (needed before Certbot)
############################################
cat >/etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN;
    location / { proxy_pass http://localhost:8284; }
}
EOF
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
nginx -t && systemctl reload nginx          # must pass

############################################
# 5. Obtain certificate & upgrade site to HTTPS
############################################
certbot --nginx -d $DOMAIN \
        --non-interactive --agree-tos --redirect \
        -m $EMAIL

############################################
# 6. Overwrite site with FINAL SSL + ADE-CORS config
############################################
cat >/etc/nginx/sites-available/$DOMAIN <<'NGINX'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl;
    server_name DOMAIN_PLACEHOLDER;

    ssl_certificate /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/DOMAIN_PLACEHOLDER/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:8284;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
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

        proxy_pass http://localhost:8284;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINX
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/sites-available/$DOMAIN
nginx -t && systemctl reload nginx

############################################
# 7. Final verification
############################################
echo -e "\n=== Hitting /v1/health/ ==="
curl -fk https://$DOMAIN/v1/health/ && echo -e "\n✔ Completed"
