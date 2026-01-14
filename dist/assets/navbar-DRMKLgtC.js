import{g as h,b as f}from"./auth-C6Z0jTos.js";async function b(){y(),await w()}function y(){const o=document.querySelector(".menu-toggle"),t=document.querySelector(".nav-links");o&&t&&(o.onclick=()=>{t.classList.toggle("active"),o.textContent=t.classList.contains("active")?"✕":"☰"})}async function w(){const o=document.querySelector(".nav-content");if(!o)return;const t=await h(),s=!!t,r='<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',l='<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',c=`
        <div class="dropdown-container" id="browseDropdown">
            <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="Browse Categories">
                ${r}
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
    `;let i="";s?(t.role,i=`
            <div class="nav-links">
                 <a href="#" id="navPostItem" class="nav-link">Post Item</a>
                 <a href="admin.html" class="nav-link">Dashboard</a>
                 <a href="messages.html" class="nav-link">Messages</a>
            </div>
            <div class="dropdown-container" id="profileDropdown" style="margin-left: 8px;">
                 <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="User Menu">
                    ${l}
                </button>
                <div class="dropdown-menu-modern" role="menu" style="display: none;">
                    <div class="dropdown-header">Signed in as <br><span style="color:var(--text-primary);">${t.name||"User"}</span></div>
                    <div class="dropdown-divider"></div>
                    <a href="admin.html" class="menu-item" role="menuitem">Control Center</a>
                    <button id="menuLogout" class="menu-item danger" role="menuitem">Log out</button>
                </div>
            </div>
        `):i=`
             <div class="nav-links">
                 <button class="btn-primary" id="navSignupBtn">Sign up</button>
                 <button class="nav-link" id="navLoginBtn" style="border:none; background:none; cursor:pointer;">Log in</button>
             </div>
        `;const d=`
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
    `,u=`
        <div class="nav-search-wrapper">
             <div class="nav-search-bar">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2" />
                    <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <input type="text" id="navSearchInput" placeholder="Search marketplace...">
             </div>
        </div>
    `,m=s?'<button class="menu-toggle">☰</button>':"";o.innerHTML=`
        <div class="nav-left" style="display:flex; align-items:center;">
             ${d}
             <div style="margin-left: 16px;">${c}</div>
        </div>
        
        <div class="nav-center" style="flex: 1; display: flex; justify-content: center; padding: 0 20px;">
             ${u}
        </div>
        
        <div class="nav-right" style="display: flex; align-items: center; gap: 12px;">
             ${i}
             ${m}
        </div>
    `,x()}function x(){document.querySelectorAll(".dropdown-container").forEach(e=>{const n=e.querySelector(".icon-btn"),a=e.querySelector(".dropdown-menu-modern");!n||!a||(n.addEventListener("click",v=>{v.stopPropagation();const g=e.classList.contains("open");p(),g||(e.classList.add("open"),n.setAttribute("aria-expanded","true"),n.classList.add("active"))}),n.addEventListener("keydown",v=>{v.key==="Escape"&&(p(),n.focus())}))}),document.addEventListener("click",e=>{e.target.closest(".dropdown-container")||p()});const t=async()=>{await f(),window.location.href="index.html"},s=document.getElementById("menuLogout");s&&s.addEventListener("click",t);const r=document.getElementById("navLogout");r&&r.addEventListener("click",t);const l=e=>{e.preventDefault(),window.location.pathname.endsWith("index.html")||window.location.pathname.endsWith("/")?document.dispatchEvent(new CustomEvent("open-post-modal")):window.location.href="index.html?action=post"},c=document.getElementById("menuPostItem");c&&c.addEventListener("click",l);const i=document.getElementById("navPostItem");i&&i.addEventListener("click",l);const d=document.getElementById("navLoginBtn");d&&d.addEventListener("click",e=>{var a;e.preventDefault();const n=document.getElementById("authModal");n&&((a=document.querySelector('.auth-tab[data-tab="login"]'))==null||a.click(),n.classList.add("active"))});const u=document.getElementById("navSignupBtn");u&&u.addEventListener("click",e=>{var a;e.preventDefault();const n=document.getElementById("authModal");n&&((a=document.querySelector('.auth-tab[data-tab="register"]'))==null||a.click(),n.classList.add("active"))});const m=document.getElementById("navSearchInput");m&&m.addEventListener("keypress",e=>{e.key==="Enter"&&(document.getElementById("marketplaceGrid")||(window.location.href=`index.html?search=${encodeURIComponent(e.target.value)}`))})}function p(){document.querySelectorAll(".dropdown-container").forEach(o=>{o.classList.remove("open");const t=o.querySelector(".icon-btn");t&&(t.setAttribute("aria-expanded","false"),t.classList.remove("active"))})}export{b as i};
