import { supabase } from './supabase-config.js';
import { isLoggedIn, logoutUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // account.html is now handled by the unified syncProfileUI() in admin.js
    console.log('Account page specialized logic ready.');
    setupEventListeners();
});

function setupEventListeners() {
    const logoutBtn = document.getElementById('sidebarLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                await logoutUser();
                window.location.href = 'index.html';
            }
        });
    }
}
