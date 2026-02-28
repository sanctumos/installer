#!/usr/bin/env bash
# Letta install for Proot Ubuntu (Termux, ARM64). No Docker, no systemd, no /etc.
# Target: run ONLY on 192.168.1.244 inside proot-distro login ubuntu.
# Resumable: checkpoints in ~/sanctum-install-checkpoints. Remove checkpoint_N_ok to redo from N.
set -euo pipefail

CHECKPOINT_DIR="${CHECKPOINT_DIR:-$HOME/sanctum-install-checkpoints}"
LETTA_REPO="${LETTA_REPO:-$HOME/letta}"
LETTAPASS="${LETTAPASS:-yourpassword}"
LETTA_HOST_PORT="${LETTA_HOST_PORT:-8284}"
SCREEN_SESSION="${SCREEN_SESSION:-letta}"

LETTA_REPO="${LETTA_REPO/#\~/$HOME}"
CHECKPOINT_DIR="${CHECKPOINT_DIR/#\~/$HOME}"

checkpoint_ok() { [[ -f "$CHECKPOINT_DIR/checkpoint_$1_ok" ]]; }
mark_ok()    { echo "✔ Checkpoint $1 done" >&2; touch "$CHECKPOINT_DIR/checkpoint_$1_ok"; }

mkdir -p "$CHECKPOINT_DIR"
echo "Checkpoint dir: $CHECKPOINT_DIR" >&2

############################################
# Checkpoint 1: Prereqs (apt, uv)
############################################
if checkpoint_ok 1; then
  echo "Checkpoint 1 already done, skipping." >&2
else
  echo "=== Checkpoint 1: Prereqs ===" >&2
  apt-get update
  apt-get install -y curl git screen
  if ! command -v uv &>/dev/null; then
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.local/bin:${PATH:-}"
  fi
  export PATH="$HOME/.local/bin:${PATH:-}"
  command -v uv
  mark_ok 1
fi
export PATH="$HOME/.local/bin:${PATH:-}"

############################################
# Checkpoint 2: Clone Letta repo
############################################
if checkpoint_ok 2; then
  echo "Checkpoint 2 already done, skipping." >&2
else
  echo "=== Checkpoint 2: Clone Letta ===" >&2
  if [[ -d "$LETTA_REPO/.git" ]]; then
    echo "Repo already present at $LETTA_REPO" >&2
  else
    # Use letta-ai/letta (public). For technonomicon-lore fork, clone manually with token/SSH.
    GIT_TERMINAL_PROMPT=0 git clone --depth 1 https://github.com/letta-ai/letta.git "$LETTA_REPO" || true
    if [[ ! -d "$LETTA_REPO/.git" ]]; then
      echo "❌ git clone failed. If using private fork, clone manually into $LETTA_REPO and re-run." >&2
      exit 1
    fi
  fi
  mark_ok 2
fi

############################################
# Checkpoint 3: uv sync (server + sqlite)
############################################
if checkpoint_ok 3; then
  echo "Checkpoint 3 already done, skipping." >&2
else
  echo "=== Checkpoint 3: uv sync ===" >&2
  cd "$LETTA_REPO"
  export UV_LINK_MODE=copy
  uv sync --python /usr/bin/python3 --extra server --extra sqlite
  # letta ORM imports asyncpg at load time (even with SQLite)
  uv pip install asyncpg
  mark_ok 3
fi

############################################
# Checkpoint 4: .env, migrations, sanctum dirs
############################################
if checkpoint_ok 4; then
  echo "Checkpoint 4 already done, skipping." >&2
else
  echo "=== Checkpoint 4: .env, migrations, sanctum ===" >&2
  mkdir -p "$HOME/.letta"
  write_env_line() {
    local key="$1" val="${2:-}"
    if [[ -n "${val}" ]]; then echo "$key=$val"; else echo "# $key="; fi
  }
  {
    echo "# ~/.letta/.env — Proot/Android. Uncomment and set only the keys you use."
    echo ""
    write_env_line "OPENAI_API_KEY" "${OPENAI_API_KEY:-}"
    write_env_line "OPENAI_BASE_URL" "${OPENAI_BASE_URL:-}"
    write_env_line "ANTHROPIC_API_KEY" "${ANTHROPIC_API_KEY:-}"
    write_env_line "OLLAMA_BASE_URL" "${OLLAMA_BASE_URL:-}"
    write_env_line "VENICE_API_KEY" "${VENICE_API_KEY:-}"
    write_env_line "VENICE_BASE_URL" "${VENICE_BASE_URL:-}"
    echo ""
    echo "LETTA_SERVER_PASSWORD=$LETTAPASS"
  } > "$HOME/.letta/.env"

  cd "$LETTA_REPO"
  uv run alembic upgrade head

  mkdir -p "$HOME/sanctum"/{agents,smcp,control/{run,cron}}
  mkdir -p "$HOME/sanctum/control/run"/{agent-athena,agent-monday,agent-timbre}
  mark_ok 4
fi

############################################
# Checkpoint 5: Launch Letta server and health check
############################################
if checkpoint_ok 5; then
  echo "Checkpoint 5 already done, skipping." >&2
else
  echo "=== Checkpoint 5: Launch Letta ===" >&2
  set +u
  source "$HOME/.letta/.env"
  set -u
  export SECURE=true
  export LETTA_SERVER_PASSWORD="$LETTAPASS"
  # Start in screen (ignore if already running)
  screen -dmS "$SCREEN_SESSION" bash -c "cd $LETTA_REPO && source $HOME/.letta/.env && export SECURE=true LETTA_SERVER_PASSWORD=\"\$LETTA_SERVER_PASSWORD\" && uv run letta server --port $LETTA_HOST_PORT" || true
  echo "Waiting for Letta health (up to ~90s)..." >&2
  for i in $(seq 1 30); do
    if curl -s "http://127.0.0.1:$LETTA_HOST_PORT/v1/health/" >/dev/null 2>&1; then
      echo "✔ Letta is healthy at http://127.0.0.1:$LETTA_HOST_PORT" >&2
      mark_ok 5
      break
    fi
    if [[ $i -eq 30 ]]; then
      echo "❌ Letta did not become healthy. Check: screen -r $SCREEN_SESSION" >&2
      exit 1
    fi
    sleep 3
  done
fi

############################################
# Launch scripts (always overwrite)
############################################
cat > "$HOME/launch_letta.sh" <<LAUNCH
#!/bin/bash
source $HOME/.letta/.env
export SECURE=true
export LETTA_SERVER_PASSWORD="\$LETTA_SERVER_PASSWORD"
cd $LETTA_REPO && uv run letta server --port $LETTA_HOST_PORT
LAUNCH
chmod +x "$HOME/launch_letta.sh"
cat > "$HOME/launch_letta_screen.sh" <<SCREEN
#!/bin/bash
screen -dmS $SCREEN_SESSION $HOME/launch_letta.sh
SCREEN
chmod +x "$HOME/launch_letta_screen.sh"

echo ""
echo "=== Done ==="
echo "Letta:  http://127.0.0.1:$LETTA_HOST_PORT  (screen: $SCREEN_SESSION)"
echo "Attach: screen -r $SCREEN_SESSION"
echo "Checkpoints: $CHECKPOINT_DIR"
