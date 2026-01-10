// ===== SUPABASE INTEGRATION =====
import { supabase } from './supabase-config.js';
import { isLoggedIn } from './auth.js';
import { initNavigation } from './navbar.js';
import { handleItemPost, handleResourceUpload } from './post-item.js';
import { fetchAllItems, createItemCard } from './items.js';
import { initSaveListeners } from './save-item.js';

// ===== STATE MANAGEMENT =====
let currentCategory = 'all';
let currentResourceType = 'all';
let marketplaceItems = [];
let resources = [];

// ===== DOM ELEMENTS =====
const uploadModal = document.getElementById('uploadModal');
const resourceModal = document.getElementById('resourceModal');
const authModal = document.getElementById('authModal');
const uploadResourceBtn = document.getElementById('uploadResourceBtn');
const closeModalBtn = document.getElementById('closeModal');
const closeResourceModalBtn = document.getElementById('closeResourceModal');
const closeAuthModalBtn = document.getElementById('closeAuthModal');
const uploadForm = document.getElementById('uploadForm');
const resourceForm = document.getElementById('resourceForm');
const searchInput = document.getElementById('searchInput');
const marketplaceGrid = document.getElementById('marketplaceGrid');
const resourcesGrid = document.getElementById('resourcesGrid');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Init Navigation (Dynamic Navbar)
    await initNavigation();

    // 2. Load Content
    await refreshMarketplace();
    fetchResources();
    initSaveListeners();

    // 3. Handle specific action triggers from URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'post') {
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('open-post-modal'));
        }, 500);
    }

    // 4. Global Event Listeners
    setupEventListeners();
});

/**
 * Loads and renders the marketplace using the unified items.js logic
 */
async function refreshMarketplace() {
    if (!marketplaceGrid) return;

    // Show loading state
    marketplaceGrid.innerHTML = '<div class="loading-state">Loading marketplace...</div>';

    const isAuth = await isLoggedIn();
    const items = await fetchAllItems();

    // Filter by category if needed (though fetchAllItems could be updated to do this)
    const filteredItems = currentCategory === 'all'
        ? items
        : items.filter(i => i.category === currentCategory);

    if (filteredItems.length === 0) {
        marketplaceGrid.innerHTML = '<div class="empty-state">No items found in this category.</div>';
        return;
    }

    marketplaceGrid.innerHTML = filteredItems.map(item => createItemCard(item, isAuth)).join('');
}

/**
 * Handle item-posted event from post-item.js
 */
document.addEventListener('item-posted', () => {
    refreshMarketplace();
});

// ===== RESOURCES =====
async function fetchResources() {
    if (!resourcesGrid) return;

    try {
        let query = supabase.from('free_resources').select('*');
        if (currentResourceType !== 'all') {
            query = query.eq('type', currentResourceType);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        if (error) throw error;

        resources = data || [];
        renderResources();
    } catch (error) {
        console.error('Error fetching resources:', error.message);
    }
}

function renderResources() {
    if (!resourcesGrid) return;
    resourcesGrid.innerHTML = resources.map(resource => createResourceCard(resource)).join('');
}

function createResourceCard(resource) {
    const icons = {
        exam: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/></svg>`,
        textbook: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/></svg>`,
        notes: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2"/></svg>`
    };

    return `
        <div class="resource-card" data-id="${resource.id}">
            <div class="resource-header">
                <div class="resource-icon">${icons[resource.type] || icons.exam}</div>
                <div class="resource-info">
                    <span class="resource-type">${resource.type}</span>
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-course">${resource.course}</p>
                </div>
            </div>
            <div class="resource-meta">
                <span class="resource-year">${resource.year}</span>
                <button class="download-btn" onclick="downloadResourceAction('${resource.id}')">Download</button>
            </div>
        </div>
    `;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // 1. Custom events from Navbar
    document.addEventListener('open-auth-modal', () => {
        if (authModal) openModal(authModal);
    });

    document.addEventListener('open-post-modal', async () => {
        if (!await isLoggedIn()) {
            document.dispatchEvent(new CustomEvent('open-auth-modal'));
            return;
        }
        if (uploadModal) openModal(uploadModal);
    });

    // 2. Floating buttons/Static buttons
    const postItemBtn = document.getElementById('postItemBtn');
    if (postItemBtn) {
        postItemBtn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('open-post-modal'));
        });
    }

    if (uploadResourceBtn) {
        uploadResourceBtn.addEventListener('click', async () => {
            if (!await isLoggedIn()) {
                document.dispatchEvent(new CustomEvent('open-auth-modal'));
                return;
            }
            openModal(resourceModal);
        });
    }

    // Modal Close logic
    [closeModalBtn, closeResourceModalBtn, closeAuthModalBtn].forEach(btn => {
        if (btn) {
            btn.onclick = () => {
                closeModal(uploadModal);
                closeModal(resourceModal);
                closeModal(authModal);
            };
        }
    });

    // 3. Category & Resource Chips
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.category;
            refreshMarketplace();
        });
    });

    document.querySelectorAll('.resource-chip').forEach(chip => {
        chip.addEventListener('click', (e) => {
            document.querySelectorAll('.resource-chip').forEach(c => c.classList.remove('active'));
            e.target.classList.add('active');
            currentResourceType = e.target.dataset.type;
            fetchResources();
        });
    });

    // 4. Search
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // 5. Forms
    if (uploadForm) uploadForm.addEventListener('submit', handleItemPost);
    if (resourceForm) resourceForm.addEventListener('submit', handleResourceUpload);

    // 6. Auth Tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            const tabType = e.target.dataset.tab;
            document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            const loginForm = document.getElementById('loginForm');
            const registerForm = document.getElementById('registerForm');
            const title = document.getElementById('authModalTitle');

            if (tabType === 'login') {
                if (loginForm) loginForm.style.display = 'block';
                if (registerForm) registerForm.style.display = 'none';
                if (title) title.textContent = 'Login';
            } else {
                if (loginForm) loginForm.style.display = 'none';
                if (registerForm) registerForm.style.display = 'block';
                if (title) title.textContent = 'Register';
            }
        });
    });
}

// ===== FORM HANDLERS =====
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const result = await loginUser(email, password);
    if (result.success) {
        showNotification('Login successful!');
        closeModal(authModal);
        // Wait for session to sync then redirect
        setTimeout(() => window.location.href = 'dashboard.html', 500);
    } else {
        showNotification(result.message);
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    const result = await registerUser(email, password, name, role);
    if (result.success) {
        showNotification(result.message);
        // Switch to login tab
        document.querySelector('[data-tab="login"]').click();
    } else {
        showNotification(result.message);
    }
}

// ===== UTILS =====
async function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
        refreshMarketplace();
        fetchResources();
        return;
    }

    try {
        const { data: items, error: itemsError } = await supabase
            .from('items')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%,category.ilike.%${query}%`)
            .eq('status', 'active');

        if (!itemsError && items) {
            const isAuth = await isLoggedIn();
            marketplaceGrid.innerHTML = items.map(item => createItemCard(item, isAuth)).join('');
        }
    } catch (err) {
        console.error('Search error:', err);
    }
}

function openModal(modal) {
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

window.downloadResourceAction = (id) => {
    alert('Resource download started!');
};
