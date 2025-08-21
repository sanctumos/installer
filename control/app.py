#!/usr/bin/env python3
from flask import Flask, render_template, request, jsonify, send_from_directory
import os
import json
from datetime import datetime

app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key-here'  # Change in production
app.config['STATIC_FOLDER'] = 'static'

# Ensure static folder exists
os.makedirs('static', exist_ok=True)

@app.route('/')
def index():
    """Main chat interface"""
    return render_template('index.html')

@app.route('/settings')
def settings():
    """Settings and tools management interface"""
    return render_template('settings.html')

@app.route('/system-settings')
def system_settings():
    """System settings and user management interface"""
    return render_template('system_settings.html')

@app.route('/install-tool')
def install_tool():
    """Install tool interface"""
    return render_template('install_tool.html')

@app.route('/cron-scheduler')
def cron_scheduler():
    """CRON scheduler interface"""
    return render_template('cron_scheduler.html')

@app.route('/api/chat', methods=['POST'])
def chat():
    """Handle chat messages"""
    data = request.get_json()
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'error': 'Message is required'}), 400
    
    # TODO: Integrate with actual Sanctum backend
    # For now, return a simple response
    response = {
        'message': f"I received your message: \"{message}\". Processing...",
        'timestamp': datetime.now().isoformat(),
        'agent': 'athena'
    }
    
    return jsonify(response)

@app.route('/api/agents')
def get_agents():
    """Get available agents"""
    agents = [
        {'id': 'athena', 'name': 'Athena', 'description': 'Sanctum Configuration Assistant'},
        {'id': 'monday', 'name': 'Monday', 'description': 'Task Management Specialist'},
        {'id': 'timbre', 'name': 'Timbre', 'description': 'Audio Processing Expert'}
    ]
    return jsonify(agents)

@app.route('/api/tools')
def get_tools():
    """Get available tools"""
    tools = [
        {
            'id': 'system-settings',
            'name': 'System Settings',
            'description': 'Base ports, paths, environment variables',
            'emoji': '⚙️',
            'status': 'Healthy',
            'category': 'master'
        },
        {
            'id': 'network-config',
            'name': 'Network Configuration',
            'description': 'Firewall, routing, and connectivity settings',
            'emoji': '🌐',
            'status': 'Healthy',
            'category': 'master'
        },
        {
            'id': 'security-settings',
            'name': 'Security Settings',
            'description': 'Authentication, encryption, and access control',
            'emoji': '🔒',
            'status': 'Healthy',
            'category': 'master'
        }
    ]
    return jsonify(tools)

@app.route('/api/status')
def get_status():
    """Get system status"""
    status = {
        'status': 'Healthy',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'nginx': 'running',
            'letta': 'running',
            'flask': 'running'
        }
    }
    return jsonify(status)

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=5000, debug=True)
