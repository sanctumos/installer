# Flask Chat Integration Project Plan

## Overview
Deploy the existing working Flask chat system from `temp-sources/python/` as a separate chat bridge service, and connect the existing chat UI in the `control/` directory to work with it. This follows the established bridge pattern where the Flask app provides API endpoints for Broca communication while the UI directly accesses the database.

**CRITICAL UPDATE**: The chat system will run out of the main control database, not as a separate database. This means we need to integrate the chat tables into the existing `control/db/init_database.sql` schema.

## Current State Analysis

### Working Flask Chat System (`temp-sources/python/`)
- **Location**: `temp-sources/python/app/`
- **Status**: **FULLY FUNCTIONAL** - This is the reference implementation
- **Architecture**: Separate Flask application with proper API structure
- **Database**: SQLite with comprehensive schema (`web_chat_bridge.db`)
- **API Endpoints**: 
  - `/api/v1/?action=messages` - Send/receive messages
  - `/api/v1/?action=responses` - Get responses for sessions
  - `/api/v1/?action=inbox` - Admin inbox for unprocessed messages
  - `/api/v1/?action=outbox` - Send responses from admin
  - `/api/v1/?action=sessions` - Session management
  - `/api/v1/?action=config` - Configuration management
- **Features**: Rate limiting, authentication, session management, proper error handling
- **Database Manager**: `DatabaseManager` class with full CRUD operations
- **Configuration**: Environment-based config with database fallbacks

### Existing Chat UI (`control/`)
- **Location**: `control/` directory
- **Frontend**: Modern Bootstrap-based chat interface with JavaScript
- **Current API**: Basic `/api/chat` endpoint (placeholder)
- **Features**: Agent switching, message display, copy/share functionality
- **Limitations**: No real backend integration, placeholder responses

### Current Database Schema (`control/db/init_database.sql`)
- **Status**: Contains UI management tables (users, agents, system_config)
- **Missing**: Chat-specific tables required by the working Flask system
- **Gap**: No `web_chat_sessions`, `web_chat_messages`, `web_chat_responses` tables

## Integration Strategy

### Phase 1: Database Schema Integration (CRITICAL FIRST STEP)
1. **Update Main Database Schema**
   - **MODIFY** `control/db/init_database.sql` to include chat tables
   - **ADD** the working Flask chat system's database schema to the main control database
   - **INTEGRATE** chat tables with existing UI management tables
   - **ENSURE** foreign key relationships work between chat and UI systems

2. **Database Schema Changes Required**
   ```sql
   -- Add to control/db/init_database.sql
   
   -- Chat session management
   CREATE TABLE IF NOT EXISTS web_chat_sessions (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       session_id VARCHAR(64) UNIQUE NOT NULL,
       user_id INTEGER,
       agent_id INTEGER,
       status VARCHAR(50) DEFAULT 'active',
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
       FOREIGN KEY (agent_id) REFERENCES agents(id) ON DELETE SET NULL
   );
   
   -- User messages
   CREATE TABLE IF NOT EXISTS web_chat_messages (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       session_id VARCHAR(64) NOT NULL,
       message TEXT NOT NULL,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       uid VARCHAR(100),
       is_new_user BOOLEAN DEFAULT false,
       FOREIGN KEY (session_id) REFERENCES web_chat_sessions(session_id) ON DELETE CASCADE
   );
   
   -- System responses
   CREATE TABLE IF NOT EXISTS web_chat_responses (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       session_id VARCHAR(64) NOT NULL,
       response_data TEXT NOT NULL,
       timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       status VARCHAR(50) DEFAULT 'pending',
       FOREIGN KEY (session_id) REFERENCES web_chat_sessions(session_id) ON DELETE CASCADE
   );
   
   -- Rate limiting data
   CREATE TABLE IF NOT EXISTS rate_limits (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       endpoint VARCHAR(100) NOT NULL,
       ip_address VARCHAR(45) NOT NULL,
       request_count INTEGER DEFAULT 1,
       first_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       last_request TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       UNIQUE(endpoint, ip_address)
   );
   ```

3. **Database Migration Strategy**
   - **NO DATA LOSS**: Existing UI data remains intact
   - **ADDITIVE**: Chat tables are added to existing schema
   - **INTEGRATED**: Chat sessions link to existing users and agents
   - **CONSISTENT**: Single database file for entire system

### Phase 2: Deploy Working Flask Chat Bridge
1. **Deploy Existing Flask App**
   - **COPY** working Flask app from `temp-sources/python/app/` to production location
   - **NO PORTING** - use the tested, working code as-is
   - **UPDATE** database path configuration to point to main control database
   - **CONFIGURE** Flask to use integrated database instead of separate `web_chat_bridge.db`

