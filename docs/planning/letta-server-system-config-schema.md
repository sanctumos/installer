# Letta Server & System Configuration Schema

## Overview
This document outlines the proposed database schema for storing Letta server connection details and system configuration data that are currently hardcoded in the bootstrap script and system-settings page.

## Tables

### 1. Letta Server Connection Table
```sql
CREATE TABLE letta_server_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    server_address VARCHAR(255) NOT NULL DEFAULT 'localhost',
    server_port INTEGER NOT NULL DEFAULT 8080,
    server_password VARCHAR(255), -- Encrypted/hashed password
    server_token VARCHAR(255), -- Alternative to password if using tokens
    connection_timeout INTEGER DEFAULT 30, -- Seconds
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Stores the connection details for the Letta server that the Sanctum control panel needs to communicate with.

**Fields**:
- `server_address`: Usually localhost, but configurable for testing/remote setups
- `server_port`: Port number for Letta server (default 8080)
- `server_password`: Authentication password for Letta server
- `server_token`: Alternative authentication method if using tokens
- `connection_timeout`: Network timeout in seconds
- `is_active`: Whether this connection config is currently active

### 2. System Configuration Table
```sql
CREATE TABLE system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT,
    config_type VARCHAR(50) DEFAULT 'string', -- 'string', 'integer', 'boolean', 'json'
    description TEXT,
    is_sensitive BOOLEAN DEFAULT false, -- For API keys, passwords, etc.
    category VARCHAR(50) DEFAULT 'general', -- 'api_keys', 'paths', 'ports', 'general'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Purpose**: Flexible key-value storage for all system configuration settings currently displayed on the system-settings page.

**Fields**:
- `config_key`: Unique identifier for the configuration setting
- `config_value`: The actual value (can be string, integer, boolean, or JSON)
- `config_type`: Data type for validation and UI rendering
- `description`: Human-readable description of what this setting controls
- `is_sensitive`: Flag to identify settings that should be masked in UI (API keys, passwords)
- `category`: Groups related settings for better organization

## Sample Data Population

### Default Letta Server Configuration
```sql
-- Insert default Letta server config
INSERT INTO letta_server_config (server_address, server_port, server_password) VALUES
('localhost', 8080, NULL);
```

### Default System Configuration
```sql
-- Insert system configuration defaults
INSERT INTO system_config (config_key, config_value, config_type, description, is_sensitive, category) VALUES
-- API Keys
('openai_api_key', '', 'string', 'OpenAI API Key for AI model access', true, 'api_keys'),
('anthropic_api_key', '', 'string', 'Anthropic API Key for Claude access', true, 'api_keys'),
('ollama_base_url', 'http://localhost:11434', 'string', 'Ollama local model server URL', false, 'api_keys'),

-- Paths
('sanctum_base_path', '~/sanctum', 'string', 'Base installation directory for Sanctum', false, 'paths'),
('letta_data_path', '~/.letta', 'string', 'Letta data directory path', false, 'paths'),

-- Ports
('flask_port', '5000', 'integer', 'Flask web interface port', false, 'ports'),
('smcp_port', '9000', 'integer', 'SMCP server port', false, 'ports'),

-- General Settings
('environment', 'development', 'string', 'Current environment (dev/staging/prod)', false, 'general'),
('debug_mode', 'true', 'boolean', 'Enable debug logging', false, 'general');
```

## Performance Indexes

```sql
-- Letta server config indexes
CREATE INDEX idx_letta_server_active ON letta_server_config(is_active);

-- System config indexes
CREATE INDEX idx_system_config_key ON system_config(config_key);
CREATE INDEX idx_system_config_category ON system_config(category);
CREATE INDEX idx_system_config_sensitive ON system_config(is_sensitive);
```

## Key Features

- **Letta Server**: Stores connection details (address, port, password/token)
- **System Config**: Flexible key-value storage for all system settings
- **Sensitive Data**: Flags for API keys and passwords
- **Categories**: Groups related settings (api_keys, paths, ports, general)
- **Default Values**: Sensible defaults for common configurations
- **Timestamps**: Track when settings were created/updated

## Security Considerations

- Passwords/tokens stored as-is (we can add encryption later if needed)
- `is_sensitive` flag helps identify what should be masked in UI
- Separate table for Letta server keeps connection details isolated
- `is_active` flag allows for multiple server configs with easy switching

## Usage Examples

### Get Letta Server Configuration
```sql
SELECT * FROM letta_server_config WHERE is_active = true;
```

### Get All API Keys
```sql
SELECT config_key, config_value FROM system_config 
WHERE category = 'api_keys' AND is_sensitive = true;
```

### Get Path Configurations
```sql
SELECT config_key, config_value FROM system_config 
WHERE category = 'paths';
```

### Update Letta Server Address
```sql
UPDATE letta_server_config 
SET server_address = '192.168.1.100', updated_at = CURRENT_TIMESTAMP 
WHERE is_active = true;
```

## Integration Points

This schema will integrate with:
1. **System Settings Page**: Replace hardcoded form fields with database-driven values
2. **Letta Client**: Use stored connection details for server communication
3. **Configuration Management**: Centralized storage for all system settings
4. **Environment Switching**: Easy switching between dev/staging/prod configs
