#!/usr/bin/env python3
"""
Load test data for Sanctum UI development
This script loads test agents and users based on Iris.af for development testing
Uses the EXISTING schema from the planning document
"""

import sqlite3
import os
from pathlib import Path

def load_test_data():
    """Load test data into the database"""
    
    # Get database path
    db_path = Path(__file__).parent / 'db' / 'sanctum_ui.db'
    
    if not db_path.exists():
        print(f"Database not found at {db_path}")
        print("Please run the application first to create the database")
        return False
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        print("Loading test data...")
        
        # Clear existing test data
        cursor.execute("DELETE FROM agents WHERE name = 'Iris'")
        cursor.execute("DELETE FROM users WHERE username = 'test_admin'")
        
        # Insert test admin user (password: 'admin123')
        cursor.execute("""
            INSERT INTO users (
                username, 
                email, 
                password_hash, 
                role, 
                permissions, 
                is_active
            ) VALUES (?, ?, ?, ?, ?, ?)
        """, (
            'test_admin',
            'admin@sanctum.test',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uOeG',  # 'admin123'
            'admin',
            '{"can_manage_users": true, "can_manage_agents": true, "can_view_logs": true}',
            True
        ))
        
        # Insert Iris test agent based on Iris.af data
        # Using the EXISTING schema from planning document
        cursor.execute("""
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            'iris',
            'iris_letta_001',
            'Iris',
            'Iris is the flagship Sanctum agent—an adaptive operator–oracle that orchestrates tools, deepens user context, and speaks with clarity and care. She''s the opposite of Siri. Get it?',
            'Healthy',
            1,  # created_by test_admin
            '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.7, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["SEP", "persona", "human"], "tool_count": 6, "is_default": true, "test_data": true, "agent_type": "memgpt_agent", "provider": "letta", "capabilities": ["memory_management", "conversation_search", "web_search", "url_processing", "core_memory_editing"]}',
            True,  # is_active
            None,  # visible_to_users - visible to all users for testing
            None   # visible_to_roles - visible to all roles for testing
        ))
        
        # Insert additional test agents for comprehensive testing
        # Using the EXISTING schema from planning document
        test_agents = [
            ('athena', 'athena_letta_002', 'Athena', 'Strategic advisor and planning specialist. Focuses on long-term thinking and complex problem decomposition.', '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.3, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["persona", "human", "strategic_context"], "tool_count": 4, "is_default": false, "test_data": true, "agent_type": "memgpt_agent", "provider": "letta", "capabilities": ["strategic_planning", "problem_decomposition", "risk_assessment", "goal_setting"]}'),
            ('monday', 'monday_letta_003', 'Monday', 'Task execution and workflow specialist. Ensures projects move forward with clear next steps and accountability.', '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.5, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["persona", "human", "project_context"], "tool_count": 4, "is_default": false, "test_data": true, "agent_type": "memgpt_agent", "provider": "letta", "capabilities": ["task_management", "workflow_optimization", "deadline_tracking", "progress_monitoring"]}'),
            ('timbre', 'timbre_letta_004', 'Timbre', 'Creative and communication specialist. Handles content creation, messaging, and creative problem-solving.', '{"version": "0.8.3", "embedding_model": "letta-free", "context_window": 8192, "temperature": 0.8, "max_tokens": 4096, "persona_version": "v1", "core_memory_blocks": ["persona", "human", "creative_context"], "tool_count": 4, "is_default": false, "test_data": true, "agent_type": "memgpt_agent", "provider": "letta", "capabilities": ["content_creation", "communication_strategy", "creative_problem_solving", "brand_voice"]}')
        ]
        
        for agent_id, letta_uid, name, description, config in test_agents:
            cursor.execute("""
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
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                agent_id,
                letta_uid,
                name,
                description,
                'Healthy',
                1,  # created_by test_admin
                config,
                True,  # is_active
                None,  # visible_to_users - visible to all users for testing
                None   # visible_to_roles - visible to all roles for testing
            ))
        
        # Update schema version
        cursor.execute("""
            INSERT OR REPLACE INTO schema_version (
                version,
                applied_at,
                description
            ) VALUES (?, CURRENT_TIMESTAMP, ?)
        """, (
            1,
            'Added test data for Iris and additional test agents based on Iris.af'
        ))
        
        # Commit changes
        conn.commit()
        
        print("✅ Test data loaded successfully!")
        print("\nTest Admin User:")
        print("  Username: test_admin")
        print("  Password: admin123")
        print("  Role: admin")
        
        print("\nTest Agents:")
        cursor.execute("SELECT name, status FROM agents WHERE config LIKE '%test_data%'")
        for row in cursor.fetchall():
            print(f"  {row[0]} ({row[1]})")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading test data: {e}")
        conn.rollback()
        return False
        
    finally:
        conn.close()

if __name__ == "__main__":
    load_test_data()
