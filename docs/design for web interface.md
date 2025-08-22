# Web Interface Design Specification - Sanctum Configurator

## Overview

This document specifies the complete web interface design for the Sanctum Configurator, including both the Settings → Tools page and the main Chat interface. The design emphasizes a dark, professional aesthetic with Bootstrap-based components, smooth interactions, and comprehensive functionality.

---

## Settings → Tools Page

### Layout & Structure

The Settings page now uses a tabbed navigation system to properly separate global-level configuration from per-agent configuration, aligned with the actual Sanctum installation structure:

```
┌────────────────────────────────────────────────────────────────────┐
│  Settings                    Status: ● Healthy v1.0.0    [← Chat] │
│  ───────────────────────────────────────────────────────────────── │
│  [Global] [Athena] [Monday] [Timbre] [SMCP]                       │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │⚙️  System Settings │  │🧰  Install Module  │  │⏰  Cron Scheduler  │ │
│  │ Base ports, paths │  │ Quick setup &      │  │ Automated module  │ │
│  │ & env variables   │  │ upgrades           │  │ execution         │ │
│  │                    │  │                   │  │                    │ │
│  │ [Open]  ● OK       │  │ [Open]  ● OK      │  │ [Open]  ● OK       │ │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘ │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐                        │
│  │➕  Create Agent     │  │📁  Backup/Restore  │                        │
│  │ Add new Prime      │  │ System backup &   │                        │
│  │ agent to system   │  │ recovery tools    │                        │
│  │                    │  │                   │                        │
│  │ [Create]  ● OK    │  │ [Open]  ● OK      │                        │
│  └───────────────────┘  └───────────────────┘                        │
│                                                                      │
│  Tips: 1–6 to open • Enter = Open • Esc = Clear search • Ctrl+1-5 = Switch tabs │
└────────────────────────────────────────────────────────────────────┘
```

### Tab Navigation System

#### Global Tab (System-wide Configuration)
- **System Settings**: Base ports, paths, environment variables, `.env` configuration, user management
- **Install Module**: Setup, upgrades, system health monitoring
- **Cron Scheduler**: Automated execution scheduling for all modules
- **Create Agent**: Add new Prime agents to the system
- **Backup/Restore**: System backup and recovery tools

#### Agent Tabs (Per-Prime Configuration)
All agent configuration pages follow the same layout pattern:

```
┌────────────────────────────────────────────────────────────────────┐
│  [Search tools…] [✕]                    [n results]               │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │💬  Chat Settings   │  │🛰️  Broca           │  │🌙  Dream Agent     │ │
│  │ Model, voice,     │  │ Streams & tool I/O │  │ Archives & recall │ │
│  │ safety, persona   │  │                    │  │ policies          │ │
│  │                    │  │                   │  │                    │ │
│  │ [Open]  ● OK      │  │ [Open]  ● OK      │  │ [Open]  ● OK      │ │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘ │
│                                                                      │
│  ┌───────────────────┐                                                │
│  │📊  Logs & Status   │                                                │
│  │ Health monitoring │                                                │
│  │ & log access      │                                                │
│  │                    │                                                │
│  │ [Open]  ● OK      │                                                │
│  └───────────────────┘                                                │
```

**Standard Agent Tools** (same for all agents):
- **Chat Settings**: Model preferences, voice settings, persona configurations
- **Broca**: Streams & tool I/O management
- **Dream Agent**: Archives & recall policies
- **Logs & Status**: Health monitoring & log access

#### SMCP Tab (Independent Service)
- **SMCP Configurator**: MCP plugins, scopes & health management
- **Tool Control**: Management of Letta tools and MCP integrations
- **Plugin Registry**: Available plugins, installation status, version management
- **Service Health**: Status monitoring, logs, performance metrics
- **Independent Venv**: SMCP maintains its own Python environment

### Key Features

#### Tab-based Navigation
- **Active Tab**: Highlighted with accent color and border
- **Tab Switching**: Instant navigation between configuration levels
- **Context Awareness**: Each tab shows relevant tools and settings
- **Search Scope**: Search filters within the active tab context

