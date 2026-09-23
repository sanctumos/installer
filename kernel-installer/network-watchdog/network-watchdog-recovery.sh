#!/usr/bin/env bash
#
# Network watchdog: when reachability is lost for N checks, trigger network
# recovery (restart WiFi); when reachability returns, restart bore-client so
# the tunnel comes back. Run via systemd user timer (e.g. every 60–120s).
#
# Requires passwordless sudo for:
#   systemctl restart netplan-wpa-wlx2cf05dfb1561.service
#   ip link set dev wlx2cf05dfb1561 down
#   ip link set dev wlx2cf05dfb1561 up
#   /usr/sbin/reboot
#
set -euo pipefail

# Config (override with env or edit)
GATEWAY="${NETWORK_WATCHDOG_GATEWAY:-192.168.1.254}"
REMOTE="${NETWORK_WATCHDOG_REMOTE:-64.95.12.49}"   # optional; set empty to only check gateway
BORE_REMOTE_PORT="${NETWORK_WATCHDOG_BORE_PORT:-7836}"   # must match bore tunnel port (e.g. bore_bootstrap.sh BORE_TUNNEL_PORT)
# All bore tunnel ports that must be live on the remote. Default: HTTP tunnel + SSH tunnel.
# A stuck client (half-open control connection) means the server stops listening on that
# tunnel's port, so probing every port catches a dead bore-ssh-client even when 7836 is fine.
BORE_REMOTE_PORTS="${NETWORK_WATCHDOG_BORE_PORTS:-$BORE_REMOTE_PORT 7837}"
INTERFACE="${NETWORK_WATCHDOG_INTERFACE:-wlx2cf05dfb1561}"
USB_WIFI_UNBIND="${NETWORK_WATCHDOG_USB_WIFI:-}"   # Realtek USB WiFi; empty=skip USB reset
FAILURES_BEFORE_RECOVERY="${NETWORK_WATCHDOG_FAILURES:-2}"
TIER1_FAILURES="${NETWORK_WATCHDOG_TIER1_FAILURES:-2}"   # consecutive "tunnel down, LAN up" before tier 1
TIER2_CYCLES_BEFORE_REBOOT="${NETWORK_WATCHDOG_TIER2_CYCLES:-3}"   # tier-2 cycles before tier 3 (reboot); 0 = disable tier 3
MAX_FAILED_REBOOTS="${NETWORK_WATCHDOG_MAX_FAILED_REBOOTS:-3}"   # consecutive failed reboots before recovery_paused; 0 = guard disabled
POST_REBOOT_GRACE_SEC="${NETWORK_WATCHDOG_POST_REBOOT_GRACE:-120}"  # wait after boot before judging reboot outcome
PING_TIMEOUT="${NETWORK_WATCHDOG_PING_TIMEOUT:-5}"
STATE_DIR="${XDG_STATE_HOME:-$HOME/.local/state}"
STATE_FILE="${STATE_DIR}/network-watchdog.state"
LOG_FILE="${STATE_DIR}/network-watchdog.log"
LOG_MAX_LINES="${NETWORK_WATCHDOG_LOG_MAX_LINES:-2000}"
LOG_TRIM_THRESHOLD="${NETWORK_WATCHDOG_LOG_TRIM_THRESHOLD:-5000}"
TIER1_ATTEMPTS_BEFORE_TIER2="${NETWORK_WATCHDOG_TIER1_ATTEMPTS_BEFORE_TIER2:-2}"
WPA_SERVICE="netplan-wpa-${INTERFACE}.service"
LOCK_FILE="${STATE_DIR}/network-watchdog.lock"

mkdir -p "$STATE_DIR"

log() {
  echo "[$(date -Iseconds)] $*" >> "$LOG_FILE"
  echo "[$(date -Iseconds)] $*" >&2
}

current_boot_id() {
  cat /proc/sys/kernel/random/boot_id 2>/dev/null || echo unknown
}

uptime_sec() {
  awk '{print int($1)}' /proc/uptime
}

# Read state: source state file and output key values in fixed order for main to read.
# Also sets pending_reboot_boot_id / failed_reboot_boot_id in caller via nameref globals written to STATE.
read_state() {
  local consecutive_failures=0 consecutive_tunnel_failures=0 was_down=0
  local tier2_cycle_count=0 tier3_reboot_pending=0 consecutive_failed_reboots=0 recovery_paused=0 tier1_attempts=0
  local pending_reboot_boot_id="" failed_reboot_boot_id=""
  if [[ -f "$STATE_FILE" ]]; then
    # shellcheck source=/dev/null
    source "$STATE_FILE" 2>/dev/null || true
  fi
  echo "${consecutive_failures:-0}" "${consecutive_tunnel_failures:-0}" "${was_down:-0}" \
       "${tier2_cycle_count:-0}" "${tier3_reboot_pending:-0}" "${consecutive_failed_reboots:-0}" \
       "${recovery_paused:-0}" "${tier1_attempts:-0}" \
       "${pending_reboot_boot_id:-}" "${failed_reboot_boot_id:-}"
}

