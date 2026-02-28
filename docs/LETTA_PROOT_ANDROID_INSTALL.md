# Letta Install on Android (Termux + Proot Ubuntu) — Full Documentation

**Date:** 2026-02-27 / 2026-02-28  
**Target machine:** 192.168.1.244 only. No changes were made to the dev machine.  
**Environment:** Android device, Termux, proot-distro Ubuntu (aarch64). SSH on port 8022.

---

## 1. Goal

Install Letta (self-hosted server, SQLite backend) on the Android device at 192.168.1.244, inside the existing proot Ubuntu environment created earlier with `proot-distro install ubuntu`. Use the sanctum bootstrap approach adapted for proot (no systemd, no /etc writes), with **resumable checkpoints** and clear rollback so failures can be retried from a known state.

---

## 2. References Used (on dev machine)

- **Bootstrap script (adapted for proot):** `sanctum/installer/kernel-installer/sanctum_bootstrap_local_letta.sh` — local Letta from repo, no Docker.
- **Proot/Android guides:**  
  - `sanctum/PROOT_TERMUX_ARM64_GUIDE.md` — what works/doesn’t in proot (no systemctl, nginx in $HOME, snapshots via rsync).  
  - `sanctum/LETTA_ANDROID_DEPENDENCY_ANALYSIS.md` — uv sync with `--extra server --extra sqlite`, `UV_LINK_MODE=copy`, proot Python for manylinux wheels.
- **Plan and checkpoints:** `sanctum/installer/kernel-installer/INSTALL_LETTA_PROOT_PLAN.md`.

---

## 3. Artifacts Created on Dev Machine

| Path | Purpose |
|------|---------|
| `sanctum/installer/kernel-installer/sanctum_bootstrap_proot_letta.sh` | Proot-specific installer: checkpoints 1–5, no systemd/nginx/cloudflared. |
| `sanctum/installer/kernel-installer/INSTALL_LETTA_PROOT_PLAN.md` | Short plan + checkpoint/rollback table. |
| `sanctum/installer/docs/LETTA_PROOT_ANDROID_INSTALL.md` | This full install log. |

**Script behavior:** Idempotent; each phase checks for `~/sanctum-install-checkpoints/checkpoint_N_ok` and skips if present. Remove a checkpoint file to re-run from that step.

---

## 4. Execution Summary

### 4.1 Access

- **SSH:** `sshpass -p '...' ssh -o StrictHostKeyChecking=no -p 8022 root@192.168.1.244`
- **Proot Ubuntu:** Commands were run inside proot via:  
  `proot-distro login ubuntu -- bash -c "..."`  
  with `PATH=/data/data/com.termux/files/usr/bin:$PATH` and `HOME=/data/data/com.termux/files/home` set on the Termux side so proot-distro was available.

### 4.2 Checkpoint 1 — Prereqs

- **Actions:** `apt-get update`, `apt-get install -y curl git screen`; install uv via `curl -LsSf https://astral.sh/uv/install.sh | sh`; `PATH` included `$HOME/.local/bin`.
- **Result:** Success. Checkpoint 1 marked done.

### 4.3 Checkpoint 2 — Clone Letta repo

- **Initial attempt:** Clone `https://github.com/technonomicon-lore/letta.git` failed with “could not read Username for 'https://github.com': No such device or address” (no TTY). Repo returned 404 from the dev machine (private or renamed).
- **Change:** Installer script was updated to use **letta-ai/letta** (public upstream):  
  `GIT_TERMINAL_PROMPT=0 git clone --depth 1 https://github.com/letta-ai/letta.git "$LETTA_REPO"`.
- **Result:** Clone succeeded. Checkpoint 2 marked done. Repo at `~/letta` on the device.

### 4.4 Checkpoint 3 — uv sync (server + sqlite)

- **Actions:**  
  - `cd ~/letta`  
  - `UV_LINK_MODE=copy` (required in proot; hardlinks can fail)  
  - `uv sync --python /usr/bin/python3 --extra server --extra sqlite`  
  - **Later addition:** `uv pip install asyncpg` (see 4.7).
- **Result:** Sync completed (many packages; run took several minutes). Checkpoint 3 marked done. One run hit a 5-minute SSH timeout during sync; re-run from checkpoint 3 completed successfully.

### 4.5 Checkpoint 4 — .env, migrations, sanctum dirs

- **Actions:**  
  - `mkdir -p ~/.letta`  
  - Wrote `~/.letta/.env` with placeholder API keys (commented) and `LETTA_SERVER_PASSWORD=yourpassword`.  
  - `cd ~/letta && uv run alembic upgrade head`  
  - `mkdir -p ~/sanctum/{agents,smcp,control/{run,cron}}` and agent run dirs (agent-athena, agent-monday, agent-timbre).
- **Result:** Success. Migrations and sanctum dirs created. Checkpoint 4 marked done. (Alembic can take 1–2 minutes on device.)

### 4.6 Checkpoint 5 — Launch Letta server and health check

- **Actions:** Start server in screen:  
  `screen -dmS letta bash -c "cd $LETTA_REPO && source ~/.letta/.env && export SECURE=true LETTA_SERVER_PASSWORD=... && uv run letta server --port 8284"`  
  then loop checking `curl -s http://127.0.0.1:8284/v1/health/` for up to ~90s.