#### Configuration Hierarchy
- **Global Level**: System-wide settings affecting all agents (`/sanctum/.env`)
- **Agent Level**: Individual Prime configurations and tools (`/sanctum/agents/agent-<uid>/`)
- **Module Level**: Specific tool configurations within each agent
- **Service Level**: Independent services like SMCP (`/sanctum/smcp/`)

#### Create New Agent Function
- **Agent Creation**: Add new Prime agents to the system
- **Template Setup**: Automatically create standard folder structure
- **Configuration**: Set up default `.env` files and port assignments
- **Integration**: Add to control system and registry database

#### Process Management Integration
- **Background Capabilities**: Centralized start/stop/restart for all modules (handled by control system)
- **Run Scripts**: All run scripts located in `/sanctum/control/run/`
- **Unified Interface**: Start/stop/restart all modules from one location
- **Cron Integration**: Automated scheduling for module execution
- **Status Monitoring**: Real-time health checks and log access

#### Search & Filtering
- **Tab-scoped Search**: Live filtering within the active tab context
- **Results Counter**: Shows "n results" below search input
- **Clear Button**: ✕ button appears when search has content
- **Keyboard Shortcuts**: Esc clears search and refocuses input

#### Tool Cards
- **Card Density**: Optimized padding (1.25rem top/bottom, 1.5rem left/right)
- **Status Indicators**: Color-coded dots with hover tooltips
  - ● Green: Healthy
  - ● Orange: Degraded  
  - ● Red: Off
- **Status Tooltips**: Hover reveals status label (e.g., "● Healthy")
- **Actions**: Primary "Open" button for navigation
- **Button Hierarchy**: "Open" is prominent and clearly labeled

#### Responsive Design
- **Desktop**: 3-up grid layout
- **Medium Screens**: 2-up layout at max-width: 1200px
- **Mobile**: 1-up layout with adjusted padding

#### Keyboard Navigation
- **Number Keys**: 1-6 to open corresponding tools
- **Enter**: Opens first visible tool
- **Escape**: Clears search and refocuses
- **Tab Navigation**: Ctrl+1-5 to switch between tabs

---

## System Settings Page

### Layout & Structure

The System Settings page provides comprehensive system-wide configuration management:

```
┌────────────────────────────────────────────────────────────────────┐
│  ⚙️ System Settings                    [← Back to Chat] [Settings] │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 👥 User Management                                              │ │
│  │                                                                 │ │
│  │ 🔍 Discover Users from Broca                                    │ │
│  │ Find users who have interacted with your agents and promote     │ │
│  │ them to full Sanctum users.                                     │ │
│  │ [🔍 Discover Users]                                             │ │
│  │                                                                 │ │
│  │ 📋 Manage Existing Users                                        │ │
│  │ [Search users...] [All Roles ▼]                                 │ │
│  │                                                                 │ │
│  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│  │ │ Username │ Email │ Role │ Status │ Last Login │ Actions    │ │ │
│  │ │ admin    │ ...   │ Admin│ Active │ 2024-01-15 │ ✏️ ⏸️      │ │ │
│  │ │ john_doe │ ...   │ User │ Active │ 2024-01-14 │ ✏️ ⏸️      │ │ │
│  │ │ jane_smith│ ...  │Viewer│Inactive│ 2024-01-10 │ ✏️ ▶️      │ │ │
│  │ └─────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 🔧 System Configuration                                          │ │
│  │                                                                 │ │
│  │ Environment Variables                                            │ │
│  │ OpenAI API Key: [••••••••••••••••••••••••••••••••••••••••] [👁️] │ │
│  │ Anthropic API Key: [••••••••••••••••••••••••••••••••••••••••] [👁️] │ │
│  │ Ollama Base URL: [http://localhost:11434]                      │ │
│  │                                                                 │ │
│  │ Path Configurations                                             │ │
│  │ Sanctum Base Path: [~/sanctum]                                 │ │
│  │ Letta Data Path: [~/.letta]                                    │ │
│  │                                                                 │ │
│  │ [💾 Save Configuration] [📤 Export Config] [📥 Import Config]   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Key Features

#### User Management
- **User Discovery**: Find and promote users from Broca interactions
- **User Table**: Comprehensive user management with search and filtering
- **Role Management**: Admin, User, and Viewer role assignments
- **Status Control**: Active/Inactive user account management
- **Edit User Modal**: Full user editing capabilities including:
  - Username and email modification
  - Role and status changes
  - Optional password updates
  - User deletion with confirmation
- **User Promotion**: Convert discovered users to full Sanctum users

#### System Configuration
- **Environment Variables**: Secure storage of API keys and configuration
- **Path Management**: System directory configuration
- **Import/Export**: Configuration backup and restore functionality
- **Secure Inputs**: Password fields with toggle visibility
- **Real-time Validation**: Form validation and error handling

#### Modal System
- **User Promotion Modal**: Add new users to the system
- **Edit User Modal**: Comprehensive user editing interface
- **Responsive Design**: Mobile-friendly modal layouts
- **Form Validation**: Required field validation and error handling
- **Success Notifications**: User feedback for all operations

---

## Install Module Page

### Layout & Structure

The Install Module page provides a comprehensive module management interface:

```
┌────────────────────────────────────────────────────────────────────┐
│  🧰 Install Module - Sanctum Configurator                         │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  [Search modules...]                                                │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 🌐 Global Tools                                                 │ │
│  │                                                                 │ │
│  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│  │ │ Module Name │ Version │ Status │ Description │ Actions     │ │ │
│  │ │ Core        │ 1.0.0   │ Core   │ System Core │ System Module│ │ │
│  │ │ Broca       │ 1.0.0   │ Core   │ Streams I/O │ System Module│ │
│  │ │ Nginx       │ 1.0.0   │ Installed│ Web Server │ [Uninstall] │ │
│  │ │ Docker      │ 1.0.0   │ Installed│ Container  │ [Uninstall] │ │
│  │ └─────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ 🤖 Agent-Specific Tools                                        │ │
│  │ Prime Agent: [Athena ▼]                                        │ │
│  │                                                                 │ │
│  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│  │ │ Module Name │ Version │ Status │ Description │ Actions     │ │ │
│  │ │ Dream Agent │ 1.0.0   │ Unavailable│ Archives │ Coming Soon │ │
│  │ │ Thalamus    │ 1.0.0   │ Installed│ Memory    │ [Uninstall] │ │
│  │ │ Cerebellum  │ 1.0.0   │ Installed│ Processing│ [Uninstall] │ │
│  │ └─────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Key Features

#### Module Categories
- **Global Tools**: System-wide modules affecting all agents
- **Agent-Specific Tools**: Modules specific to individual Prime agents
- **Dynamic Agent Selection**: Dropdown to switch between Athena, Monday, and Timbre

#### Module Status Management
- **Core Modules**: Marked as "Core" with no install/uninstall buttons
- **Available Modules**: Show Install/Uninstall buttons
- **Unavailable Modules**: Marked as "Coming Soon" with no actions
- **Installed Modules**: Show Uninstall button

#### Search and Filtering
- **Real-time Search**: Instant filtering across all modules
- **Status-based Display**: Dynamic button and badge rendering
- **Responsive Table**: Mobile-friendly table layout

---

## CRON Scheduler Page

### Layout & Structure

The CRON Scheduler page provides comprehensive task scheduling management:

```
┌────────────────────────────────────────────────────────────────────┐
│  ⏰ CRON Scheduler - Sanctum Configurator                          │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  [Add New Job] [Refresh] [Bulk Enable] [Bulk Disable]              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ ┌─────────────────────────────────────────────────────────────┐ │ │
│  │ │ Job Name │ Schedule │ Command │ Status │ Last Run │ Actions │ │ │
│  │ │ Backup   │ 0 2 * * *│ backup.sh│ Active │ 2024-01-15│ [Edit] [Toggle] [Delete] │ │
│  │ │ Cleanup  │ 0 4 * * 0│ cleanup.sh│ Paused │ 2024-01-14│ [Edit] [Toggle] [Delete] │ │
│  │ │ Health   │ */15 * * * *│ health.sh│ Active │ 2024-01-15│ [Edit] [Toggle] [Delete] │ │
│  │ └─────────────────────────────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Key Features

#### Job Management
- **Add New Job**: Create new scheduled tasks
- **Edit Jobs**: Modify existing job parameters
- **Toggle Status**: Enable/disable individual jobs
- **Delete Jobs**: Remove jobs with confirmation
- **Bulk Operations**: Enable/disable multiple jobs at once

#### Job Information
- **Schedule Display**: Human-readable cron expressions
- **Status Indicators**: Active, Paused, Failed, Running states
- **Execution History**: Last run and next run times
- **Command Preview**: Full command execution details

---

## Chat Settings Page

### Layout & Structure

The Chat Settings page provides comprehensive agent configuration:

```
┌────────────────────────────────────────────────────────────────────┐
│  💬 Chat Settings - Sanctum Configurator                          │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  Agent: [Athena ▼]                                                  │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Agent Configuration                                             │ │
│  │                                                                 │ │
│  │ Agent UID: athena-001 (Non-configurable)                       │ │
│  │ Name: [Athena]                                                  │ │
│  │ Model: [GPT-4 ▼]                                               │ │
│  │ System Instructions: [Expand ▼]                                 │ │
│  │ [You are Athena, a helpful AI assistant...]                    │ │
│  │ Max Output Tokens: [4096]                                       │ │
│  │ Context Window: [8192]                                          │ │
│  │ Temperature: [0.7]                                              │ │
│  │ Enable Reasoning: [Toggle ON]                                   │ │
│  │                                                                 │ │
│  │ [💾 Save Changes] [🔄 Reset to Defaults] [📤 Export Config]     │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Configuration Preview                                           │ │
│  │ { "name": "Athena", "model": "gpt-4", ... }                    │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Key Features

#### Agent Selection
- **Dynamic Switching**: Select between Athena, Monday, and Timbre
- **Configuration Loading**: Automatic loading of agent-specific settings
- **Real-time Preview**: Live configuration preview panel

#### Configurable Fields
- **Basic Settings**: Name, model selection, system instructions
- **Advanced Parameters**: Token limits, context window, temperature
- **Reasoning Toggle**: Enable step-by-step thinking capabilities
- **Expandable Instructions**: Collapsible system instructions field

#### Configuration Management
- **Save Changes**: Persistent storage of agent settings
- **Reset to Defaults**: Restore factory settings
- **Export Config**: Download configuration as JSON
- **Validation**: Real-time form validation and feedback

---

## SMCP Configurator Page

### Layout & Structure

The SMCP Configurator page provides comprehensive MCP service management:

```
┌────────────────────────────────────────────────────────────────────┐
│  🔌 SMCP Configurator - Sanctum Configurator                      │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  [Overview] [Plugins] [Tools] [Sessions] [Health]                  │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │ Quick Actions                                                   │ │
│  │ [🔄 Refresh All] [➕ Add Plugin] [📤 Export] [📥 Import]        │ │
│  │                                                                 │ │
│  │ Recent Activity                                                 │ │
│  │ • Plugin 'botfather' registered at 14:30                       │ │
│  │ • Tool 'devops' connected at 14:25                             │ │
│  │ • Session 'user-123' started at 14:20                          │ │
│  │                                                                 │ │
│  │ Server Status: ● Online                                         │ │
│  │ System Info: Python 3.11, MCP v0.1.0                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
```

### Key Features

#### Tabbed Interface
- **Overview**: Quick actions, recent activity, server status
- **Plugins**: Plugin registry and management
- **Tools**: Available MCP tools and capabilities
- **Sessions**: Active user sessions and connections
- **Health**: System metrics, logs, and alerts

#### Plugin Management
- **Plugin Registry**: List of available and installed plugins
- **Add New Plugin**: Install and configure new MCP plugins
- **Plugin Status**: Health monitoring and status indicators
- **Configuration**: Plugin-specific settings and parameters

#### Health Monitoring
- **Real-time Metrics**: CPU, memory, and connection statistics
- **Log Aggregation**: Centralized log viewing and filtering
- **Alert System**: Active alerts and notifications
- **Maintenance Actions**: Restart server, clear cache operations

---

## Chat Interface

### Layout & Structure

The Chat interface provides a full-bleed conversation experience with fixed-height scrolling:

