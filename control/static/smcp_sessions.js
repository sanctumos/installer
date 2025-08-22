// SMCP Sessions Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeSessionsPage();
});

// Mock data for demonstration
const mockSessionsData = {
    activeSessions: [
        {
            id: 'sess_001',
            user: 'rizzn',
            status: 'active',
            lastActivity: '2024-01-15 14:30:00',
            startTime: '2024-01-15 14:00:00',
            duration: '30m',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        {
            id: 'sess_002',
            user: 'admin',
            status: 'idle',
            lastActivity: '2024-01-15 14:25:00',
            startTime: '2024-01-15 13:30:00',
            duration: '55m',
            ipAddress: '192.168.1.101',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
        },
        {
            id: 'sess_003',
            user: 'developer',
            status: 'active',
            lastActivity: '2024-01-15 14:32:00',
            startTime: '2024-01-15 14:15:00',
            duration: '17m',
            ipAddress: '192.168.1.102',
            userAgent: 'Mozilla/5.0 (X11; Linux x86_64)'
        }
    ],
    sessionHistory: [
        {
            id: 'sess_004',
            user: 'tester',
            status: 'terminated',
            startTime: '2024-01-15 12:00:00',
            endTime: '2024-01-15 13:30:00',
            duration: '1h 30m',
            reason: 'User logout'
        },
        {
            id: 'sess_005',
            user: 'guest',
            status: 'error',
            startTime: '2024-01-15 11:45:00',
            endTime: '2024-01-15 11:47:00',
            duration: '2m',
            reason: 'Connection timeout'
        }
    ]
};

// Initialize the page
function initializeSessionsPage() {
    updateSessionOverview();
    updateSessionsTable();
    updateHistoryTable();
    setupEventListeners();
    startSessionUpdates();
}

// Setup event listeners
function setupEventListeners() {
    const historyFilter = document.getElementById('historyFilter');
    if (historyFilter) {
        historyFilter.addEventListener('change', function() {
            filterHistory(this.value);
        });
    }
}

// Update session overview cards
function updateSessionOverview() {
    const totalSessions = mockSessionsData.activeSessions.length;
    const activeSessions = mockSessionsData.activeSessions.filter(s => s.status === 'active').length;
    const idleSessions = mockSessionsData.activeSessions.filter(s => s.status === 'idle').length;
    const uniqueUsers = new Set(mockSessionsData.activeSessions.map(s => s.user)).size;

    document.getElementById('totalSessions').textContent = totalSessions;
    document.getElementById('activeSessions').textContent = activeSessions;
    document.getElementById('idleSessions').textContent = idleSessions;
    document.getElementById('totalUsers').textContent = uniqueUsers;
}

// Update sessions table
function updateSessionsTable() {
    const tbody = document.getElementById('sessionsTableBody');
    if (!tbody) return;

    tbody.innerHTML = mockSessionsData.activeSessions.map(session => `
        <tr>
            <td><code>${session.id}</code></td>
            <td><strong>${session.user}</strong></td>
            <td>
                <span class="badge ${session.status === 'active' ? 'bg-success' : 'bg-warning'}">
                    ${session.status}
                </span>
            </td>
            <td>${session.lastActivity}</td>
            <td>${session.duration}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-info btn-sm" onclick="viewSessionDetails('${session.id}')">
                        👁️
                    </button>
                    <button class="btn btn-outline-warning btn-sm" onclick="extendSession('${session.id}')">
                        ⏰
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="terminateSession('${session.id}')">
                        🚫
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Update history table
function updateHistoryTable() {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    tbody.innerHTML = mockSessionsData.sessionHistory.map(session => `
        <tr>
            <td><code>${session.id}</code></td>
            <td><strong>${session.user}</strong></td>
            <td>
                <span class="badge ${session.status === 'terminated' ? 'bg-secondary' : 'bg-danger'}">
                    ${session.status}
                </span>
            </td>
            <td>${session.startTime}</td>
            <td>${session.endTime}</td>
            <td>${session.duration}</td>
            <td>${session.reason}</td>
        </tr>
    `).join('');
}

// Filter history
function filterHistory(status) {
    const tbody = document.getElementById('historyTableBody');
    if (!tbody) return;

    let filteredHistory = mockSessionsData.sessionHistory;
    if (status !== 'all') {
        filteredHistory = mockSessionsData.sessionHistory.filter(s => s.status === status);
    }

    tbody.innerHTML = filteredHistory.map(session => `
        <tr>
            <td><code>${session.id}</code></td>
            <td><strong>${session.user}</strong></td>
            <td>
                <span class="badge ${session.status === 'terminated' ? 'bg-secondary' : 'bg-danger'}">
                    ${session.status}
                </span>
            </td>
            <td>${session.startTime}</td>
            <td>${session.endTime}</td>
            <td>${session.duration}</td>
            <td>${session.reason}</td>
        </tr>
    `).join('');
}

// Start periodic updates
function startSessionUpdates() {
    setInterval(() => {
        updateSessionOverview();
        updateSessionsTable();
    }, 30000); // Update every 30 seconds
}

// Action functions
function refreshSessions() {
    updateSessionsTable();
    updateSessionOverview();
    showNotification('Sessions refreshed successfully', 'success');
}

function clearIdleSessions() {
    if (confirm('Are you sure you want to clear all idle sessions?')) {
        mockSessionsData.activeSessions = mockSessionsData.activeSessions.filter(s => s.status === 'active');
        updateSessionsTable();
        updateSessionOverview();
        showNotification('Idle sessions cleared successfully', 'success');
    }
}

function viewSessionDetails(sessionId) {
    const session = mockSessionsData.activeSessions.find(s => s.id === sessionId);
    if (!session) return;

    const details = `
        <div class="mb-3">
            <h6 class="text-primary">Session Information</h6>
            <ul class="list-unstyled">
                <li><strong>Session ID:</strong> ${session.id}</li>
                <li><strong>User:</strong> ${session.user}</li>
                <li><strong>Status:</strong> <span class="badge ${session.status === 'active' ? 'bg-success' : 'bg-warning'}">${session.status}</span></li>
                <li><strong>Start Time:</strong> ${session.startTime}</li>
                <li><strong>Last Activity:</strong> ${session.lastActivity}</li>
                <li><strong>Duration:</strong> ${session.duration}</li>
                <li><strong>IP Address:</strong> ${session.ipAddress}</li>
            </ul>
        </div>
        <div class="mb-3">
            <h6 class="text-primary">User Agent</h6>
            <div class="bg-dark p-2 rounded">
                <code class="text-light">${session.userAgent}</code>
            </div>
        </div>
    `;

    // Create a simple modal for session details
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Session Details</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    ${details}
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();

    // Clean up modal after it's hidden
    modal.addEventListener('hidden.bs.modal', function() {
        document.body.removeChild(modal);
    });
}

function extendSession(sessionId) {
    const session = mockSessionsData.activeSessions.find(s => s.id === sessionId);
    if (session) {
        session.lastActivity = new Date().toLocaleString();
        updateSessionsTable();
        showNotification(`Session ${sessionId} extended successfully`, 'success');
    }
}

function terminateSession(sessionId) {
    if (confirm(`Are you sure you want to terminate session ${sessionId}?`)) {
        const session = mockSessionsData.activeSessions.find(s => s.id === sessionId);
        if (session) {
            // Move to history
            mockSessionsData.sessionHistory.unshift({
                ...session,
                status: 'terminated',
                endTime: new Date().toLocaleString(),
                reason: 'Admin terminated'
            });
            
            // Remove from active sessions
            mockSessionsData.activeSessions = mockSessionsData.activeSessions.filter(s => s.id !== sessionId);
            
            updateSessionsTable();
            updateHistoryTable();
            updateSessionOverview();
            showNotification(`Session ${sessionId} terminated successfully`, 'success');
        }
    }
}

function exportSessionHistory() {
    const data = {
        timestamp: new Date().toISOString(),
        sessions: mockSessionsData.sessionHistory
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'smcp-session-history.json';
    a.click();
    URL.revokeObjectURL(url);

    showNotification('Session history exported successfully', 'success');
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
