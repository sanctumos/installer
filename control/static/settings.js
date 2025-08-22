// Settings page functionality
document.addEventListener('DOMContentLoaded', function() {
    // Agent switching functionality
    const agentDropdown = document.querySelector('.dropdown-toggle');
    const agentDropdownMenu = document.querySelector('.dropdown-menu');
    
    if (agentDropdown && agentDropdownMenu) {
        // Handle agent selection
        agentDropdownMenu.addEventListener('click', function(e) {
            if (e.target.classList.contains('dropdown-item')) {
                e.preventDefault();
                const agentName = e.target.textContent;
                const agentId = e.target.dataset.agent;
                
                // Update the dropdown button text
                agentDropdown.textContent = agentName;
                
                // Update the avatar
                const avatar = document.querySelector('.avatar-assistant');
                if (avatar) {
                    const firstLetter = agentName.charAt(0).toUpperCase();
                    avatar.textContent = firstLetter;
                }
                
                // Switch to the corresponding agent tab
                switchToAgentTab(agentName);
                
                // Refresh the page to load the new agent's context
                refreshForNewAgent(agentName);
            }
        });
    }
    
    // Function to switch to agent tab
    function switchToAgentTab(agentName) {
        const tabId = agentName.toLowerCase() + '-tab';
        const tab = document.getElementById(tabId);
        if (tab) {
            const tabTrigger = new bootstrap.Tab(tab);
            tabTrigger.show();
        }
    }
    
    // Function to refresh the settings page for a new agent
    function refreshForNewAgent(agentName) {
        // Show a brief loading state
        const pageTitle = document.querySelector('h1');
        if (pageTitle) {
            pageTitle.textContent = `Loading ${agentName}...`;
        }
        
        // Refresh the page after a short delay to show the loading state
        setTimeout(() => {
            window.location.reload();
        }, 300);
    }

    // Initialize search functionality for all tabs
    initializeTabSearch();

    // Tool card interactions
    initializeToolCards();

    // Keyboard shortcuts
    initializeKeyboardShortcuts();

    // Focus search on page load
    focusActiveTabSearch();
});

// Function to initialize search functionality for all tabs
function initializeTabSearch() {
    const tabs = ['master', 'athena', 'monday', 'timbre', 'smcp'];
    
    tabs.forEach(tabName => {
        const searchInput = document.getElementById(`search${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Tools`);
        const toolsGrid = document.getElementById(`${tabName}ToolsGrid`);
        const clearSearchBtn = document.getElementById(`clear${tabName.charAt(0).toUpperCase() + tabName.slice(1)}Search`);
        const searchResults = document.getElementById(`${tabName}SearchResults`);
        
        if (searchInput && toolsGrid) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase().trim();
                const toolCards = toolsGrid.querySelectorAll('[data-tool-name]');
                let visibleCount = 0;
                
                toolCards.forEach(card => {
                    const toolName = card.dataset.toolName.toLowerCase();
                    const toolDesc = card.dataset.toolDesc.toLowerCase();
                    
                    if (toolName.includes(searchTerm) || toolDesc.includes(searchTerm)) {
                        card.style.display = 'block';
                        card.style.animation = 'fadeInUp 0.3s ease-out';
                        visibleCount++;
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                // Update results counter
                if (searchTerm) {
                    searchResults.textContent = `${visibleCount} result${visibleCount !== 1 ? 's' : ''}`;
                    searchResults.style.display = 'block';
                    
                    // Show clear button
                    if (clearSearchBtn) {
                        clearSearchBtn.classList.remove('d-none');
                    }
                } else {
                    searchResults.style.display = 'none';
                    
                    // Hide clear button
                    if (clearSearchBtn) {
                        clearSearchBtn.classList.add('d-none');
                    }
                }
            });
            
            // Clear search functionality
            if (clearSearchBtn) {
                clearSearchBtn.addEventListener('click', function() {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                    searchInput.focus();
                });
            }
        }
    });
}

// Function to initialize tool card interactions
function initializeToolCards() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        // Handle Open button clicks
        const openBtn = card.querySelector('.btn-primary');
        if (openBtn) {
            openBtn.addEventListener('click', function() {
                const toolTitle = card.querySelector('.tool-title').textContent;
                console.log(`Opening ${toolTitle}...`);
                // In a real app, this would navigate to the tool's interface
                // TODO: Implement tool opening functionality
        console.log(`Opening ${toolTitle}...`);
            });
        }
    });
}

