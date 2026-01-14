import { supabase } from './supabase-config.js';
import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        window.location.href = 'index.html'; // Redirect to landing if not logged in
        return;
    }

    // 2. Fetch User Data
    const user = await getCurrentUser();
    if (user) {
        renderProfileData(user);
    }

    // 3. Event Listeners
    setupEventListeners();
});

async function renderProfileData(user) {
    // Top Nav
    const topNavName = document.getElementById('topNavName');
    const topNavAvatar = document.getElementById('topNavAvatar');
    const displayName = user.username || user.full_name || 'User';

    if (topNavName) topNavName.textContent = displayName;
    if (topNavAvatar) {
        topNavAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=368CBF&color=fff`;
    }

    // Profile Section
    const profileAvatar = document.getElementById('profileAvatar');
    const profileFullName = document.getElementById('profileFullName');
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');

    if (profileAvatar) {
        profileAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=368CBF&color=fff`;
    }

    if (profileFullName) {
        // Prioritize Username as per user request
        profileFullName.textContent = user.username || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'User';
    }

    // Update Public ID Display
    const publicIdDisplay = document.getElementById('publicUserIdDisplay');
    if (publicIdDisplay) {
        publicIdDisplay.textContent = user.publicUserId ? `ID: #${user.publicUserId}` : 'ID: Pending';
    }

    // Form Fields
    if (firstNameInput) firstNameInput.value = user.first_name || '';
    if (lastNameInput) lastNameInput.value = user.last_name || '';
    if (usernameInput) usernameInput.value = user.username || '';
    if (phoneInput) phoneInput.value = user.phone || 'Not provided';

    // Email from Auth Object
    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (emailInput && authUser) {
        emailInput.value = authUser.email;
    }
}

function setupEventListeners() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                const { success } = await logoutUser();
                if (success) {
                    window.location.href = 'index.html';
                }
            }
        });
    }
}
