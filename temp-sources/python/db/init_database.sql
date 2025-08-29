-- Web Chat Bridge Database Initialization Script
-- This script creates all necessary tables for the web chat bridge system
-- Run this script to initialize a fresh database

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create web_chat_sessions table with UID support - IDENTICAL to PHP
CREATE TABLE IF NOT EXISTS web_chat_sessions (
    id VARCHAR(64) PRIMARY KEY,
    uid VARCHAR(16) UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    last_active TEXT DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45),
    metadata TEXT
);

-- Create web_chat_messages table - IDENTICAL to PHP
CREATE TABLE IF NOT EXISTS web_chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64),
    message TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    processed INTEGER DEFAULT 0,
    broca_message_id INTEGER NULL,
    FOREIGN KEY (session_id) REFERENCES web_chat_sessions(id)
);

-- Create web_chat_responses table - IDENTICAL to PHP
CREATE TABLE IF NOT EXISTS web_chat_responses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id VARCHAR(64),
    response TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
    message_id INTEGER NULL,
    FOREIGN KEY (session_id) REFERENCES web_chat_sessions(id),
    FOREIGN KEY (message_id) REFERENCES web_chat_messages(id)
);

-- Create rate limiting table - IDENTICAL to PHP
CREATE TABLE IF NOT EXISTS rate_limits (
    ip_address VARCHAR(45),
    endpoint VARCHAR(50),
    count INTEGER DEFAULT 1,
    window_start TEXT DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (ip_address, endpoint)
);

-- Create system_config table for storing configuration values
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default configuration values
INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES
('api_key', 'ObeyG1ant', 'API key for external integrations'),
('admin_key', 'FreeUkra1ne', 'Admin authentication key'),
('rate_limit_window', '3600', 'Rate limiting window in seconds'),
('rate_limit_max_requests', '1000', 'Maximum requests per window per IP'),
('rate_limit_endpoint_max', '100', 'Maximum requests per window per endpoint per IP'),
('session_timeout', '86400', 'Session timeout in seconds'),
('max_sessions_per_ip', '10', 'Maximum concurrent sessions per IP address'),
('log_retention_days', '30', 'Number of days to retain logs'),
('cleanup_probability', '0.1', 'Probability of running cleanup on each request (0.0-1.0)'),
('cors_origins', '*', 'Allowed CORS origins (comma-separated)'),
('debug_mode', '0', 'Enable debug mode (0=disabled, 1=enabled)');

-- Create indexes for better performance - IDENTICAL to PHP
CREATE INDEX IF NOT EXISTS idx_messages_session ON web_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_messages_processed ON web_chat_messages(processed);
CREATE INDEX IF NOT EXISTS idx_responses_session ON web_chat_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits(window_start);
CREATE INDEX IF NOT EXISTS idx_sessions_uid ON web_chat_sessions(uid);
CREATE INDEX IF NOT EXISTS idx_sessions_ip ON web_chat_sessions(ip_address);