// Function to initialize keyboard shortcuts
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Tab switching with Ctrl+1-5
        if (e.ctrlKey && e.key >= '1' && e.key <= '5') {
            e.preventDefault();
            const tabIndex = parseInt(e.key) - 1;
            const tabButtons = document.querySelectorAll('#settingsTabs .nav-link');
            
            if (tabButtons[tabIndex]) {
                const tab = new bootstrap.Tab(tabButtons[tabIndex]);
                tab.show();
                focusActiveTabSearch();
            }
        }
        
        // Number keys 1-6 to open tools in active tab
        if (e.key >= '1' && e.key <= '6') {
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab) {
                const toolCards = activeTab.querySelectorAll('.tool-card');
                const toolIndex = parseInt(e.key) - 1;
                
                if (toolCards[toolIndex]) {
                    const openBtn = toolCards[toolIndex].querySelector('.btn-primary');
                    if (openBtn) {
                        openBtn.click();
                    }
                }
            }
        }
        
        // Enter key to open first visible tool in active tab
        if (e.key === 'Enter') {
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab) {
                const firstVisibleTool = activeTab.querySelector('.tool-card[style*="display: block"], .tool-card:not([style*="display: none"])');
                if (firstVisibleTool) {
                    const openBtn = firstVisibleTool.querySelector('.btn-primary');
                    if (openBtn) {
                        openBtn.click();
                    }
                }
            }
        }
        
        // Escape key to clear search in active tab
        if (e.key === 'Escape') {
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab) {
                const searchInput = activeTab.querySelector('input[type="text"]');
                if (searchInput) {
                    searchInput.value = '';
                    searchInput.dispatchEvent(new Event('input'));
                    searchInput.focus();
                }
            }
        }
    });
}

// Function to focus search in active tab
function focusActiveTabSearch() {
    const activeTab = document.querySelector('.tab-pane.active');
    if (activeTab) {
        const searchInput = activeTab.querySelector('input[type="text"]');
        if (searchInput) {
            searchInput.focus();
        }
    }
}

// Tab change event listener to focus search in new tab
document.addEventListener('shown.bs.tab', function(e) {
    setTimeout(focusActiveTabSearch, 100);
});

// ============================================================================
// SMCP CONFIGURATOR FUNCTIONALITY
// ============================================================================

// Mock data for SMCP panels
let smcpData = {
    plugins: [
        { name: 'botfather', status: 'active', version: '1.2.0', lastUpdated: '2024-01-15 14:30:00' },
        { name: 'devops', status: 'active', version: '0.9.1', lastUpdated: '2024-01-15 14:25:00' },
        { name: 'file_manager', status: 'inactive', version: '1.0.0', lastUpdated: '2024-01-15 14:20:00' }
    ],
    tools: [
        { name: 'file_read', category: 'File System', status: 'available', lastUsed: '2024-01-15 14:30:00' },
        { name: 'file_write', category: 'File System', status: 'available', lastUsed: '2024-01-15 14:25:00' },
        { name: 'process_list', category: 'System', status: 'available', lastUsed: '2024-01-15 14:20:00' },
        { name: 'network_scan', category: 'Network', status: 'available', lastUsed: '2024-01-15 14:15:00' }
    ],
    sessions: [
        { id: 'sess_001', user: 'rizzn', status: 'active', lastActivity: '2024-01-15 14:30:00' },
        { id: 'sess_002', user: 'admin', status: 'idle', lastActivity: '2024-01-15 14:25:00' }
    ],
    recentActivity: [
        { action: 'Plugin activated', target: 'botfather', timestamp: '2024-01-15 14:30:00' },
        { action: 'Tool used', target: 'file_read', timestamp: '2024-01-15 14:25:00' },
        { action: 'Session started', target: 'rizzn', timestamp: '2024-01-15 14:20:00' }
    ],
    logs: [
        { level: 'info', message: 'Plugin botfather loaded successfully', timestamp: '2024-01-15 14:30:00' },
        { level: 'info', message: 'Tool file_read executed', timestamp: '2024-01-15 14:25:00' },
        { level: 'warning', message: 'Plugin file_manager failed to load', timestamp: '2024-01-15 14:20:00' }
    ],
    alerts: [
        { level: 'warning', message: 'Plugin file_manager inactive', timestamp: '2024-01-15 14:20:00' }
    ]
};

// Initialize SMCP panels when SMCP tab is shown
document.addEventListener('shown.bs.tab', function(e) {
    if (e.target.id === 'smcp-tab') {
        initializeSmcpPanels();
    }
});

