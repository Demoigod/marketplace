import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';

export async function initNavigation() {
    setupMobileMenu();
    await renderDesktopNav();
}

export function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links'); // Keeping legacy mobile class for now

    if (menuToggle && navLinks) {
        // Simple override to ensure it toggles
        menuToggle.onclick = () => {
            navLinks.classList.toggle('active');
            menuToggle.textContent = navLinks.classList.contains('active') ? '✕' : '☰';
        };
    }
}

async function renderDesktopNav() {
    const navContent = document.querySelector('.nav-content');
    if (!navContent) return;

    const user = await getCurrentUser();
    const isAuth = !!user;

    // SVG Icons
    const gridIcon = `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>`;
    const userIcon = `<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>`;
    const chevronDown = `<svg class="menu-icon" style="width:14px; height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor"><polyline points="6 9 12 15 18 9"></polyline></svg>`;

    // Browse Dropdown HTML
    const browseHtml = `
        <div class="dropdown-container" id="browseDropdown">
            <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="Browse Categories">
                ${gridIcon}
            </button>
            <div class="dropdown-menu-modern" role="menu" style="display: none;">
                <div class="dropdown-header">Marketplace</div>
                <a href="index.html?category=all" class="menu-item" role="menuitem">
                    All Listings
                </a>
                <a href="index.html?type=free" class="menu-item" role="menuitem">
                    Free Resources
                </a>
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Categories</div>
                <a href="index.html?category=electronics" class="menu-item" role="menuitem">Electronics</a>
                <a href="index.html?category=books" class="menu-item" role="menuitem">Books</a>
                <a href="index.html?category=furniture" class="menu-item" role="menuitem">Furniture</a>
                <a href="index.html?category=services" class="menu-item" role="menuitem">Services</a>
            </div>
        </div>
    `;

    // Profile Dropdown HTML
    let profileHtml = '';
    if (isAuth) {
        profileHtml = `
            <div class="dropdown-container" id="profileDropdown">
                <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="User Menu">
                    ${userIcon}
                </button>
                <div class="dropdown-menu-modern" role="menu" style="display: none;">
                    <div class="dropdown-header">Signed in as <br><span style="color:var(--text-primary);">${user.name || 'User'}</span></div>
                    <div class="dropdown-divider"></div>
                    <a href="dashboard.html" class="menu-item" role="menuitem">Dashboard</a>
                    <a href="messages.html" class="menu-item" role="menuitem">Messages</a>
                    <a href="#" id="menuPostItem" class="menu-item" role="menuitem">Post Item</a>
                    <div class="dropdown-divider"></div>
                    <button id="menuLogout" class="menu-item danger" role="menuitem">Log out</button>
                </div>
            </div>
        `;
    } else {
        profileHtml = `
             <button class="btn-primary" id="navLoginBtn" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Login</button>
        `;
    }

    // Logo HTML
    const logoHtml = `
        <a href="index.html" class="logo">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#gradient1)" />
                <path d="M16 8L22 14L16 20L10 14L16 20L16 8Z" fill="white" />
                <defs>
                    <linearGradient id="gradient1" x1="0" y1="0" x2="32" y2="32">
                        <stop offset="0%" stop-color="#368CBF" />
                        <stop offset="100%" stop-color="#E6DBC9" />
                    </linearGradient>
                </defs>
            </svg>
            <span class="logo-text">Campus Market</span>
        </a>
    `;

    // Layout Assembly
    // Left: Dropdowns
    // Center/Left-align: Logo (as per user request: "on the left side of the logo provide a dropdown")
    // Actually, if I place dropdowns FIRST in DOM, they are to the left of the Logo.

    const leftNav = `
        <div class="nav-left" style="display: flex; gap: 8px; align-items: center; margin-right: 16px;">
            ${browseHtml}
            ${profileHtml}
        </div>
    `;

    // Note: We need to preserve the mobile toggle
    const mobileToggleHtml = `<button class="menu-toggle">☰</button>`;

    navContent.innerHTML = `
        <div style="display:flex; align-items:center;">
             ${leftNav}
             ${logoHtml}
        </div>
        ${mobileToggleHtml}
        <div class="nav-links mobile-only-links">
             <a href="index.html" class="nav-link">Home</a>
             <a href="dashboard.html" class="nav-link">Dashboard</a>
        </div>
    `;

    attachEventListeners();
}

function attachEventListeners() {
    // Dropdown Toggles
    const dropdowns = document.querySelectorAll('.dropdown-container');

    dropdowns.forEach(dropdown => {
        const trigger = dropdown.querySelector('.icon-btn');
        const menu = dropdown.querySelector('.dropdown-menu-modern');

        if (!trigger || !menu) return;

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = dropdown.classList.contains('open');

            // Close all others
            closeAllDropdowns();

            if (!isOpen) {
                dropdown.classList.add('open');
                trigger.setAttribute('aria-expanded', 'true');
                trigger.classList.add('active');
            }
        });

        // Keyboard support
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeAllDropdowns();
                trigger.focus();
            }
        });
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.dropdown-container')) {
            closeAllDropdowns();
        }
    });

    // Handle Actions
    const logoutBtn = document.getElementById('menuLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await logoutUser();
            window.location.reload();
        });
    }

    const postItemBtn = document.getElementById('menuPostItem');
    if (postItemBtn) {
        postItemBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mainBtn = document.getElementById('postItemBtn');
            if (mainBtn) mainBtn.click();
            else window.location.href = 'index.html';
        });
    }

    const loginBtn = document.getElementById('navLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const mainLogin = document.getElementById('loginBtn');
            if (mainLogin) mainLogin.click();
            else window.location.href = 'index.html#login';
        });
    }
}

function closeAllDropdowns() {
    document.querySelectorAll('.dropdown-container').forEach(d => {
        d.classList.remove('open');
        const trigger = d.querySelector('.icon-btn');
        if (trigger) {
            trigger.setAttribute('aria-expanded', 'false');
            trigger.classList.remove('active');
        }
    });
}
