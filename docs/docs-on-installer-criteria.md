# Sanctum Installation Layout — Canonical Plan (Aug 2025)

This is the **single source of truth** for how a Sanctum install is laid out on disk and how components interact. It reflects our decisions in this thread: **one global venv for all agents**, **per-module SQLite DBs**, and an **optional control plane**. SMCP stays independent.

---

## Top-Level Tree

```
/sanctum
├─ agents/                         # tenancy boundary = one folder per Prime
│  ├─ venv/                        # ONE shared Python venv for ALL agents + modules
│  ├─ requirements-agents.txt      # pinned deps for the shared venv (fleet-wide)
│  ├─ agent-<uid>/                 # e.g., agent-athena, agent-monday, agent-timbre
│  │  ├─ broca2/
│  │  │  ├─ app/                   # instance code or symlink to shared repo
│  │  │  ├─ config/                # module .env / settings
│  │  │  ├─ db/                    # module SQLite (e.g., broca.sqlite)
│  │  │  ├─ plugins/
│  │  │  ├─ logs/
│  │  │  └─ run/                   # tiny start wrappers, pid/lock if needed
│  │  ├─ thalamus/                 # per-prime tool; same sub-layout as broca2
│  │  └─ <other per-prime tools>/  # same sub-layout pattern
│  └─ agent-<uid>/…
│
├─ smcp/                           # shared MCP service; completely independent
│  ├─ app/  venv/  config/  db/  plugins/  logs/  run/
│
├─ control/                        # optional; thin auth/catalog + admin UI/proxy
│  ├─ registry.db                  # install-level users/sessions/agents/ports (if used)
│  ├─ gateway/                     # proxy/auth layer (FastAPI/Flask or nginx+auth)
│  └─ web/                         # admin/demo UI (not authoritative)
└─ .env                            # install-wide knobs (paths, base ports). keep secrets minimal
```

---

## Invariants (Non-Negotiables)

* **Global venv**: `/sanctum/agents/venv/` is the interpreter for **all** agents and their modules.
* **Per-module DBs**: every module keeps its **own** SQLite under its folder (`db/<module>.sqlite`).
* **SMCP isolation**: SMCP maintains its **own** venv + SQLite + plugins under `/sanctum/smcp/`.
* **Config locality**: each module reads only from its own `config/` and the shared venv; no cross-module config bleed.
* **Ports**: each module binds a **unique local port**; (optional) `control/registry.db` records `{agent, module} → port`.

---

## Agent Module Config Template

Place in `agents/agent-<uid>/<module>/config/.env` (example below shows Broca/Thalamus—same shape for others):

```ini
# Shared interpreter for all agents/modules
AGENT_PY=/sanctum/agents/venv/bin/python

# Module-specific
PORT=9xxx
DB=../db/<module>.sqlite
LOG=../logs/<module>.log

# Optional, when applicable
PLUGINS_DIR=../plugins
```

### Minimal Runner (per module)

`agents/agent-<uid>/<module>/run/start.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
set -a; source "$ROOT/config/.env"; set +a
exec "$AGENT_PY" -m <module>.main
```

> Replace `<module>.main` with the actual entry point (e.g., `broca2.main`, `thalamus.main`).
> `chmod +x run/start.sh` after creation.

---

## Ports Convention (Deterministic)

Keep mental load low with a base + stride per module type:

* `broca2`: `9100 + <agent_index>`
* `thalamus`: `9200 + <agent_index>`
* (Add others by decade buckets: `9300+`, `9400+`, …)
* `smcp`: fixed, e.g., `8283`

You can store the chosen ports in the module’s `.env` and (optionally) in `control/registry.db`.

---

## SMCP (Shared MCP Service)

* Lives entirely under `/sanctum/smcp/` with its **own** `venv/`, **own** `db/`, and **own** `plugins/`.
* No coupling to agent venv or DBs.

```
/sanctum/smcp
├─ app/
├─ venv/
├─ config/
├─ db/            # mcp.sqlite
├─ plugins/
├─ logs/
└─ run/
```

---

## Control Plane (Optional, Thin)

If/when you want a “single front door” without changing any module DBs:

* `control/registry.db` stores:

  * `users`, `sessions`
  * `agents` (uid, name, path, ports)
  * optional `agent_memberships`
  * optional `user_agent_map` (global ↔ local user mapping cache)
* `gateway/` authenticates once and proxies `/agent/<uid>/…` to the right local port, injecting identity headers (e.g., `X-Sanctum-User-Email`).
* Modules remain the **source of truth** for their own data (no schema changes).

---

## Global Venv Management

* **Path**: `/sanctum/agents/venv/`
* **Pins file**: `/sanctum/agents/requirements-agents.txt`

Example starter (edit to taste):

```txt
# /sanctum/agents/requirements-agents.txt
# lock shared deps for all agents/modules
broca2==<version>
# thalamus==<version>
uvloop==0.20.0
# add common plugin deps here
```

Initialize/update:

```bash
python3 -m venv /sanctum/agents/venv
/sanctum/agents/venv/bin/pip install -U pip wheel
/sanctum/agents/venv/bin/pip install -r /sanctum/agents/requirements-agents.txt
```

> **Future:** If a Prime needs divergent deps, we can introduce **overlay venvs** per agent. For now, **all agents ride the global venv**.

---

## Ops & Lifecycle (Simple Rules)

* **Start/Stop**: use each module’s `run/start.sh` (tiny wrappers; no global scripts required).
* **Logs**: live per module in `logs/`. Tail locally; optional control UI can expose health checks.
* **Backup/Restore Unit**: `agents/agent-<uid>/` captures everything for that Prime (configs, DBs, plugins). SMCP backed up independently.
* **Code Sharing**: `app/` can be a symlink to a shared checkout or a thin wrapper that imports installed packages from the global venv.

---

## Rationale (Why This Layout)

* **Modular and simple**: every tool keeps its own SQLite DB; nothing centralized or rewritten.
* **Ops-light**: one venv to patch and one pins file to manage.
* **Control-plane-ready**: optional registry/gateway adds unified UX without touching module internals.
* **Future-proof**: overlay venvs can be introduced later if one agent’s dependencies diverge.

---

## Quick Checklist (when adding a new Prime)

1. `mkdir -p /sanctum/agents/agent-<uid>/{broca2,thalamus}/{app,config,db,logs,run,plugins}`
2. Put module `.env` files using `AGENT_PY=/sanctum/agents/venv/bin/python` and pick ports.
3. Ensure global venv exists and deps installed from `requirements-agents.txt`.
4. Create tiny `run/start.sh` per module with the template above.
5. (Optional) Add the agent + ports to `control/registry.db`.

---

That’s the whole picture. If you want this split into smaller doclets (e.g., “For Devs”, “For Ops”, “For UI/Control”), say the word and I’ll fracture it cleanly.