// Initialize all SMCP panels
function initializeSmcpPanels() {
    updateOverviewPanel();
    updatePluginsPanel();
    updateToolsPanel();
    updateSessionsPanel();
    updateHealthPanel();
    startSmcpUpdates();
}

// Update Overview Panel
function updateOverviewPanel() {
    document.getElementById('totalPlugins').textContent = smcpData.plugins.filter(p => p.status === 'active').length;
    document.getElementById('totalTools').textContent = smcpData.tools.length;
    document.getElementById('activeSessions').textContent = smcpData.sessions.filter(s => s.status === 'active').length;
    document.getElementById('serverStatus').textContent = 'Online';
    
    // Update recent activity
    const recentActivityContainer = document.getElementById('recentActivity');
    if (recentActivityContainer) {
        recentActivityContainer.innerHTML = smcpData.recentActivity.map(activity => `
            <div class="list-group-item bg-transparent border-secondary">
                <div class="d-flex justify-content-between align-items-center">
                    <span>${activity.action}: ${activity.target}</span>
                    <small class="text-muted">${activity.timestamp}</small>
                </div>
            </div>
        `).join('');
    }
    
    // Update system info
    document.getElementById('lastUpdated').textContent = 'Just now';
    document.getElementById('uptime').textContent = '0d 0h 15m';
}

