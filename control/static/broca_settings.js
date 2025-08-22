// Broca Settings JavaScript - Comprehensive Broca-2 Integration
document.addEventListener('DOMContentLoaded', function() {
    initializeBrocaSettings();
});

// Global state
let currentSettings = {};
let plugins = [];
let queueItems = [];
let users = [];

// Initialize the page
function initializeBrocaSettings() {
    loadCoreSettings();
    loadPlugins();
    loadQueue();
    loadUsers();
    setupEventListeners();
    startStatusUpdates();
}

// Event Listeners
function setupEventListeners() {
    // Core settings form
    const coreForm = document.getElementById('coreSettingsForm');
    if (coreForm) {
        coreForm.addEventListener('submit', handleCoreSettingsSubmit);
    }

    // Tab switching
    const tabs = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabs.forEach(tab => {
        tab.addEventListener('shown.bs.tab', handleTabSwitch);
    });
}

// Tab switching handler
function handleTabSwitch(event) {
    const targetId = event.target.getAttribute('data-bs-target');
    
    // Refresh data based on active tab
    switch(targetId) {
        case '#plugins':
            loadPlugins();
            break;
        case '#queue':
            loadQueue();
            break;
        case '#users':
            loadUsers();
            break;
    }
}

// ============================================================================
// CORE SETTINGS MANAGEMENT
// ============================================================================

async function loadCoreSettings() {
    try {
        // In a real implementation, this would call the Broca-2 CLI tools
        // For now, using mock data based on the actual Broca-2 structure
        currentSettings = {
            message_mode: 'live',
            queue_refresh: 5,
            max_retries: 3,
            debug_mode: false
        };
        
        populateCoreSettingsForm();
        updateSystemStatus();
        
    } catch (error) {
        showNotification('Failed to load core settings', 'error');
        console.error('Error loading core settings:', error);
    }
}

function populateCoreSettingsForm() {
    document.getElementById('messageMode').value = currentSettings.message_mode;
    document.getElementById('queueRefresh').value = currentSettings.queue_refresh;
    document.getElementById('maxRetries').value = currentSettings.max_retries;
    document.getElementById('debugMode').checked = currentSettings.debug_mode;
}

async function handleCoreSettingsSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const newSettings = {
        message_mode: formData.get('message_mode'),
        queue_refresh: parseInt(formData.get('queue_refresh')),
        max_retries: parseInt(formData.get('max_retries')),
        debug_mode: formData.get('debug_mode') === 'on'
    };
    
    try {
        // In a real implementation, this would call the Broca-2 CLI tools
        // python -m cli.settings mode <mode>
        // python -m cli.settings refresh <seconds>
        // python -m cli.settings retries <count>
        // python -m cli.settings debug --enable/--disable
        
        currentSettings = { ...currentSettings, ...newSettings };
        
        // Update system status
        updateSystemStatus();
        
        showNotification('Core settings updated successfully', 'success');
        
        // Simulate CLI command execution
        console.log('Executing CLI commands:');
        console.log(`python -m cli.settings mode ${newSettings.message_mode}`);
        console.log(`python -m cli.settings refresh ${newSettings.queue_refresh}`);
        console.log(`python -m cli.settings retries ${newSettings.max_retries}`);
        console.log(`python -m cli.settings debug ${newSettings.debug_mode ? '--enable' : '--disable'}`);
        
    } catch (error) {
        showNotification('Failed to update core settings', 'error');
        console.error('Error updating core settings:', error);
    }
}

function resetCoreSettings() {
    const defaultSettings = {
        message_mode: 'live',
        queue_refresh: 5,
        max_retries: 3,
        debug_mode: false
    };
    
    currentSettings = defaultSettings;
    populateCoreSettingsForm();
    updateSystemStatus();
    
    showNotification('Settings reset to defaults', 'info');
}

