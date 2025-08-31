-- Sanctum UI Database Initialization Script
-- This script creates all necessary tables for the UI management system
-- Run this script to initialize a fresh database
--
-- Copyright (c) 2025 Mark Rizzn Hopkins
--
-- This program is free software: you can redistribute it and/or modify
-- it under the terms of the GNU Affero General Public License as published by
-- the Free Software Foundation, either version 3 of the License, or
-- (at your option) any later version.
--
-- This program is distributed in the hope that it will be useful,
-- but WITHOUT ANY WARRANTY; without even the implied warranty of
-- MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
-- GNU Affero General Public License for more details.
--
-- You should have received a copy of the GNU Affero General Public License
-- along with this program.  If not, see <https://www.gnu.org/licenses/>.

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    permissions TEXT DEFAULT '[]', -- JSON array of permissions
    is_active BOOLEAN DEFAULT true,
    failed_login_attempts INTEGER DEFAULT 0,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id VARCHAR(100) PRIMARY KEY,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    letta_uid VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active', -- Agent status: active, inactive, error, etc.
    created_by INTEGER, -- User ID who created the agent
    config TEXT, -- JSON configuration
    is_active BOOLEAN DEFAULT true,
    visible_to_users TEXT, -- JSON array of user IDs or NULL for all users
    visible_to_roles TEXT, -- JSON array of role names or NULL for all roles
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create system configuration table
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- API Keys (sensitive)
    openai_api_key VARCHAR(255),
    anthropic_api_key VARCHAR(255),
    ollama_base_url VARCHAR(255) DEFAULT 'http://localhost:11434',
    
    -- Paths
    sanctum_base_path VARCHAR(255) DEFAULT '~/sanctum',
    letta_data_path VARCHAR(255) DEFAULT '~/.letta',
    
    -- Ports
    flask_port INTEGER DEFAULT 5000,
    smcp_port INTEGER DEFAULT 9000,
    
                   -- Letta Server Connection (core system config)
               letta_server_address VARCHAR(255) DEFAULT 'https://localhost',
               letta_server_port INTEGER DEFAULT 443,
               letta_server_token VARCHAR(255),
               letta_connection_timeout INTEGER DEFAULT 30,
               letta_server_active BOOLEAN DEFAULT true,
               last_connected TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create schema version tracking table
CREATE TABLE IF NOT EXISTS schema_version (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    version VARCHAR(20) NOT NULL,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_agents_name ON agents(name);
CREATE INDEX IF NOT EXISTS idx_agents_letta_uid ON agents(letta_uid);
CREATE INDEX IF NOT EXISTS idx_agents_active ON agents(is_active);

CREATE INDEX IF NOT EXISTS idx_system_config_letta_active ON system_config(letta_server_active);

-- Insert default admin user
INSERT INTO users (username, email, password_hash, role, permissions, failed_login_attempts) VALUES
('admin', 'admin@sanctum.local', '$2b$12$H2UoYl0FVEaq8moKx31a8OUu.RExWusGUAVk17bqgUBUI2krD771q', 'admin', '["*"]', 0);

-- Insert default system configuration
INSERT INTO system_config (
    openai_api_key, anthropic_api_key, ollama_base_url,
    sanctum_base_path, letta_data_path,
    flask_port, smcp_port,
    letta_server_address, letta_server_port, letta_connection_timeout
) VALUES (
    '', '', 'http://localhost:11434',
    '~/sanctum', '~/.letta',
    5000, 9000,
    'https://localhost', 443, 30
);

-- Insert schema version
INSERT INTO schema_version (version) VALUES ('1.0.0');
