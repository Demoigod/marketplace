import{i as m,g as b,s as c,a as V,l as Y,r as J,b as K,c as Q}from"./navbar-WqxFawbh.js";/* empty css               */async function W(e){var $;if(e.preventDefault(),!await m()){alert("Please log in to post an item."),document.dispatchEvent(new CustomEvent("open-auth-modal"));return}const t=await b();if(!t)return;const o=e.target,n=o.querySelector("#itemTitle").value,r=parseFloat(o.querySelector("#itemPrice").value),s=o.querySelector("#itemDescription").value,O=o.querySelector("#itemCategory").value,X=["https://placeholder.com/600x400"];if(!n||isNaN(r)||!s){alert("Please fill in all required fields.");return}try{const{data:w,error:C}=await c.from("items").insert([{user_id:t.id,title:n,description:s,price:r,images:X,category:O,condition:(($=o.querySelector("#itemCondition"))==null?void 0:$.value)||"good"}]).select().single();if(C)throw C;console.log("Item posted successfully:",w),alert("Your item is now live!"),o.reset();const x=document.getElementById("uploadModal");x&&x.classList.remove("active"),document.dispatchEvent(new CustomEvent("item-posted"))}catch(w){console.error("Error posting item:",w.message),alert("Error: "+w.message)}}async function Z(){try{const{data:e,error:t}=await c.from("items").select("*").order("created_at",{ascending:!1});if(t)throw t;return e||[]}catch(e){return console.error("Error fetching items:",e),[]}}function ee(e,t=!1){const o=new Date(e.created_at).toLocaleDateString(),n=e.images&&e.images.length>0?e.images[0]:"https://via.placeholder.com/300x200",r=t?"":"disabled",s=t?"":'title="Please login to use this feature"';return`
        <div class="marketplace-item" data-id="${e.id}" data-owner-id="${e.user_id}">
            <div class="item-image" style="background-image: url('${n}'); background-size: cover; background-position: center;"></div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${S(e.title)}</h3>
                    <span class="item-price">$${parseFloat(e.price).toFixed(2)}</span>
                </div>
                <p class="item-date">Posted on ${o}</p>
                <p class="item-description">${S(e.description)}</p>
                
                <div class="item-actions-grid">
                    <button class="btn-buy" ${r} ${s} onclick="handleBuyAction('${e.id}')">Buy</button>
                    <button class="btn-contact" ${r} ${s} onclick="handleContactAction('${e.user_id}')">Contact Seller</button>
                    <button class="btn-view" onclick="window.location.href='item.html?id=${e.id}'">View</button>
                    <button class="btn-save" data-item-id="${e.id}">Save</button>
                </div>
            </div>
        </div>
    `}window.handleBuyAction=e=>{window.location.href=`payment.html?item_id=${e}`};window.handleContactAction=e=>{window.location.href=`messages.html?partner_id=${e}`};function S(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function te(e){if(!await m()){alert("Please log in to save items."),document.dispatchEvent(new CustomEvent("open-auth-modal"));return}const t=await b();if(t)try{const{data:o,error:n}=await c.from("saved_items").select("id").eq("user_id",t.id).eq("item_id",e).maybeSingle();if(n)throw n;if(o){const{error:r}=await c.from("saved_items").delete().eq("id",o.id);if(r)throw r;return{saved:!1,message:"Item removed from bookmarks"}}else{const{error:r}=await c.from("saved_items").insert([{user_id:t.id,item_id:e}]);if(r)throw r;return{saved:!0,message:"Item saved successfully!"}}}catch(o){throw console.error("Save error:",o),o}}function oe(){document.addEventListener("click",async e=>{if(e.target.classList.contains("btn-save")){const t=e.target.dataset.itemId,o=e.target;o.disabled=!0;try{const n=await te(t);o.classList.toggle("active",n.saved),o.textContent=n.saved?"Saved":"Save",console.log(n.message)}catch{alert("Failed to save item.")}finally{o.disabled=!1}}})}let v="all",h="all",B=[],I=[];const d=document.getElementById("uploadModal"),f=document.getElementById("resourceModal"),i=document.getElementById("authModal"),q=document.getElementById("postItemBtn"),F=document.getElementById("uploadResourceBtn"),_=document.getElementById("closeModal"),A=document.getElementById("closeResourceModal"),R=document.getElementById("closeAuthModal"),T=document.getElementById("uploadForm"),L=document.getElementById("resourceForm"),g=document.getElementById("loginForm"),p=document.getElementById("registerForm"),ne=document.getElementById("searchInput"),P=document.getElementById("marketplaceGrid"),re=document.getElementById("resourcesGrid"),y=document.getElementById("loginBtn"),D=document.getElementById("logoutBtn"),E=document.getElementById("userMenu"),k=document.getElementById("dashboardLink");document.addEventListener("DOMContentLoaded",async()=>{await V(),await j(),H(),M(),oe(),new URLSearchParams(window.location.search).get("action")==="post"&&setTimeout(()=>{document.dispatchEvent(new CustomEvent("open-post-modal"))},800),ae()});async function H(){const e=await m(),t=await Z();P.innerHTML=t.map(o=>ee(o,e)).join("")}document.addEventListener("item-posted",H);async function se(){try{let e=c.from("marketplace_items").select("*").eq("status","active");v!=="all"&&(e=e.eq("category",v));const{data:t,error:o}=await e.order("created_at",{ascending:!1});if(o)throw o;B=t||[],U()}catch(e){console.error("Error fetching items:",e.message),a("Failed to load marketplace items")}}async function M(){try{let e=c.from("free_resources").select("*");h!=="all"&&(e=e.eq("type",h));const{data:t,error:o}=await e.order("created_at",{ascending:!1});if(o)throw o;I=t||[],N()}catch(e){console.error("Error fetching resources:",e.message),a("Failed to load resources")}}function ae(){q&&q.addEventListener("click",()=>{if(!m()){l(i),a("Please login to post items");return}l(d)}),F&&F.addEventListener("click",()=>{if(!m()){l(i),a("Please login to upload resources");return}l(f)}),_&&_.addEventListener("click",()=>u(d)),A&&A.addEventListener("click",()=>u(f)),R&&R.addEventListener("click",()=>u(i)),d&&d.addEventListener("click",o=>{o.target===d&&u(d)}),f&&f.addEventListener("click",o=>{o.target===f&&u(f)}),i&&i.addEventListener("click",o=>{o.target===i&&u(i)}),document.addEventListener("open-auth-modal",()=>{i&&l(i)}),document.addEventListener("open-post-modal",()=>{if(d){if(!m()){l(i),a("Please login to post items");return}l(d)}}),document.querySelectorAll(".auth-tab").forEach(o=>{o.addEventListener("click",n=>{const r=n.target.dataset.tab;if(document.querySelectorAll(".auth-tab").forEach(s=>s.classList.remove("active")),n.target.classList.add("active"),r==="login"){g&&(g.style.display="block"),p&&(p.style.display="none");const s=document.getElementById("authModalTitle");s&&(s.textContent="Login")}else{g&&(g.style.display="none"),p&&(p.style.display="block");const s=document.getElementById("authModalTitle");s&&(s.textContent="Register")}})}),T&&T.addEventListener("submit",W),L&&L.addEventListener("submit",ie),g&&g.addEventListener("submit",ye),p&&p.addEventListener("submit",ve),y&&y.addEventListener("click",()=>l(i)),D&&D.addEventListener("click",z),document.querySelectorAll(".category-chip").forEach(o=>{o.addEventListener("click",n=>{document.querySelectorAll(".category-chip").forEach(r=>r.classList.remove("active")),n.target.classList.add("active"),v=n.target.dataset.category,se()})}),document.querySelectorAll(".resource-chip").forEach(o=>{o.addEventListener("click",n=>{document.querySelectorAll(".resource-chip").forEach(r=>r.classList.remove("active")),n.target.classList.add("active"),h=n.target.dataset.type,M()})}),ne.addEventListener("input",me(ue,300));const e=document.querySelector(".file-upload-area"),t=document.getElementById("resourceFile");e&&t&&(e.addEventListener("click",()=>t.click()),t.addEventListener("change",o=>{var r;const n=(r=o.target.files[0])==null?void 0:r.name;n&&(e.querySelector("p").textContent=`Selected: ${n}`)}))}function l(e){e.classList.add("active"),document.body.style.overflow="hidden"}function u(e){e.classList.remove("active"),document.body.style.overflow=""}async function ie(e){e.preventDefault();const t={title:document.getElementById("resourceTitle").value,type:document.getElementById("resourceType").value,course:document.getElementById("resourceCourse").value,year:parseInt(document.getElementById("resourceYear").value)||new Date().getFullYear(),description:document.getElementById("resourceDescription").value};try{const{data:{user:o}}=await c.auth.getUser(),{error:n}=await c.from("free_resources").insert([{...t,uploader_id:o.id}]);if(n)throw n;M(),u(f),L.reset(),a("Resource uploaded successfully!")}catch(o){a(o.message)}}function U(){const e=B.filter(t=>v==="all"?!0:t.category===v);P.innerHTML=e.map(t=>ce(t)).join("")}function ce(e){return`
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
                        <span class="item-condition">${de(e.condition)}</span>
                    </div>
                </div>
            </div>
        </div>
    `}function N(){const e=I.filter(t=>h==="all"?!0:t.type===h);re.innerHTML=e.map(t=>le(t)).join("")}function le(e){const t={exam:`<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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
    `}function de(e){return{new:"New","like-new":"Like New",good:"Good",fair:"Fair"}[e]||e}async function ue(e){const t=e.target.value.toLowerCase();try{let{data:o,error:n}=await c.from("marketplace_items").select("*").or(`title.ilike.%${t}%,description.ilike.%${t}%,category.ilike.%${t}%`).eq("status","active");if(n)throw n;B=o||[],U();let{data:r,error:s}=await c.from("free_resources").select("*").or(`title.ilike.%${t}%,course.ilike.%${t}%,type.ilike.%${t}%`);if(s)throw s;I=r||[],N()}catch(o){console.error("Search error:",o.message)}}function me(e,t){let o;return function(...r){const s=()=>{clearTimeout(o),e(...r)};clearTimeout(o),o=setTimeout(s,t)}}async function fe(e){if(!await m()){l(i),a("Please login to download resources");return}const t=I.find(o=>o.id===e);t&&(await Q(t),a(`Downloading: ${t.title}`),console.log("Downloading resource:",t))}window.downloadResourceAction=fe;function a(e){const t=document.createElement("div");t.style.cssText=`
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
    `,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.style.animation="slideOut 0.3s ease",setTimeout(()=>t.remove(),300)},3e3)}const G=document.createElement("style");G.textContent=`
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
`;document.head.appendChild(G);async function j(){if(await m()){const t=await b();ge(t)}else pe()}function ge(e){if(!e)return;y&&(y.style.display="none"),E&&(E.style.display="flex"),k&&(k.style.display="block");const t=document.getElementById("userName");t&&(t.textContent=e.name?e.name.split(" ")[0]:"User");const o=document.getElementById("logoutBtnNav");o&&o.addEventListener("click",z)}function pe(){y&&(y.style.display="inline-flex"),E&&(E.style.display="none"),k&&(k.style.display="none")}async function ye(e){e.preventDefault();const t=document.getElementById("loginEmail").value,o=document.getElementById("loginPassword").value,n=await Y(t,o);n.success?(a("Login successful!"),u(i),g.reset(),setTimeout(()=>{window.location.href="dashboard.html"},500)):a(n.message)}async function ve(e){e.preventDefault();const t=document.getElementById("registerName").value,o=document.getElementById("registerEmail").value,n=document.getElementById("registerPassword").value,r=document.getElementById("registerRole").value,s=await J(o,n,t,r);s.success?(a(s.message),document.querySelector('[data-tab="login"]').click(),p.reset()):a(s.message)}async function z(e){e.preventDefault(),await K(),a("Logged out successfully"),await j(),window.location.pathname.includes("dashboard.html")&&(window.location.href="index.html")}
