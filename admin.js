import { supabase } from './supabase-config.js';
import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Auth Guard: Redirect to homepage if not logged in
    const session = await isLoggedIn();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    updateDate();
    await updateDashboardData();
    initNavigation();

    // Global Auth Logic: Handle Logout
    supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'index.html';
        }
    });
});

function updateDate() {
    const dateEl = document.getElementById('dashboardDate');
    if (dateEl) {
        const now = new Date();
        const day = now.getDate();
        const month = now.toLocaleString('en-US', { month: 'long' });
        const year = now.getFullYear();
        dateEl.textContent = `Today is ${day} ${month}, ${year}`;
    }
}

async function updateDashboardData() {
    const user = await getCurrentUser();
    if (user) {
        // 1. Personalized Greeting
        const welcomeGreeting = document.getElementById('welcomeGreeting');
        if (welcomeGreeting) {
            welcomeGreeting.textContent = `Welcome, ${user.first_name || user.name || 'David Orok'} 👋`;
        }

        // 2. Profile Avatar in Top Nav
        const topNavAvatar = document.getElementById('topNavAvatar');
        if (topNavAvatar) {
            topNavAvatar.src = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.first_name || 'User')}&background=368CBF&color=fff`;
        }
    }

    // 3. Fetch Real Stats (Marketplace Listings & Total Users)
    try {
        const { count: listingCount } = await supabase.from('market_listings').select('*', { count: 'exact', head: true });
        const { count: profileCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });

        // Update UI with localized formatting if needed
        const stats = {
            'statTotalListings': listingCount ? listingCount.toLocaleString() : '1,286,918',
            'statTotalUsers': profileCount ? profileCount.toLocaleString() : '1,973,297',
            'statTotalOrders': '32,429', // Mocking these as per image until orders table exists
            'statIncome': '$524,927',
            'statPayout': '$524,927'
        };

        for (const [id, val] of Object.entries(stats)) {
            const el = document.getElementById(id);
            if (el) el.textContent = val;
        }

    } catch (err) {
        console.error('Error fetching dashboard stats:', err);
    }
}

function initNavigation() {
    // Top nav logout logic
    const profileToggle = document.getElementById('profileToggle');
    if (profileToggle) {
        profileToggle.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                logoutUser();
            }
        });
    }

    // Sidebar logout logic
    const sidebarLogout = document.getElementById('sidebarLogout');
    if (sidebarLogout) {
        sidebarLogout.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                logoutUser();
            }
        });
    }

    // Search focus effect logic (minimal since it's just a ref match)
    const searchInput = document.querySelector('.search-container input');
    if (searchInput) {
        searchInput.addEventListener('focus', () => {
            searchInput.parentElement.style.boxShadow = '0 0 0 3px rgba(54, 140, 191, 0.15)';
            searchInput.parentElement.style.borderColor = 'var(--primary-color)';
        });
        searchInput.addEventListener('blur', () => {
            searchInput.parentElement.style.boxShadow = 'none';
            searchInput.parentElement.style.borderColor = 'var(--border-color)';
        });
    }
}
