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
