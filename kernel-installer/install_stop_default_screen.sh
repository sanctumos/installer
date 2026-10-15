#!/usr/bin/env bash
# Install SanctumOS-top ("stop") and ensure a default GNU screen named "stop"
# is running + cron-supervised. Idempotent. Source or exec from sanctum_bootstrap_*.sh
# after ~/sanctum exists and `screen` is on PATH.
#
# Override:
#   STOP_GIT_URL       (default https://github.com/sanctumos/stop.git)
#   STOP_REPO          (default $HOME/sanctum/repos/stop)
#   STOP_SCREEN_NAME   (default stop)
set -euo pipefail

STOP_GIT_URL="${STOP_GIT_URL:-https://github.com/sanctumos/stop.git}"
STOP_REPO="${STOP_REPO:-$HOME/sanctum/repos/stop}"
STOP_SCREEN_NAME="${STOP_SCREEN_NAME:-stop}"
STOP_REPO="${STOP_REPO/#\~/$HOME}"

echo "Installing SanctumOS-top (stop) → screen '${STOP_SCREEN_NAME}'..."

if ! command -v screen >/dev/null 2>&1; then
  echo "⚠ screen not installed; skipping stop (install screen and re-run)"
  return 0 2>/dev/null || exit 0
fi

mkdir -p "$(dirname "$STOP_REPO")" "$HOME/logs"

if [[ ! -d "$STOP_REPO/.git" ]]; then
  GIT_TERMINAL_PROMPT=0 git clone --depth 1 "$STOP_GIT_URL" "$STOP_REPO"
else
  echo "✔ stop repo already at $STOP_REPO"
fi

if [[ ! -x "$STOP_REPO/.venv/bin/python" ]] || [[ ! -x "$STOP_REPO/.venv/bin/pip" ]]; then
  rm -rf "$STOP_REPO/.venv"
fi

if [[ ! -x "$STOP_REPO/.venv/bin/stop" ]]; then
  echo "Building stop venv..."
  if ! python3 -m venv "$STOP_REPO/.venv" 2>/tmp/stop-venv.err; then
    echo "⚠ python3 -m venv failed (need python3-venv). Last error:"
    cat /tmp/stop-venv.err 2>/dev/null || true
    if command -v apt-get >/dev/null 2>&1 && [[ "${EUID:-$(id -u)}" -eq 0 ]]; then
      apt-get install -y python3-venv python3-pip
      rm -rf "$STOP_REPO/.venv"
      python3 -m venv "$STOP_REPO/.venv"
    else
      echo "❌ Install python3-venv (e.g. apt install python3-venv) and re-run" >&2
      return 1 2>/dev/null || exit 1
    fi
  fi
  "$STOP_REPO/.venv/bin/pip" install -q -U pip wheel
  if [[ -f "$STOP_REPO/constraints.txt" ]]; then
    "$STOP_REPO/.venv/bin/pip" install -q -c "$STOP_REPO/constraints.txt" -e "$STOP_REPO"
  else
    "$STOP_REPO/.venv/bin/pip" install -q -e "$STOP_REPO"
  fi
fi

if [[ ! -x "$STOP_REPO/.venv/bin/stop" ]]; then
  echo "❌ $STOP_REPO/.venv/bin/stop missing after install" >&2
  return 1 2>/dev/null || exit 1
fi

export STOP_REPO STOP_SCREEN_NAME
bash "$STOP_REPO/tools/start-in-screen.sh" || true

START_SH="$STOP_REPO/tools/start-in-screen.sh"
LOG_LINE="$HOME/logs/stop-cron.log"
CURRENT_CRON="$(crontab -l 2>/dev/null || true)"
HAS_REBOOT=0
HAS_MINUTE=0
if echo "$CURRENT_CRON" | grep -F "$START_SH" | grep -q '^@reboot'; then
  HAS_REBOOT=1
fi
if echo "$CURRENT_CRON" | grep -F "$START_SH" | grep -q '^\* \* \* \* \*'; then
  HAS_MINUTE=1
fi

NEW_CRON="$CURRENT_CRON"
if [[ "$HAS_REBOOT" -eq 0 ]]; then
  NEW_CRON="${NEW_CRON}
@reboot ${START_SH} >>${LOG_LINE} 2>&1"
fi
if [[ "$HAS_MINUTE" -eq 0 ]]; then
  NEW_CRON="${NEW_CRON}
* * * * * ${START_SH} >>${LOG_LINE} 2>&1"
fi

if [[ "$HAS_REBOOT" -eq 0 || "$HAS_MINUTE" -eq 0 ]]; then
  printf '%s\n' "$NEW_CRON" | sed '/./,$!d' | crontab -
  echo "✔ stop cron: @reboot + minutely → $START_SH"
else
  echo "✔ stop already in crontab"
fi

if screen -ls 2>&1 | grep -qE "[0-9]+\.${STOP_SCREEN_NAME}([[:space:]]|$)"; then
  echo "✔ screen '${STOP_SCREEN_NAME}' is up (attach: screen -x ${STOP_SCREEN_NAME})"
else
  echo "⚠ screen '${STOP_SCREEN_NAME}' not visible yet — cron will retry"
fi
