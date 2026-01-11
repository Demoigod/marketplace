// ===== SUPABASE INTEGRATION =====
import { supabase } from './supabase-config.js';
import {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentSession,
    isLoggedIn,
    getCurrentUser,
    addListing,
    addDownload,
    checkAuthStatus
} from './auth.js';
import { initNavigation } from './navbar.js';
import { handleItemPost } from './post-item.js';
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
const postItemBtn = document.getElementById('postItemBtn');
const uploadResourceBtn = document.getElementById('uploadResourceBtn');
// const closeModalBtn = document.getElementById('closeModal'); // Handled by navbar/generic logic if present
// const closeResourceModalBtn = document.getElementById('closeResourceModal');
// const closeAuthModalBtn = document.getElementById('closeAuthModal');
const uploadForm = document.getElementById('uploadForm');
const resourceForm = document.getElementById('resourceForm');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const searchInput = document.getElementById('searchInput');
const marketplaceGrid = document.getElementById('marketplaceGrid');
const resourcesGrid = document.getElementById('resourcesGrid');
const loginBtn = document.getElementById('loginBtn');
// const logoutBtn = document.getElementById('logoutBtn');
// const userMenu = document.getElementById('userMenu');
const dashboardLink = document.getElementById('dashboardLink');

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    await initNavigation();

    // Check auth status to update UI (this handles the "dead" login buttons state potentially)
    // Note: checkAuthStatus is imported from auth.js if available, or we might need to implement a simple check here
    // checking if checkAuthStatus is exported from auth.js, I will assume it's helpful to call simple auth check
    await updateAuthUI();

    // Initial content load
    refreshMarketplace();
    fetchResources();
    initSaveListeners();

    // Check URL parameters for actions (e.g., immediate post triggering)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'post') {
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('open-post-modal'));
        }, 800);
    }

    setupEventListeners();
});

async function updateAuthUI() {
    const isAuth = await isLoggedIn();
    const user = await getCurrentUser();
    // navbar.js handles most of this, but if we have specific page elements:
    if (isAuth && user) {
        if (dashboardLink) dashboardLink.style.display = 'block';
    } else {
        if (dashboardLink) dashboardLink.style.display = 'none';
    }
}

async function refreshMarketplace() {
    const isAuth = await isLoggedIn();
    const items = await fetchAllItems();
    if (marketplaceGrid) {
        if (items && items.length > 0) {
            marketplaceGrid.innerHTML = items.map(item => createItemCard(item, isAuth)).join('');
        } else {
            marketplaceGrid.innerHTML = '<p class="empty-state">No items found. Be the first to post!</p>';
        }
    }
}

// Global listener for re-rendering when an item is posted
document.addEventListener('item-posted', refreshMarketplace);

