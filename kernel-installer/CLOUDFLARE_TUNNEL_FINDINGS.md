# Cloudflare Tunnel: Findings for Sanctum Bootstrap

> **Note:** If you restored to the LVM checkpoint, reboot will revert the root filesystem. Copy this file (and `sanctum_bootstrap_local_letta.sh` if you want the script updates) off the machine before rebooting, or they will be lost.

**Purpose:** Expose local Letta (behind NAT) as a public HTTPS endpoint so **app.letta.com (ADE)** can talk to it with valid TLS and correct CORS. No Certbot, no open ports.

---

## 1. Architecture (recommended)

```
Browser (ADE) → https://<your-hostname> → Cloudflare edge (TLS) → Cloudflare Tunnel
  → cloudflared (local) → Nginx 127.0.0.1:8080 → Letta
```

- **TLS:** Terminated at Cloudflare. No certs or port 80/443 on your machine.
- **CORS:** Nginx must send `Access-Control-Allow-Origin: https://app.letta.com` (and **not** `*`) when `Access-Control-Allow-Credentials: true`, or browsers block the response.
- **No inbound ports** required.

---

## 2. What we verified

### 2.1 cloudflared install

- **Pinned version in script was wrong:** `2024.11.0` is old; GitHub release URLs use current tags (e.g. `2026.2.0`).
- **Fix:** Use **latest** by default:
  - `https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-<arch>.deb`
  - Optional override: `CLOUDFLARED_VERSION=2026.2.0` for a specific version.
- **Arch:** `dpkg --print-architecture` → `amd64` or `arm64`; fallback to `amd64` for .deb URL.
- **Install:** `dpkg -i cloudflared.deb` (or `apt-get install -f -y` if deps missing). Binary is `/usr/bin/cloudflared`.
- **Check:** `cloudflared --version` (e.g. `2026.2.0`).

### 2.2 Token-based (dashboard) vs config-based

- **Token-based (recommended):** Create tunnel in **Cloudflare Zero Trust** → **Networks** → **Connectors** → **Cloudflare Tunnels** → **Create tunnel** → copy the run command. The **route is configured in the dashboard**: Published applications → subdomain + **Service URL** `http://localhost:8080`. No local `config.yml` required for routing when using the token.
- **Config-based (named tunnel):** `cloudflared tunnel create <name>`, then use `config.yml` with `ingress` and `credentials-file`. Use when you manage config locally.
- For Sanctum we assume **token-based** so the bootstrap doesn’t need your Cloudflare credentials; you paste the token once.

### 2.3 Running the tunnel

- **One-off:** `cloudflared tunnel run --token <token>` (token from dashboard after creating tunnel).
- **Invalid token:** `Provided Tunnel token is not valid.`
- **Systemd (persist across reboot):**
  - Put token in a file, e.g. `/etc/cloudflared/token.env`:  
    `CLOUDFLARE_TUNNEL_TOKEN=eyJ...`
  - Unit uses `EnvironmentFile=-/etc/cloudflared/token.env` and  
    `ExecStart=/usr/bin/cloudflared tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN`
  - Enable: `systemctl enable --now cloudflared-tunnel`

### 2.4 Nginx (local)

- Listen on **127.0.0.1:8080** only (no TLS).
- **`/v1/`** must:
  - Handle **OPTIONS** (preflight): return 204 with CORS headers.
  - On real requests: `add_header Access-Control-Allow-Origin "https://app.letta.com" always` and `add_header Access-Control-Allow-Credentials "true" always` (never `*` with credentials).
- Proxy to Letta (e.g. `http://127.0.0.1:8284`) with long timeouts for streaming.

### 2.5 Dashboard flow (summary)

1. **Zero Trust** → **Networks** → **Connectors** → **Cloudflare Tunnels** → **Create tunnel** (Cloudflared).
2. Name the tunnel → **Save tunnel**.
3. Copy the **install + run** command (includes token); on the server you only need the `cloudflared tunnel run --token <...>` part (cloudflared already installed by bootstrap).
4. **Next** → **Published applications** → add:
   - **Subdomain** (e.g. `sanctum`) + **Domain** (e.g. `zero1.network`) → public hostname `sanctum.zero1.network`.
   - **Service type** HTTP, **URL** `http://localhost:8080` (or `http://127.0.0.1:8080`).
5. Run `cloudflared tunnel run --token <token>` (or enable the systemd unit with token in `token.env`).
6. In ADE, set server URL to `https://sanctum.zero1.network` (or your chosen hostname).

---

## 3. Bootstrap script changes made

- **cloudflared install:** Default to **latest** .deb URL; optional `CLOUDFLARED_VERSION` for pinning.
- **CORS:** Nginx `/v1/` block uses `CORS_ORIGIN` (default `https://app.letta.com`), OPTIONS handler, and credentials-safe headers.
- **Nginx:** Bind to `127.0.0.1:8080`; no TLS.
- **Config:** Create `/etc/cloudflared/config.yml` only as optional (for named-tunnel); comment that token-based tunnels use dashboard for routing.
- **Systemd:** Create `cloudflared-tunnel.service` that runs `cloudflared tunnel run --token $CLOUDFLARE_TUNNEL_TOKEN` with `EnvironmentFile=-/etc/cloudflared/token.env`. User creates `token.env` with the dashboard token and runs `systemctl enable --now cloudflared-tunnel`.

---

## 4. Post-bootstrap checklist (user)

1. Run bootstrap (Letta + Nginx + cloudflared installed, Nginx CORS set for ADE).
2. In Cloudflare Zero Trust: create tunnel, add Published application (hostname → `http://localhost:8080`), copy token.
3. On server:  
   `echo 'CLOUDFLARE_TUNNEL_TOKEN=<paste-token>' | sudo tee /etc/cloudflared/token.env`  
   `sudo systemctl enable --now cloudflared-tunnel`
4. In ADE: set server URL to `https://<your-hostname>`.
5. (Optional) Restrict who can hit the hostname via Cloudflare Access.

---

## 5. References

- [Cloudflare Tunnel – Create a tunnel (dashboard)](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-remote-tunnel/)
- [cloudflared downloads (use latest .deb)](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)
- [Run as a service (Linux)](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/do-more-with-tunnels/local-management/as-a-service/linux/)
