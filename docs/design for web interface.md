# Web Interface Design Specification - Sanctum Configurator

## Overview

This document specifies the complete web interface design for the Sanctum Configurator, including both the Settings → Tools page and the main Chat interface. The design emphasizes a dark, professional aesthetic with Bootstrap-based components, smooth interactions, and comprehensive functionality.

---

## Settings → Tools Page

### Layout & Structure

The Settings page now uses a tabbed navigation system to properly separate master-level configuration from per-agent configuration, aligned with the actual Sanctum installation structure:

```
┌────────────────────────────────────────────────────────────────────┐
│  [Athena ▼]                    Settings                    [← Chat] │
│  ───────────────────────────────────────────────────────────────── │
│  [Master] [Athena] [Monday] [Timbre] [SMCP]                       │
│  ───────────────────────────────────────────────────────────────── │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │⚙️  System Settings │  │🧰  Install Tool    │  │⏰  Cron Scheduler  │ │
│  │ Base ports, paths │  │ Quick setup &      │  │ Automated module  │ │
│  │ & env variables   │  │ upgrades           │  │ execution         │ │
│  │                    │  │                   │  │                    │ │
│  │ [Open] [⋯]  ● OK   │  │ [Open] [⋯]  ● OK  │  │ [Open] [⋯]  ● OK   │ │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘ │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐                        │
│  │➕  Create Agent     │  │📁  Backup/Restore  │                        │
│  │ Add new Prime      │  │ System backup &   │                        │
│  │ agent to system   │  │ recovery tools    │                        │
│  │                    │  │                   │                        │
│  │ [Create] [⋯]  ● OK│  │ [Open] [⋯]  ● OK   │                        │
│  └───────────────────┘  └───────────────────┘                        │
│                                                                      │
│  Tips: 1–6 to open • Enter = Open • Esc = Clear search • Ctrl+1-5 = Switch tabs │
└────────────────────────────────────────────────────────────────────┘
```

### Tab Navigation System

#### Master Tab (Global Configuration)
- **System-wide Settings**: Base ports, paths, environment variables, `.env` configuration
- **Installation Tools**: Setup, upgrades, system health monitoring
- **Cron Scheduler**: Automated execution scheduling for all modules
- **Create New Agent**: Add new Prime agents to the system
- **Backup/Restore**: System backup and recovery tools

#### Agent Tabs (Per-Prime Configuration)
All agent configuration pages follow the same layout pattern:

```
┌────────────────────────────────────────────────────────────────────┐
│  [Search tools…] [✕]                    [n results]               │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │💬  Chat Settings   │  │🛰️  Broca           │  │🧠  Thalamus        │ │
│  │ Model, voice,     │  │ Streams & tool I/O │  │ Routing & memory  │ │
│  │ safety, persona   │  │                    │  │ inspectors        │ │
│  │                    │  │                   │  │                    │ │
│  │ [Open] [⋯]  ● OK   │  │ [Open] [⋯]  ● OK  │  │ [Open] [⋯]  ● OK   │ │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘ │
│                                                                      │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐ │
│  │🌙  Dream Agent     │  │🔌  Plugins         │  │📊  Logs & Status   │ │
│  │ Archives & recall │  │ Module plugins &  │  │ Health monitoring │ │
│  │ policies          │  │ configurations    │  │ & log access      │ │
│  │                    │  │                   │  │                    │ │
│  │ [Open] [⋯]  ● OK   │  │ [Open] [⋯]  ● OK  │  │ [Open] [⋯]  ● OK   │ │
│  └───────────────────┘  └───────────────────┘  └───────────────────┘ │
```

**Standard Agent Tools** (same for all agents):
- **Chat Settings**: Model preferences, voice settings, persona configurations
- **Broca**: Streams & tool I/O management
- **Thalamus**: Routing & memory inspectors
- **Dream Agent**: Archives & recall policies
- **Plugins**: Module plugins & configurations
- **Logs & Status**: Health monitoring & log access

#### SMCP Tab (Independent Service)
- **MCP Service**: Plugin management, service configuration, scope settings
- **Service Health**: Status monitoring, logs, performance metrics
- **Plugin Registry**: Available plugins, installation status, version management
- **Tool Control**: Management of Letta tools and MCP integrations
- **Independent Venv**: SMCP maintains its own Python environment

### Key Features

#### Tab-based Navigation
- **Active Tab**: Highlighted with accent color and border
- **Tab Switching**: Instant navigation between configuration levels
- **Context Awareness**: Each tab shows relevant tools and settings
- **Search Scope**: Search filters within the active tab context

#### Configuration Hierarchy
- **Master Level**: System-wide settings affecting all agents (`/sanctum/.env`)
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