// ===== DATA FETCHING (Resources) =====
async function fetchResources() {
    if (!resourcesGrid) return; // Guard clause

    try {
        const { data, error } = await supabase
            .from('free_resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        resources = data || [];
        renderResources();
    } catch (error) {
        console.error('Error fetching resources:', error.message);
        resourcesGrid.innerHTML = '<p class="error-state">Failed to load resources.</p>';
    }
}

function renderResources() {
    if (!resourcesGrid) return;

    const filteredResources = resources.filter(resource => {
        if (currentResourceType === 'all') return true;
        return resource.type === currentResourceType;
    });

    if (filteredResources.length === 0) {
        resourcesGrid.innerHTML = '<p class="empty-state">No resources found.</p>';
        return;
    }

    resourcesGrid.innerHTML = filteredResources.map(resource => createResourceCard(resource)).join('');
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
                <div class="resource-icon">
                    ${icons[resource.type] || icons.exam}
                </div>
                <div class="resource-info">
                    <span class="resource-type">${resource.type}</span>
                    <h3 class="resource-title">${resource.title}</h3>
                    <p class="resource-course">${resource.course}</p>
                </div>
            </div>
            <div class="resource-meta">
                <span class="resource-year">${resource.year}</span>
                <button class="download-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 11V3M8 11L5 8M8 11L11 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 13H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Download
                </button>
            </div>
        </div>
    `;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Search functionality
    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Category filters
    document.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            // We would need to implement client-side filtering or re-fetch with query
            // For now, simpler re-fetch approach:
            // This assumes fetchAllItems handles strict filtering or we filter the local 'marketplaceItems' if we cached perfectly.
            // But since fetchAllItems returns everything, let's just filter locally:
            // This requires we keep marketplaceItems in state or refetch. 
            // Simplified: Just log for now or implement if 'items.js' supports it.
            // Actually, best to just filter the DOM or re-fetch with filter.
            // Let's implement client-side filter of the fetched list.
            const cat = chip.dataset.category;
            filterMarketplace(cat);
        });
    });

    // Resource filters
    document.querySelectorAll('.resource-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.resource-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentResourceType = chip.dataset.type;
            renderResources();
        });
    });

    // Forms
    if (uploadForm) uploadForm.addEventListener('submit', handleItemPost);

    // Auth Forms
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const result = await loginUser(email, password);
            if (result.success) {
                alert("Login successful!");
                window.location.reload();
            } else {
                alert(result.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            // simple registration handling
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const role = document.getElementById('registerRole').value;

            const result = await registerUser(email, password, name, role);
            if (result.success) {
                alert(result.message);
                window.location.reload();
            } else {
                alert(result.message);
            }
        });
    }

    if (resourceForm) {
        resourceForm.addEventListener('submit', handleResourceUpload);
    }

    // DELEGATED EVENT LISTENERS (Fix for 'Dead Buttons')
    // Marketplace Grid Actions
    if (marketplaceGrid) {
        marketplaceGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('button');
            if (!btn) return;

            const action = btn.dataset.action;
            const id = btn.dataset.id;

            if (action === 'buy') {
                window.location.href = `payment.html?item_id=${id}`;
            } else if (action === 'contact') {
                const sellerId = btn.dataset.sellerId;
                window.location.href = `messages.html?partner_id=${sellerId}`;
            } else if (action === 'view') {
                window.location.href = `item.html?id=${id}`;
            }
        });
    }

    // Resource Grid Actions
    if (resourcesGrid) {
        resourcesGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.download-btn');
            if (btn) {
                // For resources, we might need to rely on explicit data-id if not using window.
                // Note: script.js createResourceCard needs update to remove onclick="" and add data-id?
                // The current createResourceCard has `onclick="window.downloadResourceAction('${resource.id}')"`
                // We should update that too. BUT, we can just grab data-id from the parent card if the button doesn't have it.
                // The resource card has data-id.
                const card = btn.closest('.resource-card');
                if (card) {
                    handleDownloadAction(card.dataset.id);
                }
            }
        });
    }
}

// Helper: Resource Upload
async function handleResourceUpload(e) {
    e.preventDefault();
    if (!await isLoggedIn()) {
        alert("Please login to upload resources.");
        return;
    }
    const user = await getCurrentUser();

    const newResource = {
        title: document.getElementById('resourceTitle').value,
        type: document.getElementById('resourceType').value,
        course: document.getElementById('resourceCourse').value,
        year: parseInt(document.getElementById('resourceYear').value) || new Date().getFullYear(),
        description: document.getElementById('resourceDescription').value,
        uploader_id: user.id
    };

    const { error } = await supabase.from('free_resources').insert([newResource]);
    if (error) {
        alert("Error uploading resource: " + error.message);
    } else {
        alert("Resource uploaded!");
        document.getElementById('resourceModal').classList.remove('active'); // simplistic close
        fetchResources();
    }
}

async function handleDownloadAction(id) {
    if (!await isLoggedIn()) {
        document.dispatchEvent(new CustomEvent('open-auth-modal'));
        return;
    }
    await addDownload({ id });
    alert("Download started!");
}

// Helper: Debounce
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

// Helper: Search
async function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    // Use items table
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('status', 'active');

    const isAuth = await isLoggedIn();
    if (marketplaceGrid) {
        marketplaceGrid.innerHTML = (items || []).map(item => createItemCard(item, isAuth)).join('');
    }
}

// Helper: Client-side Filter
async function filterMarketplace(category) {
    const isAuth = await isLoggedIn();
    const { data: items } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false });

    const filtered = category === 'all'
        ? items
        : items.filter(i => i.category === category);

    if (marketplaceGrid) {
        marketplaceGrid.innerHTML = (filtered || []).map(item => createItemCard(item, isAuth)).join('');
    }
}