# Write all state keys.
write_state() {
  local cf="${1:-0}" ctf="${2:-0}" wd="${3:-0}" t2="${4:-0}" t3p="${5:-0}" cfr="${6:-0}" rp="${7:-0}" t1a="${8:-0}"
  local prbid="${9:-}" frbid="${10:-}"
  cat > "$STATE_FILE" << EOF
consecutive_failures=$cf
consecutive_tunnel_failures=$ctf
was_down=$wd
tier2_cycle_count=$t2
tier3_reboot_pending=$t3p
consecutive_failed_reboots=$cfr
recovery_paused=$rp
tier1_attempts=$t1a
pending_reboot_boot_id=$prbid
failed_reboot_boot_id=$frbid
EOF
}

# Check reachability: ping gateway; if REMOTE is set, also ping remote (both must pass for "up")
is_reachable() {
  if ! ping -c1 -W"$PING_TIMEOUT" -q "$GATEWAY" &>/dev/null; then
    return 1
  fi
  if [[ -n "${REMOTE:-}" ]]; then
    if ! ping -c1 -W"$PING_TIMEOUT" -q "$REMOTE" &>/dev/null; then
      return 1
    fi
  fi
  return 0
}

# TCP connect to remote bore ports (timeout 2s each). Requires reachability first.
# Every tunnel port must accept; one stuck bore client fails the whole check.
is_tunnel_tcp_ok() {
  [[ -z "${REMOTE:-}" ]] && return 0
  local port
  for port in $BORE_REMOTE_PORTS; do
    if timeout 2 bash -c "echo >/dev/tcp/$REMOTE/$port" 2>/dev/null; then
      continue
    fi
    if command -v nc &>/dev/null && nc -z -w 2 "$REMOTE" "$port" 2>/dev/null; then
      continue
    fi
    return 1
  done
  return 0
}

# Tunnel healthy = reachable AND TCP to bore port OK
is_tunnel_healthy() {
  is_reachable || return 1
  is_tunnel_tcp_ok || return 1
  return 0
}

# Trim log to last LOG_MAX_LINES when over threshold
trim_log() {
  [[ ! -f "$LOG_FILE" ]] && return 0
  local lines
  lines=$(wc -l < "$LOG_FILE" 2>/dev/null) || return 0
  if [[ "${lines:-0}" -gt "$LOG_TRIM_THRESHOLD" ]]; then
    tail -n "$LOG_MAX_LINES" "$LOG_FILE" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "$LOG_FILE"
  fi
}

# Recovery: restart WPA for this interface and bounce the link
do_recovery() {
  log "Recovery: restarting $WPA_SERVICE and bouncing $INTERFACE"
  sudo systemctl restart "$WPA_SERVICE" 2>>"$LOG_FILE" || log "WARNING: restart $WPA_SERVICE failed"
  sleep 2
  sudo ip link set dev "$INTERFACE" down 2>>"$LOG_FILE" || true
  sleep 2
  sudo ip link set dev "$INTERFACE" up 2>>"$LOG_FILE" || true
  log "Recovery done; waiting 15s before re-checking"
  sleep 15
}

# USB WiFi reset: unbind/bind Realtek adapter (fixes "firmware failed to leave lps state")
do_usb_wifi_reset() {
  [[ -z "${USB_WIFI_UNBIND:-}" ]] && return 0
  local drv="rtw_8723du"
  if [[ ! -d "/sys/bus/usb/drivers/$drv" ]]; then
    log "USB WiFi reset skipped: driver $drv not found"
    return 0
  fi
  log "USB WiFi reset: unbind/bind via usb-wifi-reset.sh"
  sudo /home/rizzn/bin/usb-wifi-reset.sh 2>>"$LOG_FILE" || true
  log "USB WiFi reset done; waiting 20s for interface"
  sleep 20
}

