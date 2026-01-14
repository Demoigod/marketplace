import { supabase } from './supabase-config.js';
import { getCurrentUser, logoutUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    updateDate();
    await initDashboard();
    setupSidebar();
});

function updateDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        dateEl.textContent = `Today is ${now.toLocaleDateString('en-US', options)}`;
    }
}

async function initDashboard() {
    const user = await getCurrentUser();
    if (!user) return;

    // 1. Set User Profile Info
    const nameEl = document.getElementById('userName');
    const welcomeEl = document.getElementById('welcomeTitle');
    const idEl = document.getElementById('userId');
    const avatarImg = document.getElementById('userAvatar');

    if (nameEl) nameEl.textContent = user.first_name || user.username || 'User';
    if (welcomeEl) welcomeEl.textContent = `Welcome, ${user.first_name || user.username || 'User'} 👋`;
    if (idEl) idEl.textContent = `ID: ${user.id.slice(0, 6).toUpperCase()}`;
    if (avatarImg) {
        avatarImg.src = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=368CBF&color=fff`;
    }

    // 2. Load Metrics (Only if elements exist)
    if (document.getElementById('countListings')) {
        loadCounts(user.id);
    }

    // 3. Load Activity Feeds
    if (document.getElementById('activityFeed1') || document.getElementById('notificationFeed')) {
        loadActivityFeeds();
    }

    // 4. Load Online Users
    if (document.getElementById('onlineGrid')) {
        loadOnlineUsers();
    }
}

async function loadCounts(userId) {
    try {
        // Real listing count
        const { count: listingCount } = await supabase
            .from('market_listings')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', userId);

        document.getElementById('countListings').textContent = listingCount || 0;

        // Sample data for others (to be integrated with real tables later)
        document.getElementById('countMessages').textContent = '12';
        document.getElementById('unreadBadge').textContent = '6';
        document.getElementById('countResources').textContent = '6';
        document.getElementById('countSales').textContent = '3';
    } catch (e) {
        console.error('Error loading metrics:', e);
    }
}

function loadActivityFeeds() {
    const feed1 = document.getElementById('activityFeed1');
    const feed2 = document.getElementById('activityFeed2');
    const notifFeed = document.getElementById('notificationFeed');

    const activityData = [
        { name: 'John Doe', action: 'Bought item from seller', time: '30 mins ago' },
        { name: 'Jane Smith', action: 'Listed a new textbook', time: '1 hour ago' },
        { name: 'Alex Brown', action: 'Commented on your post', time: '2 hours ago' }
    ];

    const notifData = [
        { name: 'John Doe', desc: 'sent you a message', time: '10 mins ago' },
        { name: 'System', desc: 'Your document was approved', time: '1 hour ago' },
        { name: 'Market', desc: 'New comment on your listing', time: '2 hours ago' }
    ];

    if (feed1) feed1.innerHTML = activityData.map(item => renderActivityItem(item)).join('');
    if (feed2) feed2.innerHTML = activityData.map(item => renderActivityItem(item)).join('');
    if (notifFeed) notifFeed.innerHTML = notifData.map(item => renderNotifItem(item)).join('');
}

function renderActivityItem(item) {
    return `
        <div class="activity-item">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random" class="act-avatar">
            <div class="act-body">
                <span class="act-user">${item.name}</span>
                <span class="act-desc">${item.action}</span>
            </div>
            <span class="act-time">${item.time}</span>
        </div>
    `;
}

function renderNotifItem(item) {
    return `
        <div class="activity-item">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=F1F3F5&color=368CBF" class="act-avatar" style="border-radius: 8px;">
            <div class="act-body">
                <span class="act-user">${item.name} ${item.desc}</span>
                <span class="act-time">${item.time}</span>
            </div>
            <span style="color: #ADB5BD; font-size: 1.2rem;">...</span>
        </div>
    `;
}

function loadOnlineUsers() {
    const grid = document.getElementById('onlineGrid');
    const users = ['John', 'Emily', 'Alex', 'Sarah', 'Mike', 'Sophia', 'Linda'];

    if (grid) {
        grid.innerHTML = users.map(u => `
            <div class="online-u">
                <img src="https://ui-avatars.com/api/?name=${u}&background=random">
                <span>${u}</span>
            </div>
        `).join('');
    }
}

/**
 * Centralized Sidebar & Header Navigation Logic
 * Handles transitions, auth guards, and automatic active states.
 */
function setupSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // 1. Set Automatic Active State based on current URL
    const currentPath = window.location.pathname.split('/').pop() || 'admin.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 2. Sidebar Link Handling (Event Delegation)
    sidebar.addEventListener('click', async (e) => {
        const link = e.target.closest('.nav-link');
        if (!link) return;

        if (link.id === 'sidebarLogout') {
            e.preventDefault();
            handleLogout();
            return;
        }

        const href = link.getAttribute('href');
        if (href === '#' || !href) {
            e.preventDefault();
            return;
        }

        // Auth Guard Check
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && href !== 'index.html') {
            e.preventDefault();
            window.location.href = 'index.html';
            return;
        }
    });

    // 3. Global Header Triggers (Profile, Search, etc.)
    const profileToggle = document.getElementById('profileToggle');
    if (profileToggle) {
        profileToggle.addEventListener('click', () => {
            window.location.href = 'account.html';
        });
    }

    // Initialize Header Profile Info (if elements exist)
    syncHeaderProfile();
}

/**
 * Syncs the Top-Bar profile section on every page
 */
async function syncHeaderProfile() {
    const user = await getCurrentUser();
    if (!user) return;

    const nameEl = document.getElementById('userName');
    const idEl = document.getElementById('userId');
    const avatarEl = document.getElementById('topNavAvatar') || document.getElementById('userAvatar');

    if (nameEl) nameEl.textContent = user.first_name || user.username || 'User';
    if (idEl) idEl.textContent = `ID: ${user.id.slice(0, 6).toUpperCase()}`;
    if (avatarEl) {
        avatarEl.src = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || 'User')}&background=368CBF&color=fff`;
    }
}

/**
 * Robust Logout Implementation
 */
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await logoutUser();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout failed:', error);
            // Force redirect if API fails
            window.location.href = 'index.html';
        }
    }
}
