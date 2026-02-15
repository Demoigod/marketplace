// ===== SUPABASE INTEGRATION =====
console.log("APP_DEBUG: main.js LOADED - NUCLEAR VERSION V1 [TIMESTAMP: " + new Date().toISOString() + "]");
import { supabase } from './supabase-config.js?v=fixed';
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
} from './auth.js?v=fixed';
import { initNavigation } from './navbar.js?v=fixed';
// Removed invalid import
import { fetchAllItems, createItemCard } from './items.js?v=fixed';
import { initSaveListeners } from './save-item.js?v=fixed';

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

    // Check auth status to update UI
    await updateAuthUI();
    console.log("APP_DEBUG: Script.js loaded.");

    // Homepage Guard REMOVED - Handled by inline script in index.html to prevent flash


    // Initial content load
    // Initial content load - ONLY if on a page with the grid
    if (document.getElementById('marketplaceGrid')) {
        refreshMarketplace();
    }
    if (document.getElementById('resourcesGrid')) {
        fetchResources();
    }
    initSaveListeners();

    // Check URL parameters for actions (e.g., immediate post triggering)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'post') {
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('open-post-modal'));
        }, 800);
    }

    setupEventListeners();

    // Global Auth Logic: Handle redirects on state change (Logout)
    supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'index.html';
        } else if (event === 'SIGNED_IN') {
            const user = await getCurrentUser();
            const currentPath = window.location.pathname;

            // Redirect logic for Homepage / Index
            if (currentPath.endsWith('index.html') || currentPath.endsWith('/') || currentPath === '/') {
                // Unified Redirect: Everyone goes to market.html
                window.location.href = 'market.html';
            }
        }
    });
});

async function updateAuthUI() {
    const user = await getCurrentUser();

    // Landing page sections to toggle
    const heroSection = document.querySelector('.landing-hero');
    const trustSection = document.querySelector('.trust-section');
    const howItWorksSection = document.querySelector('.how-it-works');
    const heroAuthCtas = document.getElementById('heroAuthCtas');

    if (user) {
        // Hide marketing fluff for logged-in users
        if (heroSection) heroSection.style.display = 'none';
        if (trustSection) trustSection.style.display = 'none';
        if (howItWorksSection) howItWorksSection.style.display = 'none';
        if (heroAuthCtas) heroAuthCtas.style.display = 'none';
    } else {
        // Show for guests
        if (heroSection) heroSection.style.display = 'block';
        if (trustSection) trustSection.style.display = 'block';
        if (howItWorksSection) howItWorksSection.style.display = 'block';
        if (heroAuthCtas) heroAuthCtas.style.display = 'flex';
        setupHeroListeners();
    }
}

function setupHeroListeners() {
    const signupBtn = document.getElementById('heroSignupBtn');
    const loginBtn = document.getElementById('heroLoginBtn');
    const authModal = document.getElementById('authModal');

    if (signupBtn && authModal) {
        signupBtn.onclick = () => {
            document.querySelector('.auth-tab[data-tab="register"]')?.click();
            authModal.classList.add('active');
        };
    }

    if (loginBtn) {
        loginBtn.onclick = () => {
            // Scroll to marketplace
            const marketplace = document.getElementById('marketplace');
            if (marketplace) {
                marketplace.scrollIntoView({ behavior: 'smooth' });
            }
        };
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
    // Search functionality (Dynamic check for Nav Search)
    const activeSearchInput = document.getElementById('navSearchInput') || document.getElementById('searchInput');

    // ===== SEARCH & FILTERS =====
    if (activeSearchInput) {
        activeSearchInput.addEventListener('input', debounce(handleSearch, 300));
    }

    // Category Filtering (Sidebar & Chips)
    const categoryButtons = document.querySelectorAll('.category-chip, .sidebar-link[data-category]');

    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            // Update state and refresh
            currentCategory = button.dataset.category;
            refreshMarketplace();
        });
    });

    // Resource Filtering
    const resourceChips = document.querySelectorAll('.resource-chip');
    resourceChips.forEach(chip => {
        chip.addEventListener('click', () => {
            resourceChips.forEach(c => c.classList.remove('active'));
            chip.classList.add('active');

            currentResourceType = chip.dataset.type;
            renderResources();
        });
    });

    // Forms - Handled by standalone pages or updated logic
    // if (uploadForm) uploadForm.addEventListener('submit', handleItemPost);

    // Auth Forms
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const result = await loginUser(email, password);
            if (result.success) {
                // Fetch user to check role
                const user = await getCurrentUser();
                if (user?.role === 'seller') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'market.html';
                }
            } else {
                alert(result.message);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const userData = {
                firstName: document.getElementById('registerFirstName').value,
                lastName: document.getElementById('registerLastName').value,
                username: document.getElementById('registerUsername').value,
                phone: document.getElementById('registerPhone').value,
                role: document.getElementById('registerRole').value
            };
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;

            const result = await registerUser(email, password, userData);
            if (result.success) {
                // Fetch user to check role, or rely on what we just sent
                const user = await getCurrentUser(); // Better to fetch fresh state or rely on metadata if instant

                // For new users, role comes from the form select or default
                // But let's trust the profile/session
                if (user?.role === 'seller') {
                    window.location.href = 'admin.html';
                } else {
                    // Default for new buyers
                    window.location.href = 'market.html';
                }
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
        marketplaceGrid.addEventListener('click', async (e) => {
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
                const isAuth = await isLoggedIn();
                if (isAuth) {
                    window.location.href = `item.html?id=${id}`;
                } else {
                    document.dispatchEvent(new CustomEvent('open-auth-modal'));
                }
            }
        });
    }

    // Resource Grid Actions
    if (resourcesGrid) {
        resourcesGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.download-btn');
            if (btn) {
                const card = btn.closest('.resource-card');
                if (card) {
                    handleDownloadAction(card.dataset.id);
                }
            }
        });
    }

    // Modal Handling (Auth & Post)
    document.addEventListener('open-auth-modal', () => {
        if (authModal) authModal.classList.add('active');
    });

    document.addEventListener('open-post-modal', () => {
        if (uploadModal) uploadModal.classList.add('active');
    });

    // Close Modals
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.modal').forEach(m => m.classList.remove('active'));
        });
    });

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
        }
    });

    // Auth Tabs
    const authTabs = document.querySelectorAll('.auth-tab');
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const mode = tab.dataset.tab;
            if (mode === 'login') {
                document.getElementById('loginForm').style.display = 'block';
                document.getElementById('registerForm').style.display = 'none';
                document.getElementById('authModalTitle').textContent = 'Login';
            } else {
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('registerForm').style.display = 'block';
                document.getElementById('authModalTitle').textContent = 'Register';
            }
        });
    });
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

    const isAuth = await isLoggedIn();
    if (marketplaceGrid) {
        marketplaceGrid.innerHTML = (items || []).map(item => createItemCard(item, isAuth)).join('');
    }
}

// Helper: Client-side Filter
async function filterMarketplace(category) {
    const isAuth = await isLoggedIn();
    const { data: items, error } = await supabase
        .from('market_listings')
        .select(`
            *,
            profiles (
                username,
                full_name
            )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) console.error('Filter error:', error);

    const filtered = category === 'all'
        ? items
        : (items || []).filter(i => i.category === category);

    if (marketplaceGrid) {
        marketplaceGrid.innerHTML = (filtered || []).map(item => createItemCard(item, isAuth)).join('');
    }
}
