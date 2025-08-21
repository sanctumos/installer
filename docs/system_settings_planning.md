# System Settings Core Functionality - Planning Document

## Overview
This document outlines the planning for implementing the System Settings core functionality in Sanctum. This represents the "master" category tools that manage system-wide configuration.

## What We Know (From Schema)

### Core Architecture
- **Module Scope**: Global (system-wide)
- **Category**: "master" 
- **Tool Type**: Configuration management
- **Database Tables**: `tools`, `tool_instances`, `configurations`

### Database Structure
- System settings stored in `configurations` table
- Scope: "system" (scope_id = NULL)
- Hierarchical inheritance: System → Agent → Tool → Instance
- Support for encrypted sensitive values

## Proposed System Settings Structure

### 1. **User Management** *(Primary Focus)*
- Discover users from Broca agent databases
- Promote agent users to full Sanctum users
- Set user roles and permission levels
- Manage user access to web interface
- User account status (active/inactive)
- User profile management

### 2. **System Configuration** *(Catch-all for small settings)*
- Environment variables
- API keys and secrets (encrypted)
- Path configurations
- Other miscellaneous system settings

## Separate Tools (Not System Settings)

### **User Authentication** *(Separate tile)*
- User management
- Password policies
- Session configuration
- Access control rules

## Implementation Questions (Need Project Engineer Input)

### 1. **Scope & Priority**
- Which system settings are most critical for initial release?
- What's the minimum viable configuration set?
- Priority order for implementation?

### 2. **Configuration Management**
- How should system settings be validated?
- What's the rollback strategy for configuration changes?
- How do we handle configuration conflicts?

### 3. **Integration Points**
- How does this integrate with the existing Letta setup?
- What system services need to be restarted on config changes?
- How do we handle live configuration updates?

### 4. **User Experience**
- What's the target user for system settings?
- Should this be admin-only or have different permission levels?
- What's the preferred UI approach (forms, JSON editor, etc.)?

### 5. **Security & Access**
- How sensitive are these system settings?
- What level of audit logging is needed?
- How do we handle configuration encryption/decryption?

## Technical Implementation Plan

### Phase 1: Core Infrastructure
1. Create System Settings tool definition in database
2. Implement configuration CRUD operations
3. Build basic configuration validation
4. Create configuration change audit logging

### Phase 2: Basic Settings
1. Network configuration management
2. Environment variable management
3. Basic service configuration
4. Configuration export/import

### Phase 3: Advanced Features
1. Configuration validation schemas
2. Rollback capabilities
3. Advanced security features
4. Integration with system services

## Dependencies
- Database schema implementation
- User authentication system
- Configuration encryption utilities
- System service integration layer

## Next Steps
1. **Project Engineer Review** - Validate requirements and priorities
2. **Technical Design** - Detailed implementation plan
3. **UI/UX Design** - Interface mockups and user flows
4. **Development** - Begin Phase 1 implementation

## Questions for Project Engineer
1. What's the primary use case for System Settings?
2. Which settings are most critical for day-to-day operations?
3. What's the expected user skill level for this interface?
4. How should this integrate with existing server management workflows?
5. What's the deployment strategy for configuration changes?
