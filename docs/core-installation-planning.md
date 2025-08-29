# Core Installation Planning

## Overview
This document outlines the plan for auto-installing the core Sanctum components from git repositories during the bootstrap process.

## Core Components Identified

### 1. SMCP (Sanctum Model Context Protocol)
- **Repository**: `sanctumos/smcp`
- **Purpose**: Shared MCP service for plugin orchestration
- **Installation Target**: `/sanctum/smcp/` (independent with own venv)
- **Key Files**: 
  - `smcp/mcp_server.py` - Main server entry point
  - `start.sh` - Startup script (uses venv)
  - `requirements.txt` - Dependencies including `mcp>=1.10.1`

### 2. Broca
- **Repository**: `sanctumos/broca`
- **Purpose**: Core agent framework
- **Installation Target**: `/sanctum/agents/agent-<uid>/broca2/` (uses global venv)
- **Key Files**:
  - `main.py` - Main application entry point
  - `runtime/core/` - Core agent functionality
  - `plugins/` - Plugin system
  - `requirements.txt` - Dependencies including `telethon`, `sqlalchemy`, `aiohttp`

### 3. UI/Control Interface
- **Repository**: TBD (need to identify or create)
- **Purpose**: Web-based control panel
- **Installation Target**: `/sanctum/control/web/` (uses global venv)

## Repository Analysis

### SMCP Structure
```
smcp/
├── smcp/
│   ├── mcp_server.py      # Main server (367 lines)
│   ├── __init__.py
│   └── plugins/           # Plugin directory
├── start.sh               # Startup script
├── requirements.txt       # Dependencies
└── tests/                 # Test suite
```

**Key Observations**:
- Has its own startup script that expects a venv
- Main server is in `smcp/mcp_server.py`
- Plugin discovery system built-in
- Uses official MCP library

### Broca Structure
```
broca/
├── main.py                # Main entry point (263 lines)
├── runtime/
│   └── core/             # Core agent functionality
├── plugins/               # Plugin system
│   ├── web_chat/
│   ├── telegram_bot/
│   └── telegram/
├── database/              # Database operations
├── common/                # Shared utilities
├── cli/                   # Command line interface
└── requirements.txt       # Dependencies
```

**Key Observations**:
- Main entry point is `main.py`
- Has plugin system with multiple plugins
- Database operations included
- CLI interface available

## Structure Mapping to Canonical Layout

Based on the canonical documentation, here's how the repository structures should map to the Sanctum layout:

### SMCP Mapping (Independent Service)
**Current Repository Structure** → **Canonical Target**
```
temp-repos/smcp/                    → /sanctum/smcp/
├── smcp/mcp_server.py             → app/mcp_server.py
├── smcp/__init__.py               → app/__init__.py  
├── smcp/plugins/                  → plugins/          (direct copy)
├── start.sh                       → run/start.sh      (modified)
├── requirements.txt                → requirements.txt  (module-specific)
└── tests/                         → tests/            (development only)
```

**Canonical Result**:
```
/sanctum/smcp/
├── app/                           # Contains mcp_server.py and __init__.py
├── venv/                          # Independent venv (not shared)
├── config/                        # Module .env / settings
├── db/                            # mcp.sqlite
├── plugins/                       # Direct copy from repo
├── logs/                          # Module logs
├── run/                           # Modified startup scripts
└── requirements.txt                # Module-specific deps
```

### Broca Mapping (Agent Module)
**Current Repository Structure** → **Canonical Target**
```
temp-repos/broca/                  → /sanctum/agents/agent-<uid>/broca2/
├── main.py                        → app/main.py
├── runtime/                       → app/runtime/      (direct copy)
├── plugins/                       → plugins/          (direct copy)
├── database/                      → app/database/     (direct copy)
├── common/                        → app/common/       (direct copy)
├── cli/                          → app/cli/          (direct copy)
├── settings.json                  → config/settings.json
└── requirements.txt               → requirements.txt  (module-specific)
```

**Canonical Result**:
```
/sanctum/agents/agent-<uid>/broca2/
├── app/                           # Contains main.py and all core directories
├── config/                        # Module .env / settings
├── db/                            # broca2.sqlite
├── plugins/                       # Direct copy from repo
├── logs/                          # Module logs
└── run/                           # Startup scripts (generated)
```

