import{g as E,l as D,i as m,s as g,a as q,r as T,b as $}from"./auth-BNhlD6S9.js";/* empty css               */import{i as F,f as N,c as k}from"./save-item-CqwqWcBg.js";async function P(){R(),await _()}function R(){const n=document.querySelector(".menu-toggle"),e=document.querySelector(".nav-links");n&&e&&(n.onclick=()=>{e.classList.toggle("active"),n.textContent=e.classList.contains("active")?"✕":"☰"})}async function _(){const n=document.querySelector(".nav-content");if(!n)return;const e=await E(),t=!!e,o='<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',s='<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',a=`
        <div class="dropdown-container" id="browseDropdown">
            <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="Browse Categories">
                ${o}
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
    `;let c="";t?(e.role,c=`
            <div class="nav-links">
                 <a href="#" id="navPostItem" class="nav-link">Post Item</a>
                 <a href="admin.html" class="nav-link">Dashboard</a>
                 <a href="messages.html" class="nav-link">Messages</a>
            </div>
            <div class="dropdown-container" id="profileDropdown" style="margin-left: 8px;">
                 <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="User Menu">
                    ${s}
                </button>
                <div class="dropdown-menu-modern" role="menu" style="display: none;">
                    <div class="dropdown-header">Signed in as <br><span style="color:var(--text-primary);">${e.name||"User"}</span></div>
                    <div class="dropdown-divider"></div>
                    <a href="admin.html" class="menu-item" role="menuitem">Control Center</a>
                    <button id="menuLogout" class="menu-item danger" role="menuitem">Log out</button>
                </div>
            </div>
        `):c=`
             <div class="nav-links">
                 <button class="btn-primary" id="navSignupBtn">Sign up</button>
                 <button class="nav-link" id="navLoginBtn" style="border:none; background:none; cursor:pointer;">Log in</button>
             </div>
        `;const p=`
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
    `,v=`
        <div class="nav-search-wrapper">
             <div class="nav-search-bar">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2" />
                    <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <input type="text" id="navSearchInput" placeholder="Search marketplace...">
             </div>
        </div>
    `,h=t?'<button class="menu-toggle">☰</button>':"";n.innerHTML=`
        <div class="nav-left" style="display:flex; align-items:center;">
             ${p}
             <div style="margin-left: 16px;">${a}</div>
        </div>
        
        <div class="nav-center" style="flex: 1; display: flex; justify-content: center; padding: 0 20px;">
             ${v}
        </div>
        
        <div class="nav-right" style="display: flex; align-items: center; gap: 12px;">
             ${c}
             ${h}
        </div>
    `,U()}function U(){document.querySelectorAll(".dropdown-container").forEach(r=>{const i=r.querySelector(".icon-btn"),d=r.querySelector(".dropdown-menu-modern");!i||!d||(i.addEventListener("click",f=>{f.stopPropagation();const H=r.classList.contains("open");y(),H||(r.classList.add("open"),i.setAttribute("aria-expanded","true"),i.classList.add("active"))}),i.addEventListener("keydown",f=>{f.key==="Escape"&&(y(),i.focus())}))}),document.addEventListener("click",r=>{r.target.closest(".dropdown-container")||y()});const e=async()=>{await D(),window.location.href="index.html"},t=document.getElementById("menuLogout");t&&t.addEventListener("click",e);const o=document.getElementById("navLogout");o&&o.addEventListener("click",e);const s=r=>{r.preventDefault(),window.location.pathname.endsWith("index.html")||window.location.pathname.endsWith("/")?document.dispatchEvent(new CustomEvent("open-post-modal")):window.location.href="index.html?action=post"},a=document.getElementById("menuPostItem");a&&a.addEventListener("click",s);const c=document.getElementById("navPostItem");c&&c.addEventListener("click",s);const p=document.getElementById("navLoginBtn");p&&p.addEventListener("click",r=>{var d;r.preventDefault();const i=document.getElementById("authModal");i&&((d=document.querySelector('.auth-tab[data-tab="login"]'))==null||d.click(),i.classList.add("active"))});const v=document.getElementById("navSignupBtn");v&&v.addEventListener("click",r=>{var d;r.preventDefault();const i=document.getElementById("authModal");i&&((d=document.querySelector('.auth-tab[data-tab="register"]'))==null||d.click(),i.classList.add("active"))});const h=document.getElementById("navSearchInput");h&&h.addEventListener("keypress",r=>{r.key==="Enter"&&(document.getElementById("marketplaceGrid")||(window.location.href=`index.html?search=${encodeURIComponent(r.target.value)}`))})}function y(){document.querySelectorAll(".dropdown-container").forEach(n=>{n.classList.remove("open");const e=n.querySelector(".icon-btn");e&&(e.setAttribute("aria-expanded","false"),e.classList.remove("active"))})}let w="all",M=[];const L=document.getElementById("uploadModal");document.getElementById("resourceModal");const B=document.getElementById("authModal");document.getElementById("postItemBtn");document.getElementById("uploadResourceBtn");document.getElementById("uploadForm");const I=document.getElementById("resourceForm"),x=document.getElementById("loginForm"),b=document.getElementById("registerForm"),G=document.getElementById("searchInput"),l=document.getElementById("marketplaceGrid"),u=document.getElementById("resourcesGrid");document.getElementById("loginBtn");document.getElementById("dashboardLink");document.addEventListener("DOMContentLoaded",async()=>{if(await P(),await j(),await m()){window.location.href="admin.html";return}S(),C(),F(),new URLSearchParams(window.location.search).get("action")==="post"&&setTimeout(()=>{document.dispatchEvent(new CustomEvent("open-post-modal"))},800),V(),g.auth.onAuthStateChange((t,o)=>{t==="SIGNED_OUT"?window.location.href="index.html":t==="SIGNED_IN"&&window.location.pathname.endsWith("index.html")&&(window.location.href="admin.html")})});async function j(){const n=await E(),e=document.getElementById("heroAuthCtas");n?e&&(e.style.display="none"):(e&&(e.style.display="flex"),z())}function z(){const n=document.getElementById("heroSignupBtn"),e=document.getElementById("heroLoginBtn"),t=document.getElementById("authModal");n&&t&&(n.onclick=()=>{var o;(o=document.querySelector('.auth-tab[data-tab="register"]'))==null||o.click(),t.classList.add("active")}),e&&(e.onclick=()=>{const o=document.getElementById("marketplace");o&&o.scrollIntoView({behavior:"smooth"})})}async function S(){const n=await m(),e=await N();l&&(e&&e.length>0?l.innerHTML=e.map(t=>k(t,n)).join(""):l.innerHTML='<p class="empty-state">No items found. Be the first to post!</p>')}document.addEventListener("item-posted",S);async function C(){if(u)try{const{data:n,error:e}=await g.from("free_resources").select("*").order("created_at",{ascending:!1});if(e)throw e;M=n||[],A()}catch(n){console.error("Error fetching resources:",n.message),u.innerHTML='<p class="error-state">Failed to load resources.</p>'}}function A(){if(!u)return;const n=M.filter(e=>w==="all"?!0:e.type===w);if(n.length===0){u.innerHTML='<p class="empty-state">No resources found.</p>';return}u.innerHTML=n.map(e=>O(e)).join("")}function O(n){const e={exam:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/></svg>',textbook:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/></svg>',notes:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2"/></svg>'};return`
        <div class="resource-card" data-id="${n.id}">
            <div class="resource-header">
                <div class="resource-icon">
                    ${e[n.type]||e.exam}
                </div>
                <div class="resource-info">
                    <span class="resource-type">${n.type}</span>
                    <h3 class="resource-title">${n.title}</h3>
                    <p class="resource-course">${n.course}</p>
                </div>
            </div>
            <div class="resource-meta">
                <span class="resource-year">${n.year}</span>
                <button class="download-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 11V3M8 11L5 8M8 11L11 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 13H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Download
                </button>
            </div>
        </div>
    `}function V(){const n=document.getElementById("navSearchInput")||G;n&&n.addEventListener("input",Z(J,300)),document.querySelectorAll(".category-chip").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".category-chip").forEach(s=>s.classList.remove("active")),t.classList.add("active");const o=t.dataset.category;K(o)})}),document.querySelectorAll(".resource-chip").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".resource-chip").forEach(o=>o.classList.remove("active")),t.classList.add("active"),w=t.dataset.type,A()})}),x&&x.addEventListener("submit",async t=>{t.preventDefault();const o=document.getElementById("loginEmail").value,s=document.getElementById("loginPassword").value,a=await q(o,s);a.success?window.location.href="admin.html":alert(a.message)}),b&&b.addEventListener("submit",async t=>{t.preventDefault();const o={firstName:document.getElementById("registerFirstName").value,lastName:document.getElementById("registerLastName").value,username:document.getElementById("registerUsername").value,phone:document.getElementById("registerPhone").value,role:document.getElementById("registerRole").value},s=document.getElementById("registerEmail").value,a=document.getElementById("registerPassword").value,c=await T(s,a,o);c.success?window.location.href="admin.html":alert(c.message)}),I&&I.addEventListener("submit",W),l&&l.addEventListener("click",async t=>{const o=t.target.closest("button");if(!o)return;const s=o.dataset.action,a=o.dataset.id;if(s==="buy")window.location.href=`payment.html?item_id=${a}`;else if(s==="contact"){const c=o.dataset.sellerId;window.location.href=`messages.html?partner_id=${c}`}else s==="view"&&(await m()?window.location.href=`item.html?id=${a}`:document.dispatchEvent(new CustomEvent("open-auth-modal")))}),u&&u.addEventListener("click",t=>{const o=t.target.closest(".download-btn");if(o){const s=o.closest(".resource-card");s&&Y(s.dataset.id)}}),document.addEventListener("open-auth-modal",()=>{B&&B.classList.add("active")}),document.addEventListener("open-post-modal",()=>{L&&L.classList.add("active")}),document.querySelectorAll(".modal-close").forEach(t=>{t.addEventListener("click",()=>{document.querySelectorAll(".modal").forEach(o=>o.classList.remove("active"))})}),window.addEventListener("click",t=>{t.target.classList.contains("modal")&&t.target.classList.remove("active")});const e=document.querySelectorAll(".auth-tab");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(s=>s.classList.remove("active")),t.classList.add("active"),t.dataset.tab==="login"?(document.getElementById("loginForm").style.display="block",document.getElementById("registerForm").style.display="none",document.getElementById("authModalTitle").textContent="Login"):(document.getElementById("loginForm").style.display="none",document.getElementById("registerForm").style.display="block",document.getElementById("authModalTitle").textContent="Register")})})}async function W(n){if(n.preventDefault(),!await m()){alert("Please login to upload resources.");return}const e=await E(),t={title:document.getElementById("resourceTitle").value,type:document.getElementById("resourceType").value,course:document.getElementById("resourceCourse").value,year:parseInt(document.getElementById("resourceYear").value)||new Date().getFullYear(),description:document.getElementById("resourceDescription").value,uploader_id:e.id},{error:o}=await g.from("free_resources").insert([t]);o?alert("Error uploading resource: "+o.message):(alert("Resource uploaded!"),document.getElementById("resourceModal").classList.remove("active"),C())}async function Y(n){if(!await m()){document.dispatchEvent(new CustomEvent("open-auth-modal"));return}await $({id:n}),alert("Download started!")}function Z(n,e){let t;return function(...o){clearTimeout(t),t=setTimeout(()=>n.apply(this,o),e)}}async function J(n){const e=n.target.value.toLowerCase(),{data:t,error:o}=await g.from("market_listings").select(`
            *,
            profiles (
                username,
                full_name
            )
        `).or(`title.ilike.%${e}%,description.ilike.%${e}%`).eq("status","active");o&&console.error("Search error:",o);const s=await m();l&&(l.innerHTML=(t||[]).map(a=>k(a,s)).join(""))}async function K(n){const e=await m(),{data:t,error:o}=await g.from("market_listings").select(`
            *,
            profiles (
                username,
                full_name
            )
        `).eq("status","active").order("created_at",{ascending:!1});o&&console.error("Filter error:",o);const s=n==="all"?t:(t||[]).filter(a=>a.category===n);l&&(l.innerHTML=(s||[]).map(a=>k(a,e)).join(""))}
