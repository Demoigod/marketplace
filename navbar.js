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

    // Right-side Navigation HTML (Conditional)
    let rightNavHtml = '';
    if (isAuth) {
        const isSeller = user.role === 'seller';
        // Logged in: Show requested links
        rightNavHtml = `
            <div class="nav-links">
                 <a href="#" id="navPostItem" class="nav-link">Post Item</a>
                 <a href="dashboard.html" class="nav-link">Dashboard</a>
                 <a href="messages.html" class="nav-link">Messages</a>
            </div>
            <div class="dropdown-container" id="profileDropdown" style="margin-left: 8px;">
                 <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="User Menu">
                    ${userIcon}
                </button>
                <div class="dropdown-menu-modern" role="menu" style="display: none;">
                    <div class="dropdown-header">Signed in as <br><span style="color:var(--text-primary);">${user.name || 'User'}</span></div>
                    <div class="dropdown-divider"></div>
                    <a href="dashboard.html" class="menu-item" role="menuitem">Account Settings</a>
                    <a href="admin.html" class="menu-item" role="menuitem">Admin Dashboard</a>
                    <button id="menuLogout" class="menu-item danger" role="menuitem">Log out</button>
                </div>
            </div>
        `;
    } else {
        // Logged out: Show Sign up and Log in buttons
        rightNavHtml = `
             <div class="nav-links">
                 <button class="btn-primary" id="navSignupBtn">Sign up</button>
                 <button class="nav-link" id="navLoginBtn" style="border:none; background:none; cursor:pointer;">Log in</button>
             </div>
        `;
    }

    // Logo HTML
    const logoHtml = `
        <a href="index.html" class="logo" style="flex-direction: row; gap: 10px; align-items: center;">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="url(#gradient1)" />
                <path d="M16 8L22 14L16 20L10 14L16 20L16 8Z" fill="white" />
                <defs>
                    <linearGradient id="gradient1" x1="0" y1="0" x2="32" y2="32">
                        <stop offset="0%" stop-color="#368CBF" />
                        <stop offset="100%" stop-color="#E6DBC9" />
                    </linearGradient>
                </defs>
            </svg>
            <span class="logo-text" style="font-size: 1.1rem; margin-top: 0;">Campus Market</span>
        </a>
    `;

    // Nav Search HTML
    const navSearchHtml = `
        <div class="nav-search-wrapper">
             <div class="nav-search-bar">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2" />
                    <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <input type="text" id="navSearchInput" placeholder="Search marketplace...">
             </div>
        </div>
    `;

    // Layout Assembly
    // Only show mobile toggle if we have links to toggle (i.e. if logged in)
    const mobileToggleHtml = isAuth ? `<button class="menu-toggle">☰</button>` : '';

    navContent.innerHTML = `
        <div class="nav-left" style="display:flex; align-items:center;">
             ${logoHtml}
             <div style="margin-left: 16px;">${browseHtml}</div>
        </div>
        
        <div class="nav-center" style="flex: 1; display: flex; justify-content: center; padding: 0 20px;">
             ${navSearchHtml}
        </div>
        
        <div class="nav-right" style="display: flex; align-items: center; gap: 12px;">
             ${rightNavHtml}
             ${mobileToggleHtml}
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
    const logoutHandler = async () => {
        await logoutUser();
        window.location.href = 'index.html';
    };

    const logoutBtnMenu = document.getElementById('menuLogout');
    if (logoutBtnMenu) logoutBtnMenu.addEventListener('click', logoutHandler);

    const logoutBtnNav = document.getElementById('navLogout');
    if (logoutBtnNav) logoutBtnNav.addEventListener('click', logoutHandler);


    const postItemHandler = (e) => {
        e.preventDefault();
        const isHomePage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');

        if (isHomePage) {
            document.dispatchEvent(new CustomEvent('open-post-modal'));
        } else {
            window.location.href = 'index.html?action=post';
        }
    };

    const postItemBtnMenu = document.getElementById('menuPostItem');
    if (postItemBtnMenu) postItemBtnMenu.addEventListener('click', postItemHandler);

    const postItemBtnNav = document.getElementById('navPostItem');
    if (postItemBtnNav) postItemBtnNav.addEventListener('click', postItemHandler);

    const loginBtn = document.getElementById('navLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const authModal = document.getElementById('authModal');
            if (authModal) {
                // Show login tab
                document.querySelector('.auth-tab[data-tab="login"]')?.click();
                authModal.classList.add('active');
            }
        });
    }

    const signupBtn = document.getElementById('navSignupBtn');
    if (signupBtn) {
        signupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const authModal = document.getElementById('authModal');
            if (authModal) {
                // Show register tab
                document.querySelector('.auth-tab[data-tab="register"]')?.click();
                authModal.classList.add('active');
            }
        });
    }

    // Nav Search Listener
    const navSearchInput = document.getElementById('navSearchInput');
    if (navSearchInput) {
        navSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const mainSearch = document.getElementById('marketplaceGrid'); // Checking if we are on index
                if (!mainSearch) {
                    window.location.href = `index.html?search=${encodeURIComponent(e.target.value)}`;
                }
            }
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