# Restart user's bore clients (HTTP + SSH tunnels). Optional short delay for stack to settle.
restart_bore() {
  local delay="${1:-0}"
  if [[ -n "$delay" && "$delay" -gt 0 ]]; then
    log "Reachable again; waiting ${delay}s for stack to settle, then restarting bore tunnel services"
    sleep "$delay"
  else
    log "Reachable again; restarting bore tunnel services"
  fi
  systemctl --user restart bore-client.service 2>>"$LOG_FILE" || log "WARNING: bore-client restart failed"
  systemctl --user restart bore-ssh-client.service 2>>"$LOG_FILE" || log "WARNING: bore-ssh-client restart failed"
}

# Max recovery attempts in one cycle (retry if still unreachable after first recovery)
RECOVERY_RETRIES="${NETWORK_WATCHDOG_RECOVERY_RETRIES:-2}"
# Seconds to wait before restarting bore when we just became reachable (lets stack settle)
BORE_RESTART_DELAY="${NETWORK_WATCHDOG_BORE_DELAY:-5}"
# Throttle "Recovery paused" log to at most once per 60s
PAUSED_LOG_INTERVAL="${NETWORK_WATCHDOG_PAUSED_LOG_INTERVAL:-60}"
PAUSED_LOG_MARKER="${STATE_DIR}/network-watchdog-paused-logged"