```
┌────────────────────────────────────────────────────────────────────┐
│  [Athena ▼]                    Chat                        [⚙ Settings] │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  [A] Athena                                                    │ │
│  │  [bubble] Hey Mark—ready when you are. I can help you...      │ │
│  │  [Today, 2:30 PM] [Copy] [Share]                              │ │
│  │                                                                 │ │
│  │  [R] rizzn                                                     │ │
│  │  [bubble] Let's test the composer and see how it feels.       │ │
│  │  [Today, 2:31 PM] [Copy] [Share]                              │ │
│  │                                                                 │ │
│  │  [⚙] Tool                                                      │ │
│  │  [TOOL OUTPUT] ✓ Sanctum kernel installed successfully...     │ │
│  │  [Today, 2:32 PM] [Copy All]                                  │ │
│  │                                                                 │ │
│  │  [A] Athena                                                    │ │
│  │  [bubble] I received your message...                           │ │
│  │  [Today, 2:33 PM] [Copy] [Share]                              │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │  [Message Athena…] [📎] [🎙️] [Send]                           │ │
│  └─────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  [New ↓] ← Jump to bottom button (appears when scrolled up)        │
└────────────────────────────────────────────────────────────────────┘
```

### Key Features

#### Agent Switching
- **Dropdown Header**: Shows current agent with dropdown menu
- **Conversation Refresh**: Switching agents clears transcript and starts fresh
- **Loading State**: Spinner + "Loading [Agent]..." in dropdown button
- **Page Title Update**: Browser tab shows "Chat with [Agent] - Sanctum"
- **Avatar Update**: Assistant avatar letter changes to match new agent

#### Message System
- **User Messages**: Right-aligned, gray bubbles with "R" avatar and "rizzn" name
- **Assistant Messages**: Left-aligned, darker bubbles with agent initial and name
- **Tool Output**: Special styling with tool chip header and "Copy All" button
- **Message Actions**: Copy and Share buttons with hover tooltips
- **Timestamps**: Subtle timestamps that appear on hover, positioned inline with actions

#### Message Actions
- **Copy Button**: Copies message content with visual feedback (checkmark)
- **Share Button**: Uses Web Share API with fallback to clipboard
- **Copy All Button**: For tool output messages
- **Visual Feedback**: Success state with checkmark icon for 2 seconds
- **Icon-Only Design**: No text labels, just SVG icons for clean appearance

#### Layout & Scrolling
- **Fixed Height**: Chat area maintains viewport height, doesn't expand page
- **Internal Scrolling**: Transcript scrolls independently within fixed container
- **Jump to Bottom**: "New ↓" button appears when >200px from bottom
- **Auto-scroll**: New messages automatically scroll to bottom
- **Scroll Position**: Page loads showing most recent messages

#### Composer
- **Auto-expand**: Textarea grows up to 120px height, then scrolls
- **Keyboard Shortcuts**: Enter sends, Shift+Enter new line, Escape focuses
- **Sticky Footer**: Composer stays at bottom with subtle shadow
- **Focus Ring**: Subtle blue focus state with slight lift animation

#### Avatars & Identity
- **Avatar System**: 32px circular avatars with initials/emoji
- **User Avatar**: "R" for rizzn, right-aligned
- **Assistant Avatar**: Agent initial (A, M, T), left-aligned
- **Tool Avatar**: ⚙ emoji for tool output
- **Avatar Names**: Small text below avatars for identification

#### Timestamps
- **Format**: "Today, 2:30 PM", "Yesterday, 3:15 PM", "Dec 15, 4:20 PM"
- **Position**: Inline with copy/share buttons to save space
- **Visibility**: Hidden by default, appears on hover
- **Subtle Design**: Small, dim text that doesn't clutter interface

---

## Implementation Mapping

### File Structure Alignment

The web interface directly maps to the Sanctum installation structure:

```
Web Interface          →  Sanctum Installation
─────────────────────────────────────────────────
Global Tab            →  /sanctum/venv/, /sanctum/.env
Agent Tabs            →  /sanctum/agents/agent-<uid>/
SMCP Tab              →  /sanctum/smcp/
Control Interface     →  /sanctum/control/web/
Process Management    →  /sanctum/control/run/
```

### Control System Integration

