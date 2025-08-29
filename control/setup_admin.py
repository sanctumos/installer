#!/usr/bin/env python3
"""
Setup script for Sanctum UI admin user
This script sets the initial password for the admin user
"""

import sys
import os
import getpass
from models import User, get_db
from auth import hash_password

def setup_admin_password():
    """Set up the admin password"""
    print("Sanctum UI Admin Setup")
    print("=" * 30)
    
    # Get database session
    db = next(get_db())
    
    try:
        # Check if admin user exists
        admin_user = db.query(User).filter(User.username == 'admin').first()
        
        if not admin_user:
            print("Error: Admin user not found in database.")
            print("Please run the database initialization script first:")
            print("sqlite3 control/db/sanctum_ui.db < control/db/init_database.sql")
            return False
        
        # Check if password is already set
        if admin_user.password_hash != 'CHANGE_ME_ON_FIRST_LOGIN':
            print("Admin password is already set.")
            change = input("Do you want to change it? (y/N): ").lower().strip()
            if change != 'y':
                return True
        
        # Get new password
        while True:
            password = getpass.getpass("Enter new admin password: ")
            if len(password) < 6:
                print("Password must be at least 6 characters long.")
                continue
            
            confirm_password = getpass.getpass("Confirm password: ")
            if password != confirm_password:
                print("Passwords do not match. Please try again.")
                continue
            
            break
        
        # Hash and update password
        admin_user.password_hash = hash_password(password)
        db.commit()
        
        print("Admin password updated successfully!")
        return True
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == '__main__':
    success = setup_admin_password()
    sys.exit(0 if success else 1)
