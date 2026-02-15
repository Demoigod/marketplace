import{g as y,l as k,a as b}from"./auth-JaHXRiaM.js";/* empty css              */async function w(){L(),await x()}function L(){const e=document.querySelector(".menu-toggle"),t=document.querySelector(".nav-links");e&&t&&(e.onclick=()=>{t.classList.toggle("active"),e.textContent=t.classList.contains("active")?"✕":"☰"})}async function x(){const e=document.querySelector(".nav-content");if(!e)return;const t=await y(),a=!!t,l='<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',r='<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',s=a?"market.html":"index.html",d=`
        <div class="dropdown-container" id="browseDropdown">
            <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="Browse Categories">
                ${l}
            </button>
            <div class="dropdown-menu-modern" role="menu" style="display: none;">
                <div class="dropdown-header">Marketplace</div>
                <a href="${s}?category=all" class="menu-item" role="menuitem">
                    All Listings
                </a>
                <a href="${s}?type=free" class="menu-item" role="menuitem">
                    Free Resources
                </a>
                <a href="skills-hub.html" class="menu-item" role="menuitem">
                    Skills Hub
                </a>
                <div class="dropdown-divider"></div>
                <div class="dropdown-header">Categories</div>
                <a href="${s}?category=electronics" class="menu-item" role="menuitem">Electronics</a>
                <a href="${s}?category=books" class="menu-item" role="menuitem">Books</a>
                <a href="${s}?category=furniture" class="menu-item" role="menuitem">Furniture</a>
                <a href="${s}?category=services" class="menu-item" role="menuitem">Services</a>
            </div>
        </div>
    `;let c="";if(a){const i=t.role==="seller";let o="";i?o=`
                 <a href="#" id="navPostItem" class="nav-link">Post Item</a>
                 <a href="admin.html" class="nav-link">Dashboard</a>
                 <a href="skills-hub.html" class="nav-link">Skills Hub</a>
                 <a href="messages.html" class="nav-link">Messages</a>
            `:o=`
                 <a href="market.html" class="nav-link">Browse Marketplace</a>
                 <a href="become-seller.html" class="nav-link">Become a Seller</a>
                 <a href="skills-hub.html" class="nav-link">Learn</a>
                 <a href="messages.html" class="nav-link">Messages</a>
            `,c=`
            <div class="nav-links">
                 ${o}
            </div>
            <div class="dropdown-container" id="profileDropdown" style="margin-left: 8px;">
                 <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="User Menu">
                    ${r}
                </button>
                <div class="dropdown-menu-modern" role="menu" style="display: none;">
                    <div class="dropdown-header">Signed in as <br><span style="color:var(--text-primary);">${t.name||t.username||"User"}</span></div>
                    <div class="dropdown-divider"></div>
                    ${i?'<a href="admin.html" class="menu-item" role="menuitem">Seller Dashboard</a>':""}
                    <a href="account.html" class="menu-item" role="menuitem">Account Settings</a>
                    <button id="menuLogout" class="menu-item danger" role="menuitem">Log out</button>
                </div>
            </div>
        `}else c=`
             <div class="nav-links">
                 <button class="btn-primary" id="navSignupBtn">Sign up</button>
                 <button class="nav-link" id="navLoginBtn" style="border:none; background:none; cursor:pointer;">Log in</button>
             </div>
        `;const u=`
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
    `,m=`
        <div class="nav-search-wrapper">
             <div class="nav-search-bar">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2" />
                    <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <input type="text" id="navSearchInput" placeholder="Search marketplace...">
             </div>
        </div>
    `,n=a?'<button class="menu-toggle">☰</button>':"";e.innerHTML=`
        <div class="nav-left" style="display:flex; align-items:center;">
             ${u}
             <div style="margin-left: 16px;">${d}</div>
        </div>
        
        <div class="nav-center" style="flex: 1; display: flex; justify-content: center; padding: 0 20px;">
             ${m}
        </div>
        
        <div class="nav-right" style="display: flex; align-items: center; gap: 12px;">
             ${c}
             ${n}
        </div>
    `,B()}function B(){document.querySelectorAll(".dropdown-container").forEach(n=>{const i=n.querySelector(".icon-btn"),o=n.querySelector(".dropdown-menu-modern");!i||!o||(i.addEventListener("click",f=>{f.stopPropagation();const h=n.classList.contains("open");v(),h||(n.classList.add("open"),i.setAttribute("aria-expanded","true"),i.classList.add("active"))}),i.addEventListener("keydown",f=>{f.key==="Escape"&&(v(),i.focus())}))}),document.addEventListener("click",n=>{n.target.closest(".dropdown-container")||v()});const t=async()=>{await k(),window.location.href="index.html"},a=document.getElementById("menuLogout");a&&a.addEventListener("click",t);const l=document.getElementById("navLogout");l&&l.addEventListener("click",t);const r=n=>{n.preventDefault(),window.location.pathname.endsWith("index.html")||window.location.pathname.endsWith("/")?document.dispatchEvent(new CustomEvent("open-post-modal")):window.location.href="index.html?action=post"},s=document.getElementById("menuPostItem");s&&s.addEventListener("click",r);const d=document.getElementById("navPostItem");d&&d.addEventListener("click",r);const c=document.getElementById("navLoginBtn");c&&c.addEventListener("click",n=>{var o;n.preventDefault();const i=document.getElementById("authModal");i&&((o=document.querySelector('.auth-tab[data-tab="login"]'))==null||o.click(),i.classList.add("active"))});const u=document.getElementById("navSignupBtn");u&&u.addEventListener("click",n=>{var o;n.preventDefault();const i=document.getElementById("authModal");i&&((o=document.querySelector('.auth-tab[data-tab="register"]'))==null||o.click(),i.classList.add("active"))});const m=document.getElementById("navSearchInput");m&&m.addEventListener("keypress",n=>{n.key==="Enter"&&(document.getElementById("marketplaceGrid")||(window.location.href=`index.html?search=${encodeURIComponent(n.target.value)}`))})}function v(){document.querySelectorAll(".dropdown-container").forEach(e=>{e.classList.remove("open");const t=e.querySelector(".icon-btn");t&&(t.setAttribute("aria-expanded","false"),t.classList.remove("active"))})}const g=[{id:1,title:"Intro to Python Programming",category:"tech",description:"Learn the basics of Python, the most popular language for data science and web dev.",difficulty:"Beginner",icon:"🐍",link:"#",color:"#e0f2fe"},{id:2,title:"Graphic Design Basics",category:"design",description:"Master the fundamentals of composition, color theory, and typography.",difficulty:"Beginner",icon:"🎨",link:"#",color:"#fce7f3"},{id:3,title:"Personal Finance 101",category:"business",description:"Budgeting, saving, and investing tips specifically for students.",difficulty:"Beginner",icon:"💰",link:"#",color:"#dcfce7"},{id:4,title:"Public Speaking Mastery",category:"soft-skills",description:"Overcome fear and deliver impactful presentations in class and beyond.",difficulty:"Intermediate",icon:"🎤",link:"#",color:"#fef3c7"},{id:5,title:"Web Development Bootcamp",category:"tech",description:"Build your first website using HTML, CSS, and modern JavaScript.",difficulty:"Intermediate",icon:"💻",link:"#",color:"#e0f2fe"},{id:6,title:"Study Smarter, Not Harder",category:"academic",description:"Proven techniques to improve memory retention and ace your exams.",difficulty:"Beginner",icon:"🧠",link:"#",color:"#f3e8ff"},{id:7,title:"Digital Marketing Essentials",category:"business",description:"Learn how to market yourself and products in the digital age.",difficulty:"Beginner",icon:"📱",link:"#",color:"#dcfce7"},{id:8,title:"Advanced Excel for Business",category:"tech",description:"Pivot tables, VLOOKUPs, and macros to boost your productivity.",difficulty:"Advanced",icon:"📊",link:"#",color:"#e0f2fe"}];document.addEventListener("DOMContentLoaded",async()=>{if(!await b()){window.location.href="index.html";return}await w(),p(g),E()});function p(e){const t=document.getElementById("skillsGrid");if(t){if(e.length===0){t.innerHTML='<p class="empty-state">No skills found in this category.</p>';return}t.innerHTML=e.map(a=>S(a)).join("")}}function S(e){let t="diff-beginner";return e.difficulty==="Intermediate"&&(t="diff-intermediate"),e.difficulty==="Advanced"&&(t="diff-advanced"),`
        <div class="skill-card">
            <div class="skill-cover" style="background: linear-gradient(135deg, ${e.color} 0%, #ffffff 100%);">
                <div class="skill-icon-lg">${e.icon}</div>
            </div>
            <div class="skill-content">
                <div class="skill-category">${e.category.replace("-"," ")}</div>
                <h3 class="skill-title">${e.title}</h3>
                <p class="skill-desc">${e.description}</p>
                
                <div class="skill-meta">
                    <div class="skill-difficulty ${t}">
                        <div class="diff-dot"></div>
                        ${e.difficulty}
                    </div>
                    <a href="${e.link}" class="skill-action">Start Learning</a>
                </div>
            </div>
        </div>
    `}function E(){const e=document.querySelectorAll(".skill-tab");e.forEach(t=>{t.addEventListener("click",()=>{e.forEach(l=>l.classList.remove("active")),t.classList.add("active");const a=t.dataset.category;if(a==="all")p(g);else{const l=g.filter(r=>r.category===a);p(l)}})})}
//# sourceMappingURL=skills-hub-BKJimZID.js.map
