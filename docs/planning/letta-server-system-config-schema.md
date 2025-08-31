# Letta Server & System Configuration Schema

## Overview
This document outlines the proposed database schema for storing Letta server connection details and system configuration data that are currently hardcoded in the bootstrap script and system-settings page.

## Tables

### 1. System Configuration Table (Merged)
```sql
CREATE TABLE system_config (
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
```

**Purpose**: Single table storing all core system configuration settings with explicit, well-defined fields for reliable cross-module interactions.

**Fields**:
- **API Keys**: OpenAI, Anthropic, and Ollama configuration (sensitive data)
- **Paths**: Sanctum and Letta installation directories
- **Ports**: Webapp interface and SMCP server ports
- **Letta Server**: Connection details (address, port, token, timeout, active status)

## Additional Tables

### 2. User Sessions Table
```sql
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

**Purpose**: Track user authentication sessions with security metadata.

## Sample Data Population

### Default System Configuration
```sql
-- Insert default system configuration
INSERT INTO system_config (
    openai_api_key, anthropic_api_key, ollama_base_url,
    sanctum_base_path, letta_data_path,
    flask_port, smcp_port,
    letta_server_address, letta_server_port, letta_connection_timeout,
    letta_server_active, last_connected
) VALUES (
    '', '', 'http://localhost:11434',
    '~/sanctum', '~/.letta',
    5000, 9000,
    'https://localhost', 443, 30,
    true, NULL
);
```

## Performance Indexes

```sql
-- System config indexes for common queries
CREATE INDEX idx_system_config_letta_active ON system_config(letta_server_active);
CREATE INDEX idx_system_config_environment ON system_config(environment);
CREATE INDEX idx_system_config_debug_mode ON system_config(debug_mode);
```

## Key Features

- **Explicit Fields**: Direct field access for reliable cross-module interactions
- **Type Safety**: Database enforces data types (VARCHAR, INTEGER, BOOLEAN)
- **Default Values**: Sensible defaults for common configurations
- **Sensitive Data**: API keys and passwords stored securely
- **Letta Integration**: Core server connection details included
- **Timestamps**: Track when settings were created/updated

## Security Considerations

- API keys and passwords stored as-is (encryption can be added later)
- Sensitive fields can be masked in UI based on field names
- Single table simplifies backup/restore procedures
- Clear separation between public and sensitive configuration

## Usage Examples

### Get All Configuration
```sql
SELECT * FROM system_config WHERE id = 1;
```

### Get Letta Server Configuration
```sql
SELECT letta_server_address, letta_server_port, letta_server_active 
FROM system_config WHERE id = 1;
```

### Get API Keys
```sql
SELECT openai_api_key, anthropic_api_key, ollama_base_url 
FROM system_config WHERE id = 1;
```

### Update Letta Server Address
```sql
UPDATE system_config 
SET letta_server_address = '192.168.1.100', updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;
```

### Update Environment
```sql
UPDATE system_config 
SET environment = 'production', debug_mode = false, updated_at = CURRENT_TIMESTAMP 
WHERE id = 1;
```

## Integration Points

This schema will integrate with:
1. **System Settings Page**: Replace hardcoded form fields with database-driven values
2. **Letta Client**: Use stored connection details for server communication
3. **Configuration Management**: Centralized storage for all core system settings
4. **Environment Switching**: Easy switching between dev/staging/prod configs
5. **Cross-Module Access**: Direct field access without runtime discovery

## Response Status Monitoring

The system now includes a comprehensive response status area that provides:

### Real-Time Connection Testing
- **HTTP Status**: Shows actual HTTP response codes (200 OK, 404 Not Found, etc.)
- **Response Time**: Measures and displays connection latency in milliseconds
- **Response Details**: Provides detailed error messages and success confirmations
- **Last Test**: Timestamp of when the connection test was performed

### Connection History
- **Last Connected**: Automatically updated timestamp when connection succeeds
- **Persistent Storage**: Connection success times are saved to the database
- **Visual Indicators**: Color-coded status badges (Testing, Connected, Error, Failed)

### Error Diagnostics
- **Network Errors**: Distinguishes between server unreachable, CORS blocked, and network issues
- **HTTP Errors**: Shows specific HTTP status codes and error responses
- **Authentication**: Handles token-based authentication with Bearer headers
- **Timeout Handling**: Configurable connection timeout settings

## Future Considerations

For plugin/module configuration (user-created content), a separate flexible table can be added later:
```sql
-- Future: Plugin/Module Configuration (flexible, user-created)
-- CREATE TABLE plugin_config (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     plugin_name VARCHAR(100) NOT NULL,
--     config_key VARCHAR(100) NOT NULL,
--     config_value TEXT,
--     config_type VARCHAR(50) DEFAULT 'string',
--     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--     UNIQUE(plugin_name, config_key)
-- );
```

This approach follows the WordPress model: explicit core configuration for reliability, flexible plugin configuration for extensibility.
