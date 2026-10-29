# Network watchdog (bore persistence)

Canonical copy of Moya’s **network-watchdog-recovery** stack: keep WiFi + bore tunnels alive, escalate to reboot when needed.

**Source of truth sync:** live Moya + authlokr-ai 2026-10-29 (RF-kill unblock, persist t2 before recovery, skip hung dhclient, TimeoutStartSec=120, `NETWORK_WATCHDOG_HAIRPIN_E2E`). SHA-256:

`cfb612058d4d0731955172fd65dc9e9fb0ed3a011916eb73bd08fd97c745b45d`

## What it does

| Tier | Condition | Action |
|------|-----------|--------|
| 1 | LAN up, bore TCP down | `systemctl --user restart bore-client` (+ `bore-ssh-client` if present) |
| 2 | Gateway / remote unreachable | Restart netplan WPA + bounce WiFi iface (+ optional USB WiFi reset) |
| 3 | Still down after N cycles | `reboot` (pauses after repeated failed reboots) |

Timer runs every **5 seconds** (user systemd: `OnBootSec` + `OnActiveSec` + `OnUnitInactiveSec`). Do **not** use `OnUnitActiveSec` alone — if user systemd starts after `OnBootSec` and the oneshot has never activated this boot, `NextElapse=infinity` and the watchdog stays dead. Oneshot must have `TimeoutStartSec=120` (not infinity, not 45 — 45s killed every Tier-2 pass and never persisted the reboot counter). Banner probes must use `timeout -k`. Persist `tier2_cycle_count` **before** recovery. Skip `dhclient` unless `wpa_state=COMPLETED`. `rfkill unblock wifi` at the start of reconnect (install the `rfkill` package).

## Files

| File | Install to |
|------|------------|
| `network-watchdog-recovery.sh` | `~/bin/network-watchdog-recovery.sh` |
| `network-watchdog-recovery.service` | `~/.config/systemd/user/` |
| `network-watchdog-recovery.timer` | `~/.config/systemd/user/` |
| `usb-wifi-reset.sh` | `~/bin/` (Moya USB Realtek only; optional elsewhere) |
| `sudoers.network-watchdog.example` | `/etc/sudoers.d/network-watchdog` (edit user + iface) |

## Install (generic)

1. Copy script(s) to `~/bin/`, units to `~/.config/systemd/user/`.
2. Edit defaults or set `~/.config/network-watchdog.env` (service `EnvironmentFile=-`): `NETWORK_WATCHDOG_GATEWAY`, `NETWORK_WATCHDOG_REMOTE`, `NETWORK_WATCHDOG_BORE_PORT(S)`, `NETWORK_WATCHDOG_INTERFACE`, `NETWORK_WATCHDOG_HAIRPIN_E2E=0` if the box cannot hairpin its own tunnel.
3. Install sudoers from the example — **change username and interface** to match the host (`visudo -cf` first).
4. `loginctl enable-linger $USER`
5. `systemctl --user daemon-reload && systemctl --user enable --now network-watchdog-recovery.timer`

Requires `bore-client.service` (and optionally `bore-ssh-client.service`) with `Restart=always`.

## Host notes

- **Moya:** iface `wlx2cf05dfb1561`, bore ports `7836` + `7837`, user `rizzn`, USB reset enabled, hairpin e2e on.
- **authlokr-ai:** iface `wlp58s0`, bore `7838` + `7842`, user `rizzn0`, `NETWORK_WATCHDOG_USB_WIFI=0`, **`NETWORK_WATCHDOG_HAIRPIN_E2E=0`** (ISP cannot hairpin). Same script; sudoers user + iface must match.
