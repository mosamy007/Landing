/**
 * LapStore Admin Panel
 * Handles tab switching and dashboard functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tab switching
    initTabs();
    
    // Initialize settings form if available
    initSettingsForm();
});

// Initialize tab switching functionality
function initTabs() {
    const tabs = {
        products: {
            button: document.getElementById('products-tab'),
            section: document.getElementById('products-section')
        },
        stats: {
            button: document.getElementById('stats-tab'),
            section: document.getElementById('stats-section')
        },
        settings: {
            button: document.getElementById('settings-tab'),
            section: document.getElementById('settings-section')
        }
    };
    
    // Add click event listeners to tab buttons
    for (const tabKey in tabs) {
        const tab = tabs[tabKey];
        
        if (tab.button && tab.section) {
            tab.button.addEventListener('click', function() {
                // Hide all sections
                for (const key in tabs) {
                    if (tabs[key].section) {
                        tabs[key].section.classList.remove('active');
                    }
                    if (tabs[key].button) {
                        tabs[key].button.classList.remove('active');
                    }
                }
                
                // Show selected section
                tab.section.classList.add('active');
                tab.button.classList.add('active');
            });
        }
    }
}

// Initialize the settings form
function initSettingsForm() {
    const settingsForm = document.getElementById('settings-form');
    if (!settingsForm) return;
    
    // Load current settings
    loadSettings();
    
    // Handle form submission
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
}

// Load current settings into form
function loadSettings() {
    const usernameInput = document.getElementById('admin-username');
    const whatsappInput = document.getElementById('whatsapp-number');
    
    // Username - use stored value or default
    if (usernameInput) {
        const username = localStorage.getItem('lapstore_admin_username') || 'admin';
        usernameInput.value = username;
    }
    
    // WhatsApp number - use stored value or empty
    if (whatsappInput) {
        const whatsapp = localStorage.getItem('lapstore_whatsapp_number') || '';
        whatsappInput.value = whatsapp;
    }
    
    // Password field is always empty for security
}

// Save settings from form
function saveSettings() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    const whatsapp = document.getElementById('whatsapp-number').value;
    
    // Validate inputs
    if (username.trim() === '') {
        alert('Username cannot be empty');
        return;
    }
    
    // Save username
    localStorage.setItem('lapstore_admin_username', username);
    document.getElementById('admin-name').textContent = username;
    
    // Save password if provided
    if (password.trim() !== '') {
        localStorage.setItem('lapstore_admin_password', password);
    }
    
    // Save WhatsApp number
    localStorage.setItem('lapstore_whatsapp_number', whatsapp);
    
    // Show success message
    alert('Settings saved successfully');
}

// Handle responsive design adjustments
function handleResponsive() {
    const isMobile = window.innerWidth < 768;
    
    // Add any responsive adjustments here if needed
    
    return isMobile;
}

// Window resize event for responsive adjustments
window.addEventListener('resize', function() {
    handleResponsive();
});

// Initial responsive check
handleResponsive();
