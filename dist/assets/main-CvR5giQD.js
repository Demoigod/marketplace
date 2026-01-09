import{i as A,s as m,a as v,b as T,g as D,l as S,r as U,c as _,d as H}from"./navbar-BEC0A3f0.js";/* empty css               */let p="all",y="all",L=[],k=[];const l=document.getElementById("uploadModal"),d=document.getElementById("resourceModal"),i=document.getElementById("authModal"),N=document.getElementById("postItemBtn"),G=document.getElementById("uploadResourceBtn"),P=document.getElementById("closeModal"),j=document.getElementById("closeResourceModal"),z=document.getElementById("closeAuthModal"),x=document.getElementById("uploadForm"),C=document.getElementById("resourceForm"),f=document.getElementById("loginForm"),h=document.getElementById("registerForm"),O=document.getElementById("searchInput"),X=document.getElementById("marketplaceGrid"),V=document.getElementById("resourcesGrid"),g=document.getElementById("loginBtn"),b=document.getElementById("logoutBtn"),E=document.getElementById("userMenu"),w=document.getElementById("dashboardLink");document.addEventListener("DOMContentLoaded",async()=>{await A(),await M(),await I(),await B(),Y()});async function I(){try{let e=m.from("marketplace_items").select("*").eq("status","active");p!=="all"&&(e=e.eq("category",p));const{data:t,error:o}=await e.order("created_at",{ascending:!1});if(o)throw o;L=t||[],$()}catch(e){console.error("Error fetching items:",e.message),r("Failed to load marketplace items")}}async function B(){try{let e=m.from("free_resources").select("*");y!=="all"&&(e=e.eq("type",y));const{data:t,error:o}=await e.order("created_at",{ascending:!1});if(o)throw o;k=t||[],F()}catch(e){console.error("Error fetching resources:",e.message),r("Failed to load resources")}}function Y(){N.addEventListener("click",()=>{if(!v()){u(i),r("Please login to post items");return}u(l)}),G.addEventListener("click",()=>{if(!v()){u(i),r("Please login to upload resources");return}u(d)}),P.addEventListener("click",()=>c(l)),j.addEventListener("click",()=>c(d)),z.addEventListener("click",()=>c(i)),l.addEventListener("click",o=>{o.target===l&&c(l)}),d.addEventListener("click",o=>{o.target===d&&c(d)}),i.addEventListener("click",o=>{o.target===i&&c(i)}),document.querySelectorAll(".auth-tab").forEach(o=>{o.addEventListener("click",n=>{const s=n.target.dataset.tab;document.querySelectorAll(".auth-tab").forEach(a=>a.classList.remove("active")),n.target.classList.add("active"),s==="login"?(f.style.display="block",h.style.display="none",document.getElementById("authModalTitle").textContent="Login"):(f.style.display="none",h.style.display="block",document.getElementById("authModalTitle").textContent="Register")})}),x.addEventListener("submit",J),C.addEventListener("submit",K),f.addEventListener("submit",se),h.addEventListener("submit",ae),g&&g.addEventListener("click",()=>u(i)),b&&b.addEventListener("click",q),document.querySelectorAll(".category-chip").forEach(o=>{o.addEventListener("click",n=>{document.querySelectorAll(".category-chip").forEach(s=>s.classList.remove("active")),n.target.classList.add("active"),p=n.target.dataset.category,I()})}),document.querySelectorAll(".resource-chip").forEach(o=>{o.addEventListener("click",n=>{document.querySelectorAll(".resource-chip").forEach(s=>s.classList.remove("active")),n.target.classList.add("active"),y=n.target.dataset.type,B()})}),O.addEventListener("input",te(ee,300));const e=document.querySelector(".file-upload-area"),t=document.getElementById("resourceFile");e&&t&&(e.addEventListener("click",()=>t.click()),t.addEventListener("change",o=>{var s;const n=(s=o.target.files[0])==null?void 0:s.name;n&&(e.querySelector("p").textContent=`Selected: ${n}`)}))}function u(e){e.classList.add("active"),document.body.style.overflow="hidden"}function c(e){e.classList.remove("active"),document.body.style.overflow=""}async function J(e){e.preventDefault();const t={title:document.getElementById("itemTitle").value,category:document.getElementById("itemCategory").value,price:parseFloat(document.getElementById("itemPrice").value),description:document.getElementById("itemDescription").value,condition:document.getElementById("itemCondition").value},o=await T(t);o.success?(I(),c(l),x.reset(),r("Item posted successfully!")):r(o.message)}async function K(e){e.preventDefault();const t={title:document.getElementById("resourceTitle").value,type:document.getElementById("resourceType").value,course:document.getElementById("resourceCourse").value,year:parseInt(document.getElementById("resourceYear").value)||new Date().getFullYear(),description:document.getElementById("resourceDescription").value};try{const{data:{user:o}}=await m.auth.getUser(),{error:n}=await m.from("free_resources").insert([{...t,uploader_id:o.id}]);if(n)throw n;B(),c(d),C.reset(),r("Resource uploaded successfully!")}catch(o){r(o.message)}}function $(){const e=L.filter(t=>p==="all"?!0:t.category===p);X.innerHTML=e.map(t=>Q(t)).join("")}function Q(e){return`
        <div class="marketplace-item" data-id="${e.id}">
            <div class="item-image" style="background: linear-gradient(135deg, #368CBF 0%, #E6DBC9 100%)"></div>
            <div class="item-content">
                <span class="item-category">${e.category}</span>
                <h3 class="item-title">${e.title}</h3>
                <p class="item-description">${e.description}</p>
                <div class="item-footer">
                    <span class="item-price">$${parseFloat(e.price).toFixed(2)}</span>
                    <div style="display: flex; gap: 0.5rem;">
                         <button class="btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.8rem;" 
                            onclick="window.location.href='messages.html?item_id=${e.id}&seller_id=${e.seller_id}'">
                            Message
                        </button>
                        <span class="item-condition">${Z(e.condition)}</span>
                    </div>
                </div>
            </div>
        </div>
    `}function F(){const e=k.filter(t=>y==="all"?!0:t.type===y);V.innerHTML=e.map(t=>W(t)).join("")}function W(e){const t={exam:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
        </svg>`,textbook:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="currentColor" stroke-width="2"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" stroke="currentColor" stroke-width="2"/>
        </svg>`,notes:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
            <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="currentColor" stroke-width="2"/>
        </svg>`};return`
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
                <button class="download-btn" onclick="downloadResourceAction('${e.id}')">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M8 11V3M8 11L5 8M8 11L11 8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M2 13H14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    Download
                </button>
            </div>
        </div>
    `}function Z(e){return{new:"New","like-new":"Like New",good:"Good",fair:"Fair"}[e]||e}async function ee(e){const t=e.target.value.toLowerCase();try{let{data:o,error:n}=await m.from("marketplace_items").select("*").or(`title.ilike.%${t}%,description.ilike.%${t}%,category.ilike.%${t}%`).eq("status","active");if(n)throw n;L=o||[],$();let{data:s,error:a}=await m.from("free_resources").select("*").or(`title.ilike.%${t}%,course.ilike.%${t}%,type.ilike.%${t}%`);if(a)throw a;k=s||[],F()}catch(o){console.error("Search error:",o.message)}}function te(e,t){let o;return function(...s){const a=()=>{clearTimeout(o),e(...s)};clearTimeout(o),o=setTimeout(a,t)}}async function oe(e){if(!await v()){u(i),r("Please login to download resources");return}const t=k.find(o=>o.id===e);t&&(await H(t),r(`Downloading: ${t.title}`),console.log("Downloading resource:",t))}window.downloadResourceAction=oe;function r(e){const t=document.createElement("div");t.style.cssText=`
        position: fixed;
        top: 20px;
        right: 20px;
        background: #368CBF;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
        z-index: 3000;
        animation: slideIn 0.3s ease;
        font-weight: 600;
    `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOut 0.3s ease",setTimeout(()=>t.remove(),300)},3e3)}const R=document.createElement("style");R.textContent=`
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;document.head.appendChild(R);async function M(){if(await v()){const t=await D();ne(t)}else re()}function ne(e){if(!e)return;g&&(g.style.display="none"),E&&(E.style.display="flex"),w&&(w.style.display="block");const t=document.getElementById("userName");t&&(t.textContent=e.name?e.name.split(" ")[0]:"User");const o=document.getElementById("logoutBtnNav");o&&o.addEventListener("click",q)}function re(){g&&(g.style.display="inline-flex"),E&&(E.style.display="none"),w&&(w.style.display="none")}async function se(e){e.preventDefault();const t=document.getElementById("loginEmail").value,o=document.getElementById("loginPassword").value,n=await S(t,o);n.success?(r("Login successful!"),c(i),f.reset(),await M(),I(),B()):r(n.message)}async function ae(e){e.preventDefault();const t=document.getElementById("registerName").value,o=document.getElementById("registerEmail").value,n=document.getElementById("registerPassword").value,s=document.getElementById("registerRole").value,a=await U(o,n,t,s);a.success?(r(a.message),document.querySelector('[data-tab="login"]').click(),h.reset()):r(a.message)}async function q(e){e.preventDefault(),await _(),r("Logged out successfully"),await M(),window.location.pathname.includes("dashboard.html")&&(window.location.href="index.html")}
