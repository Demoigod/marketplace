import{i as H,s as f,a as y,b as P,g as _,l as N,r as G,c as j,d as z}from"./navbar-Cg1UA9q4.js";/* empty css               */let h="all",v="all",L=[],k=[];const c=document.getElementById("uploadModal"),u=document.getElementById("resourceModal"),i=document.getElementById("authModal"),x=document.getElementById("postItemBtn"),C=document.getElementById("uploadResourceBtn"),$=document.getElementById("closeModal"),F=document.getElementById("closeResourceModal"),R=document.getElementById("closeAuthModal"),I=document.getElementById("uploadForm"),B=document.getElementById("resourceForm"),m=document.getElementById("loginForm"),g=document.getElementById("registerForm"),O=document.getElementById("searchInput"),X=document.getElementById("marketplaceGrid"),V=document.getElementById("resourcesGrid"),p=document.getElementById("loginBtn"),T=document.getElementById("logoutBtn"),E=document.getElementById("userMenu"),w=document.getElementById("dashboardLink");document.addEventListener("DOMContentLoaded",async()=>{await H(),await S(),M(),b(),new URLSearchParams(window.location.search).get("action")==="post"&&setTimeout(()=>{document.dispatchEvent(new CustomEvent("open-post-modal"))},800),Y()});async function M(){try{let e=f.from("marketplace_items").select("*").eq("status","active");h!=="all"&&(e=e.eq("category",h));const{data:t,error:o}=await e.order("created_at",{ascending:!1});if(o)throw o;L=t||[],q()}catch(e){console.error("Error fetching items:",e.message),s("Failed to load marketplace items")}}async function b(){try{let e=f.from("free_resources").select("*");v!=="all"&&(e=e.eq("type",v));const{data:t,error:o}=await e.order("created_at",{ascending:!1});if(o)throw o;k=t||[],A()}catch(e){console.error("Error fetching resources:",e.message),s("Failed to load resources")}}function Y(){x&&x.addEventListener("click",()=>{if(!y()){l(i),s("Please login to post items");return}l(c)}),C&&C.addEventListener("click",()=>{if(!y()){l(i),s("Please login to upload resources");return}l(u)}),$&&$.addEventListener("click",()=>d(c)),F&&F.addEventListener("click",()=>d(u)),R&&R.addEventListener("click",()=>d(i)),c&&c.addEventListener("click",o=>{o.target===c&&d(c)}),u&&u.addEventListener("click",o=>{o.target===u&&d(u)}),i&&i.addEventListener("click",o=>{o.target===i&&d(i)}),document.addEventListener("open-auth-modal",()=>{i&&l(i)}),document.addEventListener("open-post-modal",()=>{if(c){if(!y()){l(i),s("Please login to post items");return}l(c)}}),document.querySelectorAll(".auth-tab").forEach(o=>{o.addEventListener("click",n=>{const a=n.target.dataset.tab;if(document.querySelectorAll(".auth-tab").forEach(r=>r.classList.remove("active")),n.target.classList.add("active"),a==="login"){m&&(m.style.display="block"),g&&(g.style.display="none");const r=document.getElementById("authModalTitle");r&&(r.textContent="Login")}else{m&&(m.style.display="none"),g&&(g.style.display="block");const r=document.getElementById("authModalTitle");r&&(r.textContent="Register")}})}),I&&I.addEventListener("submit",J),B&&B.addEventListener("submit",K),m&&m.addEventListener("submit",se),g&&g.addEventListener("submit",ae),p&&p.addEventListener("click",()=>l(i)),T&&T.addEventListener("click",U),document.querySelectorAll(".category-chip").forEach(o=>{o.addEventListener("click",n=>{document.querySelectorAll(".category-chip").forEach(a=>a.classList.remove("active")),n.target.classList.add("active"),h=n.target.dataset.category,M()})}),document.querySelectorAll(".resource-chip").forEach(o=>{o.addEventListener("click",n=>{document.querySelectorAll(".resource-chip").forEach(a=>a.classList.remove("active")),n.target.classList.add("active"),v=n.target.dataset.type,b()})}),O.addEventListener("input",te(ee,300));const e=document.querySelector(".file-upload-area"),t=document.getElementById("resourceFile");e&&t&&(e.addEventListener("click",()=>t.click()),t.addEventListener("change",o=>{var a;const n=(a=o.target.files[0])==null?void 0:a.name;n&&(e.querySelector("p").textContent=`Selected: ${n}`)}))}function l(e){e.classList.add("active"),document.body.style.overflow="hidden"}function d(e){e.classList.remove("active"),document.body.style.overflow=""}async function J(e){e.preventDefault();const t={title:document.getElementById("itemTitle").value,category:document.getElementById("itemCategory").value,price:parseFloat(document.getElementById("itemPrice").value),description:document.getElementById("itemDescription").value,condition:document.getElementById("itemCondition").value},o=await P(t);o.success?(M(),d(c),I.reset(),s("Item posted successfully!")):s(o.message)}async function K(e){e.preventDefault();const t={title:document.getElementById("resourceTitle").value,type:document.getElementById("resourceType").value,course:document.getElementById("resourceCourse").value,year:parseInt(document.getElementById("resourceYear").value)||new Date().getFullYear(),description:document.getElementById("resourceDescription").value};try{const{data:{user:o}}=await f.auth.getUser(),{error:n}=await f.from("free_resources").insert([{...t,uploader_id:o.id}]);if(n)throw n;b(),d(u),B.reset(),s("Resource uploaded successfully!")}catch(o){s(o.message)}}function q(){const e=L.filter(t=>h==="all"?!0:t.category===h);X.innerHTML=e.map(t=>Q(t)).join("")}function Q(e){return`
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
                            onclick="window.location.href='messages.html?partner_id=${e.seller_id}'">
                            Message
                        </button>
                        <span class="item-condition">${Z(e.condition)}</span>
                    </div>
                </div>
            </div>
        </div>
    `}function A(){const e=k.filter(t=>v==="all"?!0:t.type===v);V.innerHTML=e.map(t=>W(t)).join("")}function W(e){const t={exam:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    `}function Z(e){return{new:"New","like-new":"Like New",good:"Good",fair:"Fair"}[e]||e}async function ee(e){const t=e.target.value.toLowerCase();try{let{data:o,error:n}=await f.from("marketplace_items").select("*").or(`title.ilike.%${t}%,description.ilike.%${t}%,category.ilike.%${t}%`).eq("status","active");if(n)throw n;L=o||[],q();let{data:a,error:r}=await f.from("free_resources").select("*").or(`title.ilike.%${t}%,course.ilike.%${t}%,type.ilike.%${t}%`);if(r)throw r;k=a||[],A()}catch(o){console.error("Search error:",o.message)}}function te(e,t){let o;return function(...a){const r=()=>{clearTimeout(o),e(...a)};clearTimeout(o),o=setTimeout(r,t)}}async function oe(e){if(!await y()){l(i),s("Please login to download resources");return}const t=k.find(o=>o.id===e);t&&(await z(t),s(`Downloading: ${t.title}`),console.log("Downloading resource:",t))}window.downloadResourceAction=oe;function s(e){const t=document.createElement("div");t.style.cssText=`
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
    `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOut 0.3s ease",setTimeout(()=>t.remove(),300)},3e3)}const D=document.createElement("style");D.textContent=`
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
`;document.head.appendChild(D);async function S(){if(await y()){const t=await _();ne(t)}else re()}function ne(e){if(!e)return;p&&(p.style.display="none"),E&&(E.style.display="flex"),w&&(w.style.display="block");const t=document.getElementById("userName");t&&(t.textContent=e.name?e.name.split(" ")[0]:"User");const o=document.getElementById("logoutBtnNav");o&&o.addEventListener("click",U)}function re(){p&&(p.style.display="inline-flex"),E&&(E.style.display="none"),w&&(w.style.display="none")}async function se(e){e.preventDefault();const t=document.getElementById("loginEmail").value,o=document.getElementById("loginPassword").value,n=await N(t,o);n.success?(s("Login successful!"),d(i),m.reset(),setTimeout(()=>{window.location.href="dashboard.html"},500)):s(n.message)}async function ae(e){e.preventDefault();const t=document.getElementById("registerName").value,o=document.getElementById("registerEmail").value,n=document.getElementById("registerPassword").value,a=document.getElementById("registerRole").value,r=await G(o,n,t,a);r.success?(s(r.message),document.querySelector('[data-tab="login"]').click(),g.reset()):s(r.message)}async function U(e){e.preventDefault(),await j(),s("Logged out successfully"),await S(),window.location.pathname.includes("dashboard.html")&&(window.location.href="index.html")}
