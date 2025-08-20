# Sanctum Registry Database Schema

## Overview
This document outlines the proposed database schema for the Sanctum Configurator registry. The schema is designed to support the multi-agent architecture, tool management, and configuration system shown in the UI.

## Core Tables

### 1. Agents
The primary entities that users interact with - Athena, Monday, Timbre, etc.

```sql
agents
- id (PRIMARY KEY)
- name (VARCHAR) - e.g., "Athena", "Monday", "Timbre"
- description (TEXT) - e.g., "Sanctum Configuration Assistant"
- status (ENUM) - "Healthy", "Degraded", "Off", "Ready"
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- config (JSON) - Agent-specific configuration
- is_active (BOOLEAN)
```

### 2. Tools
The various tools and modules that can be managed through the system.

```sql
tools
- id (PRIMARY KEY)
- name (VARCHAR) - e.g., "System Settings", "Network Configuration"
- description (TEXT) - e.g., "Base ports, paths, environment variables"
- emoji (VARCHAR) - e.g., "⚙️", "🌐", "🔒"
- category (VARCHAR) - "master", "athena", "monday", "timbre", "smcp"
- status (ENUM) - "Healthy", "Degraded", "Off", "Ready"
- tool_type (VARCHAR) - "config", "plugin", "service", "utility"
- config_schema (JSON) - Tool configuration schema
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_enabled (BOOLEAN)
```

### 3. Tool Instances
Individual instances of tools with their specific configurations.

```sql
tool_instances
- id (PRIMARY KEY)
- tool_id (FOREIGN KEY -> tools.id)
- agent_id (FOREIGN KEY -> agents.id) - NULL for master tools
- name (VARCHAR) - Instance-specific name
- config (JSON) - Instance configuration
- status (ENUM) - "Healthy", "Degraded", "Off", "Ready"
- last_run (TIMESTAMP)
- next_run (TIMESTAMP) - For scheduled tools
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_active (BOOLEAN)
```

### 4. Configurations
System-wide and agent-specific configuration settings.

```sql
configurations
- id (PRIMARY KEY)
- key (VARCHAR) - Configuration key
- value (TEXT) - Configuration value
- type (ENUM) - "string", "number", "boolean", "json"
- scope (VARCHAR) - "system", "agent", "tool", "user"
- scope_id (INTEGER) - ID of the scope entity (NULL for system)
- description (TEXT) - What this config controls
- is_encrypted (BOOLEAN) - For sensitive values
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### 5. Plugins
MCP plugins and their configurations.

```sql
plugins
- id (PRIMARY KEY)
- name (VARCHAR) - Plugin name
- type (VARCHAR) - "mcp", "extension", "integration"
- version (VARCHAR) - Plugin version
- status (ENUM) - "Active", "Inactive", "Error"
- config (JSON) - Plugin configuration
- dependencies (JSON) - Required dependencies
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_enabled (BOOLEAN)
```

### 6. Scheduled Jobs
Cron jobs and scheduled tasks.

```sql
scheduled_jobs
- id (PRIMARY KEY)
- name (VARCHAR) - Job name
- description (TEXT) - Job description
- cron_expression (VARCHAR) - Cron schedule
- tool_instance_id (FOREIGN KEY -> tool_instances.id)
- agent_id (FOREIGN KEY -> agents.id)
- status (ENUM) - "Active", "Paused", "Error"
- last_run (TIMESTAMP)
- next_run (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_enabled (BOOLEAN)
```

### 7. Logs
System and tool execution logs.

```sql
logs
- id (PRIMARY KEY)
- level (ENUM) - "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"
- source (VARCHAR) - "system", "agent", "tool", "plugin"
- source_id (INTEGER) - ID of the source entity
- message (TEXT) - Log message
- details (JSON) - Additional log data
- timestamp (TIMESTAMP)
- user_id (INTEGER) - Who triggered this (if applicable)
```

### 8. Backups
System backup and restore points.

```sql
backups
- id (PRIMARY KEY)
- name (VARCHAR) - Backup name
- description (TEXT) - Backup description
- type (ENUM) - "full", "incremental", "config_only"
- status (ENUM) - "In Progress", "Completed", "Failed"
- file_path (VARCHAR) - Backup file location
- size_bytes (BIGINT) - Backup size
- checksum (VARCHAR) - File integrity check
- created_at (TIMESTAMP)
- expires_at (TIMESTAMP) - Auto-cleanup date
- is_auto (BOOLEAN) - Was this an automatic backup?
```

### 9. Users
User accounts and permissions (if multi-user support is needed).

```sql
users
- id (PRIMARY KEY)
- username (VARCHAR) - Unique username
- email (VARCHAR) - User email
- role (ENUM) - "admin", "user", "viewer"
- permissions (JSON) - User permissions
- last_login (TIMESTAMP)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
- is_active (BOOLEAN)
```

## Relationships

### Agent-Tool Relationships
- **One-to-Many**: An agent can have multiple tools
- **Many-to-Many**: Tools can be shared between agents (through tool_instances)

### Configuration Relationships
- **One-to-Many**: System/agent/tool can have multiple configs
- **Hierarchical**: System → Agent → Tool → Instance configuration inheritance

### Plugin Relationships
- **Many-to-Many**: Plugins can be associated with multiple agents/tools
- **Dependency**: Plugins can depend on other plugins

## Key Design Principles

1. **Flexibility**: JSON fields for complex configurations that vary by tool/agent
2. **Auditability**: Timestamps and user tracking for all changes
3. **Scalability**: Efficient indexing on frequently queried fields
4. **Security**: Encryption support for sensitive configuration values
5. **Extensibility**: Easy to add new agent types, tools, and plugins

## Indexes

```sql
-- Performance indexes
CREATE INDEX idx_tools_category ON tools(category);
CREATE INDEX idx_tool_instances_agent ON tool_instances(agent_id);
CREATE INDEX idx_configurations_scope ON configurations(scope, scope_id);
CREATE INDEX idx_logs_source ON logs(source, source_id);
CREATE INDEX idx_logs_timestamp ON logs(timestamp);
CREATE INDEX idx_scheduled_jobs_next_run ON scheduled_jobs(next_run);
```

## Future Considerations

1. **Versioning**: Tool and plugin version management
2. **Rollbacks**: Configuration change history and rollback capability
3. **Templates**: Pre-configured tool and agent templates
4. **API Keys**: External service integrations
5. **Metrics**: Performance and usage statistics
6. **Notifications**: Alert system for system events

## Questions for Discussion

1. **Scope**: Should this support multiple Sanctum instances or just one?
2. **Users**: Do we need multi-user support or just single admin?
3. **Encryption**: What level of security is needed for sensitive configs?
4. **Performance**: Expected data volume and query patterns?
5. **Integration**: How does this connect with the existing Letta system?

