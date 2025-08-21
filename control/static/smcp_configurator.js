// SMCP Configurator JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Mock data for demonstration
    const mockPlugins = {
        'botfather': {
            name: 'BotFather',
            status: 'active',
            tools: 2,
            version: '1.0.0',
            type: 'cli',
            path: '/opt/sanctum/plugins/botfather',
            description: 'Telegram Bot API integration'
        },
        'devops': {
            name: 'DevOps',
            status: 'active',
            tools: 3,
            version: '1.2.0',
            type: 'cli',
            path: '/opt/sanctum/plugins/devops',
            description: 'Deployment and infrastructure management'
        },
        'sanctum-core': {
            name: 'Sanctum Core',
            status: 'active',
            tools: 5,
            version: '2.1.0',
            type: 'python',
            path: '/opt/sanctum/core',
            description: 'Core Sanctum system tools'
        }
    };

    const mockTools = [
        {
            name: 'botfather.click-button',
            plugin: 'botfather',
            description: 'Click a button in a BotFather message',
            status: 'available',
            parameters: ['button-text', 'msg-id']
        },
        {
            name: 'botfather.send-message',
            plugin: 'botfather',
            description: 'Send a message to BotFather',
            status: 'available',
            parameters: ['message']
        },
        {
            name: 'devops.deploy',
            plugin: 'devops',
            description: 'Deploy an application',
            status: 'available',
            parameters: ['app-name', 'environment']
        },
        {
            name: 'devops.rollback',
            plugin: 'devops',
            description: 'Rollback an application deployment',
            status: 'available',
            parameters: ['app-name', 'version']
        },
        {
            name: 'devops.status',
            plugin: 'devops',
            description: 'Get deployment status',
            status: 'available',
            parameters: ['app-name']
        },
        {
            name: 'sanctum-core.health',
            plugin: 'sanctum-core',
            description: 'Check system health status',
            status: 'available',
            parameters: []
        },
        {
            name: 'sanctum-core.config',
            plugin: 'sanctum-core',
            description: 'Manage system configuration',
            status: 'available',
            parameters: ['action', 'key', 'value']
        }
    ];

    const mockSessions = [
        {
            id: 'session-1234-5678',
            status: 'active',
            client: 'Letta Agent',
            lastActivity: '2 minutes ago'
        },
        {
            id: 'session-8765-4321',
            status: 'idle',
            client: 'Web Interface',
            lastActivity: '15 minutes ago'
        }
    ];

    const mockRecentActivity = [
        {
            time: '2 minutes ago',
            message: 'Plugin "sanctum-core" registered successfully',
            type: 'success'
        },
        {
            time: '5 minutes ago',
            message: 'Tool "devops.deploy" executed successfully',
            type: 'info'
        },
        {
            time: '12 minutes ago',
            message: 'New session established from Letta Agent',
            type: 'info'
        },
        {
            time: '1 hour ago',
            message: 'Configuration exported to smcp-config.json',
            type: 'success'
        }
    ];

    const mockLogs = [
        {
            timestamp: '2024-01-15 14:32:15',
            level: 'info',
            message: 'MCP Server started on port 8000'
        },
        {
            timestamp: '2024-01-15 14:32:18',
            level: 'success',
            message: 'Plugin discovery completed - 3 plugins found'
        },
        {
            timestamp: '2024-01-15 14:32:20',
            level: 'info',
            message: 'SSE connection established from client'
        },
        {
            timestamp: '2024-01-15 14:32:25',
            level: 'warning',
            message: 'Plugin "botfather" has 1 deprecated tool'
        }
    ];

    const mockAlerts = [
        {
            id: 1,
            level: 'warning',
            message: 'Plugin "botfather" has deprecated tools',
            timestamp: '2 hours ago'
        },
        {
            id: 2,
            level: 'info',
            message: 'New plugin update available for "devops"',
            timestamp: '4 hours ago'
        }
    ];

    // Initialize the page
    function initializePage() {
        updateStatusOverview();
        populatePluginsTable();
        populateToolsTable();
        populateSessionsList();
        populateRecentActivity();
        populateLogs();
        populateAlerts();
        setupEventListeners();
        startHeartbeat();
        startMetricsUpdate();
    }

    // Update status overview cards
    function updateStatusOverview() {
        document.getElementById('totalPlugins').textContent = Object.keys(mockPlugins).length;
        document.getElementById('totalTools').textContent = mockTools.length;
        document.getElementById('activeSessions').textContent = mockSessions.filter(s => s.status === 'active').length;
        document.getElementById('serverStatus').textContent = 'Online';
    }

    // Populate plugins table
    function populatePluginsTable() {
        const tbody = document.getElementById('pluginsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        Object.entries(mockPlugins).forEach(([key, plugin]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="d-flex align-items-center gap-2">
                        <strong>${plugin.name}</strong>
                        <span class="badge plugin-type-badge ${plugin.type}">${plugin.type.toUpperCase()}</span>
                    </div>
                    <small class="text-muted">${plugin.description}</small>
                </td>
                <td>
                    <div class="plugin-status ${plugin.status}">
                        <span class="status-dot"></span>
                        <span>${plugin.status}</span>
                    </div>
                </td>
                <td>
                    <span class="badge bg-info">${plugin.tools}</span>
                </td>
                <td>
                    <span class="text-muted">${plugin.version}</span>
                </td>
                <td>
                    <div class="plugin-actions">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewPlugin('${key}')">View</button>
                        <button class="btn btn-outline-warning btn-sm" onclick="editPlugin('${key}')">Edit</button>
                        <button class="btn btn-outline-danger btn-sm" onclick="removePlugin('${key}')">Remove</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Populate tools table
    function populateToolsTable() {
        const tbody = document.getElementById('toolsTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        mockTools.forEach(tool => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <span class="tool-name">${tool.name}</span>
                </td>
                <td>
                    <span class="badge bg-secondary">${tool.plugin}</span>
                </td>
                <td>
                    <span class="tool-description">${tool.description}</span>
                </td>
                <td>
                    <span class="badge bg-success">${tool.status}</span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewTool('${tool.name}')">View</button>
                        <button class="btn btn-outline-info btn-sm" onclick="testTool('${tool.name}')">Test</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Populate sessions list
    function populateSessionsList() {
        const sessionsList = document.getElementById('sessionsList');
        if (!sessionsList) return;
        
        sessionsList.innerHTML = '';

        if (mockSessions.length === 0) {
            sessionsList.innerHTML = '<div class="text-muted small">No active sessions</div>';
            return;
        }

        mockSessions.forEach(session => {
            const sessionItem = document.createElement('div');
            sessionItem.className = 'session-item';
            sessionItem.innerHTML = `
                <div>
                    <div class="session-id">${session.id}</div>
                    <div class="text-muted small">${session.client}</div>
                </div>
                <div class="text-end">
                    <span class="badge bg-${session.status === 'active' ? 'success' : 'warning'} session-status">${session.status}</span>
                    <div class="text-muted small">${session.lastActivity}</div>
                </div>
            `;
            sessionsList.appendChild(sessionItem);
        });
    }

    // Populate recent activity
    function populateRecentActivity() {
        const recentActivity = document.getElementById('recentActivity');
        if (!recentActivity) return;
        
        recentActivity.innerHTML = '';

        mockRecentActivity.forEach(activity => {
            const activityItem = document.createElement('div');
            activityItem.className = 'activity-item';
            activityItem.innerHTML = `
                <div class="activity-time">${activity.time}</div>
                <div class="activity-message">${activity.message}</div>
            `;
            recentActivity.appendChild(activityItem);
        });
    }

    // Populate logs
    function populateLogs() {
        const recentLogs = document.getElementById('recentLogs');
        if (!recentLogs) return;
        
        recentLogs.innerHTML = '';

        mockLogs.forEach(log => {
            const logEntry = document.createElement('div');
            logEntry.className = `log-entry ${log.level}`;
            logEntry.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <span class="text-muted small">${log.timestamp}</span>
                    <span class="badge bg-${log.level === 'success' ? 'success' : log.level === 'warning' ? 'warning' : log.level === 'error' ? 'danger' : 'info'}">${log.level.toUpperCase()}</span>
                </div>
                <div class="mt-1">${log.message}</div>
            `;
            recentLogs.appendChild(logEntry);
        });
    }

    // Populate alerts
    function populateAlerts() {
        const activeAlerts = document.getElementById('activeAlerts');
        if (!activeAlerts) return;
        
        activeAlerts.innerHTML = '';

        if (mockAlerts.length === 0) {
            activeAlerts.innerHTML = '<div class="text-muted text-center py-3">No active alerts</div>';
            return;
        }

        mockAlerts.forEach(alert => {
            const alertItem = document.createElement('div');
            alertItem.className = `alert-item ${alert.level}`;
            alertItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <strong>${alert.message}</strong>
                        <div class="text-muted small mt-1">${alert.timestamp}</div>
                    </div>
                    <button class="btn btn-sm btn-outline-secondary" onclick="dismissAlert(${alert.id})">×</button>
                </div>
            `;
            activeAlerts.appendChild(alertItem);
        });
    }

    // Setup event listeners
    function setupEventListeners() {
        // Tab switching
        const tabLinks = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabLinks.forEach(tab => {
            tab.addEventListener('shown.bs.tab', function(e) {
                // Update content based on active tab
                const targetId = e.target.getAttribute('data-bs-target');
                updateTabContent(targetId);
            });
        });

        // Refresh all
        const refreshAllBtn = document.getElementById('refreshAll');
        if (refreshAllBtn) {
            refreshAllBtn.addEventListener('click', function() {
                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Refreshing...';
                
                setTimeout(() => {
                    updateStatusOverview();
                    populatePluginsTable();
                    populateToolsTable();
                    populateSessionsList();
                    this.disabled = false;
                    this.innerHTML = '<span class="d-block">🔄</span>Refresh All';
                    showNotification('All data refreshed successfully', 'success');
                }, 1500);
            });
        }

        // Add new plugin (overview tab)
        const addNewPluginBtn = document.getElementById('addNewPlugin');
        if (addNewPluginBtn) {
            addNewPluginBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('addPluginModal'));
                modal.show();
            });
        }

        // Refresh plugins
        const refreshPluginsBtn = document.getElementById('refreshPlugins');
        if (refreshPluginsBtn) {
            refreshPluginsBtn.addEventListener('click', function() {
                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Refreshing...';
                
                setTimeout(() => {
                    populatePluginsTable();
                    this.disabled = false;
                    this.textContent = 'Refresh';
                    showNotification('Plugins refreshed successfully', 'success');
                }, 1000);
            });
        }

        // Add plugin
        const addPluginBtn = document.getElementById('addPlugin');
        if (addPluginBtn) {
            addPluginBtn.addEventListener('click', function() {
                const modal = new bootstrap.Modal(document.getElementById('addPluginModal'));
                modal.show();
            });
        }

        // Save plugin
        const savePluginBtn = document.getElementById('savePlugin');
        if (savePluginBtn) {
            savePluginBtn.addEventListener('click', function() {
                const name = document.getElementById('pluginName').value;
                const path = document.getElementById('pluginPath').value;
                const type = document.getElementById('pluginType').value;

                if (!name || !path) {
                    showNotification('Please fill in all required fields', 'warning');
                    return;
                }

                // Add mock plugin
                mockPlugins[name.toLowerCase()] = {
                    name: name,
                    status: 'active',
                    tools: 0,
                    version: '1.0.0',
                    type: type,
                    path: path,
                    description: 'New plugin'
                };

                populatePluginsTable();
                updateStatusOverview();
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('addPluginModal'));
                modal.hide();
                
                // Reset form
                document.getElementById('addPluginForm').reset();
                
                showNotification(`Plugin "${name}" added successfully`, 'success');
            });
        }

        // Search tools
        const searchToolsInput = document.getElementById('searchTools');
        if (searchToolsInput) {
            searchToolsInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                filterTools(searchTerm);
            });
        }

        // Test connection
        const testConnectionBtn = document.getElementById('testConnection');
        if (testConnectionBtn) {
            testConnectionBtn.addEventListener('click', function() {
                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Testing...';
                
                setTimeout(() => {
                    this.disabled = false;
                    this.textContent = 'Test Connection';
                    showNotification('Connection test successful', 'success');
                }, 2000);
            });
        }

        // Clear sessions
        const clearSessionsBtn = document.getElementById('clearSessions');
        if (clearSessionsBtn) {
            clearSessionsBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to clear all sessions?')) {
                    mockSessions.length = 0;
                    populateSessionsList();
                    updateStatusOverview();
                    showNotification('All sessions cleared', 'info');
                }
            });
        }

        // Export config
        const exportConfigBtn = document.getElementById('exportConfig');
        if (exportConfigBtn) {
            exportConfigBtn.addEventListener('click', function() {
                const config = {
                    plugins: mockPlugins,
                    tools: mockTools,
                    timestamp: new Date().toISOString()
                };
                
                const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'smcp-config.json';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
                showNotification('Configuration exported successfully', 'success');
            });
        }

        // Import config
        const importConfigBtn = document.getElementById('importConfig');
        if (importConfigBtn) {
            importConfigBtn.addEventListener('click', function() {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.json';
                input.onchange = function(e) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        try {
                            const config = JSON.parse(e.target.result);
                            // In a real implementation, you would validate and apply the config
                            showNotification('Configuration imported successfully', 'success');
                        } catch (error) {
                            showNotification('Invalid configuration file', 'error');
                        }
                    };
                    reader.readAsText(file);
                };
                input.click();
            });
        }

        // Restart server
        const restartServerBtn = document.getElementById('restartServer');
        if (restartServerBtn) {
            restartServerBtn.addEventListener('click', function() {
                if (confirm('Are you sure you want to restart the MCP server? This will disconnect all active sessions.')) {
                    this.disabled = true;
                    this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Restarting...';
                    
                    setTimeout(() => {
                        this.disabled = false;
                        this.textContent = 'Restart Server';
                        showNotification('Server restarted successfully', 'success');
                    }, 3000);
                }
            });
        }

        // Clear cache
        const clearCacheBtn = document.getElementById('clearCache');
        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', function() {
                this.disabled = true;
                this.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Clearing...';
                
                setTimeout(() => {
                    this.disabled = false;
                    this.textContent = 'Clear Cache';
                    showNotification('Cache cleared successfully', 'success');
                }, 1500);
            });
        }
    }

    // Update tab content based on active tab
    function updateTabContent(tabId) {
        switch(tabId) {
            case '#overview':
                // Overview tab is already populated
                break;
            case '#plugins':
                populatePluginsTable();
                break;
            case '#tools':
                populateToolsTable();
                break;
            case '#sessions':
                populateSessionsList();
                break;
            case '#health':
                populateLogs();
                populateAlerts();
                break;
        }
    }

    // Filter tools based on search term
    function filterTools(searchTerm) {
        const rows = document.querySelectorAll('#toolsTableBody tr');
        
        rows.forEach(row => {
            const toolName = row.querySelector('.tool-name').textContent.toLowerCase();
            const description = row.querySelector('.tool-description').textContent.toLowerCase();
            const plugin = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            
            if (toolName.includes(searchTerm) || description.includes(searchTerm) || plugin.includes(searchTerm)) {
                row.style.display = '';
                // Highlight search term
                if (searchTerm) {
                    highlightSearchTerm(row, searchTerm);
                }
            } else {
                row.style.display = 'none';
            }
        });
    }

    // Highlight search terms in tool rows
    function highlightSearchTerm(row, searchTerm) {
        const toolName = row.querySelector('.tool-name');
        const description = row.querySelector('.tool-description');
        
        toolName.innerHTML = toolName.textContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
        
        description.innerHTML = description.textContent.replace(
            new RegExp(searchTerm, 'gi'),
            match => `<span class="highlight">${match}</span>`
        );
    }

    // Start heartbeat monitoring
    function startHeartbeat() {
        setInterval(() => {
            const lastHeartbeat = document.getElementById('lastHeartbeat');
            if (lastHeartbeat) {
                const now = new Date();
                const timeDiff = Math.floor((now - new Date(now.getTime() - 30000)) / 1000);
                
                if (timeDiff < 60) {
                    lastHeartbeat.textContent = 'Just now';
                } else if (timeDiff < 3600) {
                    const minutes = Math.floor(timeDiff / 60);
                    lastHeartbeat.textContent = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
                } else {
                    const hours = Math.floor(timeDiff / 3600);
                    lastHeartbeat.textContent = `${hours} hour${hours > 1 ? 's' : ''} ago`;
                }
            }
        }, 30000); // Update every 30 seconds
    }

    // Start metrics update
    function startMetricsUpdate() {
        setInterval(() => {
            // Update health metrics with random variations
            const responseTime = document.getElementById('responseTime');
            const errorRate = document.getElementById('errorRate');
            const throughput = document.getElementById('throughput');
            const availability = document.getElementById('availability');

            if (responseTime) {
                const baseTime = 45;
                const variation = Math.floor(Math.random() * 20) - 10;
                responseTime.textContent = `${Math.max(20, baseTime + variation)}ms`;
            }

            if (errorRate) {
                const baseRate = 0.2;
                const variation = (Math.random() * 0.3);
                errorRate.textContent = `${(baseRate + variation).toFixed(1)}%`;
            }

            if (throughput) {
                const baseThroughput = 1.2;
                const variation = (Math.random() * 0.4) - 0.2;
                throughput.textContent = `${(baseThroughput + variation).toFixed(1)}k req/s`;
            }

            if (availability) {
                const baseAvailability = 99.9;
                const variation = (Math.random() * 0.1);
                availability.textContent = `${(baseAvailability - variation).toFixed(1)}%`;
            }
        }, 10000); // Update every 10 seconds
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show notification`;
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // Global functions for onclick handlers
    window.viewPlugin = function(pluginKey) {
        const plugin = mockPlugins[pluginKey];
        showNotification(`Viewing plugin: ${plugin.name}`, 'info');
    };

    window.editPlugin = function(pluginKey) {
        const plugin = mockPlugins[pluginKey];
        showNotification(`Editing plugin: ${plugin.name}`, 'info');
    };

    window.removePlugin = function(pluginKey) {
        const plugin = mockPlugins[pluginKey];
        if (confirm(`Are you sure you want to remove the plugin "${plugin.name}"?`)) {
            delete mockPlugins[pluginKey];
            populatePluginsTable();
            updateStatusOverview();
            showNotification(`Plugin "${plugin.name}" removed`, 'success');
        }
    };

    window.viewTool = function(toolName) {
        const tool = mockTools.find(t => t.name === toolName);
        if (tool) {
            const modal = new bootstrap.Modal(document.getElementById('toolDetailsModal'));
            const content = document.getElementById('toolDetailsContent');
            
            content.innerHTML = `
                <div class="mb-3">
                    <h6>Tool Information</h6>
                    <p><strong>Name:</strong> <span class="tool-name">${tool.name}</span></p>
                    <p><strong>Plugin:</strong> <span class="badge bg-secondary">${tool.plugin}</span></p>
                    <p><strong>Description:</strong> ${tool.description}</p>
                    <p><strong>Status:</strong> <span class="badge bg-success">${tool.status}</span></p>
                </div>
                <div class="mb-3">
                    <h6>Parameters</h6>
                    ${tool.parameters.length > 0 ? 
                        `<ul class="list-unstyled">
                            ${tool.parameters.map(param => `<li><code>${param}</code></li>`).join('')}
                        </ul>` : 
                        '<p class="text-muted">No parameters required</p>'
                    }
                </div>
            `;
            
            modal.show();
        }
    };

    window.testTool = function(toolName) {
        const tool = mockTools.find(t => t.name === toolName);
        if (tool) {
            showNotification(`Testing tool: ${tool.name}`, 'info');
            
            // Simulate tool execution
            setTimeout(() => {
                showNotification(`Tool ${tool.name} executed successfully`, 'success');
            }, 2000);
        }
    };

    window.dismissAlert = function(alertId) {
        // Remove alert from mock data
        const alertIndex = mockAlerts.findIndex(a => a.id === alertId);
        if (alertIndex > -1) {
            mockAlerts.splice(alertIndex, 1);
            populateAlerts();
            showNotification('Alert dismissed', 'info');
        }
    };

    // Initialize the page
    initializePage();
});
