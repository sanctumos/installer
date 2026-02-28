# Install Letta on Android (Termux + Proot Ubuntu) — Plan and Rollback

**Target:** 192.168.1.244 only. No changes to the dev machine.

**Environment:** Android, Termux, proot Ubuntu (aarch64). Uses `sanctum_bootstrap_proot_letta.sh`.

**Full documentation:** See [LETTA_PROOT_ANDROID_INSTALL.md](../docs/LETTA_PROOT_ANDROID_INSTALL.md) for the complete install log, execution summary, issues (asyncpg, venv), and how to run/rollback on the device.

---

## Checkpoints (resumable / rollback)

| Checkpoint | What | Rollback / Retry |
|------------|------|-------------------|
| **0** | Checkpoint dir created | N/A |
| **1** | Prereqs: apt (curl, git, screen), uv installed | Re-run script; checkpoint_1_ok removed if you need to redo apt/uv |
| **2** | Letta repo cloned to ~/letta | Remove ~/letta and checkpoint_2_ok; re-run to re-clone |
| **3** | uv sync (server + sqlite) in ~/letta | Remove ~/letta/.venv (and cache) and checkpoint_3_ok; re-run |
| **4** | ~/.letta/.env, alembic migrations, ~/sanctum dirs | Restore ~/.letta from backup if needed; remove checkpoint_4_ok to re-run migrations |
| **5** | Letta server launched in screen, health OK | Kill screen session; remove checkpoint_5_ok; fix and re-run |

**Rollback (full):** From Termux (outside proot), snapshot/restore rootfs per PROOT_TERMUX_ARM64_GUIDE.md. Or delete checkpoints and ~/letta, ~/.letta, ~/sanctum and re-run from scratch.

**Note (letta-ai/letta):** The server imports `asyncpg` at startup even when using SQLite. After `uv sync --extra server --extra sqlite`, run `uv pip install asyncpg` (with `UV_LINK_MODE=copy` if in proot). Do not use `--extra postgres` (pulls in psycopg2 which needs pg_config).

---

## What we skip on Proot (no systemd / no /etc)

- systemctl (nginx, cloudflared)
- nginx config in /etc
- cloudflared .deb and systemd service
- certbot
- @reboot crontab (Termux doesn’t run cron at boot)

---

## Execution

1. Run installer **inside proot Ubuntu** on 192.168.1.244 (via SSH).
2. Script is idempotent: completed checkpoints are skipped.
3. On failure at checkpoint N: fix cause, remove `checkpoint_N_ok` (and later checkpoints), re-run.
4. Optional backups: script can rsync ~/letta and ~/.letta to ~/sanctum-backups before critical steps (see script).
