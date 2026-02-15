import{s as d,c as R,g as D,l as N,i as T}from"./auth-JaHXRiaM.js";async function G(){var e,t,r,a,n;try{console.log("APP_DEBUG: getCurrentUser called");const{data:{user:s}}=await d.auth.getUser();if(!s)return null;const{data:i,error:u}=await d.from("profiles").select("*, role").eq("id",s.id).maybeSingle();let o={...s};u?(console.warn("Error fetching profile:",u.message),o={...s,role:"user"}):i?o={...s,...i}:(console.warn("Profile missing for user, using default"),o={...s,role:"user"});let h=[],m=[],l=[],g=[],p=[],v=[];try{[h,m,l,g,p,v]=await Promise.all([d.from("purchases").select("*").eq("buyer_id",s.id).order("purchase_date",{ascending:!1}).then(c=>c.data||[]),d.from("market_listings").select("*").eq("seller_id",s.id).order("created_at",{ascending:!1}).then(c=>c.data||[]),d.from("market_listings").select("id").eq("seller_id",s.id).then(c=>c.data||[]),d.from("downloads").select("*, resource:free_resources(*)").eq("user_id",s.id).order("download_date",{ascending:!1}).then(c=>c.data||[]),d.from("saved_items").select("*").eq("profile_id",s.id).then(c=>c.data||[]),d.from("free_resources").select("*").eq("uploader_id",s.id).order("created_at",{ascending:!1}).then(c=>c.data||[])])}catch(f){console.warn("Error fetching supplementary activity data:",f.message)}let I=[];try{if(l&&l.length>0){const f=l.map(_=>_.id),{data:c}=await d.from("purchases").select("*").in("item_id",f);I=c||[]}}catch(f){console.warn("Could not fetch sales data:",f.message)}return{...o,id:s.id,first_name:o.first_name||((e=s.user_metadata)==null?void 0:e.first_name)||"",last_name:o.last_name||((t=s.user_metadata)==null?void 0:t.last_name)||"",username:o.username||((r=s.user_metadata)==null?void 0:r.username)||((a=s.user_metadata)==null?void 0:a.name)||"User",email:o.email||s.email||"",phone:o.phone||((n=s.user_metadata)==null?void 0:n.phone)||"",role:o.role||"user",immutable_user_code:o.immutable_user_code||null,purchases:h,listings:m,sales:I,downloads:g,savedItems:p,uploadedResources:v}}catch(s){return console.error("Get user error:",s.message),null}}async function j(){try{await G()?window.location.replace("market.html"):document.body.style.display="block"}catch(e){console.error("Auth check failed",e),document.body.style.display="block"}}j();const V="https://dkswceahtpiiqnhfuytm.supabase.co",z="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrc3djZWFodHBpaXFuaGZ1eXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc4MTY1NTcsImV4cCI6MjA4MzM5MjU1N30.j5V6wx9KfFJb7R_KoaD-iOFvIC9kYZ4JC-vp3uMccj4",k=R(V,z);async function O(e,t,r){try{const{firstName:a,lastName:n,username:s,phone:i,role:u}=r,{data:o,error:h}=await d.auth.signUp({email:e,password:t,options:{data:{first_name:a,last_name:n,username:s,phone:i,username:s,phone:i,role:u||"user"}}});if(h)throw h;return o.session?{success:!0,message:"Registration successful!",user:o.user}:{success:!0,message:"Registration successful! Please check your email for verification.",user:o.user}}catch(a){return console.error("Registration error:",a.message),{success:!1,message:a.message}}}async function J(e,t){try{const{data:r,error:a}=await d.auth.signInWithPassword({email:e,password:t});if(a)throw a;return{success:!0,message:"Login successful",user:r.user}}catch(r){return console.error("Login error:",r.message),{success:!1,message:r.message}}}async function W(){const{data:{session:e},error:t}=await d.auth.getSession();return t?(console.error("Session error:",t.message),null):e}async function E(){return!!await W()}async function b(){var e,t,r,a,n;try{console.log("APP_DEBUG: getCurrentUser called");const{data:{user:s}}=await d.auth.getUser();if(!s)return null;const{data:i,error:u}=await d.from("profiles").select("*, role").eq("id",s.id).maybeSingle();let o={...s};u?(console.warn("Error fetching profile:",u.message),o={...s,role:"user"}):i?o={...s,...i}:(console.warn("Profile missing for user, using default"),o={...s,role:"user"});let h=[],m=[],l=[],g=[],p=[],v=[];try{[h,m,l,g,p,v]=await Promise.all([d.from("purchases").select("*").eq("buyer_id",s.id).order("purchase_date",{ascending:!1}).then(c=>c.data||[]),d.from("market_listings").select("*").eq("seller_id",s.id).order("created_at",{ascending:!1}).then(c=>c.data||[]),d.from("market_listings").select("id").eq("seller_id",s.id).then(c=>c.data||[]),d.from("downloads").select("*, resource:free_resources(*)").eq("user_id",s.id).order("download_date",{ascending:!1}).then(c=>c.data||[]),d.from("saved_items").select("*").eq("profile_id",s.id).then(c=>c.data||[]),d.from("free_resources").select("*").eq("uploader_id",s.id).order("created_at",{ascending:!1}).then(c=>c.data||[])])}catch(f){console.warn("Error fetching supplementary activity data:",f.message)}let I=[];try{if(l&&l.length>0){const f=l.map(_=>_.id),{data:c}=await d.from("purchases").select("*").in("item_id",f);I=c||[]}}catch(f){console.warn("Could not fetch sales data:",f.message)}return{...o,id:s.id,first_name:o.first_name||((e=s.user_metadata)==null?void 0:e.first_name)||"",last_name:o.last_name||((t=s.user_metadata)==null?void 0:t.last_name)||"",username:o.username||((r=s.user_metadata)==null?void 0:r.username)||((a=s.user_metadata)==null?void 0:a.name)||"User",email:o.email||s.email||"",phone:o.phone||((n=s.user_metadata)==null?void 0:n.phone)||"",role:o.role||"user",immutable_user_code:o.immutable_user_code||null,purchases:h,listings:m,sales:I,downloads:g,savedItems:p,uploadedResources:v}}catch(s){return console.error("Get user error:",s.message),null}}async function Z(e){try{const{data:{user:t}}=await d.auth.getUser();if(!t)throw new Error("Not logged in");const{data:r,error:a}=await d.from("downloads").insert([{user_id:t.id,resource_id:e.id}]).select().single();if(a)throw a;return await d.rpc("increment_resource_downloads",{resource_id:e.id}),{success:!0,message:"Download recorded",download:r}}catch(t){return console.error("Add download error:",t.message),{success:!1,message:t.message}}}async function Y(){X(),await K()}function X(){const e=document.querySelector(".menu-toggle"),t=document.querySelector(".nav-links");e&&t&&(e.onclick=()=>{t.classList.toggle("active"),e.textContent=t.classList.contains("active")?"✕":"☰"})}async function K(){const e=document.querySelector(".nav-content");if(!e)return;const t=await D(),r=!!t,a='<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>',n='<svg class="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',s=r?"market.html":"index.html",i=`
        <div class="dropdown-container" id="browseDropdown">
            <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="Browse Categories">
                ${a}
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
    `;let u="";if(r){const l=t.role==="seller";let g="";l?g=`
                 <a href="#" id="navPostItem" class="nav-link">Post Item</a>
                 <a href="admin.html" class="nav-link">Dashboard</a>
                 <a href="skills-hub.html" class="nav-link">Skills Hub</a>
                 <a href="messages.html" class="nav-link">Messages</a>
            `:g=`
                 <a href="market.html" class="nav-link">Browse Marketplace</a>
                 <a href="become-seller.html" class="nav-link">Become a Seller</a>
                 <a href="skills-hub.html" class="nav-link">Learn</a>
                 <a href="messages.html" class="nav-link">Messages</a>
            `,u=`
            <div class="nav-links">
                 ${g}
            </div>
            <div class="dropdown-container" id="profileDropdown" style="margin-left: 8px;">
                 <button class="icon-btn" aria-expanded="false" aria-haspopup="true" aria-label="User Menu">
                    ${n}
                </button>
                <div class="dropdown-menu-modern" role="menu" style="display: none;">
                    <div class="dropdown-header">Signed in as <br><span style="color:var(--text-primary);">${t.name||t.username||"User"}</span></div>
                    <div class="dropdown-divider"></div>
                    ${l?'<a href="admin.html" class="menu-item" role="menuitem">Seller Dashboard</a>':""}
                    <a href="account.html" class="menu-item" role="menuitem">Account Settings</a>
                    <button id="menuLogout" class="menu-item danger" role="menuitem">Log out</button>
                </div>
            </div>
        `}else u=`
             <div class="nav-links">
                 <button class="btn-primary" id="navSignupBtn">Sign up</button>
                 <button class="nav-link" id="navLoginBtn" style="border:none; background:none; cursor:pointer;">Log in</button>
             </div>
        `;const o=`
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
    `,h=`
        <div class="nav-search-wrapper">
             <div class="nav-search-bar">
                <svg class="search-icon" width="18" height="18" viewBox="0 0 20 20" fill="none">
                    <circle cx="9" cy="9" r="6" stroke="currentColor" stroke-width="2" />
                    <path d="M14 14L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                </svg>
                <input type="text" id="navSearchInput" placeholder="Search marketplace...">
             </div>
        </div>
    `,m=r?'<button class="menu-toggle">☰</button>':"";e.innerHTML=`
        <div class="nav-left" style="display:flex; align-items:center;">
             ${o}
             <div style="margin-left: 16px;">${i}</div>
        </div>
        
        <div class="nav-center" style="flex: 1; display: flex; justify-content: center; padding: 0 20px;">
             ${h}
        </div>
        
        <div class="nav-right" style="display: flex; align-items: center; gap: 12px;">
             ${u}
             ${m}
        </div>
    `,Q()}function Q(){document.querySelectorAll(".dropdown-container").forEach(m=>{const l=m.querySelector(".icon-btn"),g=m.querySelector(".dropdown-menu-modern");!l||!g||(l.addEventListener("click",p=>{p.stopPropagation();const v=m.classList.contains("open");L(),v||(m.classList.add("open"),l.setAttribute("aria-expanded","true"),l.classList.add("active"))}),l.addEventListener("keydown",p=>{p.key==="Escape"&&(L(),l.focus())}))}),document.addEventListener("click",m=>{m.target.closest(".dropdown-container")||L()});const t=async()=>{await N(),window.location.href="index.html"},r=document.getElementById("menuLogout");r&&r.addEventListener("click",t);const a=document.getElementById("navLogout");a&&a.addEventListener("click",t);const n=m=>{m.preventDefault(),window.location.pathname.endsWith("index.html")||window.location.pathname.endsWith("/")?document.dispatchEvent(new CustomEvent("open-post-modal")):window.location.href="index.html?action=post"},s=document.getElementById("menuPostItem");s&&s.addEventListener("click",n);const i=document.getElementById("navPostItem");i&&i.addEventListener("click",n);const u=document.getElementById("navLoginBtn");u&&u.addEventListener("click",m=>{var g;m.preventDefault();const l=document.getElementById("authModal");l&&((g=document.querySelector('.auth-tab[data-tab="login"]'))==null||g.click(),l.classList.add("active"))});const o=document.getElementById("navSignupBtn");o&&o.addEventListener("click",m=>{var g;m.preventDefault();const l=document.getElementById("authModal");l&&((g=document.querySelector('.auth-tab[data-tab="register"]'))==null||g.click(),l.classList.add("active"))});const h=document.getElementById("navSearchInput");h&&h.addEventListener("keypress",m=>{m.key==="Enter"&&(document.getElementById("marketplaceGrid")||(window.location.href=`index.html?search=${encodeURIComponent(m.target.value)}`))})}function L(){document.querySelectorAll(".dropdown-container").forEach(e=>{e.classList.remove("open");const t=e.querySelector(".icon-btn");t&&(t.setAttribute("aria-expanded","false"),t.classList.remove("active"))})}async function ee(){try{if(await E()){console.log("Fetching items with profile data (authenticated)...");const{data:a,error:n}=await k.from("market_listings").select(`
                    *,
                    profiles (
                        username,
                        full_name,
                        immutable_user_code
                    )
                `).eq("status","active").order("created_at",{ascending:!1});if(!n)return console.log("Successfully fetched items with profiles:",a==null?void 0:a.length),a||[];console.warn("Profile join failed for authenticated user, using fallback:",n)}else console.log("Fetching items without profile data (public user)...");const{data:t,error:r}=await k.from("market_listings").select("*").eq("status","active").order("created_at",{ascending:!1});if(r)throw console.error("Failed to fetch marketplace items:",r),r;return console.log("Successfully fetched public items:",t==null?void 0:t.length),t||[]}catch(e){return console.error("Critical items fetch error:",e),[]}}function P(e,t=!1){const r=new Date(e.created_at).toLocaleDateString();let a=e.image_url;return!a&&e.images&&e.images.length>0&&(a=e.images[0]),a||(a="https://placehold.co/300x200?text=No+Image"),t?te(e,a,r):se(e,a,r)}function te(e,t,r){var s,i,u;const a=((s=e.profiles)==null?void 0:s.username)||((i=e.profiles)==null?void 0:i.full_name)||"Anonymous",n=((u=e.profiles)==null?void 0:u.immutable_user_code)||(e.seller_id?e.seller_id.slice(0,6).toUpperCase():"N/A");return`
        <div class="marketplace-item" data-id="${e.id}" data-user-id="${e.seller_id}">
            <div class="item-image" style="background-image: url('${t}');"></div>
            <div class="item-content">
                <h3 class="item-title">${x(e.title||"Untitled Item")}</h3>
                <div class="item-price">R ${parseFloat(e.price||0).toLocaleString()}</div>
                
                <div class="item-meta" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span style="font-weight: 700;">${x(a)}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); padding-left: 1.4rem;">Posted by User ID: ${n}</span>
                </div>
                
                <div class="item-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Posted on ${r}</span>
                </div>
                <div class="item-directions">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>Directions Available</span>
                </div>
                
                <div class="item-actions" style="margin-top: auto; display: flex; gap: 0.5rem;">
                    <button class="btn-view-item" data-action="view" data-id="${e.id}" style="flex:1;">View Info</button>
                    <button class="btn-view-item contact-seller-btn" 
                            data-seller-id="${e.seller_id}" 
                            data-listing-id="${e.id}"
                            style="flex:1; background:transparent; color:var(--primary-color); border-color:var(--primary-color);">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    `}function se(e,t,r){return`
        <div class="marketplace-item public-view" data-id="${e.id}">
            <div class="item-image" style="background-image: url('${t}');"></div>
            <div class="item-content">
                <h3 class="item-title">${x(e.title||"Untitled Item")}</h3>
                <div class="item-price">R ${parseFloat(e.price||0).toLocaleString()}</div>
                
                <div class="item-meta" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span style="font-weight: 700; color: var(--text-muted);">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Registered User
                        </span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); padding-left: 1.4rem;">
                        <a href="#" onclick="event.preventDefault(); document.getElementById('authModal')?.classList.add('active');" style="color: var(--primary-color); text-decoration: underline;">
                            Login to view seller
                        </a>
                    </span>
                </div>
                
                <div class="item-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Posted on ${r}</span>
                </div>
                <div class="item-directions">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>Category: ${x(e.category||"General")}</span>
                </div>
                
                <div class="item-actions" style="margin-top: auto; display: flex; gap: 0.5rem;">
                    <button class="btn-view-item" data-action="view" data-id="${e.id}" style="flex:1;">View Details</button>
                    <button class="btn-view-item" 
                            onclick="event.preventDefault(); document.getElementById('authModal')?.classList.add('active'); document.querySelector('.auth-tab[data-tab=\\'login\\']')?.click();"
                            style="flex:1; background:transparent; color:var(--primary-color); border-color:var(--primary-color); position: relative;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px;">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Login to Contact
                    </button>
                </div>
            </div>
        </div>
    `}function x(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function ae(e){if(!await T()){alert("Please log in to save items."),document.dispatchEvent(new CustomEvent("open-auth-modal"));return}const t=await D();if(t)try{const{data:r,error:a}=await d.from("saved_items").select("id").eq("user_id",t.id).eq("item_id",e).maybeSingle();if(a)throw a;if(r){const{error:n}=await d.from("saved_items").delete().eq("id",r.id);if(n)throw n;return{saved:!1,message:"Item removed from bookmarks"}}else{const{error:n}=await d.from("saved_items").insert([{user_id:t.id,item_id:e}]);if(n)throw n;return{saved:!0,message:"Item saved successfully!"}}}catch(r){throw console.error("Save error:",r),r}}function re(){document.addEventListener("click",async e=>{if(e.target.classList.contains("btn-save")){const t=e.target.dataset.itemId,r=e.target;r.disabled=!0;try{const a=await ae(t);r.classList.toggle("active",a.saved),r.textContent=a.saved?"Saved":"Save",console.log(a.message)}catch{alert("Failed to save item.")}finally{r.disabled=!1}}})}console.log("APP_DEBUG: main.js LOADED - NUCLEAR VERSION V1 [TIMESTAMP: "+new Date().toISOString()+"]");let B="all",U=[];const C=document.getElementById("uploadModal");document.getElementById("resourceModal");const M=document.getElementById("authModal");document.getElementById("postItemBtn");document.getElementById("uploadResourceBtn");document.getElementById("uploadForm");const $=document.getElementById("resourceForm"),A=document.getElementById("loginForm"),q=document.getElementById("registerForm");document.getElementById("searchInput");const y=document.getElementById("marketplaceGrid"),w=document.getElementById("resourcesGrid");document.getElementById("loginBtn");document.getElementById("dashboardLink");document.addEventListener("DOMContentLoaded",async()=>{await Y(),await ne(),console.log("APP_DEBUG: Script.js loaded."),document.getElementById("marketplaceGrid")&&S(),document.getElementById("resourcesGrid")&&H(),re(),new URLSearchParams(window.location.search).get("action")==="post"&&setTimeout(()=>{document.dispatchEvent(new CustomEvent("open-post-modal"))},800),le(),k.auth.onAuthStateChange(async(t,r)=>{if(t==="SIGNED_OUT")window.location.href="index.html";else if(t==="SIGNED_IN"){await b();const a=window.location.pathname;(a.endsWith("index.html")||a.endsWith("/")||a==="/")&&(window.location.href="market.html")}})});async function ne(){const e=await b(),t=document.querySelector(".landing-hero"),r=document.querySelector(".trust-section"),a=document.querySelector(".how-it-works"),n=document.getElementById("heroAuthCtas");e?(t&&(t.style.display="none"),r&&(r.style.display="none"),a&&(a.style.display="none"),n&&(n.style.display="none")):(t&&(t.style.display="block"),r&&(r.style.display="block"),a&&(a.style.display="block"),n&&(n.style.display="flex"),oe())}function oe(){const e=document.getElementById("heroSignupBtn"),t=document.getElementById("heroLoginBtn"),r=document.getElementById("authModal");e&&r&&(e.onclick=()=>{var a;(a=document.querySelector('.auth-tab[data-tab="register"]'))==null||a.click(),r.classList.add("active")}),t&&(t.onclick=()=>{const a=document.getElementById("marketplace");a&&a.scrollIntoView({behavior:"smooth"})})}async function S(){const e=await E(),t=await ee();y&&(t&&t.length>0?y.innerHTML=t.map(r=>P(r,e)).join(""):y.innerHTML='<p class="empty-state">No items found. Be the first to post!</p>')}document.addEventListener("item-posted",S);async function H(){if(w)try{const{data:e,error:t}=await k.from("free_resources").select("*").order("created_at",{ascending:!1});if(t)throw t;U=e||[],F()}catch(e){console.error("Error fetching resources:",e.message),w.innerHTML='<p class="error-state">Failed to load resources.</p>'}}function F(){if(!w)return;const e=U.filter(t=>B==="all"?!0:t.type===B);if(e.length===0){w.innerHTML='<p class="empty-state">No resources found.</p>';return}w.innerHTML=e.map(t=>ie(t)).join("")}function ie(e){const t={exam:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/></svg>',textbook:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/></svg>',notes:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2"/></svg>'};return`
        <div class="resource-card" data-id="${e.id}">
            <div class="resource-header">
                <div class="resource-icon">
                    ${t[e.type]||t.exam}
                </div>
                <div class="resource-info">
                    <span class="resource-type">${e.type}</span>
                    <h3 class="resource-title">${e.title}</h3>
                    <p class="resource-course">${e.course}</p>
                </div>
            </div>
            <div class="resource-meta">
                <span class="resource-year">${e.year}</span>
                <button class="download-btn">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 11V3M8 11L5 8M8 11L11 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 13H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Download
                </button>
            </div>
        </div>
    `}function le(){const e=document.getElementById("navSearchInput")||document.getElementById("searchInput");e&&e.addEventListener("input",ue(me,300));const t=document.querySelectorAll(".category-chip, .sidebar-link[data-category]");t.forEach(n=>{n.addEventListener("click",()=>{t.forEach(s=>s.classList.remove("active")),n.classList.add("active"),n.dataset.category,S()})});const r=document.querySelectorAll(".resource-chip");r.forEach(n=>{n.addEventListener("click",()=>{r.forEach(s=>s.classList.remove("active")),n.classList.add("active"),B=n.dataset.type,F()})}),A&&A.addEventListener("submit",async n=>{n.preventDefault();const s=document.getElementById("loginEmail").value,i=document.getElementById("loginPassword").value,u=await J(s,i);if(u.success){const o=await b();(o==null?void 0:o.role)==="seller"?window.location.href="admin.html":window.location.href="market.html"}else alert(u.message)}),q&&q.addEventListener("submit",async n=>{n.preventDefault();const s={firstName:document.getElementById("registerFirstName").value,lastName:document.getElementById("registerLastName").value,username:document.getElementById("registerUsername").value,phone:document.getElementById("registerPhone").value,role:document.getElementById("registerRole").value},i=document.getElementById("registerEmail").value,u=document.getElementById("registerPassword").value,o=await O(i,u,s);if(o.success){const h=await b();(h==null?void 0:h.role)==="seller"?window.location.href="admin.html":window.location.href="market.html"}else alert(o.message)}),$&&$.addEventListener("submit",ce),y&&y.addEventListener("click",async n=>{const s=n.target.closest("button");if(!s)return;const i=s.dataset.action,u=s.dataset.id;if(i==="buy")window.location.href=`payment.html?item_id=${u}`;else if(i==="contact"){const o=s.dataset.sellerId;window.location.href=`messages.html?partner_id=${o}`}else i==="view"&&(await E()?window.location.href=`item.html?id=${u}`:document.dispatchEvent(new CustomEvent("open-auth-modal")))}),w&&w.addEventListener("click",n=>{const s=n.target.closest(".download-btn");if(s){const i=s.closest(".resource-card");i&&de(i.dataset.id)}}),document.addEventListener("open-auth-modal",()=>{M&&M.classList.add("active")}),document.addEventListener("open-post-modal",()=>{C&&C.classList.add("active")}),document.querySelectorAll(".modal-close").forEach(n=>{n.addEventListener("click",()=>{document.querySelectorAll(".modal").forEach(s=>s.classList.remove("active"))})}),window.addEventListener("click",n=>{n.target.classList.contains("modal")&&n.target.classList.remove("active")});const a=document.querySelectorAll(".auth-tab");a.forEach(n=>{n.addEventListener("click",()=>{a.forEach(i=>i.classList.remove("active")),n.classList.add("active"),n.dataset.tab==="login"?(document.getElementById("loginForm").style.display="block",document.getElementById("registerForm").style.display="none",document.getElementById("authModalTitle").textContent="Login"):(document.getElementById("loginForm").style.display="none",document.getElementById("registerForm").style.display="block",document.getElementById("authModalTitle").textContent="Register")})})}async function ce(e){if(e.preventDefault(),!await E()){alert("Please login to upload resources.");return}const t=await b(),r={title:document.getElementById("resourceTitle").value,type:document.getElementById("resourceType").value,course:document.getElementById("resourceCourse").value,year:parseInt(document.getElementById("resourceYear").value)||new Date().getFullYear(),description:document.getElementById("resourceDescription").value,uploader_id:t.id},{error:a}=await k.from("free_resources").insert([r]);a?alert("Error uploading resource: "+a.message):(alert("Resource uploaded!"),document.getElementById("resourceModal").classList.remove("active"),H())}async function de(e){if(!await E()){document.dispatchEvent(new CustomEvent("open-auth-modal"));return}await Z({id:e}),alert("Download started!")}function ue(e,t){let r;return function(...a){clearTimeout(r),r=setTimeout(()=>e.apply(this,a),t)}}async function me(e){const t=e.target.value.toLowerCase(),{data:r,error:a}=await k.from("market_listings").select(`
            *,
            profiles (
                username,
                full_name
            )
        `).or(`title.ilike.%${t}%,description.ilike.%${t}%`).eq("status","active");a&&console.error("Search error:",a);const n=await E();y&&(y.innerHTML=(r||[]).map(s=>P(s,n)).join(""))}
//# sourceMappingURL=main-B9gpcn8Z.js.map
