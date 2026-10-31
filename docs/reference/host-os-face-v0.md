# Sanctum Registry + installer harness — pointer (v0)

Canonical long form: https://github.com/sanctumos/ade/blob/main/docs/host-os/README.md

**This repo’s future job (experimental):** stop being a **collection** of env-specific bootstraps (`kernel-installer/sanctum_bootstrap.sh` vs `_local_letta` vs `_proot_letta`). Become a **lightweight OSS harness** (Python + recipes; occasional local devops — **not Letta Code**) that:

1. **Polls Registry** for sysinfo (`bare` / `wsl` / `docker` / `proot`, paths, …)
2. Takes a bootstrap **contract**
3. Adapts and applies
4. Writes actual/ports back to Registry

**Interactive debugger (locked):** compact **gptme** (`[minimal]`, `--system short`, `--tools shell,read,patch,save`). Goose is out. Freeze to a binary is later packaging, not the first spike. Same agent later as a **brain doctor** for Kernel/agent trees — outside the Kernel.

**Registry** (separate sidecar) is the hive + light ADE↔Broca transport. It is not this harness.

Layout canon: `docs/reference/docs-on-installer-criteria.md`. Hive stub: `registry_schema.md` (idea only).