function exportCoreSettings() {
    const dataStr = JSON.stringify(currentSettings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'broca-core-settings.json';
    link.click();
    
    showNotification('Core settings exported', 'success');
}

function updateSystemStatus() {
    document.getElementById('currentMessageMode').textContent = currentSettings.message_mode.charAt(0).toUpperCase() + currentSettings.message_mode.slice(1);
    document.getElementById('queueStatus').innerHTML = `● Running <small class="text-muted">Refresh: ${currentSettings.queue_refresh}s</small>`;
}

// ============================================================================
// PLUGIN MANAGEMENT
// ============================================================================

async function loadPlugins() {
    try {
        // Mock data based on actual Broca-2 plugin structure
        plugins = [
            {
                name: 'telegram',
                platform: 'telegram',
                status: 'active',
                version: '1.0.0',
                config: { enabled: true, parse_mode: 'MarkdownV2' }
            },
            {
                name: 'cli_test',
                platform: 'cli',
                status: 'active',
                version: '1.0.0',
                config: { enabled: true, debug: false }
            },
            {
                name: 'fake_plugin',
                platform: 'test',
                status: 'active',
                version: '1.0.0',
                config: { enabled: true, message: 'Hello from fake plugin!' }
            }
        ];
        
        populatePluginsTable();
        updatePluginCount();
        
    } catch (error) {
        showNotification('Failed to load plugins', 'error');
        console.error('Error loading plugins:', error);
    }
}

function populatePluginsTable() {
    const tbody = document.getElementById('pluginsTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    plugins.forEach(plugin => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${plugin.name}</strong></td>
            <td><span class="badge bg-secondary">${plugin.platform}</span></td>
            <td>
                <span class="status-indicator status-online"></span>
                <span class="badge bg-success">${plugin.status}</span>
            </td>
            <td>${plugin.version}</td>
            <td>
                <button class="btn btn-sm btn-outline-info" onclick="viewPluginConfig('${plugin.name}')">
                    ⚙️ Config
                </button>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-success" onclick="startPlugin('${plugin.name}')" ${plugin.status === 'active' ? 'disabled' : ''}>
                        ▶️ Start
                    </button>
                    <button class="btn btn-outline-warning" onclick="stopPlugin('${plugin.name}')" ${plugin.status !== 'active' ? 'disabled' : ''}>
                        ⏸️ Stop
                    </button>
                    <button class="btn btn-outline-danger" onclick="removePlugin('${plugin.name}')">
                        🗑️ Remove
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updatePluginCount() {
    const activeCount = plugins.filter(p => p.status === 'active').length;
    document.getElementById('pluginCount').textContent = `${activeCount} Active`;
}

function refreshPlugins() {
    loadPlugins();
    showNotification('Plugins refreshed', 'success');
}

function addNewPlugin() {
    const modal = new bootstrap.Modal(document.getElementById('addPluginModal'));
    modal.show();
}

function submitAddPlugin() {
    const name = document.getElementById('pluginName').value;
    const platform = document.getElementById('pluginPlatform').value;
    const path = document.getElementById('pluginPath').value;
    
    if (!name || !platform) {
        showNotification('Please fill in all required fields', 'warning');
        return;
    }
    
    // In a real implementation, this would create the plugin structure
    const newPlugin = {
        name: name,
        platform: platform,
        status: 'inactive',
        version: '1.0.0',
        config: { enabled: false }
    };
    
    plugins.push(newPlugin);
    populatePluginsTable();
    updatePluginCount();
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('addPluginModal'));
    modal.hide();
    
    // Clear form
    document.getElementById('addPluginForm').reset();
    
    showNotification(`Plugin ${name} added successfully`, 'success');
}

function startPlugin(pluginName) {
    const plugin = plugins.find(p => p.name === pluginName);
    if (plugin) {
        plugin.status = 'active';
        populatePluginsTable();
        updatePluginCount();
        showNotification(`Plugin ${pluginName} started`, 'success');
    }
}

function stopPlugin(pluginName) {
    const plugin = plugins.find(p => p.name === pluginName);
    if (plugin) {
        plugin.status = 'inactive';
        populatePluginsTable();
        updatePluginCount();
        showNotification(`Plugin ${pluginName} stopped`, 'warning');
    }
}

function removePlugin(pluginName) {
    if (confirm(`Are you sure you want to remove plugin ${pluginName}?`)) {
        plugins = plugins.filter(p => p.name !== pluginName);
        populatePluginsTable();
        updatePluginCount();
        showNotification(`Plugin ${pluginName} removed`, 'success');
    }
}

function viewPluginConfig(pluginName) {
    const plugin = plugins.find(p => p.name === pluginName);
    if (plugin) {
        const configStr = JSON.stringify(plugin.config, null, 2);
        alert(`Plugin Configuration for ${pluginName}:\n\n${configStr}`);
    }
}



// ============================================================================
// QUEUE MANAGEMENT
// ============================================================================

async function loadQueue() {
    try {
        // Mock data based on actual Broca-2 queue structure
        queueItems = [
            {
                id: 1,
                user: 'john_doe',
                display_name: 'John Doe',
                message: 'Hello, how are you?',
                status: 'pending',
                attempts: 0,
                timestamp: '2024-01-15 14:30:00'
            },
            {
                id: 2,
                user: 'jane_smith',
                display_name: 'Jane Smith',
                message: 'Can you help me with a task?',
                status: 'processing',
                attempts: 1,
                timestamp: '2024-01-15 14:25:00'
            },
            {
                id: 3,
                user: 'bob_wilson',
                display_name: 'Bob Wilson',
                message: 'What time is the meeting?',
                status: 'completed',
                attempts: 0,
                timestamp: '2024-01-15 14:20:00'
            }
        ];
        
        populateQueueTable();
        
    } catch (error) {
        showNotification('Failed to load queue', 'error');
        console.error('Error loading queue:', error);
    }
}

function populateQueueTable() {
    const tbody = document.getElementById('queueTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    queueItems.forEach(item => {
        const statusBadge = getStatusBadge(item.status);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${item.id}</strong></td>
            <td>
                <div><strong>${item.display_name}</strong></div>
                <small class="text-muted">@${item.user}</small>
            </td>
            <td class="text-truncate">${item.message}</td>
            <td>${statusBadge}</td>
            <td><span class="badge bg-secondary">${item.attempts}</span></td>
            <td><small class="text-muted">${item.timestamp}</small></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" onclick="viewQueueItem(${item.id})">
                        👁️ View
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteQueueItem(${item.id})">
                        🗑️ Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getStatusBadge(status) {
    switch (status) {
        case 'pending':
            return '<span class="badge bg-warning">Pending</span>';
        case 'processing':
            return '<span class="badge bg-info">Processing</span>';
        case 'completed':
            return '<span class="badge bg-success">Completed</span>';
        case 'failed':
            return '<span class="badge bg-danger">Failed</span>';
        default:
            return '<span class="badge bg-secondary">Unknown</span>';
    }
}

function refreshQueue() {
    loadQueue();
    showNotification('Queue refreshed', 'success');
}

function flushQueue() {
    if (confirm('Are you sure you want to flush all queue items? This action cannot be undone.')) {
        queueItems = [];
        populateQueueTable();
        showNotification('Queue flushed successfully', 'success');
        
        // Simulate CLI command execution
        console.log('Flushing queue:');
        console.log('python -m cli.qtool flush --all');
    }
}

function viewQueueItem(id) {
    const item = queueItems.find(i => i.id === id);
    if (item) {
        const details = `
Queue Item #${item.id}

User: ${item.display_name} (@${item.user})
Message: ${item.message}
Status: ${item.status}
Attempts: ${item.attempts}
Timestamp: ${item.timestamp}
        `;
        alert(details);
    }
}

function deleteQueueItem(id) {
    if (confirm(`Are you sure you want to delete queue item #${id}?`)) {
        queueItems = queueItems.filter(i => i.id !== id);
        populateQueueTable();
        showNotification(`Queue item #${id} deleted`, 'success');
        
        // Simulate CLI command execution
        console.log(`Deleting queue item: ${id}`);
        console.log(`python -m cli.qtool delete --id ${id}`);
    }
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

async function loadUsers() {
    try {
        // In a real implementation, this pulls users live from the Broca database
        // Mock data for demonstration
        users = [
            {
                id: 1,
                username: 'john_doe',
                display_name: 'John Doe',
                status: 'active',
                last_interaction: '2024-01-15 14:30:00'
            },
            {
                id: 2,
                username: 'jane_smith',
                display_name: 'Jane Smith',
                status: 'active',
                last_interaction: '2024-01-15 14:25:00'
            },
            {
                id: 3,
                username: 'bob_wilson',
                display_name: 'Bob Wilson',
                status: 'inactive',
                last_interaction: '2024-01-14 16:20:00'
            }
        ];
        
        populateUsersTable();
        
    } catch (error) {
        showNotification('Failed to load users', 'error');
        console.error('Error loading users:', error);
    }
}

function populateUsersTable() {
    const tbody = document.getElementById('usersTableBody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    users.forEach(user => {
        const statusBadge = user.status === 'active' 
            ? '<span class="badge bg-success">Active</span>'
            : '<span class="badge bg-secondary">Inactive</span>';
            
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>#${user.id}</strong></td>
            <td><code>@${user.username}</code></td>
            <td><strong>${user.display_name}</strong></td>
            <td>${statusBadge}</td>
            <td><small class="text-muted">${user.last_interaction}</small></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info" onclick="viewUserDetails(${user.id})">
                        👁️ View
                    </button>
                    <button class="btn btn-outline-warning" onclick="toggleUserStatus(${user.id})">
                        ${user.status === 'active' ? '⏸️ Deactivate' : '▶️ Activate'}
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function refreshUsers() {
    loadUsers();
    showNotification('Users refreshed', 'success');
}



function viewUserDetails(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        const details = `
User Details #${user.id}

Username: @${user.username}
Display Name: ${user.display_name}
Status: ${user.status}
Last Interaction: ${user.last_interaction}
        `;
        alert(details);
    }
}

function toggleUserStatus(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        user.status = user.status === 'active' ? 'inactive' : 'active';
        populateUsersTable();
        
        const action = user.status === 'active' ? 'activated' : 'deactivated';
        showNotification(`User ${user.display_name} ${action}`, 'success');
        
        // Simulate CLI command execution
        console.log(`Updating user status: ${id}`);
        console.log(`python -m cli.utool update ${id} ${user.status}`);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="d-flex justify-content-between align-items-start">
            <div>${message}</div>
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function startStatusUpdates() {
    // Update system status every 30 seconds
    setInterval(() => {
        updateSystemStatus();
        updatePluginCount();
    }, 30000);
}

// Export functions for global access
window.refreshPlugins = refreshPlugins;
window.addNewPlugin = addNewPlugin;
window.submitAddPlugin = submitAddPlugin;
window.startPlugin = startPlugin;
window.stopPlugin = stopPlugin;
window.removePlugin = removePlugin;
window.viewPluginConfig = viewPluginConfig;



window.refreshQueue = refreshQueue;
window.flushQueue = flushQueue;
window.viewQueueItem = viewQueueItem;
window.deleteQueueItem = deleteQueueItem;

window.refreshUsers = refreshUsers;
window.viewUserDetails = viewUserDetails;
window.toggleUserStatus = toggleUserStatus;

window.resetCoreSettings = resetCoreSettings;
window.exportCoreSettings = exportCoreSettings;
