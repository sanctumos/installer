"""
Sanctum Control Interface - Database Models
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
SQLAlchemy models for Sanctum UI database
"""

from sqlalchemy import create_engine, Column, Integer, String, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.sql import func
from datetime import datetime
import json

# Database configuration
DB_PATH = 'db/sanctum_ui.db'  # Relative to control/ directory
DATABASE_URL = f"sqlite:///{DB_PATH}"

# Create engine and session
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()

class User(Base):
    """User model for authentication and authorization"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default='user')
    permissions = Column(Text, default='[]')  # JSON array of permissions
    is_active = Column(Boolean, default=True)
    failed_login_attempts = Column(Integer, default=0)
    last_login = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    
    def get_permissions(self):
        """Parse permissions JSON and return as list"""
        try:
            return json.loads(self.permissions) if self.permissions else []
        except json.JSONDecodeError:
            return []
    
    def has_permission(self, permission):
        """Check if user has specific permission"""
        perms = self.get_permissions()
        return '*' in perms or permission in perms

class UserSession(Base):
    """User session model for web interface authentication"""
    __tablename__ = "user_sessions"
    
    id = Column(String(100), primary_key=True)  # Match existing database schema
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    session_token = Column(String(255), unique=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    ip_address = Column(String(45))  # IPv6 addresses can be up to 45 chars
    user_agent = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="sessions")

class Agent(Base):
    """Agent model for managing AI agents"""
    __tablename__ = "agents"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    letta_uid = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    status = Column(String(50), default='active')  # Agent status: active, inactive, error, etc.
    config = Column(Text)  # JSON configuration
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    def get_config(self):
        """Parse config JSON and return as dict"""
        try:
            return json.loads(self.config) if self.config else {}
        except json.JSONDecodeError:
            return {}

class SystemConfig(Base):
    __tablename__ = 'system_config'
    
    id = Column(Integer, primary_key=True)
    
    # API Keys (sensitive)
    openai_api_key = Column(String(255))
    anthropic_api_key = Column(String(255))
    ollama_base_url = Column(String(255), default='http://localhost:11434')
    
    # Paths
    sanctum_base_path = Column(String(255), default='~/sanctum')
    letta_data_path = Column(String(255), default='~/.letta')
    
    # Ports
    flask_port = Column(Integer, default=5000)
    smcp_port = Column(Integer, default=9000)
    
    # Letta Server Connection (core system config)
    letta_server_address = Column(String(255), default='https://localhost')
    letta_server_port = Column(Integer, default=443)
    letta_server_token = Column(String(255))  # Password/token for authentication
    letta_connection_timeout = Column(Integer, default=30)
    letta_server_active = Column(Boolean, default=True)
    last_connected = Column(DateTime)  # Timestamp of last successful connection
    
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    @classmethod
    def get_config(cls, db):
        """Get the system configuration (creates default if none exists)"""
        config = db.query(cls).first()
        if not config:
            # Create default configuration
            config = cls()
            db.add(config)
            db.commit()
        return config
    
    def update_config(self, **kwargs):
        """Update configuration values"""
        for key, value in kwargs.items():
            if hasattr(self, key):
                setattr(self, key, value)
        self.updated_at = func.now()

class SchemaVersion(Base):
    """Schema version tracking for migrations"""
    __tablename__ = "schema_version"
    
    version = Column(Integer, primary_key=True)  # Old schema uses version as primary key
    applied_at = Column(DateTime, default=func.now())
    description = Column(Text)  # Old schema has description column

# Database utility functions
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)

def get_current_schema_version():
    """Get current schema version"""
    db = SessionLocal()
    try:
        version = db.query(SchemaVersion).order_by(SchemaVersion.version.desc()).first()
        return version.version if version else 0
    finally:
        db.close()

def get_agents_visible_to_user(user_id, user_role, db):
    """
    Get agents visible to a specific user based on their role and permissions.
    This is a placeholder implementation - expand based on your visibility logic.
    """
    if user_role == 'admin':
        # Admins see all agents
        return db.query(Agent).filter(Agent.is_active == True).all()
    else:
        # Regular users see active agents (expand this logic as needed)
        return db.query(Agent).filter(Agent.is_active == True).all()
