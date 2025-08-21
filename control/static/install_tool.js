// Install Module JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchModules');
    const clearSearchBtn = document.getElementById('clearSearch');
    const globalToolsTable = document.getElementById('globalToolsTable');
    const agentToolsTable = document.getElementById('agentToolsTable');
    const noModulesMessage = document.getElementById('noModulesMessage');
    const installButtons = document.querySelectorAll('.install-btn');
    const uninstallButtons = document.querySelectorAll('.uninstall-btn');
    const agentSelector = document.getElementById('agentSelector');

    // Mock data for different agents' installation states
    const agentInstallationStates = {
        'default': {
            'broca': 'core',
            'plugins': 'available'
        },
        'athena': {
            'broca': 'core',
            'plugins': 'available'
        },
        'monday': {
            'broca': 'core',
            'plugins': 'installed'
        },
        'timbre': {
            'broca': 'core',
            'plugins': 'available'
        }
    };

    // Search functionality
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const globalRows = globalToolsTable.querySelectorAll('tbody tr[data-module-name]');
        const agentRows = agentToolsTable.querySelectorAll('tbody tr[data-module-name]');
        let visibleCount = 0;

        // Search global tools
        globalRows.forEach(row => {
            const moduleName = row.getAttribute('data-module-name').toLowerCase();
            const moduleDesc = row.getAttribute('data-module-desc').toLowerCase();
            
            if (moduleName.includes(searchTerm) || moduleDesc.includes(searchTerm)) {
                row.style.display = 'table-row';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Search agent tools
        agentRows.forEach(row => {
            const moduleName = row.getAttribute('data-module-name').toLowerCase();
            const moduleDesc = row.getAttribute('data-module-desc').toLowerCase();
            
            if (moduleName.includes(searchTerm) || moduleDesc.includes(searchTerm)) {
                row.style.display = 'table-row';
                visibleCount++;
            } else {
                row.style.display = 'none';
            }
        });

        // Show/hide clear button
        if (searchTerm) {
            clearSearchBtn.classList.remove('d-none');
        } else {
            clearSearchBtn.classList.add('d-none');
        }

        // Show/hide no modules message
        if (visibleCount === 0) {
            noModulesMessage.classList.remove('d-none');
        } else {
            noModulesMessage.classList.add('d-none');
        }
    });

    // Clear search
    clearSearchBtn.addEventListener('click', function() {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
        this.classList.add('d-none');
    });

    // Agent selector functionality
    agentSelector.addEventListener('change', function() {
        updateAgentToolsDisplay(this.value);
    });

    // Install button functionality
    installButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moduleName = this.getAttribute('data-module');
            installModule(moduleName, this);
        });
    });

    // Uninstall button functionality
    uninstallButtons.forEach(button => {
        button.addEventListener('click', function() {
            const moduleName = this.getAttribute('data-module');
            uninstallModule(moduleName, this);
        });
    });

    // Function to update agent tools display based on selected agent
    function updateAgentToolsDisplay(selectedAgent) {
        const agentRows = agentToolsTable.querySelectorAll('tbody tr[data-module-name]');
        const agentStates = agentInstallationStates[selectedAgent] || agentInstallationStates['default'];

        agentRows.forEach(row => {
            const moduleName = row.getAttribute('data-module-name');
            const moduleKey = moduleName === 'dream agent' ? 'dream-agent' : moduleName;
            const status = agentStates[moduleKey];
            
            // Update status badge
            const statusBadge = row.querySelector('.badge');
            if (status === 'installed') {
                statusBadge.className = 'badge bg-success';
                statusBadge.textContent = 'Installed';
            } else if (status === 'core') {
                statusBadge.className = 'badge bg-primary';
                statusBadge.textContent = 'Core';
            } else if (status === undefined && moduleName === 'dream agent') {
                // Dream Agent is unavailable
                statusBadge.className = 'badge bg-warning';
                statusBadge.textContent = 'Unavailable';
            } else {
                statusBadge.className = 'badge bg-secondary';
                statusBadge.textContent = 'Available';
            }

            // Update action buttons
            const installBtn = row.querySelector('.install-btn');
            const uninstallBtn = row.querySelector('.uninstall-btn');
            
            if (status === 'installed') {
                if (installBtn) {
                    installBtn.textContent = 'Installed';
                    installBtn.className = 'btn btn-success btn-sm';
                    installBtn.disabled = true;
                }
                if (uninstallBtn) {
                    uninstallBtn.disabled = false;
                }
            } else if (status === 'core') {
                // Core modules have no action buttons - they're always present
                if (installBtn) {
                    installBtn.style.display = 'none';
                }
                if (uninstallBtn) {
                    uninstallBtn.style.display = 'none';
                }
            } else if (status === undefined && moduleName === 'dream agent') {
                // Unavailable modules have no action buttons
                if (installBtn) {
                    installBtn.style.display = 'none';
                }
                if (uninstallBtn) {
                    uninstallBtn.style.display = 'none';
                }
            } else {
                if (installBtn) {
                    installBtn.textContent = 'Install';
                    installBtn.className = 'btn btn-primary btn-sm install-btn';
                    installBtn.disabled = false;
                    installBtn.style.display = 'inline-block';
                }
                if (uninstallBtn) {
                    uninstallBtn.disabled = true;
                    uninstallBtn.style.display = 'inline-block';
                }
            }
        });

        // Show notification of agent change
        showNotification(`Switched to ${agentSelector.options[agentSelector.selectedIndex].text}`, 'info');
    }

    // Install module function
    function installModule(moduleName, button) {
        // Show loading state
        button.textContent = 'Installing...';
        button.className = 'btn btn-warning btn-sm install-btn';
        button.disabled = true;

        // Simulate installation process
        setTimeout(() => {
            // Success state
            button.textContent = 'Installed';
            button.className = 'btn btn-success btn-sm install-btn';
            button.disabled = true;

            // Update status indicator
            const statusBadge = button.closest('tr').querySelector('.badge');
            statusBadge.className = 'badge bg-success';
            statusBadge.textContent = 'Installed';

            // Enable uninstall button
            const uninstallBtn = button.closest('tr').querySelector('.uninstall-btn');
            if (uninstallBtn) {
                uninstallBtn.disabled = false;
            }

            // Update the agent installation states for agent-specific tools
            const selectedAgent = agentSelector.value;
            const moduleKey = moduleName === 'dream-agent' ? 'dream-agent' : moduleName;
            if (agentInstallationStates[selectedAgent]) {
                agentInstallationStates[selectedAgent][moduleKey] = 'installed';
            }

            // Show success message
            const moduleType = button.closest('tr').getAttribute('data-module-type');
            if (moduleType === 'global') {
                showNotification(`Successfully installed ${moduleName} module`, 'success');
            } else {
                showNotification(`Successfully installed ${moduleName} module on ${agentSelector.options[agentSelector.selectedIndex].text}`, 'success');
            }

        }, 2000); // Simulate 2 second installation
    }

    // Uninstall module function
    function uninstallModule(moduleName, button) {
        // Show loading state
        button.textContent = 'Uninstalling...';
        button.className = 'btn btn-warning btn-sm uninstall-btn';
        button.disabled = true;

        // Simulate uninstallation process
        setTimeout(() => {
            // Success state
            button.disabled = true;

            // Update status indicator
            const statusBadge = button.closest('tr').querySelector('.badge');
            statusBadge.className = 'badge bg-secondary';
            statusBadge.textContent = 'Available';

            // Reset install button
            const installBtn = button.closest('tr').querySelector('.install-btn');
            if (installBtn) {
                installBtn.textContent = 'Install';
                installBtn.className = 'btn btn-primary btn-sm install-btn';
                installBtn.disabled = false;
            }

            // Update the agent installation states for agent-specific tools
            const selectedAgent = agentSelector.value;
            const moduleKey = moduleName === 'dream-agent' ? 'dream-agent' : moduleName;
            if (agentInstallationStates[selectedAgent]) {
                agentInstallationStates[selectedAgent][moduleKey] = 'available';
            }

            // Show success message
            const moduleType = button.closest('tr').getAttribute('data-module-type');
            if (moduleType === 'global') {
                showNotification(`Successfully uninstalled ${moduleName} module`, 'success');
            } else {
                showNotification(`Successfully uninstalled ${moduleName} module from ${agentSelector.options[agentSelector.selectedIndex].text}`, 'success');
            }

        }, 2000); // Simulate 2 second uninstallation
    }

    // Notification function
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
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

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            searchInput.focus();
        }

        // Escape to clear search
        if (e.key === 'Escape' && searchInput.value) {
            searchInput.value = '';
            searchInput.dispatchEvent(new Event('input'));
            clearSearchBtn.classList.add('d-none');
        }
    });

    // Initialize the display with the default agent
    updateAgentToolsDisplay('default');
    
    // Initialize global tools display
    updateGlobalToolsDisplay();
    
    // Function to update global tools display
    function updateGlobalToolsDisplay() {
        const globalRows = globalToolsTable.querySelectorAll('tbody tr[data-module-name]');
        
        globalRows.forEach(row => {
            const moduleName = row.getAttribute('data-module-name');
            const statusBadge = row.querySelector('.badge');
            const installBtn = row.querySelector('.install-btn');
            const uninstallBtn = row.querySelector('.uninstall-btn');
            
            if (statusBadge.textContent === 'Installed') {
                if (installBtn) {
                    installBtn.textContent = 'Installed';
                    installBtn.className = 'btn btn-success btn-sm';
                    installBtn.disabled = true;
                }
                if (uninstallBtn) {
                    uninstallBtn.disabled = false;
                }
            } else if (statusBadge.textContent === 'Core') {
                // Core modules have no action buttons - they're always present
                if (installBtn) {
                    installBtn.style.display = 'none';
                }
                if (uninstallBtn) {
                    uninstallBtn.style.display = 'none';
                }
            } else {
                if (installBtn) {
                    installBtn.textContent = 'Install';
                    installBtn.className = 'btn btn-primary btn-sm install-btn';
                    installBtn.disabled = false;
                }
                if (uninstallBtn) {
                    uninstallBtn.disabled = true;
                }
            }
        });
    }
});
