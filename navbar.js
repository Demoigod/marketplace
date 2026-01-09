import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';

export async function initNavigation() {
    setupMobileMenu(); // Keep mobile logic
    await renderDesktopNav();
}

export function setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links'); // Legacy support
    // We might need to render a mobile equivalent of the new menu
}

async function renderDesktopNav() {
    const navContent = document.querySelector('.nav-content');
    if (!navContent) return;

    const user = await getCurrentUser();
    const isAuth = !!user;

    // Preserve the Mobile Toggle button if it exists (it's usually hidden on desktop)
    const mobileToggle = navContent.querySelector('.menu-toggle');

    // Clear existing content but keep mobile toggle if needed, or rebuild it
    // Easiest is to rebuild the entire innerHTML strictly

    // SVG Logo
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

    // Dropdowns HTML
    const browseMenu = `
        <div class="nav-dropdown" id="browseDropdown">
            <button class="nav-dropdown-trigger">
                Browse
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M6 9l6 6 6-6"/>
                </svg>
            </button>
            <div class="nav-dropdown-menu">
                <a href="index.html?category=all" class="nav-dropdown-item">All Listings</a>
                <div class="nav-dropdown-item nested-dropdown">
                    Categories
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                    <div class="nested-dropdown-menu">
                        <a href="index.html?category=electronics" class="nav-dropdown-item">Electronics</a>
                        <a href="index.html?category=books" class="nav-dropdown-item">Books</a>
                        <a href="index.html?category=furniture" class="nav-dropdown-item">Furniture</a>
                        <a href="index.html?category=services" class="nav-dropdown-item">Services</a>
                        <a href="index.html?category=clothing" class="nav-dropdown-item">Clothing</a>
                    </div>
                </div>
                <a href="index.html?type=free" class="nav-dropdown-item">Free Items</a>
                <a href="#" id="navPostItem" class="nav-dropdown-item">Post item</a>
            </div>
        </div>
    `;

    let profileMenu = '';
    if (isAuth) {
        profileMenu = `
            <div class="nav-dropdown" id="profileDropdown">
                <button class="nav-dropdown-trigger">
                    Profile
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 9l6 6 6-6"/>
                    </svg>
                </button>
                <div class="nav-dropdown-menu">
                    <a href="dashboard.html" class="nav-dropdown-item">My Profile</a>
                    <a href="dashboard.html" class="nav-dropdown-item">My Listings</a>
                    <a href="messages.html" class="nav-dropdown-item">Messages</a>
                    <a href="#" class="nav-dropdown-item">Settings</a>
                    <div class="nav-dropdown-divider"></div>
                    <a href="#" id="navLogout" class="nav-dropdown-item" style="color: #e63946;">Log out</a>
                </div>
            </div>
        `;
    } else {
        // Option 1: Show "Login" button instead of Profile
        // Option 2: Show Profile dropdown with "Login" option
        // I will stick to the button for Guest, or a simple Login text
        profileMenu = `
             <button class="btn-primary" id="navLoginBtn" style="padding: 0.5rem 1rem; font-size: 0.9rem;">Login</button>
        `;
    }

    // Construct Layout
    // "On the left side of the logo" -> [Browse] [Profile] [Logo]
    const leftNav = `
        <div class="nav-left">
            ${browseMenu}
            ${profileMenu}
        </div>
    `;

    // Rebuild DOM
    // Standard: [Left Nav] [Logo] [Mobile Toggle]
    // Add spacer to push logo? The CSS 'nav-content' has justify-start.
    // Logic: 
    // .nav-left { order: -1 } -> First
    // .logo { margin-right: auto } -> Pushes everything else (if any) to right

    // We need to be careful not to destroy the Mobile Toggle button which is usually hidden in CSS but needed for mobile.
    // I will recreate it.

    const mobileToggleHtml = `<button class="menu-toggle">☰</button>`;

    navContent.innerHTML = `
        ${leftNav}
        ${logoHtml}
        ${mobileToggleHtml}
        <div class="nav-links mobile-only-links"> <!-- Hidden on desktop, logic for mobile menu -->
             <a href="index.html" class="nav-link">Home</a>
             <a href="dashboard.html" class="nav-link">Dashboard</a>
             <!-- ... simplified mobile menu ... -->
        </div>
    `;

    // Re-attach Event Listeners
    attachDropdownListeners();

    // Attach Post Item listener
    const postItem = document.getElementById('navPostItem');
    if (postItem) {
        postItem.addEventListener('click', (e) => {
            e.preventDefault();
            const btn = document.getElementById('postItemBtn'); // The hidden button or main button
            if (btn) btn.click(); // Trigger existing logic
            else {
                // Fallback if on page without that button
                if (isAuth) {
                    // Redirect or open modal (requires modal logic)
                    window.location.href = 'index.html#post';
                } else {
                    alert('Please login');
                }
            }
        });
    }

    // Attach Login
    const loginBtn = document.getElementById('navLoginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            const mainLogin = document.getElementById('loginBtn');
            if (mainLogin) mainLogin.click();
            else window.location.href = 'index.html#login';
        });
    }

    // Attach Logout
    const logoutBtn = document.getElementById('navLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            await logoutUser();
            window.location.href = 'index.html';
        });
    }
}

function attachDropdownListeners() {
    // Dropdown Toggles
    document.querySelectorAll('.nav-dropdown-trigger').forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const parent = trigger.parentElement;

            // Close others
            document.querySelectorAll('.nav-dropdown').forEach(d => {
                if (d !== parent) d.classList.remove('active');
            });

            parent.classList.toggle('active');
        });
    });

    // Close on click outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.nav-dropdown').forEach(d => {
            d.classList.remove('active');
        });
    });
}