### Control Interface Mapping
**Current Repository Structure** → **Canonical Target**
```
control/                           → /sanctum/control/
├── app.py                         → web/app.py        (main Flask app)
├── static/                        → web/static/       (direct copy)
├── templates/                     → web/templates/    (direct copy)
└── requirements.txt               → requirements.txt  (module-specific)
```

**Canonical Result**:
```
/sanctum/control/
├── web/                           # Contains Flask app and UI
├── registry.db                    # Install-level database
├── gateway/                       # Proxy/auth layer
└── run/                           # Unified process management
```

## Agent Creation via .af Files

### **Perfect Workflow for Sanctum Agents**

Thanks to the [letta-ai/agent-file](https://github.com/letta-ai/agent-file) repository, we have full `.af` file support in the existing `letta-client` SDK.

#### **Agent Design & Export Phase**
1. **Use Letta's ADE** (Agent Development Environment) to design the perfect Sanctum agent:
   - System prompts about Sanctum architecture and capabilities
   - Memory blocks for system knowledge and documentation
   - Tool configurations for system operations
   - Personality traits and behavior patterns
   - LLM settings and context window configuration

2. **Export as .af file** from the ADE

#### **Agent Import & Deployment Phase**
1. **Use existing SDK** to import the `.af` file:
   ```python
   from letta_client import Letta
   
   client = Letta(base_url="http://localhost:8284")
   
   # Import .af file
   agent_state = client.agents.import_agent_serialized(
       file=open("/path/to/sanctum-agent.af", "rb")
   )
   print(f"Imported agent: {agent_state.id}")
   ```

2. **Deploy to canonical structure** in `/sanctum/agents/agent-<uid>/`

#### **Benefits of .af Approach**
- **Visual design tools** in ADE for perfect agent configuration
- **Complete agent state** including memory, tools, and personality
- **Native SDK support** - no custom import functions needed
- **Portable agents** that can be shared and version controlled
- **Full integration** with Letta's memory and tool systems

### **Example .af Files Available**
The agent-file repository provides several example agents we could use as starting points:
- **Deep Research Agent** - Good for system analysis and documentation
- **Customer Support Agent** - Good for system management and user assistance
- **Workflow Agent** - Good for automation and task orchestration

### **Future Enhancement: Full Sanctum Control Agent**

**Note: Not included in MVP, but planned for future releases**

The ultimate goal is to create a **default Sanctum agent** that provides full control over the entire ecosystem:

#### **MCP Integration**
- **Plugin management** - Install, configure, and manage MCP plugins
- **Server control** - Start, stop, and monitor MCP services
- **Tool discovery** - Browse and utilize available MCP tools
- **Plugin development** - Create and test custom MCP plugins

#### **Broca Agent Management**
- **Agent lifecycle** - Create, start, stop, and monitor Broca agents
- **Plugin deployment** - Deploy Broca plugins across agent instances
- **Configuration management** - Manage agent settings and environment variables
- **Health monitoring** - Check agent status and performance metrics

#### **System Administration**
- **Sanctum architecture** - Understand and manage the canonical directory structure
- **Service orchestration** - Coordinate between SMCP, Broca, and control interfaces
- **Resource management** - Monitor system resources and performance
- **Troubleshooting** - Diagnose and resolve system issues

#### **Benefits of Full Control Agent**
- **Single point of control** for entire Sanctum ecosystem
- **Unified interface** for all system operations
- **Reduced complexity** for end users
- **Centralized management** of distributed components

This would transform the default agent from a basic system component into a **full Sanctum command center** that users can interact with to manage their entire installation.

## Transformation Logic Required

### SMCP Transformation Steps
1. **Create canonical structure**: `/sanctum/smcp/{app,venv,config,db,plugins,logs,run}`
2. **Move core files**: 
   - `smcp/mcp_server.py` → `app/mcp_server.py`
   - `smcp/__init__.py` → `app/__init__.py`
3. **Copy plugins**: `smcp/plugins/` → `plugins/` (direct copy)
4. **Modify startup script**: Update `start.sh` to use local venv and config
5. **Create config**: Generate `.env` with `MCP_PLUGINS_DIR=../plugins`
6. **Initialize venv**: Create independent Python venv
7. **Install deps**: Install from module requirements.txt to local venv

### Broca Transformation Steps
1. **Create canonical structure**: `/sanctum/agents/agent-<uid>/broca2/{app,config,db,plugins,logs,run}`
2. **Move core files**:
   - `main.py` → `app/main.py`
   - `runtime/` → `app/runtime/` (entire directory)
   - `database/` → `app/database/` (entire directory)
   - `common/` → `app/common/` (entire directory)
   - `cli/` → `app/cli/` (entire directory)
3. **Copy plugins**: `plugins/` → `plugins/` (direct copy)
4. **Move config**: `settings.json` → `config/settings.json`
5. **Create .env**: Generate with port assignment and paths
6. **Generate startup script**: Create canonical `start-broca2.sh`

### Key Transformation Rules
- **app/ directory**: Contains all executable code and core functionality
- **config/ directory**: Contains all configuration files (.env, settings.json, etc.)
- **plugins/ directory**: Direct copy from repository (no restructuring)
- **logs/ directory**: Empty, created for runtime logging
- **db/ directory**: Empty, created for SQLite databases
- **run/ directory**: Contains startup/shutdown scripts (generated, not copied)

### File Path Adjustments Needed
- **SMCP**: Update `start.sh` to use `../config/.env` and `../venv/bin/python`
- **Broca**: Update any hardcoded paths in code to use relative paths from `app/` directory
- **Import statements**: May need adjustment if code assumes specific directory structure
- **Plugin discovery**: Ensure plugins can find their dependencies in the new structure

## Installation Challenges & Considerations

### 1. Directory Structure Transformation
**Current Issue**: Repos have their own structure that doesn't match canonical Sanctum layout

**Canonical Target**:
```
/sanctum/smcp/
├── app/                   # Should contain smcp/mcp_server.py
├── venv/                  # Independent venv
├── config/                # Module .env / settings
├── db/                    # Module SQLite
├── plugins/               # Module plugins
├── logs/                  # Module logs
└── run/                   # Startup scripts

/sanctum/agents/agent-<uid>/broca2/
├── app/                   # Should contain main.py and core files
├── config/                # Module .env / settings
├── db/                    # Module SQLite
├── plugins/               # Module plugins
├── logs/                  # Module logs
└── run/                   # Startup scripts
```

### 2. Dependencies Management
**SMCP**: Has its own requirements.txt with MCP-specific deps
**Broca**: Has requirements.txt with agent-specific deps
**Global Venv**: Need to consolidate and resolve conflicts

### 3. Configuration Files
**SMCP**: Expects `MCP_PLUGINS_DIR` environment variable
**Broca**: Uses `settings.json` and `.env` files
**Port Assignment**: Need to implement canonical port scheme (9100+, 9200+)

### 4. Startup Scripts
**SMCP**: Has `start.sh` but expects venv
**Broca**: No startup script, just `main.py`
**Need**: Create canonical startup scripts in `/sanctum/control/run/`

## Proposed Installation Process

### Phase 1: Repository Analysis
1. ✅ Clone repos to temp location
2. ✅ Analyze repository structures
3. ✅ Document key files and dependencies
4. ✅ Map current structure to canonical structure

### Phase 2: Installation Logic Design
1. **Directory Creation**: Create canonical structure
2. **File Transplantation**: Move/copy files to correct locations
3. **Dependency Resolution**: Merge requirements.txt files
4. **Configuration Setup**: Generate .env files with proper ports
5. **Startup Script Creation**: Generate canonical startup scripts

### Phase 3: Testing
1. **Unit Tests**: Test each component installation separately
2. **Integration Tests**: Test full stack startup
3. **Validation**: Verify canonical structure compliance

### Phase 4: Bootstrap Integration
1. **Script Creation**: Build git installation functions
2. **Error Handling**: Add proper error handling and rollback
3. **User Experience**: Add progress indicators and validation

## Next Steps

1. **Complete Repository Analysis**: Deep dive into key files
2. **Design Transformation Logic**: How to restructure repos into canonical layout
3. **Create Test Scripts**: Validate installation process step by step
4. **Build Installation Functions**: Implement the actual installation logic

## Questions to Resolve

1. **UI Repository**: Where is the control interface coming from?
2. **Plugin Compatibility**: Will existing plugins work in canonical structure?
3. **Database Migration**: How to handle existing data in repos?
4. **Error Recovery**: What happens if installation fails partway through?
5. **Update Strategy**: How to handle future updates to these repos?

## Notes

- Both repos appear to be production-ready with proper dependency management
- SMCP is more self-contained and should be easier to install
- Broca has more complex structure and may need more transformation logic
- Need to understand how these components will interact in the final system
