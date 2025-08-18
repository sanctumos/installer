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
                
                // Refresh the page to load the new agent's context
                refreshForNewAgent(agentName);
            }
        });
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

    // Search functionality
    const searchInput = document.getElementById('searchTools');
    const toolsGrid = document.getElementById('toolsGrid');
    const clearSearchBtn = document.getElementById('clearSearch');
    const searchResults = document.getElementById('searchResults');
    
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

    // Tool card interactions
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        // Handle Open button clicks
        const openBtn = card.querySelector('.btn-primary');
        if (openBtn) {
            openBtn.addEventListener('click', function() {
                const toolTitle = card.querySelector('.tool-title').textContent;
                console.log(`Opening ${toolTitle}...`);
                // In a real app, this would navigate to the tool's interface
                alert(`Opening ${toolTitle}... (This is a mockup)`);
            });
        }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Number keys 1-6 to open tools
        if (e.key >= '1' && e.key <= '6') {
            const toolIndex = parseInt(e.key) - 1;
            const toolCards = document.querySelectorAll('.tool-card');
            
            if (toolCards[toolIndex]) {
                const openBtn = toolCards[toolIndex].querySelector('.btn-primary');
                if (openBtn) {
                    openBtn.click();
                }
            }
        }
        
        // Enter key to open first visible tool
        if (e.key === 'Enter') {
            const firstVisibleTool = document.querySelector('.tool-card[style*="display: block"], .tool-card:not([style*="display: none"])');
            if (firstVisibleTool) {
                const openBtn = firstVisibleTool.querySelector('.btn-primary');
                if (openBtn) {
                    openBtn.click();
                }
            }
        }
        
        // Escape key to clear search
        if (e.key === 'Escape') {
            if (searchInput) {
                searchInput.value = '';
                searchInput.dispatchEvent(new Event('input'));
                searchInput.focus();
            }
        }
    });

    // Focus search on page load
    if (searchInput) {
        searchInput.focus();
    }
});
