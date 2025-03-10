/**
 * LapStore Admin Authentication
 * Handles login and authentication for admin panel
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    checkAuthState();
    
    // Handle login form if available
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Handle logout button if available
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

// Default admin credentials (in a real app, this would not be client-side)
const DEFAULT_CREDENTIALS = {
    username: 'admin',
    password: 'lapstore2025'
};

// Check authentication state
function checkAuthState() {
    const authToken = localStorage.getItem('lapstore_auth_token');
    const isLoginPage = window.location.pathname.includes('index.html') || 
                        window.location.pathname.endsWith('/admin/');
    
    if (!authToken && !isLoginPage) {
        // Redirect to login if not authenticated and not already on login page
        window.location.href = 'index.html';
    } else if (authToken && isLoginPage) {
        // Redirect to dashboard if already authenticated
        window.location.href = 'dashboard.html';
    }
    
    // Set admin name if available
    if (authToken) {
        const adminName = document.getElementById('admin-name');
        if (adminName) {
            adminName.textContent = localStorage.getItem('lapstore_admin_username') || 'Admin';
        }
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('login-error');
    
    // Check against saved credentials or default if none saved
    const savedUsername = localStorage.getItem('lapstore_admin_username') || DEFAULT_CREDENTIALS.username;
    const savedPassword = localStorage.getItem('lapstore_admin_password') || DEFAULT_CREDENTIALS.password;
    
    if (username === savedUsername && password === savedPassword) {
        // Successful login
        // Generate a simple token (in a real app, this would be more secure)
        const token = btoa(username + ':' + Date.now());
        localStorage.setItem('lapstore_auth_token', token);
        localStorage.setItem('lapstore_admin_username', username);
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
    } else {
        // Failed login
        errorElement.textContent = 'Invalid username or password';
        errorElement.style.display = 'block';
    }
}

// Handle logout
function handleLogout() {
    localStorage.removeItem('lapstore_auth_token');
    window.location.href = 'index.html';
}
