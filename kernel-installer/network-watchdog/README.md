# Network watchdog (bore persistence)

Canonical copy of Moya’s **network-watchdog-recovery** stack: keep WiFi + bore tunnels alive, escalate to reboot when needed.

**Source of truth sync:** pulled from live Moya (`~/bin/network-watchdog-recovery.sh`) 2026-09-23. SHA-256 of the script at sync:

`1a1a10ee1ac5ebb7b5d3cc9952b0554c18885621ed3f6d18121b046fa08c156f`

## What it does

| Tier | Condition | Action |
|------|-----------|--------|
| 1 | LAN up, bore TCP down | `systemctl --user restart bore-client` (+ `bore-ssh-client` if present) |
| 2 | Gateway / remote unreachable | Restart netplan WPA + bounce WiFi iface (+ optional USB WiFi reset) |
| 3 | Still down after N cycles | `reboot` (pauses after repeated failed reboots) |

Timer runs every **5 seconds** (user systemd).

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
2. Edit defaults or set env: `NETWORK_WATCHDOG_GATEWAY`, `NETWORK_WATCHDOG_REMOTE`, `NETWORK_WATCHDOG_BORE_PORT(S)`, `NETWORK_WATCHDOG_INTERFACE`.
3. Install sudoers from the example — **change username and interface** to match the host (`visudo -cf` first).
4. `loginctl enable-linger $USER`
5. `systemctl --user daemon-reload && systemctl --user enable --now network-watchdog-recovery.timer`

Requires `bore-client.service` (and optionally `bore-ssh-client.service`) with `Restart=always`.

## Host notes

- **Moya:** iface `wlx2cf05dfb1561`, bore ports `7836` + `7837`, user `rizzn`, USB reset enabled.
- **Other boxes** (e.g. authlokr-ai): same script with env overrides; omit USB reset / ssh tunnel if unused.
