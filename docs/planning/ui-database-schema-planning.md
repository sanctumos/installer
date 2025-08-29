# UI Database Schema Implementation Plan

## Overview
This document outlines the **implementation plan** for the database schema needed to support the existing UI functionality in the Sanctum control interface. 

**Note**: This document references the **master schema** defined in `../reference/registry_schema.md`. For complete table definitions and design principles, refer to that document.

## Current State Analysis

### What We Have
- **Complete UI Templates**: All major interface pages built and functional
- **Working Flask Chat Bridge**: Full chat system with database already implemented
- **Control App Structure**: Routes and basic API endpoints defined
- **Hardcoded Data**: Tools, agents, and status information currently static

### What We Need
- **Database Schema**: Tables to store the data the UI displays
- **Data Integration**: Connect UI to real data sources
- **User Management**: Authentication and session management
- **Chat Integration**: Link existing chat system to user accounts

## Implementation Strategy

### **Phase 1: Minimal Schema (Get UI Working)**
**Goal**: Replace hardcoded data with database-driven content
**Timeline**: 1-2 days
**Tables**: `tools`, `agents`, `users`

### **Phase 2: User Management**
**Goal**: Enable user authentication and agent configuration
**Timeline**: 2-3 days
**Tables**: `user_sessions`, `agent_configs`

### **Phase 3: Configuration Management**
**Goal**: Full configuration management capabilities
**Timeline**: 2-3 days
**Tables**: `system_config`, `env_vars`, `tool_instances`

### **Phase 4: Advanced Features**
**Goal**: Complete system with all features
**Timeline**: 2-3 days
**Tables**: `plugins`, `configurations`, enhanced chat tables

## Phase 1: Minimal Schema Implementation

### Tables to Create

#### 1. Tools Table
**Reference**: See `../reference/registry_schema.md#tools` for complete schema
**Purpose**: Stores all the tools displayed in the settings grid (settings.html)

```sql
-- Phase 1: Simplified tools table for immediate UI support
CREATE TABLE tools (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    category VARCHAR(20) NOT NULL, -- 'master', 'athena', 'monday', 'timbre', 'smcp'
    status VARCHAR(20) DEFAULT 'Healthy', -- 'Healthy', 'Degraded', 'Off', 'Ready'
    route_path VARCHAR(100), -- e.g., '/system-settings', '/chat-settings'
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**UI Usage**: 
- Settings grid displays tool cards with emojis, names, descriptions
- Status indicators show tool health
- Route paths enable navigation to tool-specific pages
- Category tabs organize tools by scope

#### 2. Agents Table
**Reference**: See `../reference/registry_schema.md#agents` for complete schema
**Purpose**: Stores agent information for the create_agent.html form and agent switching

```sql
-- Phase 1: Simplified agents table for immediate UI support
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY, -- e.g., 'athena', 'monday', 'timbre'
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'Healthy',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**UI Usage**:
- Agent creation form captures basic fields
- Chat interface agent dropdown shows available agents
- Agent status monitoring and health checks

#### 3. Users Table
**Reference**: See `../reference/registry_schema.md#users` for complete schema
**Purpose**: Manages user accounts for the system_settings.html interface

