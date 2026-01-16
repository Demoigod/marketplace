import{s as a,i as m,g as f}from"./auth-BNhlD6S9.js";async function g(){try{console.log("Attempting to fetch items with profile join...");const{data:e,error:s}=await a.from("market_listings").select(`
                *,
                profiles (
                    username,
                    full_name,
                    immutable_user_code
                )
            `).eq("status","active").order("created_at",{ascending:!1});if(!s)return console.log("Successfully fetched items with join:",e==null?void 0:e.length),e||[];console.warn("Fetch with join failed, trying fallback without join. Error:",s);const{data:t,error:r}=await a.from("market_listings").select("*").eq("status","active").order("created_at",{ascending:!1});if(r)throw console.error("Ultimate fetch failure:",r),r;return console.log("Fallback fetch successful:",t==null?void 0:t.length),t||[]}catch(e){return console.error("Critical items fetch error:",e),[]}}function h(e,s=!1){var o,l,n;const t=new Date(e.created_at).toLocaleDateString();let r=e.image_url;!r&&e.images&&e.images.length>0&&(r=e.images[0]),r||(r="https://via.placeholder.com/300x200?text=No+Image");const i=((o=e.profiles)==null?void 0:o.username)||((l=e.profiles)==null?void 0:l.full_name)||"Anonymous",d=((n=e.profiles)==null?void 0:n.immutable_user_code)||(e.seller_id?e.seller_id.slice(0,6).toUpperCase():"N/A");return`
        <div class="marketplace-item" data-id="${e.id}" data-user-id="${e.seller_id}">
            <div class="item-image" style="background-image: url('${r}');"></div>
            <div class="item-content">
                <h3 class="item-title">${c(e.title||"Untitled Item")}</h3>
                <div class="item-price">R ${parseFloat(e.price||0).toLocaleString()}</div>
                
                <div class="item-meta" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span style="font-weight: 700;">${c(i)}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); padding-left: 1.4rem;">Posted by User ID: ${d}</span>
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
    `}function c(e){if(!e)return"";const s=document.createElement("div");return s.textContent=e,s.innerHTML}async function u(e){if(!await m()){alert("Please log in to save items."),document.dispatchEvent(new CustomEvent("open-auth-modal"));return}const s=await f();if(s)try{const{data:t,error:r}=await a.from("saved_items").select("id").eq("user_id",s.id).eq("item_id",e).maybeSingle();if(r)throw r;if(t){const{error:i}=await a.from("saved_items").delete().eq("id",t.id);if(i)throw i;return{saved:!1,message:"Item removed from bookmarks"}}else{const{error:i}=await a.from("saved_items").insert([{user_id:s.id,item_id:e}]);if(i)throw i;return{saved:!0,message:"Item saved successfully!"}}}catch(t){throw console.error("Save error:",t),t}}function p(){document.addEventListener("click",async e=>{if(e.target.classList.contains("btn-save")){const s=e.target.dataset.itemId,t=e.target;t.disabled=!0;try{const r=await u(s);t.classList.toggle("active",r.saved),t.textContent=r.saved?"Saved":"Save",console.log(r.message)}catch{alert("Failed to save item.")}finally{t.disabled=!1}}})}export{h as c,g as f,p as i};