2. **Database Configuration Update**
   - **MODIFY** Flask app's `config.py` to use main control database path
   - **ENSURE** Flask app can access the integrated chat tables
   - **TEST** database connectivity and operations with new schema

3. **Service Configuration**
   - Configure Flask chat bridge to run on designated port (8001)
   - Set up environment variables and configuration
   - Ensure proper file permissions and security

### Phase 3: Connect Chat UI to Working System
1. **Update Chat JavaScript**
   - Modify `control/static/chat.js` to use working Flask API endpoints
   - Implement proper session management using integrated database schema
   - Add proper error handling and user feedback

2. **API Endpoint Mapping**
   - Map existing chat UI calls to working Flask endpoints:
     - `POST /api/v1/?action=messages` for sending messages
     - `GET /api/v1/?action=responses` for getting responses
   - Maintain existing UI functionality while connecting to real backend

3. **Session Management**
   - Use existing session management from working Flask app
   - Implement proper session ID generation and persistence
   - Handle multiple concurrent chat sessions

### Phase 2.5: Detailed API-to-UI Integration (CRITICAL)

**This is where the real work happens - mapping the working Flask API to our functional UI mockup.**

#### **Current UI Mockup Analysis**
- **Message Input**: Form submission to `/api/chat` (placeholder)
- **Message Display**: Static HTML with copy/share functionality
- **Agent Switching**: Dropdown with Athena/Monday/Timbre
- **Session Handling**: No persistence, resets on page reload
- **Error Handling**: Basic console logging

#### **Working Flask API Analysis**
- **Message Endpoint**: `POST /api/v1/?action=messages`
  - Expects: `session_id`, `message`, `timestamp`
  - Returns: `message_id`, `session_id`, `uid`, `is_new_user`
- **Response Endpoint**: `GET /api/v1/?action=responses`
  - Expects: `session_id`, `since` (optional)
  - Returns: `responses` array with timestamps
- **Session Management**: Automatic creation via `session_id` pattern

#### **Critical Integration Points**

##### **1. Session ID Generation & Management**
```javascript
// Current: No session management
// Required: Generate session_id matching Flask pattern
function generateSessionId() {
    // Flask expects: session_[a-zA-Z0-9_]+ (max 64 chars)
    return 'session_' + Math.random().toString(36).substr(2, 9);
}

// Store in localStorage for persistence
let currentSessionId = localStorage.getItem('chat_session_id') || generateSessionId();
localStorage.setItem('chat_session_id', currentSessionId);
```

##### **2. Message Submission Flow**
```javascript
// Current: POST /api/chat with { message: text }
// Required: POST /api/v1/?action=messages with proper payload
async function sendMessage(message) {
    const payload = {
        session_id: currentSessionId,
        message: message,
        timestamp: new Date().toISOString()
    };
    
    try {
        const response = await fetch('/api/v1/?action=messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        if (data.success) {
            // Message stored successfully
            // Now poll for responses
            pollForResponses();
        }
    } catch (error) {
        console.error('Send failed:', error);
    }
}
```

##### **3. Response Polling & Display**
```javascript
// Current: No response handling
// Required: Poll GET /api/v1/?action=responses for new messages
async function pollForResponses() {
    try {
        const response = await fetch(`/api/v1/?action=responses?session_id=${currentSessionId}`);
        const data = await response.json();
        
        if (data.success && data.data.responses) {
            // Display new responses
            data.data.responses.forEach(response => {
                addAssistantMessage(response.response_data);
            });
        }
    } catch (error) {
        console.error('Response polling failed:', error);
    }
}

// Poll every 2 seconds for new responses
setInterval(pollForResponses, 2000);
```

##### **4. Agent Integration with Broca**
```javascript
// Current: Static agent switching
// Required: Connect to Broca via Flask bridge
function switchAgent(agentId) {
    // Update UI
    updateAgentDisplay(agentId);
    
    // Create new session for this agent
    currentSessionId = generateSessionId();
    localStorage.setItem('chat_session_id', currentSessionId);
    
    // Clear transcript
    clearTranscript();
    
    // Send agent switch message to Broca via Flask
    sendAgentSwitchMessage(agentId);
}

async function sendAgentSwitchMessage(agentId) {
    const payload = {
        session_id: currentSessionId,
        message: `Switched to agent: ${agentId}`,
        agent_id: agentId,
        timestamp: new Date().toISOString()
    };
    
    // This goes to Broca via the Flask bridge
    await fetch('/api/v1/?action=messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}
```