// Update Plugins Panel
function updatePluginsPanel() {
    const tbody = document.getElementById('pluginsTableBody');
    if (tbody) {
        tbody.innerHTML = smcpData.plugins.map(plugin => `
            <tr>
                <td><strong>${plugin.name}</strong></td>
                <td><span class="badge ${plugin.status === 'active' ? 'bg-success' : 'bg-warning'}">${plugin.status}</span></td>
                <td>${plugin.version}</td>
                <td>${plugin.lastUpdated}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary btn-sm" onclick="togglePlugin('${plugin.name}')">
                            ${plugin.status === 'active' ? 'Deactivate' : 'Activate'}
                        </button>
                        <button class="btn btn-outline-info btn-sm" onclick="viewPluginConfig('${plugin.name}')">Config</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Update Tools Panel
function updateToolsPanel() {
    const tbody = document.getElementById('toolsTableBody');
    if (tbody) {
        tbody.innerHTML = smcpData.tools.map(tool => `
            <tr>
                <td><strong>${tool.name}</strong></td>
                <td>${tool.category}</td>
                <td><span class="badge bg-success">${tool.status}</span></td>
                <td>${tool.lastUsed}</td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-info btn-sm" onclick="testTool('${tool.name}')">Test</button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="viewToolDocs('${tool.name}')">Docs</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Update Sessions Panel
function updateSessionsPanel() {
    const sessionsList = document.getElementById('sessionsList');
    if (sessionsList) {
        if (smcpData.sessions.length === 0) {
            sessionsList.innerHTML = '<div class="list-group-item bg-transparent border-secondary text-muted text-center"><small>No active sessions</small></div>';
        } else {
            sessionsList.innerHTML = smcpData.sessions.map(session => `
                <div class="list-group-item bg-transparent border-secondary">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <strong>${session.id}</strong> - ${session.user}
                            <span class="badge ${session.status === 'active' ? 'bg-success' : 'bg-warning'} ms-2">${session.status}</span>
                        </div>
                        <div class="d-flex gap-2">
                            <small class="text-muted">${session.lastActivity}</small>
                            <button class="btn btn-outline-danger btn-sm" onclick="terminateSession('${session.id}')">Terminate</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Update Health Panel
function updateHealthPanel() {
    // Update health metrics
    document.getElementById('cpuUsage').textContent = '12%';
    document.getElementById('memoryUsage').textContent = '45%';
    document.getElementById('diskUsage').textContent = '23%';
    document.getElementById('networkStatus').textContent = 'Active';
    
    // Update recent logs
    const recentLogs = document.getElementById('recentLogs');
    if (recentLogs) {
        recentLogs.innerHTML = smcpData.logs.map(log => `
            <div class="list-group-item bg-transparent border-secondary">
                <div class="d-flex justify-content-between align-items-center">
                    <span class="text-${log.level === 'warning' ? 'warning' : 'info'}">${log.message}</span>
                    <small class="text-muted">${log.timestamp}</small>
                </div>
            </div>
        `).join('');
    }
    
    // Update active alerts
    const activeAlerts = document.getElementById('activeAlerts');
    if (activeAlerts) {
        if (smcpData.alerts.length === 0) {
            activeAlerts.innerHTML = '<div class="list-group-item bg-transparent border-secondary text-muted text-center"><small>No active alerts</small></div>';
        } else {
            activeAlerts.innerHTML = smcpData.alerts.map(alert => `
                <div class="list-group-item bg-transparent border-secondary">
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-${alert.level === 'warning' ? 'warning' : 'info'}">${alert.message}</span>
                        <small class="text-muted">${alert.timestamp}</small>
                    </div>
                </div>
            `).join('');
        }
    }
}

// Action functions
function refreshAllSmcp() {
    console.log('Refreshing all SMCP data...');
    // Simulate API call
    setTimeout(() => {
        updateOverviewPanel();
        updatePluginsPanel();
        updateToolsPanel();
        updateSessionsPanel();
        updateHealthPanel();
        showNotification('All SMCP data refreshed successfully', 'success');
    }, 1000);
}

function refreshPlugins() {
    console.log('Refreshing plugins...');
    setTimeout(() => {
        updatePluginsPanel();
        showNotification('Plugins refreshed successfully', 'success');
    }, 500);
}

function refreshTools() {
    console.log('Refreshing tools...');
    setTimeout(() => {
        updateToolsPanel();
        showNotification('Tools refreshed successfully', 'success');
    }, 500);
}

function refreshSessions() {
    console.log('Refreshing sessions...');
    setTimeout(() => {
        updateSessionsPanel();
        showNotification('Sessions refreshed successfully', 'success');
    }, 500);
}

function refreshHealth() {
    console.log('Refreshing health data...');
    setTimeout(() => {
        updateHealthPanel();
        showNotification('Health data refreshed successfully', 'success');
    }, 500);
}

function addNewPlugin() {
    console.log('Adding new plugin...');
    showNotification('Plugin creation dialog would open here', 'info');
}

function exportSmcpConfig() {
    console.log('Exporting SMCP config...');
    const config = {
        plugins: smcpData.plugins,
        tools: smcpData.tools,
        timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smcp-config.json';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('SMCP configuration exported successfully', 'success');
}

function testConnection() {
    console.log('Testing connection...');
    showNotification('Connection test completed successfully', 'success');
}

function clearOldSessions() {
    console.log('Clearing old sessions...');
    smcpData.sessions = smcpData.sessions.filter(s => s.status === 'active');
    updateSessionsPanel();
    showNotification('Old sessions cleared successfully', 'success');
}

function clearCache() {
    console.log('Clearing cache...');
    showNotification('Cache cleared successfully', 'success');
}

function restartServer() {
    console.log('Restarting server...');
    showNotification('Server restart initiated', 'warning');
}

function backupConfig() {
    console.log('Backing up configuration...');
    showNotification('Configuration backup completed successfully', 'success');
}

function togglePlugin(pluginName) {
    const plugin = smcpData.plugins.find(p => p.name === pluginName);
    if (plugin) {
        plugin.status = plugin.status === 'active' ? 'inactive' : 'active';
        updatePluginsPanel();
        updateOverviewPanel();
        showNotification(`Plugin ${pluginName} ${plugin.status}`, 'success');
    }
}

function viewPluginConfig(pluginName) {
    console.log(`Viewing config for plugin: ${pluginName}`);
    showNotification(`Configuration for ${pluginName} would open here`, 'info');
}

function testTool(toolName) {
    console.log(`Testing tool: ${toolName}`);
    showNotification(`Tool ${toolName} test completed successfully`, 'success');
}

function viewToolDocs(toolName) {
    console.log(`Viewing docs for tool: ${toolName}`);
    showNotification(`Documentation for ${toolName} would open here`, 'info');
}

function terminateSession(sessionId) {
    smcpData.sessions = smcpData.sessions.filter(s => s.id !== sessionId);
    updateSessionsPanel();
    updateOverviewPanel();
    showNotification(`Session ${sessionId} terminated successfully`, 'success');
}

// Start periodic updates for SMCP data
function startSmcpUpdates() {
    // Update uptime every minute
    setInterval(() => {
        const uptimeElement = document.getElementById('uptime');
        if (uptimeElement) {
            const currentUptime = uptimeElement.textContent;
            // Simple uptime increment for demo
            if (currentUptime.includes('0d 0h 15m')) {
                uptimeElement.textContent = '0d 0h 16m';
            }
        }
    }, 60000);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}