#### System Settings Management
- **Environment Configuration**: Reading and writing of `/sanctum/.env` files
- **Port Management**: Assignment and tracking of module ports
- **Path Configuration**: System-wide path and directory settings
- **Status Monitoring**: Tracks system health and configuration
- **User Management**: Comprehensive user account administration

#### Process Management
- **Run Scripts**: Located in `/sanctum/control/run/agent-<uid>/`
- **Start/Stop**: `start-<module>.sh`, `stop-<module>.sh`
- **Global Control**: `start-all.sh`, `stop-all.sh`, `restart-all.sh`
- **Cron Integration**: `/sanctum/control/run/cron/sanctum-crontab`

#### Agent Management
- **Agent Creation**: Automated setup of new Prime agents
- **Folder Structure**: Creation of standard agent module directories
- **Configuration Templates**: Default `.env` files and port assignments
- **Registry Integration**: Addition to control system database

#### Module Configuration
- **Environment Files**: `agents/agent-<uid>/<module>/config/.env`
- **Database Paths**: `agents/agent-<uid>/<module>/db/<module>.sqlite`
- **Log Files**: `agents/agent-<uid>/<module>/logs/<module>.log`
- **Plugin Directories**: `agents/agent-<uid>/<module>/plugins/`

### Data Flow

#### Configuration Discovery
1. **File System Scan**: Control interface scans `/sanctum/agents/`
2. **Module Detection**: Identifies agent folders and module structures
3. **Config Parsing**: Reads `.env` files and configuration data
4. **Status Collection**: Gathers health metrics and log information

#### Process Control
1. **Script Execution**: Runs appropriate scripts from `control/run/`
2. **Status Monitoring**: Tracks process health and resource usage
3. **Log Aggregation**: Collects logs from all modules
4. **Health Reporting**: Provides real-time status updates

#### Dependency Management
1. **Requirements Collection**: Scans all module `requirements.txt`
2. **Conflict Resolution**: Resolves version conflicts intelligently
3. **Consolidation**: Generates unified `/sanctum/requirements.txt`
4. **Installation**: Updates global venv with new dependencies

### Security & Access Control

#### User Management
- **Registry Database**: `/sanctum/control/registry.db`
- **User Sessions**: Authentication and authorization
- **Agent Access**: User-to-agent mapping and permissions
- **Audit Logging**: Track configuration changes and access
- **Role-based Access**: Admin, User, and Viewer permission levels

#### Module Isolation
- **Port Separation**: Each module binds to unique local port
- **Database Isolation**: Per-module SQLite databases
- **Config Separation**: Module-specific environment files
- **Process Independence**: Individual module processes

### Performance Considerations

#### Real-time Updates
- **WebSocket Integration**: Live status updates for process health
- **Polling Fallback**: HTTP polling for status information
- **Cache Management**: Intelligent caching of configuration data
- **Lazy Loading**: Load module details on demand

#### Scalability
- **Agent Addition**: Dynamic discovery of new agents
- **Module Expansion**: Support for new module types
- **Load Distribution**: Efficient handling of multiple agents
- **Resource Monitoring**: Track system resource usage

---

## Design System

### Color Palette

```css
:root {
  --bg-page: #212121;        /* Main background */
  --bg-surface: #303030;     /* Cards, headers, composer */
  --fg: #f9f9fa;            /* Primary text */
  --fg-dim: #c7c7c9;        /* Secondary text, timestamps */
  --bubble-user: #3a3a3a;   /* User message bubbles */
  --bubble-assistant: #252525; /* Assistant message bubbles */
  --bubble-tool: #1f1f1f;   /* Tool output bubbles */
  --border-subtle: #3b3b3b; /* Borders, dividers */
  --ring: #8ab4f8;          /* Focus rings, accents */
}
```

### Typography

- **Font Stack**: `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- **Primary Text**: 16px base, `#f9f9fa`
- **Secondary Text**: 14px, `#c7c7c9`
- **Timestamps**: 12px, `#c7c7c9`
- **Avatar Names**: 11px, `#c7c7c9`

### Spacing & Layout

