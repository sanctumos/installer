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

### **MVP: Core Features for Shipping**
**Goal**: Launch with login/user management, chat UI integration, and upgrade path
**Timeline**: 1-2 weeks
**Focus**: Essential functionality for production deployment

### **Phase 1: User Management & Authentication (Week 1)**
**Goal**: Complete login system and user management
**Tables**: `users`, `user_sessions`
**Features**:
- User registration and login
- Password hashing and security
- Session management
- Role-based access control
- User discovery from Broca databases

### **Phase 2: Chat UI Integration (Week 1-2)**
**Goal**: Connect existing chat UI to working backend
**Tables**: Enhanced `web_chat_sessions`, `web_chat_messages`
**Features**:
- Link chat sessions to authenticated users
- Associate chats with specific agents
- User-specific chat history
- Integration with existing Flask chat bridge

### **Phase 3: Upgrade Path (Week 2)**
**Goal**: Enable future feature additions without breaking existing system
**Tables**: `tools`, `agents` (minimal schema)
**Features**:
- Basic tool and agent management
- Database-driven UI (replace hardcoded data)
- Foundation for future enhancements
- Auto-update capability

### **Post-MVP: Future Enhancements**
**Goal**: Add advanced features via auto-updates
**Tables**: `plugins`, `configurations`, `tool_instances`, `system_config`, `env_vars`
**Features**:
- Plugin management
- Advanced configuration
- Tool execution tracking
- System monitoring

## MVP Implementation Details

### **Phase 1: User Management & Authentication**

#### Tables to Create

##### Users Table (Core)
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user', -- 'admin', 'user', 'viewer'
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'locked'
    last_login TIMESTAMP,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

##### User Sessions Table
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

#### Implementation Steps
1. **User Authentication System**
   - Login/logout endpoints
   - Password hashing (bcrypt)
   - JWT token generation
   - Session management

2. **User Management Interface**
   - User discovery from Broca databases
   - User role management
   - Account status tracking

3. **Security Features**
   - Rate limiting for login attempts
   - Account lockout after failed attempts
   - Secure session handling

### **Phase 2: Chat UI Integration**

#### Enhanced Chat Tables
```sql
-- Enhance existing web_chat_sessions table
ALTER TABLE web_chat_sessions ADD COLUMN user_id INTEGER;
ALTER TABLE web_chat_sessions ADD COLUMN agent_id VARCHAR(50);

-- Add foreign key constraints
-- (These will be added after Phase 3 when agents table exists)
```

#### Implementation Steps
1. **Link Existing Chat System**
   - Connect chat sessions to authenticated users
   - Associate chats with specific agents
   - Maintain existing chat functionality

2. **User Attribution**
   - Track who sent each message
   - User-specific chat history
   - Agent-specific conversations

3. **Integration Points**
   - Connect to existing Flask chat bridge
   - Maintain current API compatibility
   - Add user context to existing system

### **Phase 3: Upgrade Path & Foundation**

#### Minimal Schema Tables
```sql
-- Tools table for future enhancements
CREATE TABLE tools (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    category VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Healthy',
    route_path VARCHAR(100),
    is_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Agents table for future enhancements
CREATE TABLE agents (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(100),
    description TEXT,
    status VARCHAR(20) DEFAULT 'Healthy',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Implementation Steps
1. **Database-Driven UI**
   - Replace hardcoded tool/agent data
   - Enable dynamic UI updates
   - Foundation for future features

2. **Upgrade Infrastructure**
   - Database migration system
   - Schema version tracking
   - Auto-update capability

3. **Future-Proofing**
   - Extensible table structure
   - Plugin system foundation
   - Configuration management base

## MVP Success Criteria

### **User Management**
- ✅ Users can register and login
- ✅ Sessions persist across browser restarts
- ✅ Role-based access control works
- ✅ User discovery from Broca functions
- ✅ Security features (lockout, rate limiting) active

### **Chat Integration**
- ✅ Chat UI connects to existing backend
- ✅ User attribution works correctly
- ✅ Agent switching maintains user context
- ✅ Chat history per user functions
- ✅ No breaking changes to existing chat

### **Upgrade Path**
- ✅ UI displays database-driven content
- ✅ Database migrations work smoothly
- ✅ Foundation for future features exists
- ✅ Auto-update system functional
- ✅ No hardcoded data remains

## Post-MVP Auto-Update Features

Once the MVP is shipped and stable, these features can be added via auto-updates:

### **Configuration Management**
- System settings interface
- Environment variable management
- API key management

### **Advanced Tool Management**
- Plugin system
- Tool execution tracking
- Advanced configuration options

### **System Monitoring**
- Health checks
- Performance metrics
- Log management

## Implementation Timeline

### **Week 1: Core Foundation**
- **Days 1-3**: User management system
- **Days 4-5**: Chat integration foundation

### **Week 2: Integration & Testing**
- **Days 1-3**: Complete chat integration
- **Days 4-5**: Upgrade path implementation and testing

### **Week 3: Production Readiness**
- **Days 1-2**: Final testing and bug fixes
- **Days 3-5**: Production deployment and validation

## Risk Mitigation

### **User Management Risks**
- **Risk**: Complex authentication system
- **Mitigation**: Start with simple JWT-based auth, enhance later

### **Chat Integration Risks**
- **Risk**: Breaking existing chat functionality
- **Mitigation**: Maintain API compatibility, add user context incrementally

### **Upgrade Path Risks**
- **Risk**: Complex database migrations
- **Mitigation**: Simple schema changes, test migrations thoroughly

## Next Steps

1. **Review MVP scope** - Validate these three core features
2. **Start Phase 1** - Implement user management system
3. **Test thoroughly** - Ensure each phase works before moving forward
4. **Prepare for shipping** - Focus on stability over features

This MVP approach gives you a solid foundation for shipping while maintaining a clear path for future enhancements via auto-updates.

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
