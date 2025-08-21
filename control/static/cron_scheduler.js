// CRON Scheduler JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const jobsTable = document.getElementById('jobsTable');
    const noJobsMessage = document.getElementById('noJobsMessage');
    const selectAllCheckbox = document.getElementById('selectAll');
    const jobCheckboxes = document.querySelectorAll('.job-checkbox');
    const bulkEnableBtn = document.getElementById('bulkEnable');
    const bulkDisableBtn = document.getElementById('bulkDisable');
    const refreshJobsBtn = document.getElementById('refreshJobs');
    const saveJobBtn = document.getElementById('saveJob');
    const confirmDeleteBtn = document.getElementById('confirmDelete');

    // Form elements
    const jobForm = document.getElementById('jobForm');
    const scheduleTypeSelect = document.getElementById('scheduleType');
    const cronExpressionInput = document.getElementById('cronExpression');

    // State
    let editingJobId = null;
    let jobsData = [];

    // Initialize
    initializeCronScheduler();

    function initializeCronScheduler() {
        // Load sample data
        loadSampleJobs();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update bulk action buttons
        updateBulkActionButtons();
    }

    function setupEventListeners() {
        // Select all checkbox
        selectAllCheckbox.addEventListener('change', function() {
            const isChecked = this.checked;
            jobCheckboxes.forEach(checkbox => {
                checkbox.checked = isChecked;
            });
            updateBulkActionButtons();
        });

        // Individual job checkboxes
        jobCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateBulkActionButtons);
        });

        // Bulk action buttons
        bulkEnableBtn.addEventListener('click', bulkEnableJobs);
        bulkDisableBtn.addEventListener('click', bulkDisableJobs);
        refreshJobsBtn.addEventListener('click', refreshJobs);

        // Schedule type change
        scheduleTypeSelect.addEventListener('change', function() {
            updateCronExpression(this.value);
        });

        // Save job
        saveJobBtn.addEventListener('click', saveJob);

        // Confirm delete
        confirmDeleteBtn.addEventListener('click', confirmDeleteJob);

        // Form validation
        cronExpressionInput.addEventListener('input', validateCronExpression);
    }

    function loadSampleJobs() {
        // Sample jobs data structure
        jobsData = [
            {
                id: 1,
                name: 'System Backup',
                description: 'Daily system backup',
                schedule: '0 2 * * *',
                command: '/usr/local/bin/backup.sh',
                status: 'active',
                lastRun: '2024-01-15 02:00:01',
                lastRunStatus: 'success',
                nextRun: '2024-01-16 02:00:00',
                workingDirectory: '/var/backups',
                user: 'root',
                timeout: 1800,
                retries: 3,
                enabled: true
            },
            {
                id: 2,
                name: 'Log Rotation',
                description: 'Weekly log cleanup',
                schedule: '0 3 * * 0',
                command: '/usr/sbin/logrotate /etc/logrotate.conf',
                status: 'active',
                lastRun: '2024-01-14 03:00:02',
                lastRunStatus: 'success',
                nextRun: '2024-01-21 03:00:00',
                workingDirectory: '/var/log',
                user: 'root',
                timeout: 300,
                retries: 0,
                enabled: true
            },
            {
                id: 3,
                name: 'SSL Renewal Check',
                description: 'Monthly SSL certificate check',
                schedule: '0 4 1 * *',
                command: '/usr/bin/certbot renew --quiet',
                status: 'paused',
                lastRun: '2024-01-01 04:00:15',
                lastRunStatus: 'success',
                nextRun: '2024-02-01 04:00:00',
                workingDirectory: '/etc/letsencrypt',
                user: 'root',
                timeout: 600,
                retries: 2,
                enabled: false
            },
            {
                id: 4,
                name: 'Database Backup',
                description: 'Hourly database backup',
                schedule: '0 * * * *',
                command: '/usr/local/bin/db-backup.sh',
                status: 'failed',
                lastRun: '2024-01-15 14:00:03',
                lastRunStatus: 'error',
                nextRun: '2024-01-15 15:00:00',
                workingDirectory: '/var/backups/db',
                user: 'postgres',
                timeout: 900,
                retries: 1,
                enabled: true
            }
        ];
    }

    function updateBulkActionButtons() {
        const checkedJobs = document.querySelectorAll('.job-checkbox:checked');
        const hasCheckedJobs = checkedJobs.length > 0;
        
        bulkEnableBtn.disabled = !hasCheckedJobs;
        bulkDisableBtn.disabled = !hasCheckedJobs;
    }

    function updateCronExpression(scheduleType) {
        const cronExpressions = {
            'daily': '0 2 * * *',
            'weekly': '0 3 * * 0',
            'monthly': '0 4 1 * *',
            'yearly': '0 5 1 1 *',
            'custom': ''
        };
        
        if (cronExpressions[scheduleType]) {
            cronExpressionInput.value = cronExpressions[scheduleType];
        } else {
            cronExpressionInput.value = '';
        }
    }

    function validateCronExpression() {
        const cronValue = cronExpressionInput.value.trim();
        const cronRegex = /^(\*|[0-5]?[0-9])(\/[0-9]+)?(\*|[0-5]?[0-9])(\/[0-9]+)?(\*|[1-3]?[0-9])(\/[0-9]+)?(\*|[1-2]?[0-9])(\/[0-9]+)?(\*|[0-6])(\/[0-9]+)?$/;
        
        if (cronValue && !cronRegex.test(cronValue)) {
            cronExpressionInput.classList.add('is-invalid');
            return false;
        } else {
            cronExpressionInput.classList.remove('is-invalid');
            return true;
        }
    }

    function saveJob() {
        // Validate form
        if (!validateCronExpression()) {
            showNotification('Please enter a valid cron expression', 'error');
            return;
        }

        // Collect form data
        const jobData = {
            name: document.getElementById('jobName').value,
            description: document.getElementById('jobDescription').value,
            schedule: document.getElementById('cronExpression').value,
            command: document.getElementById('command').value,
            workingDirectory: document.getElementById('workingDirectory').value,
            user: document.getElementById('user').value,
            timeout: parseInt(document.getElementById('timeout').value),
            retries: parseInt(document.getElementById('retries').value),
            enabled: document.getElementById('enabled').checked
        };

        if (editingJobId) {
            // Update existing job
            updateExistingJob(editingJobId, jobData);
        } else {
            // Create new job
            createNewJob(jobData);
        }

        // Close modal and reset form
        const modal = bootstrap.Modal.getInstance(document.getElementById('addJobModal'));
        modal.hide();
        resetForm();
    }

    function createNewJob(jobData) {
        const newJob = {
            id: Date.now(), // Simple ID generation
            ...jobData,
            status: jobData.enabled ? 'active' : 'paused',
            lastRun: 'Never',
            lastRunStatus: 'none',
            nextRun: calculateNextRun(jobData.schedule)
        };

        jobsData.push(newJob);
        addJobToTable(newJob);
        showNotification(`Job "${jobData.name}" created successfully`, 'success');
    }

    function updateExistingJob(jobId, jobData) {
        const jobIndex = jobsData.findIndex(job => job.id === jobId);
        if (jobIndex !== -1) {
            jobsData[jobIndex] = {
                ...jobsData[jobIndex],
                ...jobData,
                status: jobData.enabled ? 'active' : 'paused'
            };
            
            updateJobInTable(jobId, jobsData[jobIndex]);
            showNotification(`Job "${jobData.name}" updated successfully`, 'success');
        }
        
        editingJobId = null;
    }

    function addJobToTable(job) {
        const tbody = jobsTable.querySelector('tbody');
        const newRow = createJobRow(job);
        tbody.appendChild(newRow);
        
        // Update no jobs message
        updateNoJobsMessage();
    }

    function updateJobInTable(jobId, jobData) {
        const row = document.querySelector(`tr[data-job-id="${jobId}"]`);
        if (row) {
            // Update row content
            row.innerHTML = createJobRowContent(jobData);
        }
    }

    function createJobRow(job) {
        const row = document.createElement('tr');
        row.setAttribute('data-job-id', job.id);
        row.innerHTML = createJobRowContent(job);
        return row;
    }

    function createJobRowContent(job) {
        const statusBadge = getStatusBadge(job.status);
        const lastRunStatus = getLastRunStatus(job.lastRunStatus);
        
        return `
            <td>
                <input type="checkbox" class="form-check-input job-checkbox" value="${job.id}">
            </td>
            <td>
                <strong>${job.name}</strong>
                <br><small class="text-muted">${job.description || ''}</small>
            </td>
            <td>
                <code>${job.schedule}</code>
                <br><small class="text-muted">${getScheduleDescription(job.schedule)}</small>
            </td>
            <td>
                <code>${job.command}</code>
            </td>
            <td>
                ${statusBadge}
            </td>
            <td>
                <small>${job.lastRun}</small>
                <br>${lastRunStatus}
            </td>
            <td>
                <small>${job.nextRun}</small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" onclick="editJob(${job.id})">✏️</button>
                    <button class="btn btn-outline-${job.enabled ? 'warning' : 'success'}" onclick="toggleJob(${job.id})">${job.enabled ? '⏸️' : '▶️'}</button>
                    <button class="btn btn-outline-danger" onclick="deleteJob(${job.id})">🗑️</button>
                </div>
            </td>
        `;
    }

    function getStatusBadge(status) {
        const badges = {
            'active': '<span class="badge bg-success">Active</span>',
            'paused': '<span class="badge bg-warning">Paused</span>',
            'failed': '<span class="badge bg-danger">Failed</span>',
            'running': '<span class="badge bg-info">Running</span>'
        };
        return badges[status] || badges['paused'];
    }

    function getLastRunStatus(status) {
        const statuses = {
            'success': '<span class="text-success">✓ Success</span>',
            'error': '<span class="text-danger">✗ Error</span>',
            'none': '<span class="text-muted">-</span>'
        };
        return statuses[status] || statuses['none'];
    }

    function getScheduleDescription(cronExpression) {
        // Simple cron description parser
        const parts = cronExpression.split(' ');
        if (parts.length !== 5) return 'Invalid format';
        
        const [minute, hour, day, month, weekday] = parts;
        
        if (minute === '0' && hour === '2' && day === '*' && month === '*' && weekday === '*') {
            return 'Daily at 2:00 AM';
        } else if (minute === '0' && hour === '3' && day === '*' && month === '*' && weekday === '0') {
            return 'Weekly on Sunday at 3:00 AM';
        } else if (minute === '0' && hour === '4' && day === '1' && month === '*' && weekday === '*') {
            return 'Monthly on 1st at 4:00 AM';
        } else if (minute === '0' && hour === '*' && day === '*' && month === '*' && weekday === '*') {
            return 'Every hour';
        }
        
        return 'Custom schedule';
    }

    function calculateNextRun(cronExpression) {
        // Simple next run calculation (in real implementation, use a cron library)
        const now = new Date();
        const nextRun = new Date(now.getTime() + 24 * 60 * 60 * 1000); // +1 day for demo
        return nextRun.toISOString().slice(0, 19).replace('T', ' ');
    }

    function resetForm() {
        jobForm.reset();
        editingJobId = null;
        document.getElementById('addJobModalLabel').textContent = 'Add New Scheduled Job';
        document.getElementById('saveJob').textContent = 'Save Job';
        
        // Clear validation classes
        cronExpressionInput.classList.remove('is-invalid');
    }

    function updateNoJobsMessage() {
        const hasJobs = jobsData.length > 0;
        noJobsMessage.classList.toggle('d-none', hasJobs);
        jobsTable.classList.toggle('d-none', !hasJobs);
    }

    // Global functions for onclick handlers
    window.editJob = function(jobId) {
        const job = jobsData.find(j => j.id === jobId);
        if (job) {
            editingJobId = jobId;
            
            // Populate form
            document.getElementById('jobName').value = job.name;
            document.getElementById('jobDescription').value = job.description || '';
            document.getElementById('cronExpression').value = job.schedule;
            document.getElementById('command').value = job.command;
            document.getElementById('workingDirectory').value = job.workingDirectory || '';
            document.getElementById('user').value = job.user || '';
            document.getElementById('timeout').value = job.timeout || 300;
            document.getElementById('retries').value = job.retries || 0;
            document.getElementById('enabled').checked = job.enabled;
            
            // Update modal title
            document.getElementById('addJobModalLabel').textContent = 'Edit Scheduled Job';
            document.getElementById('saveJob').textContent = 'Update Job';
            
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById('addJobModal'));
            modal.show();
        }
    };

    window.toggleJob = function(jobId) {
        const job = jobsData.find(j => j.id === jobId);
        if (job) {
            job.enabled = !job.enabled;
            job.status = job.enabled ? 'active' : 'paused';
            
            updateJobInTable(jobId, job);
            showNotification(`Job "${job.name}" ${job.enabled ? 'enabled' : 'disabled'}`, 'success');
        }
    };

    window.deleteJob = function(jobId) {
        const job = jobsData.find(j => j.id === jobId);
        if (job) {
            document.getElementById('deleteJobName').textContent = job.name;
            
            // Store job ID for deletion
            confirmDeleteBtn.setAttribute('data-job-id', jobId);
            
            // Show delete confirmation modal
            const modal = new bootstrap.Modal(document.getElementById('deleteJobModal'));
            modal.show();
        }
    };

    function confirmDeleteJob() {
        const jobId = parseInt(confirmDeleteBtn.getAttribute('data-job-id'));
        const job = jobsData.find(j => j.id === jobId);
        
        if (job) {
            // Remove from data
            jobsData = jobsData.filter(j => j.id !== jobId);
            
            // Remove from table
            const row = document.querySelector(`tr[data-job-id="${jobId}"]`);
            if (row) {
                row.remove();
            }
            
            // Update no jobs message
            updateNoJobsMessage();
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteJobModal'));
            modal.hide();
            
            showNotification(`Job "${job.name}" deleted successfully`, 'success');
        }
    }

    function bulkEnableJobs() {
        const checkedJobs = document.querySelectorAll('.job-checkbox:checked');
        let enabledCount = 0;
        
        checkedJobs.forEach(checkbox => {
            const jobId = parseInt(checkbox.value);
            const job = jobsData.find(j => j.id === jobId);
            if (job && !job.enabled) {
                job.enabled = true;
                job.status = 'active';
                updateJobInTable(jobId, job);
                enabledCount++;
            }
        });
        
        if (enabledCount > 0) {
            showNotification(`${enabledCount} job(s) enabled successfully`, 'success');
        }
        
        // Reset checkboxes
        selectAllCheckbox.checked = false;
        jobCheckboxes.forEach(checkbox => checkbox.checked = false);
        updateBulkActionButtons();
    }

    function bulkDisableJobs() {
        const checkedJobs = document.querySelectorAll('.job-checkbox:checked');
        let disabledCount = 0;
        
        checkedJobs.forEach(checkbox => {
            const jobId = parseInt(checkbox.value);
            const job = jobsData.find(j => j.id === jobId);
            if (job && job.enabled) {
                job.enabled = false;
                job.status = 'paused';
                updateJobInTable(jobId, job);
                disabledCount++;
            }
        });
        
        if (disabledCount > 0) {
            showNotification(`${disabledCount} job(s) disabled successfully`, 'success');
        }
        
        // Reset checkboxes
        selectAllCheckbox.checked = false;
        jobCheckboxes.forEach(checkbox => checkbox.checked = false);
        updateBulkActionButtons();
    }

    function refreshJobs() {
        // Simulate refresh
        showNotification('Jobs refreshed successfully', 'info');
        
        // In real implementation, this would fetch latest data from server
        // For demo, just update timestamps
        jobsData.forEach(job => {
            if (job.enabled) {
                job.nextRun = calculateNextRun(job.schedule);
                updateJobInTable(job.id, job);
            }
        });
    }

    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;

        // Add to page
        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }
});
