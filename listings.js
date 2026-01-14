import { supabase } from './supabase-config.js';
import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';
import { fetchAllItems, createItemCard } from './items.js';
import { initSaveListeners } from './save-item.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard: Redirect to homepage if not logged in
    const session = await isLoggedIn();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Initialize Page
    updateUserProfile();
    loadMarketplace();
    setupEventListeners();
    initSaveListeners(); // Initialize bookmarking functionality

    // 3. Global Auth Logic: Handle Logout
    supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'index.html';
        }
    });
});

async function updateUserProfile() {
    const user = await getCurrentUser();
    if (user) {
        const adminNameElements = document.querySelectorAll('.admin-name');
        const displayName = user.username || user.full_name || 'User';
        adminNameElements.forEach(el => el.textContent = displayName);

        const avatarImages = document.querySelectorAll('.avatar');
        avatarImages.forEach(img => {
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=368CBF&color=fff`;
        });
    }
}

async function loadMarketplace() {
    const grid = document.getElementById('marketplaceGrid');
    if (!grid) return;

    try {
        const items = await fetchAllItems();
        console.log(`Loading ${items?.length || 0} items into grid...`);
        const isAuth = true; // Guarded by DOMContentLoaded check

        if (items && items.length > 0) {
            grid.innerHTML = items.map(item => createItemCard(item, isAuth)).join('');
            console.log('Grid updated successfully');
        } else {
            console.log('No items found, showing empty state');
            grid.innerHTML = '<div class="empty-state" style="padding: 60px; text-align: center; grid-column: 1/-1;">' +
                '<p style="color: var(--text-secondary); font-size: 1.1rem;">No items found in the marketplace.</p>' +
                '</div>';
        }
    } catch (error) {
        console.error('Error loading marketplace:', error.message);
        grid.innerHTML = '<p class="error-state">Failed to load listings. Please try again later.</p>';
    }
}

function setupEventListeners() {
    // 1. Search Logic
    const searchInput = document.getElementById('listingsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.toLowerCase();
            const grid = document.getElementById('marketplaceGrid');

            // Search market_listings table
            const { data: items, error } = await supabase
                .from('market_listings')
                .select(`
                    *,
                    profiles (
                        username,
                        full_name
                    )
                `)
                .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
                .eq('status', 'active');

            if (error) console.error('Search error:', error);

            if (grid) {
                grid.innerHTML = (items || []).map(item => createItemCard(item, true)).join('');
            }
        }, 300));
    }

    // 2. Grid Actions (Event Delegation)
    const marketplaceGrid = document.getElementById('marketplaceGrid');
    if (marketplaceGrid) {
        marketplaceGrid.addEventListener('click', async (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'buy') {
                window.location.href = `payment.html?item_id=${id}`;
            } else if (action === 'contact') {
                const sellerId = btn.dataset.sellerId;
                const itemId = btn.dataset.id;
                window.location.href = `messages.html?partner_id=${sellerId}&item_id=${itemId}`;
            } else if (action === 'view') {
                window.location.href = `item.html?id=${id}`;
            }
        });
    }

    // 3. Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                await logoutUser();
                window.location.href = 'index.html';
            }
        });
    }
}

// Helper: Debounce
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
