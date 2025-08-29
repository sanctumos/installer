// SMCP Health Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeHealthPage();
});

// Mock data for demonstration
const mockHealthData = {
    logs: [
        {
            level: 'info',
            message: 'Plugin botfather loaded successfully',
            timestamp: '2024-01-15 14:30:00'
        },
        {
            level: 'info',
            message: 'Tool file_read executed',
            timestamp: '2024-01-15 14:25:00'
        },
        {
            level: 'warning',
            message: 'Plugin file_manager failed to load',
            timestamp: '2024-01-15 14:20:00'
        },
        {
            level: 'info',
            message: 'Health check completed successfully',
            timestamp: '2024-01-15 14:15:00'
        },
        {
            level: 'error',
            message: 'Database connection timeout',
            timestamp: '2024-01-15 14:10:00'
        }
    ],
    alerts: [
        {
            level: 'warning',
            message: 'Plugin file_manager inactive',
            timestamp: '2024-01-15 14:20:00'
        },
        {
            level: 'error',
            message: 'Database connection issues detected',
            timestamp: '2024-01-15 14:10:00'
        }
    ],
    metrics: {
        cpu: 12,
        memory: 45,
        disk: 23,
        network: 'Active'
    }
};

// Initialize the page
function initializeHealthPage() {
    updateHealthMetrics();
    updateRecentLogs();
    updateActiveAlerts();
    setupEventListeners();
    startHealthUpdates();
}

// Setup event listeners
function setupEventListeners() {
    const logLevel = document.getElementById('logLevel');
    if (logLevel) {
        logLevel.addEventListener('change', function() {
            filterLogs(this.value);
        });
    }
}

// Update health metrics
function updateHealthMetrics() {
    // Update progress bars
    const cpuProgress = document.getElementById('cpuProgress');
    const memoryProgress = document.getElementById('memoryProgress');
    const diskProgress = document.getElementById('diskProgress');

    if (cpuProgress) {
        cpuProgress.style.width = `${mockHealthData.metrics.cpu}%`;
        cpuProgress.textContent = `${mockHealthData.metrics.cpu}%`;
    }

    if (memoryProgress) {
        memoryProgress.style.width = `${mockHealthData.metrics.memory}%`;
        memoryProgress.textContent = `${mockHealthData.metrics.memory}%`;
    }

    if (diskProgress) {
        diskProgress.style.width = `${mockHealthData.metrics.disk}%`;
        diskProgress.textContent = `${mockHealthData.metrics.disk}%`;
    }

    // Update metric displays
    const cpuUsage = document.getElementById('cpuUsage');
    const memoryUsage = document.getElementById('memoryUsage');

    if (cpuUsage) {
        cpuUsage.textContent = `${mockHealthData.metrics.cpu}%`;
        cpuUsage.className = mockHealthData.metrics.cpu > 80 ? 'h4 mb-1 text-danger' : 'h4 mb-1 text-primary';
    }

    if (memoryUsage) {
        memoryUsage.textContent = `${mockHealthData.metrics.memory}%`;
        memoryUsage.className = mockHealthData.metrics.memory > 80 ? 'h4 mb-1 text-danger' : 'h4 mb-1 text-warning';
    }
}

// Update recent logs
function updateRecentLogs() {
    const recentLogs = document.getElementById('recentLogs');
    if (!recentLogs) return;

    recentLogs.innerHTML = mockHealthData.logs.map(log => `
        <div class="list-group-item bg-transparent border-secondary">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <span class="badge bg-${getLogLevelColor(log.level)} me-2">${log.level.toUpperCase()}</span>
                    <span>${log.message}</span>
                </div>
                <small class="text-muted">${log.timestamp}</small>
            </div>
        </div>
    `).join('');
}

// Filter logs by level
function filterLogs(level) {
    const recentLogs = document.getElementById('recentLogs');
    if (!recentLogs) return;

    let filteredLogs = mockHealthData.logs;
    if (level !== 'all') {
        filteredLogs = mockHealthData.logs.filter(log => log.level === level);
    }

    recentLogs.innerHTML = filteredLogs.map(log => `
        <div class="list-group-item bg-transparent border-secondary">
            <div class="d-flex justify-content-between align-items-start">
                <div>
                    <span class="badge bg-${getLogLevelColor(log.level)} me-2">${log.level.toUpperCase()}</span>
                    <span>${log.message}</span>
                </div>
                <small class="text-muted">${log.timestamp}</small>
            </div>
        </div>
    `).join('');
}

// Get log level color
function getLogLevelColor(level) {
    const colors = {
        'debug': 'success',
        'info': 'info',
        'warning': 'warning',
        'error': 'danger'
    };
    return colors[level] || 'secondary';
}

// Update active alerts
function updateActiveAlerts() {
    const activeAlerts = document.getElementById('activeAlerts');
    if (!activeAlerts) return;

    if (mockHealthData.alerts.length === 0) {
        activeAlerts.innerHTML = '<div class="list-group-item bg-transparent border-secondary text-muted text-center"><small>No active alerts</small></div>';
    } else {
        activeAlerts.innerHTML = mockHealthData.alerts.map(alert => `
            <div class="list-group-item bg-transparent border-${getAlertBorderColor(alert.level)}">
                <div class="d-flex justify-content-between align-items-start">
                    <div>
                        <span class="badge bg-${getAlertBadgeColor(alert.level)} me-2">${alert.level.toUpperCase()}</span>
                        <span>${alert.message}</span>
                    </div>
                    <div class="d-flex gap-2">
                        <small class="text-muted">${alert.timestamp}</small>
                        <button class="btn btn-outline-success btn-sm" onclick="acknowledgeAlert('${alert.timestamp}')">✅</button>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

// Get alert border color
function getAlertBorderColor(level) {
    const colors = {
        'info': 'info',
        'warning': 'warning',
        'error': 'danger'
    };
    return colors[level] || 'secondary';
}

// Get alert badge color
function getAlertBadgeColor(level) {
    const colors = {
        'info': 'info',
        'warning': 'warning',
        'error': 'danger'
    };
    return colors[level] || 'secondary';
}

// Start periodic health updates
function startHealthUpdates() {
    setInterval(() => {
        // Simulate real-time updates
        mockHealthData.metrics.cpu = Math.floor(Math.random() * 20) + 10;
        mockHealthData.metrics.memory = Math.floor(Math.random() * 20) + 40;
        mockHealthData.metrics.disk = Math.floor(Math.random() * 10) + 20;
        
        updateHealthMetrics();
    }, 30000); // Update every 30 seconds
}

// Action functions
function refreshLogs() {
    updateRecentLogs();
    showNotification('Logs refreshed successfully', 'success');
}

function refreshAlerts() {
    updateActiveAlerts();
    showNotification('Alerts refreshed successfully', 'success');
}

function acknowledgeAlert(timestamp) {
    const alert = mockHealthData.alerts.find(a => a.timestamp === timestamp);
    if (alert) {
        mockHealthData.alerts = mockHealthData.alerts.filter(a => a.timestamp !== timestamp);
        updateActiveAlerts();
        showNotification('Alert acknowledged successfully', 'success');
    }
}

function acknowledgeAllAlerts() {
    if (confirm('Are you sure you want to acknowledge all alerts?')) {
        mockHealthData.alerts = [];
        updateActiveAlerts();
        showNotification('All alerts acknowledged successfully', 'success');
    }
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;';
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
