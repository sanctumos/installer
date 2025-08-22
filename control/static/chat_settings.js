// Chat Settings JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const agentSelector = document.getElementById('agentSelector');
    const chatSettingsForm = document.getElementById('chatSettingsForm');
    const expandInstructions = document.getElementById('expandInstructions');
    const expandIcon = document.getElementById('expandIcon');
    const systemInstructions = document.getElementById('systemInstructions');
    
    // Mock data for different agents' chat settings
    const agentChatSettings = {
        'athena': {
            uid: 'agent-24ab7439-7f33-4665-8aa4-9ba709694e1a',
            name: 'Athena',
            model: 'gpt-4',
            systemInstructions: 'You are Athena, a strategic AI agent focused on analysis and planning. You excel at breaking down complex problems, identifying patterns, and providing structured solutions. Always think step-by-step and consider multiple perspectives before making recommendations.',
            maxTokens: 4000,
            contextWindow: 16000,
            temperature: 0.7,
            reasoning: true
        },
        'monday': {
            uid: 'agent-8f7c2e1d-9a4b-4c5d-8e6f-1a2b3c4d5e6f',
            name: 'Monday',
            model: 'claude-3-sonnet',
            systemInstructions: 'You are Monday, a creative AI agent specializing in content generation and artistic expression. You have a playful personality and excel at brainstorming, writing, and creative problem-solving. Always bring enthusiasm and originality to your responses.',
            maxTokens: 6000,
            contextWindow: 200000,
            temperature: 0.9,
            reasoning: false
        },
        'timbre': {
            uid: 'agent-3b2a1c9d-8e7f-6a5b-4c3d-2e1f9a8b7c6',
            name: 'Timbre',
            model: 'gemini-pro',
            systemInstructions: 'You are Timbre, a technical AI agent focused on coding, debugging, and system architecture. You have deep knowledge of programming languages, frameworks, and best practices. Always provide clear, well-documented code examples and explain technical concepts thoroughly.',
            maxTokens: 8000,
            contextWindow: 32000,
            temperature: 0.3,
            reasoning: true
        }
    };

    // Default settings template
    const defaultSettings = {
        uid: 'agent-00000000-0000-0000-0000-000000000000',
        name: 'New Agent',
        model: 'gpt-4',
        systemInstructions: 'You are a helpful AI assistant. Please provide clear, accurate, and helpful responses to user queries.',
        maxTokens: 4000,
        contextWindow: 16000,
        temperature: 0.7,
        reasoning: false
    };

    // Initialize the page
    function initializePage() {
        loadAgentSettings(agentSelector.value);
        updatePreview();
        setupEventListeners();
    }

    // Load settings for a specific agent
    function loadAgentSettings(agentKey) {
        const settings = agentChatSettings[agentKey] || defaultSettings;
        
        // Update form fields
        document.getElementById('agentUID').value = settings.uid;
        document.getElementById('agentName').value = settings.name;
        document.getElementById('modelSelect').value = settings.model;
        document.getElementById('systemInstructions').value = settings.systemInstructions;
        document.getElementById('maxTokens').value = settings.maxTokens;
        document.getElementById('contextWindow').value = settings.contextWindow;
        document.getElementById('temperature').value = settings.temperature;
        document.getElementById('reasoningToggle').checked = settings.reasoning;
        
        updatePreview();
    }

    // Update the preview panel
    function updatePreview() {
        const selectedAgent = agentSelector.options[agentSelector.selectedIndex].text;
        const model = document.getElementById('modelSelect').value;
        const tokens = document.getElementById('maxTokens').value;
        const context = document.getElementById('contextWindow').value;
        const temp = document.getElementById('temperature').value;
        const reasoning = document.getElementById('reasoningToggle').checked;
        
        document.getElementById('previewAgent').textContent = selectedAgent;
        document.getElementById('previewModel').textContent = model;
        document.getElementById('previewTokens').textContent = tokens;
        document.getElementById('previewContext').textContent = context;
        document.getElementById('previewTemp').textContent = temp;
        document.getElementById('previewReasoning').textContent = reasoning ? 'Enabled' : 'Disabled';
    }

    // Setup event listeners
    function setupEventListeners() {
        // Agent selector change
        agentSelector.addEventListener('change', function() {
            loadAgentSettings(this.value);
        });

        // Form submission
        chatSettingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveSettings();
        });

        // Expand/collapse system instructions
        expandInstructions.addEventListener('click', function() {
            toggleInstructionsExpansion();
        });

        // Reset to defaults
        document.getElementById('resetDefaults').addEventListener('click', function() {
            resetToDefaults();
        });

        // Export config
        document.getElementById('exportConfig').addEventListener('click', function() {
            exportConfiguration();
        });

        // Real-time preview updates
        const formInputs = chatSettingsForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('input', updatePreview);
            input.addEventListener('change', updatePreview);
        });
    }

    // Toggle system instructions expansion
    function toggleInstructionsExpansion() {
        const isExpanded = systemInstructions.style.height === '400px';
        
        if (isExpanded) {
            systemInstructions.style.height = '200px';
            expandIcon.textContent = '⤢';
            expandIcon.title = 'Expand';
        } else {
            systemInstructions.style.height = '400px';
            expandIcon.textContent = '⤡';
            expandIcon.title = 'Collapse';
        }
    }

    // Save current settings
    function saveSettings() {
        const selectedAgent = agentSelector.value;
        const currentSettings = {
            uid: document.getElementById('agentUID').value,
            name: document.getElementById('agentName').value,
            model: document.getElementById('modelSelect').value,
            systemInstructions: document.getElementById('systemInstructions').value,
            maxTokens: parseInt(document.getElementById('maxTokens').value),
            contextWindow: parseInt(document.getElementById('contextWindow').value),
            temperature: parseFloat(document.getElementById('temperature').value),
            reasoning: document.getElementById('reasoningToggle').checked
        };

        // Update the stored settings
        agentChatSettings[selectedAgent] = currentSettings;

        // Show success notification
        showNotification(`Settings saved for ${agentSelector.options[agentSelector.selectedIndex].text}`, 'success');
        
        // Simulate API call delay
        setTimeout(() => {
            console.log('Settings saved:', currentSettings);
        }, 1000);
    }

    // Reset to default settings
    function resetToDefaults() {
        if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
            loadAgentSettings('default');
            showNotification('Settings reset to defaults', 'info');
        }
    }

    // Export configuration
    function exportConfiguration() {
        const selectedAgent = agentSelector.value;
        const settings = agentChatSettings[selectedAgent] || defaultSettings;
        
        const configData = {
            agent: selectedAgent,
            timestamp: new Date().toISOString(),
            settings: settings
        };

        const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedAgent}-chat-settings.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Configuration exported successfully', 'success');
    }

    // Show notification
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type === 'success' ? 'success' : 'info'} alert-dismissible fade show position-fixed`;
        notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; min-width: 300px; max-width: 400px;';
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

    // Initialize the page
    initializePage();
});
