-- Test Database Setup for Development
-- This file loads test agent data based on Iris.af for UI development
-- NOT for production bootstrap - production will use Letta kernel auto-detection
-- Uses the EXISTING schema from the planning document

-- Clear existing test data
DELETE FROM agents WHERE name = 'Iris';
DELETE FROM users WHERE username = 'test_admin';

-- Insert test admin user (password: 'admin123')
INSERT INTO users (
    username, 
    email, 
    password_hash, 
    role, 
    permissions, 
    is_active
) VALUES (
    'test_admin',
    'admin@sanctum.test',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uOeG', -- 'admin123'
    'admin',
    '{"can_manage_users": true, "can_manage_agents": true, "can_view_logs": true}',
    true
);

-- Insert Iris test agent based on Iris.af data
-- Using the EXISTING schema from planning document
INSERT INTO agents (
    id,
    letta_uid,
    name,
    description,
    status,
    created_by,
    config,
    is_active,
    visible_to_users,
    visible_to_roles
) VALUES (
    'iris',
    'iris_letta_001',
    'Iris',
    'Iris is the flagship Sanctum agent—an adaptive operator–oracle that orchestrates tools, deepens user context, and speaks with clarity and care. She''s the opposite of Siri. Get it?',
    'Healthy',
    1, -- created_by test_admin
    '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.7, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["SEP", "persona", "human"], "tool_count": 6, "is_default": true, "test_data": true, "agent_type": "memgpt_agent", "provider": "letta", "capabilities": ["memory_management", "conversation_search", "web_search", "url_processing", "core_memory_editing"]}',
    true,
    NULL, -- visible to all users for testing
    NULL  -- visible to all roles for testing
);

-- Insert additional test agents for comprehensive testing
-- Using the EXISTING schema from planning document
INSERT INTO agents (
    id,
    letta_uid,
    name,
    description,
    status,
    created_by,
    config,
    is_active,
    visible_to_users,
    visible_to_roles
) VALUES 
(
    'athena',
    'athena_letta_002',
    'Athena',
    'Strategic advisor and planning specialist. Focuses on long-term thinking and complex problem decomposition.',
    'Healthy',
    1, -- created_by test_admin
    '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.3, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["persona", "human", "strategic_context"], "tool_count": 4, "is_default": false, "test_data": true, "agent_type": "memgpt_agent", "provider": "letta", "capabilities": ["strategic_planning", "problem_decomposition", "risk_assessment", "goal_setting"]}',
    true,
    NULL, -- visible to all users for testing
    NULL  -- visible to all roles for testing
),
(
    'monday',
    'monday_letta_003',
    'Monday',
    'Task execution and workflow specialist. Ensures projects move forward with clear next steps and accountability.',
    'Healthy',
    1, -- created_by test_admin
    '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.5, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["persona", "human", "project_context"], "tool_count": 4, "is_default": false, "test_data": true, "agent_type": "memgpt_agent", "provider": "letta", "capabilities": ["task_management", "workflow_optimization", "deadline_tracking", "progress_monitoring"]}',
    true,
    NULL, -- visible to all users for testing
    NULL  -- visible to all roles for testing
),
(
    'timbre',
    'timbre_letta_004',
    'Timbre',
    'Creative and communication specialist. Handles content creation, messaging, and creative problem-solving.',
    'Healthy',
    1, -- created_by test_admin
    '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.8, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["persona", "human", "creative_context"], "tool_count": 4, "is_default": false, "test_data": true, "agent_type": "memgpt_agent", "provider": "letta", "capabilities": ["content_creation", "communication_strategy", "creative_problem_solving", "brand_voice"]}',
    true,
    NULL, -- visible to all users for testing
    NULL  -- visible to all roles for testing
);

-- Insert test user sessions for development
INSERT INTO user_sessions (
    user_id,
    session_token,
    expires_at,
    created_at
) VALUES (
    1, -- test_admin
    'test_session_token_12345',
    datetime('now', '+24 hours'),
    CURRENT_TIMESTAMP
);

-- Update schema version
INSERT OR REPLACE INTO schema_version (
    version,
    applied_at,
    description
) VALUES (
    1,
    CURRENT_TIMESTAMP,
    'Added test data for Iris and additional test agents based on Iris.af'
);

-- Display test data summary
SELECT 'Test data loaded successfully!' as status;
SELECT 'Test Admin User:' as user_info, username, role, email FROM users WHERE username = 'test_admin';
SELECT 'Test Agents:' as agent_info, name, status FROM agents WHERE config LIKE '%test_data%';
