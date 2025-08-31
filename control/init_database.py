#!/usr/bin/env python3
"""
Sanctum Control Interface - Database Initialization Script
Copyright (c) 2025 Mark Rizzn Hopkins

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
"""

"""
Initialize the database with the new system_config table
"""

import os
import sys
from models import init_db, get_db, User, SystemConfig, SchemaVersion
import bcrypt

def init_database():
    """Initialize the database with all tables and default data"""
    print("🚀 Initializing Sanctum UI Database...")
    
    # Create tables
    print("📋 Creating database tables...")
    init_db()
    print("✅ Tables created successfully")
    
    # Get database session
    db = next(get_db())
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.username == 'admin').first()
        if not admin_user:
            print("👤 Creating default admin user...")
            # Hash password for admin123
            password_hash = bcrypt.hashpw('admin123'.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
            
            admin_user = User(
                username='admin',
                email='admin@sanctum.local',
                password_hash=password_hash,
                role='admin',
                permissions='["*"]',
                is_active=True,
                failed_login_attempts=0
            )
            db.add(admin_user)
            print("✅ Admin user created")
        else:
            print("ℹ️  Admin user already exists")
        
        # Check if system config already exists
        system_config = db.query(SystemConfig).first()
        if not system_config:
            print("⚙️  Creating default system configuration...")
            system_config = SystemConfig(
                openai_api_key='',
                anthropic_api_key='',
                ollama_base_url='http://localhost:11434',
                sanctum_base_path='~/sanctum',
                letta_data_path='~/.letta',
                flask_port=5000,
                smcp_port=9000,
                letta_server_address='https://localhost',
                letta_server_port=443,
                letta_server_token=None,
                letta_connection_timeout=30,
                letta_server_active=True
            )
            db.add(system_config)
            print("✅ System configuration created")
        else:
            print("ℹ️  System configuration already exists")
        
        # Check if schema version exists
        schema_version = db.query(SchemaVersion).first()
        if not schema_version:
            print("📊 Setting schema version...")
            schema_version = SchemaVersion(version=1, description='Initial MVP schema: users, user_sessions, agents, system_config')
            db.add(schema_version)
            print("✅ Schema version set")
        else:
            print("ℹ️  Schema version already exists")
        
        # Commit all changes
        db.commit()
        print("💾 Database initialization completed successfully!")
        
        # Display summary
        print("\n📋 Database Summary:")
        print(f"   Users: {db.query(User).count()}")
        print(f"   System Config: {db.query(SystemConfig).count()}")
        print(f"   Schema Version: {db.query(SchemaVersion).count()}")
        
        if admin_user:
            print(f"\n🔑 Admin Login:")
            print(f"   Username: admin")
            print(f"   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error during initialization: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