# Main
main() {
  local cf ctf wd t2 t3p cfr rp t1a prbid frbid
  read -r cf ctf wd t2 t3p cfr rp t1a prbid frbid < <(read_state)

  # ---- Startup order: recovery_paused -> tier3_reboot_pending (post-reboot) -> log trim -> main loop ----
  if [[ "${rp}" == "1" ]]; then
    # Pause blocks Tier 2/3 (WiFi bounce / reboot) only. Still heal zombie bore clients.
    if is_reachable && ! is_tunnel_healthy; then
      log "Recovery paused for reboots, but tunnel unhealthy with LAN up — Tier 1 bore restart only"
      restart_bore 0
      return 0
    fi
    local now last=0
    now=$(date +%s)
    [[ -f "$PAUSED_LOG_MARKER" ]] && last=$(stat -c %Y "$PAUSED_LOG_MARKER" 2>/dev/null) || true
    if [[ $(( now - last )) -ge "${PAUSED_LOG_INTERVAL}" ]]; then
      log "Recovery paused (${cfr} failed reboots); human intervention required. To resume: set recovery_paused=0 in $STATE_FILE or delete state file. (Tier-1 bore restarts still run when LAN is up.)"
      touch "$PAUSED_LOG_MARKER" 2>/dev/null || true
    fi
    return 0
  fi

  if [[ "${t3p}" == "1" ]]; then
    local boot_id up
    boot_id=$(current_boot_id)
    up=$(uptime_sec)

    # Same boot as when Tier 3 was armed → reboot has not happened yet (pre-reboot race).
    if [[ -n "$prbid" && "$boot_id" == "$prbid" ]]; then
      log "Tier 3 pending: still on pre-reboot boot_id; skipping checks until reboot"
      return 0
    fi

    # New boot, but WiFi/stack may not be ready yet.
    if [[ "$up" -lt "$POST_REBOOT_GRACE_SEC" ]]; then
      log "Post-reboot: grace ${up}s/${POST_REBOOT_GRACE_SEC}s; not judging yet"
      return 0
    fi

    if is_reachable; then
      log "Post-reboot: reachable; clearing tier3_reboot_pending and consecutive_failed_reboots"
      write_state 0 0 0 0 0 0 0 0 "" ""
      return 0
    fi

    # Count at most one failed reboot per boot_id.
    if [[ -n "$frbid" && "$boot_id" == "$frbid" ]]; then
      log "Post-reboot: still unreachable; failure already counted for this boot; waiting"
      return 0
    fi

    cfr=$((cfr + 1))
    frbid=$boot_id
    log "Post-reboot: still unreachable after grace; consecutive_failed_reboots=$cfr (max $MAX_FAILED_REBOOTS)"
    if [[ "$MAX_FAILED_REBOOTS" -gt 0 ]] && [[ "$cfr" -ge "$MAX_FAILED_REBOOTS" ]]; then
      log "Recovery paused: ${cfr} failed reboots; human intervention required"
      write_state "$cf" "$ctf" 1 "$t2" 0 "$cfr" 1 "$t1a" "" "$frbid"
      return 0
    fi
    # Clear pending so we can escalate again later; keep cfr + frbid.
    write_state "$cf" "$ctf" 1 0 0 "$cfr" "$rp" "$t1a" "" "$frbid"
    return 0
  fi

  trim_log

  # Heartbeat
  log "check (cf=$cf ctf=$ctf wd=$wd t2=$t2 cfr=$cfr t1a=$t1a)"

  # ---- Reachable ----
  if is_reachable; then
    if is_tunnel_healthy; then
      write_state 0 0 0 0 0 0 "$rp" 0 "" "$frbid"
      return 0
    fi
    # Reachable but tunnel unhealthy (LAN up, tunnel down)
    ctf=$((ctf + 1))
    if [[ "$ctf" -ge "$TIER1_FAILURES" ]]; then
      log "Tier 1: tunnel unhealthy (LAN up); restarting bore only"
      restart_bore "$BORE_RESTART_DELAY"
      t1a=$((t1a + 1))
      write_state "$cf" 0 "$wd" "$t2" "$t3p" "$cfr" "$rp" "$t1a" "$prbid" "$frbid"
      return 0
    fi
    # Escalate to tier 2 if we've done tier 1 enough times and tunnel still unhealthy
    if [[ "$t1a" -ge "$TIER1_ATTEMPTS_BEFORE_TIER2" ]]; then
      log "Tier 1 did not fix tunnel; escalating to Tier 2 (WPA + link bounce)"
      do_recovery
      t1a=0
      if is_tunnel_healthy; then
        restart_bore "$BORE_RESTART_DELAY"
        write_state 0 0 0 "$t2" "$t3p" "$cfr" "$rp" 0 "$prbid" "$frbid"
      else
        write_state "$cf" "$ctf" "$wd" "$t2" "$t3p" "$cfr" "$rp" 0 "$prbid" "$frbid"
      fi
      return 0
    fi
    write_state "$cf" "$ctf" "$wd" "$t2" "$t3p" "$cfr" "$rp" "$t1a" "$prbid" "$frbid"
    return 0
  fi

  # ---- Unreachable ----
  cf=$((cf + 1))
  wd=1
  log "Unreachable (failure $cf/$FAILURES_BEFORE_RECOVERY)"
  write_state "$cf" "$ctf" "$wd" "$t2" "$t3p" "$cfr" "$rp" "$t1a" "$prbid" "$frbid"

  if [[ "$cf" -lt "$FAILURES_BEFORE_RECOVERY" ]]; then
    return 0
  fi

  # Tier 2: WPA + link bounce (with retries)
  t2=$((t2 + 1))
  log "Tier 2: cycle $t2 (max $TIER2_CYCLES_BEFORE_REBOOT before reboot)"
  local attempt=0
  while [[ "$attempt" -le "$RECOVERY_RETRIES" ]]; do
    do_recovery
    if is_reachable; then
      restart_bore "$BORE_RESTART_DELAY"
      write_state 0 0 0 0 "$t3p" "$cfr" "$rp" 0 "$prbid" "$frbid"
      return 0
    fi
    attempt=$((attempt + 1))
    if [[ "$attempt" -le "$RECOVERY_RETRIES" ]]; then
      log "Still unreachable; retrying recovery ($attempt/$RECOVERY_RETRIES)"
    fi
  done

  # Try USB WiFi reset once before escalating to reboot (fixes rtw_8723du wedge)
  do_usb_wifi_reset
  if is_reachable; then
    restart_bore "$BORE_RESTART_DELAY"
    write_state 0 0 0 0 "$t3p" "$cfr" "$rp" 0 "$prbid" "$frbid"
    return 0
  fi

  # Still unreachable after tier 2. Escalate to tier 3 (reboot) if enabled.
  if [[ "$TIER2_CYCLES_BEFORE_REBOOT" -gt 0 ]] && [[ "$t2" -ge "$TIER2_CYCLES_BEFORE_REBOOT" ]]; then
    local boot_id
    boot_id=$(current_boot_id)
    log "Tier 3: initiating full reboot (tier2_cycle_count=$t2, boot_id=$boot_id)"
    write_state "$cf" "$ctf" "$wd" "$t2" 1 "$cfr" "$rp" "$t1a" "$boot_id" "$frbid"
    sync
    # Stop timer so pre-reboot ticks cannot count fake failed reboots.
    systemctl --user stop network-watchdog-recovery.timer 2>>"$LOG_FILE" || log "WARNING: could not stop watchdog timer before reboot"
    sudo reboot
    exit 0
  fi

  write_state "$cf" "$ctf" "$wd" "$t2" "$t3p" "$cfr" "$rp" "$t1a" "$prbid" "$frbid"
}

# Serialize: timer is 5s but recovery sleeps can exceed that.
exec 9>"$LOCK_FILE"
if ! flock -n 9; then
  exit 0
fi

main "$@"
