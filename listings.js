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


async function loadMarketplace() {
    const grid = document.getElementById('marketplaceGrid');
    if (!grid) return;

    try {
        const items = await fetchAllItems();
        console.log(`Loading ${items?.length || 0} items into grid...`);
        const isAuth = true; // Guarded by DOMContentLoaded check

        if (items && items.length > 0) {
            grid.innerHTML = items.map(item => createItemCard(item, isAuth)).join('');
        } else {
            grid.innerHTML = '<div class="empty-state" style="padding: 60px; text-align: center; grid-column: 1/-1;">' +
                '<p style="color: #6B7280; font-size: 1.1rem;">No items found in the marketplace.</p>' +
                '</div>';
        }
    } catch (error) {
        console.error('Error loading marketplace:', error.message);
        grid.innerHTML = '<p class="error-state">Failed to load listings.</p>';
    }
}

function setupEventListeners() {
    // 1. Search Logic
    const searchInput = document.getElementById('listingsSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(async (e) => {
            const query = e.target.value.toLowerCase();
            const grid = document.getElementById('marketplaceGrid');

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

            // Handle View Button
            if (btn.dataset.action === 'view') {
                const id = btn.dataset.id;
                window.location.href = `item.html?id=${id}`;
                return;
            }

            // Handle Contact Button
            if (btn.classList.contains('contact-seller-btn')) {
                const sellerId = btn.dataset.sellerId;
                const listingId = btn.dataset.listingId;
                window.location.href = `messages.html?seller_id=${sellerId}&listing_id=${listingId}`;
                return;
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