##### **5. Error Handling & User Feedback**
```javascript
// Current: Basic console logging
// Required: User-friendly error messages and loading states
function showLoadingState() {
    const sendButton = document.querySelector('button[type="submit"]');
    sendButton.disabled = true;
    sendButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Sending...';
}

function hideLoadingState() {
    const sendButton = document.querySelector('button[type="submit"]');
    sendButton.disabled = false;
    sendButton.innerHTML = 'Send';
}

function showError(message) {
    // Add error message to transcript
    addErrorMessage(message);
    
    // Show toast notification
    showToast('Error: ' + message, 'error');
}
```

#### **Data Flow Validation**

##### **Message Flow**
1. **User types message** → UI captures input
2. **Generate session_id** → Use existing pattern or create new
3. **POST to Flask API** → `/api/v1/?action=messages`
4. **Flask stores message** → Database + Broca integration
5. **UI polls for responses** → GET `/api/v1/?action=responses`
6. **Display responses** → Update transcript with real data

##### **Session Flow**
1. **Page load** → Check localStorage for existing session
2. **No session** → Generate new `session_[random]` ID
3. **Agent switch** → Create new session for new agent
4. **Page reload** → Restore session from localStorage
5. **Session timeout** → Handle gracefully, create new session

##### **Error Flow**
1. **Network error** → Show user-friendly message
2. **API error** → Display specific error from Flask response
3. **Validation error** → Highlight invalid input
4. **Rate limit** → Show "too many messages" warning
5. **Authentication error** → Redirect to login if needed

#### **UI State Management**

##### **Loading States**
- **Sending message**: Disable send button, show spinner
- **Polling responses**: Show "waiting for response" indicator
- **Agent switching**: Show "connecting to agent" message
- **Error recovery**: Show "retrying..." state

##### **Message States**
- **Pending**: Message sent, waiting for response
- **Delivered**: Message received by Flask API
- **Processing**: Message being handled by Broca
- **Complete**: Response received and displayed
- **Failed**: Error occurred, show retry option

#### **Testing Integration Points**

##### **Unit Tests**
- Session ID generation matches Flask pattern
- API payload formatting is correct
- Error handling covers all scenarios
- Loading states work properly

##### **Integration Tests**
- End-to-end message flow
- Session persistence across reloads
- Agent switching creates new sessions
- Error scenarios handled gracefully

##### **User Acceptance Tests**
- Message sending feels responsive
- Responses appear in reasonable time
- Session persistence works as expected
- Error messages are clear and helpful

### Phase 3: WebSocket Integration
1. **Real-time Updates**
   - Implement WebSocket communication for real-time message updates
   - Add typing indicators and status updates
   - Handle long-running operations gracefully

2. **Broca Integration**
   - Connect working Flask chat bridge to Broca messaging system
   - Ensure proper message flow between UI, database, and Broca
   - Test end-to-end message processing

## Technical Implementation Details

### Database Schema (Already Working)
```sql
-- Existing tables from working Flask app
web_chat_sessions - Session management
web_chat_messages - User messages  
web_chat_responses - System responses
system_config - Configuration storage
rate_limits - Rate limiting data
```

### API Endpoint Structure (Already Working)
```
POST /api/v1/?action=messages - Send message
GET  /api/v1/?action=responses - Get responses
GET  /api/v1/?action=inbox - Admin inbox (authenticated)
POST /api/v1/?action=outbox - Send response (authenticated)
GET  /api/v1/?action=sessions - Session list (admin)
GET  /api/v1/?action=config - Configuration (admin)
```

### Key Components (Already Built)
- `DatabaseManager` - Database operations (working)
- `RateLimitManager` - Rate limiting (working)
- Authentication decorators and utilities (working)
- Configuration management system (working)

## File Changes Required

### Database Schema Changes (CRITICAL FIRST)
- **MODIFY** `control/db/init_database.sql` - Add chat tables to existing schema
- **INTEGRATE** chat tables with existing UI management tables
- **ENSURE** foreign key relationships work properly

### New Files to Create
- `control/chat_bridge/` - Directory for Flask chat bridge
- `control/chat_bridge/app.py` - Copy of working Flask app
- `control/chat_bridge/requirements.txt` - Dependencies
- `control/chat_bridge/config.py` - Production configuration (modified for integrated database)

### Files to Modify
- `control/static/chat.js` - Update API calls to use working endpoints
- `control/templates/index.html` - Add session management
- `control/app.py` - Add health check for chat bridge

### Files to Copy (Working Implementation)
- `temp-sources/python/app/utils/` → `control/chat_bridge/utils/` (**COPY AS-IS**)
- `temp-sources/python/app/api/` → `control/chat_bridge/api/` (**COPY AS-IS**)
- `temp-sources/python/app/chat/` → `control/chat_bridge/chat/` (**COPY AS-IS**)
- `temp-sources/python/app/__init__.py` → `control/chat_bridge/__init__.py` (**COPY AS-IS**)
- `temp-sources/python/config.py` → `control/chat_bridge/config.py` (**COPY AS-IS, THEN MODIFY DATABASE PATH**)
- `temp-sources/python/requirements.txt` → `control/chat_bridge/requirements.txt` (**COPY AS-IS**)

