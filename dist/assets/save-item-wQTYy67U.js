import{s as r,i as l,g as d}from"./auth-C6Z0jTos.js";async function f(){try{console.log("Attempting to fetch items with profile join...");const{data:e,error:s}=await r.from("market_listings").select(`
                *,
                profiles (
                    username,
                    full_name
                )
            `).eq("status","active").order("created_at",{ascending:!1});if(!s)return console.log("Successfully fetched items with join:",e==null?void 0:e.length),e||[];console.warn("Fetch with join failed, trying fallback without join. Error:",s);const{data:t,error:a}=await r.from("market_listings").select("*").eq("status","active").order("created_at",{ascending:!1});if(a)throw console.error("Ultimate fetch failure:",a),a;return console.log("Fallback fetch successful:",t==null?void 0:t.length),t||[]}catch(e){return console.error("Critical items fetch error:",e),[]}}function v(e,s=!1){var n,c;const t=new Date(e.created_at).toLocaleDateString();let a=e.image_url;!a&&e.images&&e.images.length>0&&(a=e.images[0]),a||(a="https://via.placeholder.com/300x200?text=No+Image");let i="";return s?i=`
            <div class="item-actions-grid">
                <button class="btn-buy" data-action="buy" data-id="${e.id}">Buy</button>
                <button class="btn-contact" data-action="contact" data-seller-id="${e.seller_id}">Contact Seller</button>
                <button class="btn-save" data-action="save" data-item-id="${e.id}">Save</button>
                <button class="btn-view" data-action="view" data-id="${e.id}">View Details</button>
            </div>
        `:i=`
            <div class="item-actions-preview">
                <button class="btn-primary btn-full" data-action="view" data-id="${e.id}">View Item</button>
            </div>
        `,`
        <div class="marketplace-item" data-id="${e.id}" data-user-id="${e.seller_id}">
            <div class="item-image" style="background-image: url('${a}'); background-size: cover; background-position: center;"></div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${o(e.title||"Untitled Item")}</h3>
                    <span class="item-price">R ${parseFloat(e.price||0).toLocaleString()}</span>
                </div>
                <div class="item-meta" style="margin-bottom: 0.5rem; font-size: 0.85rem; color: #666;">
                    <span>By ${o(((n=e.profiles)==null?void 0:n.username)||((c=e.profiles)==null?void 0:c.full_name)||"Anonymous")}</span>
                </div>
                <p class="item-date">Posted on ${t}</p>
                <p class="item-description">${o(e.description)}</p>
                
                ${i}
            </div>
        </div>
    `}function o(e){if(!e)return"";const s=document.createElement("div");return s.textContent=e,s.innerHTML}async function u(e){if(!await l()){alert("Please log in to save items."),document.dispatchEvent(new CustomEvent("open-auth-modal"));return}const s=await d();if(s)try{const{data:t,error:a}=await r.from("saved_items").select("id").eq("user_id",s.id).eq("item_id",e).maybeSingle();if(a)throw a;if(t){const{error:i}=await r.from("saved_items").delete().eq("id",t.id);if(i)throw i;return{saved:!1,message:"Item removed from bookmarks"}}else{const{error:i}=await r.from("saved_items").insert([{user_id:s.id,item_id:e}]);if(i)throw i;return{saved:!0,message:"Item saved successfully!"}}}catch(t){throw console.error("Save error:",t),t}}function g(){document.addEventListener("click",async e=>{if(e.target.classList.contains("btn-save")){const s=e.target.dataset.itemId,t=e.target;t.disabled=!0;try{const a=await u(s);t.classList.toggle("active",a.saved),t.textContent=a.saved?"Saved":"Save",console.log(a.message)}catch{alert("Failed to save item.")}finally{t.disabled=!1}}})}export{v as c,f,g as i};