```sql
-- Phase 1: Simplified users table for immediate UI support
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user', 'viewer'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'locked'
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**UI Usage**:
- User discovery from Broca agent databases
- User role management and status tracking
- Authentication for web interface access

### Sample Data Population

#### Tools Table
```sql
INSERT INTO tools (id, name, description, emoji, category, status, route_path) VALUES
('system-settings', 'System Settings', 'Base ports, paths, environment variables', '⚙️', 'master', 'Healthy', '/system-settings'),
('install-tool', 'Install Module', 'Quick setup & upgrades', '🧰', 'master', 'Healthy', '/install-tool'),
('cron-scheduler', 'Cron Scheduler', 'Automated module execution', '⏰', 'master', 'Healthy', '/cron-scheduler'),
('create-agent', 'Create Agent', 'Add new Prime agent to system', '➕', 'master', 'Ready', '/create-agent'),
('backup-restore', 'Backup/Restore', 'System backup & recovery tools', '📁', 'master', 'Ready', '/backup-restore'),
('chat-settings', 'Chat Settings', 'Model, voice, safety, persona', '💬', 'athena', 'Healthy', '/chat-settings'),
('broca', 'Broca', 'Streams & tool I/O', '🛰️', 'athena', 'Healthy', '/broca-settings');
```

#### Agents Table
```sql
INSERT INTO agents (id, name, display_name, description, status) VALUES
('athena', 'Athena', 'Athena Prime', 'Sanctum Configuration Assistant', 'Healthy'),
('monday', 'Monday', 'Monday Prime', 'Task Management Specialist', 'Healthy'),
('timbre', 'Timbre', 'Timbre Prime', 'Audio Processing Expert', 'Healthy');
```

#### Users Table
```sql
-- Create default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role, status) VALUES
('admin', 'admin@sanctum.local', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.Gi', 'admin', 'active');
```

## Phase 2: User Management Implementation

### Additional Tables

#### User Sessions Table
**Reference**: See `../reference/registry_schema.md#user-sessions` for complete schema

```sql
CREATE TABLE user_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### Agent Configs Table
**Reference**: See `../reference/registry_schema.md#agent-configurations` for complete schema

```sql
CREATE TABLE agent_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    agent_id VARCHAR(50) NOT NULL,
    config_key VARCHAR(100) NOT NULL,
    config_value TEXT,
    config_type VARCHAR(20) DEFAULT 'string',
    is_encrypted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (agent_id) REFERENCES agents(id),
    UNIQUE(agent_id, config_key)
);
```

## Phase 3: Configuration Management Implementation

### Additional Tables

#### System Config Table
**Reference**: See `../reference/registry_schema.md#system-configuration` for complete schema

#### Environment Variables Table
**Reference**: See `../reference/registry_schema.md#environment-variables` for complete schema

#### Tool Instances Table
**Reference**: See `../reference/registry_schema.md#tool-instances` for complete schema

## Phase 4: Advanced Features Implementation

### Additional Tables

#### Plugins Table
**Reference**: See `../reference/registry_schema.md#plugins` for complete schema

#### Configurations Table
**Reference**: See `../reference/registry_schema.md#configurations` for complete schema

#### Enhanced Chat Tables
**Reference**: See `../reference/registry_schema.md#chat-integration-tables` for complete schema

## API Endpoint Updates Needed

### Current Endpoints (Hardcoded)
- `/api/agents` - Returns static agent list
- `/api/tools` - Returns static tool list
- `/api/status` - Returns static status

### Updated Endpoints (Database-Driven)
- `/api/agents` - Query agents table
- `/api/tools` - Query tools table with category filtering
- `/api/status` - Aggregate status from tools and agents tables
- `/api/users` - User management endpoints
- `/api/config` - Configuration management endpoints

## Database Relationships

### Phase 1 Relationships
- **Tools → Categories**: Tools organized by category for UI tabs
- **Agents → Status**: Agent health monitoring

### Phase 2+ Relationships
**Reference**: See `../reference/registry_schema.md#relationships` for complete relationship documentation

## Security Considerations

### Data Protection
- **Encrypted Fields**: API keys, passwords, sensitive configs
- **Access Control**: Role-based permissions for different UI sections
- **Session Security**: Secure session tokens with expiration

### User Authentication
- **Password Hashing**: Secure password storage
- **Rate Limiting**: Prevent brute force attacks
- **Account Lockout**: Temporary lockout after failed attempts

## Testing Strategy

### Unit Tests
- Database schema validation
- CRUD operations for each table
- Foreign key constraint testing

### Integration Tests
- API endpoint functionality
- UI data population
- User authentication flow

### User Acceptance Tests
- Settings grid displays correctly
- Agent switching works
- User management functions properly

## Migration Strategy

### From Phase 1 to Phase 2
1. Add new tables without breaking existing functionality
2. Migrate user data to new session system
3. Test authentication flow

### From Phase 2 to Phase 3
1. Add configuration tables
2. Migrate hardcoded configs to database
3. Test configuration management

### From Phase 3 to Phase 4
1. Add advanced feature tables
2. Migrate to full schema
3. Test all functionality

## Next Steps

1. **Review this implementation plan** - Validate phases and timelines
2. **Implement Phase 1** - Create minimal schema to get UI working
3. **Test data population** - Verify UI displays database content correctly
4. **Implement Phase 2** - Add user management functionality
5. **Continue through phases** - Build functionality incrementally

## Questions for Review

1. **Phase Prioritization**: Are these phases in the right order?
2. **Timeline Realistic**: Are the timelines achievable?
3. **Testing Strategy**: Is the testing approach sufficient?
4. **Migration Path**: Are the migration steps clear?
5. **Dependencies**: Are there missing dependencies between phases?

## Conclusion

This implementation plan provides a clear path from the current hardcoded UI to a fully functional database-driven system. By implementing in phases:

- **Phase 1** gets the UI working quickly with minimal database changes
- **Phases 2-4** add functionality incrementally without breaking existing features
- **Testing at each phase** ensures stability before moving forward
- **Reference to master schema** ensures consistency with the overall system design

The key insight remains: **most of the work is already done** - we just need to replace hardcoded data with database queries, one phase at a time.

## References

- **Master Schema**: `../reference/registry_schema.md` - Complete database schema reference
- **UI Templates**: `../control/templates/` - Existing UI implementation
- **Chat Bridge**: `../temp-sources/python/` - Working Flask chat system