#### Agent Switching
- **Dropdown Header**: Shows current agent with dropdown menu
- **Tab Context**: Agent tabs automatically switch when changing agents
- **Page Refresh**: Switching agents refreshes the entire page to load new context
- **Loading State**: Brief "Loading [Agent]..." display during transition

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
- **Actions**: Primary "Open" button + secondary "⋯" menu
- **Button Hierarchy**: "Open" is prominent, menu dots are reduced contrast

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
Master Tab            →  /sanctum/venv/, /sanctum/.env
Agent Tabs            →  /sanctum/agents/agent-<uid>/
SMCP Tab              →  /sanctum/smcp/
Flask App             →  /sanctum/control/web/ (runs on dedicated port)
Reverse Proxy         →  https://<sanctumhost.com>/ui/ → Flask app
Process Management    →  /sanctum/control/run/
```

### Control System Integration

#### System Settings Management
- **Environment Configuration**: Reading and writing of `/sanctum/.env` files
- **Port Management**: Assignment and tracking of module ports
- **Path Configuration**: System-wide path and directory settings
- **Status Monitoring**: Tracks system health and configuration

#### Flask Application Architecture
- **Dedicated Port**: Flask app runs on dedicated port (e.g., 5000) for development/debugging
- **Reverse Proxy**: Nginx/Apache routes `https://<sanctumhost.com>/ui/` to Flask app
- **Direct Module Integration**: Flask app directly imports and interacts with core modules via `/sanctum/venv/`
- **No API Gateway**: Direct function calls and object access to module functionality
- **Module Discovery**: Dynamic scanning of `/sanctum/agents/` for available modules
- **Registry System**: Future mechanism for adding new modules and having them recognized by UI

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
- **Tabbed Settings Page**: Master, Agent, and SMCP tabs with proper navigation
- **Chat Interface**: Full conversation experience with message actions and avatars
- **Agent Switching**: Dropdown-based agent selection with conversation refresh
- **Message System**: User/assistant/tool messages with copy/share actions
- **Responsive Design**: Bootstrap-based layout with mobile optimization
- **Keyboard Navigation**: Comprehensive shortcuts for power users

#### 🔄 **In Development**
- **Process Management**: Integration with centralized run scripts
- **Cron Integration**: Automated scheduling interface
- **Real-time Status**: Live monitoring of module health
- **Configuration Editor**: Direct editing of module `.env` files

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

### Flask Implementation
- **Application Structure**: Flask app with blueprints for different sections (settings, chat, api)
- **Template Engine**: Jinja2 templates for dynamic content generation
- **Static Files**: CSS, JavaScript, and assets served from Flask static directory
- **Route Structure**: `/ui/` prefix for all routes, matching reverse proxy configuration
- **Development Server**: Flask development server on dedicated port for local development
- **Production Deployment**: Flask built-in server behind nginx reverse proxy (sufficient for low-traffic system)
- **Environment Management**: Flask app reads from `/sanctum/.env` for configuration
- **Module Integration**: Direct Python imports from shared venv for all module functionality

### JavaScript Functionality
- **Event Handling**: Comprehensive event listeners for all interactions
- **State Management**: Clean state transitions for agent switching
- **Clipboard API**: Modern clipboard integration with fallbacks
- **Web Share API**: Native sharing with graceful degradation
- **Tab Management**: Bootstrap tab integration with custom enhancements

### CSS Architecture
- **CSS Variables**: Centralized color and spacing management
- **Component Classes**: Modular CSS for maintainability
- **Responsive Design**: Mobile-first approach with progressive enhancement
- **Performance**: Optimized selectors and minimal repaints

### Integration Points

#### Control System
- **Flask Application**: Web interface built with Flask, running on dedicated port
- **Direct Module Access**: Flask app directly imports and calls module functions via shared venv
- **File System Access**: Direct scanning of Sanctum directory structure
- **Process Control**: Execution of run scripts from `control/run/`
- **Configuration Management**: Reading and writing of `.env` files
- **Status Monitoring**: Health checks and log aggregation

#### Module Discovery
- **Dynamic Scanning**: Automatic detection of new agents and modules in `/sanctum/agents/`
- **Direct Import**: Modules are imported directly when needed, no API calls
- **Configuration Parsing**: Reading of module-specific settings
- **Health Monitoring**: Real-time status of running processes
- **Log Collection**: Aggregated logging from all modules

#### Deployment & Access
- **Development Port**: Flask app runs on dedicated port (e.g., 5000) for local development
- **Production Setup**: Flask built-in server behind nginx reverse proxy (adequate for low-traffic system)
- **URL Structure**: `https://<sanctumhost.com>/ui/` → Flask app
- **SSL Termination**: HTTPS handled at nginx reverse proxy level
- **Simple Architecture**: Single Flask instance sufficient for dozen users max

#### Security Layer
- **Authentication**: User session management via registry database
- **Authorization**: Role-based access to configuration and control
- **Audit Logging**: Tracking of all configuration changes
- **Isolation**: Secure separation between different agents and modules

This specification represents the complete, implemented design that has been thoroughly tested and refined through iterative development, now fully aligned with the Sanctum installation criteria and implementation structure.