- **Result:** Health check did not succeed within the SSH session (timeouts / server startup time on device). Screen session “letta” was created; server startup then failed with missing module (see 4.7).

### 4.7 Issue: asyncpg required at import time

- **Symptom:** `uv run letta server --port 8284` failed with:  
  `ModuleNotFoundError: No module named 'asyncpg'`  
  (from `letta/orm/sqlalchemy_base.py` importing `asyncpg.exceptions`).
- **Cause:** letta-ai/letta imports asyncpg at startup even when using SQLite. The install used only `--extra server --extra sqlite`, which does not install asyncpg.
- **Attempted fix 1:** `uv sync --extra postgres` to pull in postgres deps. This removed the venv and tried to build psycopg2, which failed with “pg_config executable not found” (no Postgres dev headers on device).
- **Attempted fix 2:** Restore venv with `uv sync --extra server --extra sqlite` (with `UV_LINK_MODE=copy`), then `uv pip install asyncpg`. asyncpg installed successfully. Running the server via the venv binary then hit “No module named 'pydantic'”, suggesting a mixed or broken venv state (e.g. from the failed postgres sync).
- **Attempted fix 3:** Clean re-sync (rm .venv, uv sync with UV_LINK_MODE=copy, uv pip install asyncpg) was started; long-running SSH timeouts prevented full verification of server startup in the same session.
- **Script/plan update:** The proot bootstrap script and plan were updated so that after `uv sync --extra server --extra sqlite` the script runs `uv pip install asyncpg`. The docs note not to use `--extra postgres` (psycopg2 needs pg_config).

---

## 5. Final State on 192.168.1.244 (proot Ubuntu)

- **Checkpoints:** `~/sanctum-install-checkpoints/` contains `checkpoint_1_ok` through `checkpoint_4_ok`. Checkpoint 5 (server healthy) was not confirmed.
- **Paths:**  
  - Letta repo: `~/letta` (letta-ai/letta).  
  - Config: `~/.letta/.env`.  
  - DB: SQLite (no `LETTA_PG_URI`), expected at `~/.letta/sqlite.db` after migrations.  
  - Sanctum: `~/sanctum/{agents,smcp,control/{run,cron}}` and agent run dirs.
- **Launch scripts:** Installer writes `~/launch_letta.sh` and `~/launch_letta_screen.sh` (screen wrapper).

---

## 6. How to Complete or Run the Server on the Device

All commands below are run **inside proot Ubuntu** (e.g. `proot-distro login ubuntu` from Termux, or via SSH as above).

1. **Ensure asyncpg and use venv directly (avoids uv reinstall):**
   ```bash
   cd /root/letta
   export PATH=$HOME/.local/bin:$PATH
   export UV_LINK_MODE=copy
   uv pip install asyncpg   # if not already present
   ```

2. **If the venv is broken (e.g. missing pydantic):**
   ```bash
   cd /root/letta
   export PATH=$HOME/.local/bin:$PATH
   export UV_LINK_MODE=copy
   rm -rf .venv
   uv sync --python /usr/bin/python3 --extra server --extra sqlite
   uv pip install asyncpg
   ```

3. **Start the server:**
   ```bash
   source /root/.letta/.env
   export SECURE=true
   export LETTA_SERVER_PASSWORD=${LETTA_SERVER_PASSWORD:-yourpassword}
   # Foreground (to see logs):
   /root/letta/.venv/bin/letta server --port 8284
   # Or in background with screen:
   screen -dmS letta /root/letta/.venv/bin/letta server --port 8284
   ```

4. **Check health:**  
   `curl -s http://127.0.0.1:8284/v1/health/`  
   Attach to screen: `screen -r letta`.

---

## 7. Rollback and Resume

- **Resume from a checkpoint:** Remove the corresponding `~/sanctum-install-checkpoints/checkpoint_N_ok` and any later checkpoint files, then re-run the installer script. It will redo from step N.
- **Full rollback:** From Termux (outside proot), snapshot/restore the proot rootfs per `PROOT_TERMUX_ARM64_GUIDE.md`. Or delete `~/letta`, `~/.letta`, `~/sanctum`, and `~/sanctum-install-checkpoints`, and re-run the installer from scratch.
- **DB only:** Backup/restore `~/.letta/sqlite.db` (and optionally `~/.letta/.env`) before re-running migrations or risky changes.

---

## 8. What Is Skipped on Proot (vs. full bootstrap)

No changes to the dev machine. On the **target** we intentionally skip:

- systemctl (nginx, cloudflared, any systemd)
- nginx config under /etc
- cloudflared .deb and systemd service
- certbot
- @reboot crontab (Termux does not run cron at boot)

So: Letta and sanctum dirs only; no reverse proxy, no TLS, no tunnel on the device from this install.

---

## 9. File Locations on Dev Machine (sanctum repo)

- **Installer script:** `sanctum/installer/kernel-installer/sanctum_bootstrap_proot_letta.sh`
- **Short plan:** `sanctum/installer/kernel-installer/INSTALL_LETTA_PROOT_PLAN.md`
- **This doc:** `sanctum/installer/docs/LETTA_PROOT_ANDROID_INSTALL.md`

Same content as this file is also placed on the **target** at **`/root/LETTA_PROOT_ANDROID_INSTALL.md`** (workspace root inside proot Ubuntu) for reference on the device.
