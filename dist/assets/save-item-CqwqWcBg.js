import{i as d,s,g as v}from"./auth-BNhlD6S9.js";async function p(){try{if(await d()){console.log("Fetching items with profile data (authenticated)...");const{data:i,error:a}=await s.from("market_listings").select(`
                    *,
                    profiles (
                        username,
                        full_name,
                        immutable_user_code
                    )
                `).eq("status","active").order("created_at",{ascending:!1});if(!a)return console.log("Successfully fetched items with profiles:",i==null?void 0:i.length),i||[];console.warn("Profile join failed for authenticated user, using fallback:",a)}else console.log("Fetching items without profile data (public user)...");const{data:r,error:t}=await s.from("market_listings").select("*").eq("status","active").order("created_at",{ascending:!1});if(t)throw console.error("Failed to fetch marketplace items:",t),t;return console.log("Successfully fetched public items:",r==null?void 0:r.length),r||[]}catch(e){return console.error("Critical items fetch error:",e),[]}}function f(e,r=!1){const t=new Date(e.created_at).toLocaleDateString();let i=e.image_url;return!i&&e.images&&e.images.length>0&&(i=e.images[0]),i||(i="https://via.placeholder.com/300x200?text=No+Image"),r?g(e,i,t):u(e,i,t)}function g(e,r,t){var o,n,c;const i=((o=e.profiles)==null?void 0:o.username)||((n=e.profiles)==null?void 0:n.full_name)||"Anonymous",a=((c=e.profiles)==null?void 0:c.immutable_user_code)||(e.seller_id?e.seller_id.slice(0,6).toUpperCase():"N/A");return`
        <div class="marketplace-item" data-id="${e.id}" data-user-id="${e.seller_id}">
            <div class="item-image" style="background-image: url('${r}');"></div>
            <div class="item-content">
                <h3 class="item-title">${l(e.title||"Untitled Item")}</h3>
                <div class="item-price">R ${parseFloat(e.price||0).toLocaleString()}</div>
                
                <div class="item-meta" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span style="font-weight: 700;">${l(i)}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); padding-left: 1.4rem;">Posted by User ID: ${a}</span>
                </div>
                
                <div class="item-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Posted on ${t}</span>
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
    `}function u(e,r,t){return`
        <div class="marketplace-item public-view" data-id="${e.id}">
            <div class="item-image" style="background-image: url('${r}');"></div>
            <div class="item-content">
                <h3 class="item-title">${l(e.title||"Untitled Item")}</h3>
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
                    <span>Posted on ${t}</span>
                </div>
                <div class="item-directions">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>Category: ${l(e.category||"General")}</span>
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
    `}function l(e){if(!e)return"";const r=document.createElement("div");return r.textContent=e,r.innerHTML}async function m(e){if(!await d()){alert("Please log in to save items."),document.dispatchEvent(new CustomEvent("open-auth-modal"));return}const r=await v();if(r)try{const{data:t,error:i}=await s.from("saved_items").select("id").eq("user_id",r.id).eq("item_id",e).maybeSingle();if(i)throw i;if(t){const{error:a}=await s.from("saved_items").delete().eq("id",t.id);if(a)throw a;return{saved:!1,message:"Item removed from bookmarks"}}else{const{error:a}=await s.from("saved_items").insert([{user_id:r.id,item_id:e}]);if(a)throw a;return{saved:!0,message:"Item saved successfully!"}}}catch(t){throw console.error("Save error:",t),t}}function y(){document.addEventListener("click",async e=>{if(e.target.classList.contains("btn-save")){const r=e.target.dataset.itemId,t=e.target;t.disabled=!0;try{const i=await m(r);t.classList.toggle("active",i.saved),t.textContent=i.saved?"Saved":"Save",console.log(i.message)}catch{alert("Failed to save item.")}finally{t.disabled=!1}}})}export{f as c,p as f,y as i};