## Deployment Strategy

### 1. Update Database Schema (FIRST)
```sql
-- Run this against the main control database to add chat tables
-- This integrates chat functionality into the existing UI database
-- No data loss, only additive changes
```

### 2. Deploy Flask Chat Bridge
```bash
# COPY working Flask app to production (NO PORTING)
cp -r temp-sources/python/app control/chat_bridge/
cp temp-sources/python/config.py control/chat_bridge/
cp temp-sources/python/requirements.txt control/chat_bridge/

# MODIFY config.py to use main control database path
# Change DATABASE_PATH from 'db/web_chat_bridge.db' to 'db/sanctum_ui.db'

# Install dependencies (use existing working requirements)
cd control/chat_bridge
pip install -r requirements.txt

# Run on port 8001 (separate from main control app)
# Use existing working Flask app as-is, but with integrated database
python app.py --port 8001
```

### 2. Update Chat UI
- Modify `control/static/chat.js` to call working API endpoints
- Ensure proper error handling and user feedback
- Test message flow end-to-end

### 3. Integration Testing
- Test chat bridge runs independently
- Test UI connects to working API
- Test database operations work as designed
- Test rate limiting and authentication

## Testing Strategy

### Unit Tests
- Database operations (already tested in working Flask app)
- API endpoint functionality (already working)
- Authentication and authorization (already implemented)
- Rate limiting logic (already functional)

### Integration Tests
- End-to-end chat flow using working system
- Session management with existing database
- Error handling scenarios
- Performance under load

### User Acceptance Testing
- Chat interface usability with real backend
- Message flow and responses
- Error message clarity
- Performance expectations

## Dependencies and Requirements

### Python Dependencies
- Flask (already working in existing app)
- SQLite3 (built-in)
- All utilities already implemented and tested

### Database Requirements
- SQLite database file (already working)
- Proper file permissions
- Backup and recovery procedures

### Security Considerations
- API key management (already implemented)
- Rate limiting implementation (already working)
- Input validation and sanitization (already in place)
- Session security (already functional)

## Timeline and Milestones

### Week 1: Deploy Working System
- Copy working Flask chat bridge to production
- Test all existing functionality works
- Configure production environment

### Week 2: UI Integration
- Update chat JavaScript to use working API
- Test message flow end-to-end
- Implement proper error handling

### Week 3: WebSocket and Real-time
- Add WebSocket communication
- Implement real-time updates
- Test performance and reliability

### Week 4: Production Deployment
- Final testing and validation
- Performance optimization
- Documentation and monitoring

## Risk Assessment

### Technical Risks
- **LOW**: Database migration complexity (using existing working schema)
- **LOW**: API compatibility issues (using existing working endpoints)
- **MEDIUM**: Performance under production load
- **LOW**: Security vulnerabilities (using tested implementation)

### Mitigation Strategies
- Use existing working implementation as-is
- Test in production-like environment
- Monitor performance and adjust as needed
- Security review of existing working code

## Success Criteria

### Functional Requirements
- Users can send and receive messages (using working system)
- Sessions persist across page reloads (existing functionality)
- Admin can manage chat system (already implemented)
- Proper error handling and user feedback

### Performance Requirements
- Message response time < 2 seconds (existing performance)
- Support for 100+ concurrent users (tested capacity)
- Database operations complete in < 100ms (existing performance)
- Graceful degradation under load

### Quality Requirements
- Use existing tested implementation
- Zero critical security vulnerabilities (already tested)
- Comprehensive error logging (already implemented)
- User-friendly error messages

## Next Steps

1. **Review and approve this corrected plan**
2. **Deploy existing working Flask chat bridge**
3. **Update chat UI to use working API endpoints**
4. **Test end-to-end functionality**
5. **Deploy to production**

## Key Principle

**COPY, DON'T PORT, BUT INTEGRATE DATABASE.** The Flask chat system in `temp-sources/python/` is **TESTED AND WORKING** code that already perfectly integrates with Sanctum Broca. This plan:

1. **COPIES the working code as-is** - no rewriting, no porting, no "integration"
2. **INTEGRATES the database schema** - adds chat tables to existing control database
3. **Only adjusts file paths and database configuration** for production environment
4. **Uses existing working API endpoints** exactly as they are
5. **Maintains all existing functionality** that's already tested and working

**The backend is DONE. The API is DONE. The database integration is DONE.** We just need to:
- **Integrate the chat tables into the main control database**
- **Copy the working Flask app to production**
- **Update the database path configuration**
- **Connect the existing UI to the working API**