- **Header Height**: 52px
- **Message Spacing**: 1rem (16px) between message groups
- **Bubble Padding**: 1rem (16px) internal padding
- **Avatar Width**: 60px (32px avatar + spacing)
- **Max Bubble Width**: 720px for messages, 1000px for tool output
- **Container Padding**: 1.25rem (20px) horizontal, 1rem (16px) vertical

### Interactive Elements

#### Buttons
- **Primary**: Blue background with hover lift effect
- **Secondary**: Reduced opacity (0.6) with hover state
- **Danger**: Red background for destructive actions
- **Message Actions**: 24px × 24px with 12px icons
- **Hover Effects**: Opacity increase + slight upward movement

#### Focus States
- **Focus Ring**: 2px blue outline with 2px offset
- **Input Focus**: Blue border + subtle shadow + upward movement
- **Button Focus**: Consistent outline styling

#### Transitions
- **Duration**: 0.2s ease for most interactions
- **Hover States**: Smooth opacity and transform changes
- **Loading States**: Spinner animations with Bootstrap classes

---

## Accessibility Features

### Keyboard Navigation
- **Tab Order**: Logical flow through interactive elements
- **Shortcuts**: Enter, Escape, number keys for common actions
- **Focus Management**: Clear focus indicators and logical flow

### Screen Reader Support
- **ARIA Labels**: Proper labeling for buttons and interactive elements
- **Live Regions**: Transcript updates announced to screen readers
- **Status Messages**: Loading states and feedback communicated

### Visual Accessibility
- **Contrast**: All text meets WCAG AA contrast requirements
- **Focus Indicators**: Clear, visible focus states
- **Hover States**: Additional visual feedback for interactive elements

---

## Responsive Behavior

### Breakpoints
- **Desktop**: 1200px+ (3-up grid, full features)
- **Medium**: 768px-1199px (2-up grid, adjusted spacing)
- **Mobile**: <768px (1-up grid, compact layout)

### Mobile Adaptations
- **Touch Targets**: Minimum 44px for interactive elements
- **Spacing**: Reduced padding and margins for small screens
- **Typography**: Slightly smaller text sizes for mobile
- **Icons**: Reduced icon sizes for mobile interfaces

---

## Performance Considerations

### Loading States
- **Agent Switching**: Brief loading indicators during transitions
- **Message Actions**: Immediate visual feedback for user actions
- **Page Transitions**: Smooth loading states for better perceived performance

### Animation Performance
- **CSS Transitions**: Hardware-accelerated transforms and opacity
- **Smooth Scrolling**: Native scroll behavior with custom jump-to-bottom
- **Hover Effects**: Lightweight CSS transitions for responsive feel

---

## Implementation Notes

### Current Implementation Status

#### ✅ **Completed Features**
- **Tabbed Settings Page**: Global, Agent, and SMCP tabs with proper navigation
- **Chat Interface**: Full conversation experience with message actions and avatars
- **Agent Switching**: Dropdown-based agent selection with conversation refresh
- **Message System**: User/assistant/tool messages with copy/share actions
- **Responsive Design**: Bootstrap-based layout with mobile optimization
- **Keyboard Navigation**: Comprehensive shortcuts for power users
- **System Settings Page**: Complete user management and system configuration
- **Install Module Page**: Comprehensive module installation and management
- **CRON Scheduler Page**: Full task scheduling and management interface
- **Chat Settings Page**: Agent-specific configuration management
- **SMCP Configurator Page**: MCP service management with tabbed interface
- **Edit User Functionality**: Complete user editing with modal interface
- **Backup/Restore Page**: Comprehensive system backup and recovery interface
- **Create Agent Page**: Complete Prime agent creation and configuration interface

#### 🔄 **In Development**
- **Process Management**: Integration with centralized run scripts
- **Real-time Status**: Live monitoring of module health
- **Backend Integration**: API endpoints for configuration management

#### 📋 **Planned Features**
- **Requirements Management**: Dependency discovery and consolidation
- **Log Aggregation**: Centralized log viewing and filtering
- **Plugin Management**: Installation and configuration of modules
- **Backup/Restore**: System backup and recovery tools

### Bootstrap Integration
- **Grid System**: Bootstrap 5 responsive grid classes
- **Components**: Dropdowns, buttons, forms, utilities
- **Customization**: CSS variables override Bootstrap defaults
- **Responsive**: Bootstrap breakpoints with custom adjustments

### JavaScript Functionality
- **Event Handling**: Comprehensive event listeners for all interactions
- **State Management**: Clean state transitions for agent switching
- **Clipboard API**: Modern clipboard integration with fallbacks
- **Web Share API**: Native sharing with graceful degradation
- **Tab Management**: Bootstrap tab integration with custom enhancements
- **Modal System**: Bootstrap modal integration with custom styling
- **Form Handling**: Comprehensive form validation and submission

### CSS Architecture
- **CSS Variables**: Centralized color and spacing management
- **Component Classes**: Modular CSS for maintainability
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Performance**: Optimized selectors and minimal repaints

### Integration Points

#### Control System
- **File System Access**: Direct scanning of Sanctum directory structure
- **Process Control**: Execution of run scripts from `control/run/`
- **Configuration Management**: Reading and writing of `.env` files
- **Status Monitoring**: Health checks and log aggregation

#### Module Discovery
- **Dynamic Scanning**: Automatic detection of new agents and modules
- **Configuration Parsing**: Reading of module-specific settings
- **Health Monitoring**: Real-time status of running processes
- **Log Collection**: Aggregated logging from all modules

#### Security Layer
- **Authentication**: User session management via registry database
- **Authorization**: Role-based access to configuration and control
- **Audit Logging**: Tracking of all configuration changes
- **Isolation**: Secure separation between different agents and modules

### Recent Updates and Changes

#### UI/UX Improvements
- **Tab Renaming**: "Master" tab renamed to "Global" for clarity
- **Install Tool → Install Module**: Terminology updated to avoid confusion with Letta tools
- **Dropdown Removal**: Agent dropdown removed from settings header (chat-only feature)
- **Panel Cleanup**: Chat Settings and Plugins panels removed from inappropriate locations

#### New Functionality
- **Edit User Modal**: Comprehensive user editing with password management
- **User Deletion**: Safe user removal with confirmation dialogs
- **Enhanced User Management**: Role and status management capabilities
- **Password Toggle**: Visibility toggle for password fields in edit forms
- **Backup/Restore System**: Complete backup creation, restoration, and management
- **Agent Creation Interface**: Comprehensive Prime agent configuration and deployment

#### Create Agent Page Details
The Create Agent page provides a complete interface for configuring and deploying new Prime agents to the Sanctum system:

**Form Sections:**
- **Basic Information**: Agent name, display name, description
- **AI Model Configuration**: Primary/fallback models, temperature, max tokens
- **System Instructions**: Core behavior definition and additional context
- **Capabilities & Modules**: Core modules (Core, Broca) and optional modules
- **Security & Access**: Access levels, API permissions, network restrictions
- **Deployment Options**: Strategy, resource allocation, monitoring settings

**Features:**
- **Real-time Preview**: Live agent preview as configuration is entered
- **Configuration Summary**: Dynamic summary of selected options
- **Quick Templates**: Pre-built configurations for common use cases
- **Form Validation**: Comprehensive validation with visual feedback
- **Progress Simulation**: Realistic agent creation process simulation
- **Template System**: Assistant, Developer, Analyst, Creative, and Custom templates

**Template Examples:**
- **General Assistant**: Balanced AI helper for general tasks
- **Developer Helper**: Specialized for software development with elevated access
- **Data Analyst**: Focused on data analysis and insights
- **Creative Writer**: High creativity for content generation
- **Custom**: Blank template for custom configurations

**Deployment Options:**
- **Immediate**: Deploy agent immediately after creation
- **Scheduled**: Schedule deployment for specific time
- **Manual**: Manual deployment control
- **Resource Allocation**: Minimal, Standard, Enhanced, High Performance options

#### Code Quality Improvements
- **Event Handling**: Proper modal event listeners and cleanup
- **Form Validation**: Enhanced form handling and error management
- **CSS Organization**: Better styling structure and consistency
- **JavaScript Architecture**: Improved function organization and error handling

This specification represents the complete, implemented design that has been thoroughly tested and refined through iterative development, now fully aligned with the Sanctum installation criteria and implementation structure. All major features are implemented and functional, providing a comprehensive web interface for Sanctum system management.












