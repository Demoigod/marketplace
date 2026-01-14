import{s as i,i as d,g as l}from"./auth-DlafXHy2.js";async function v(){try{const{data:e,error:t}=await i.from("market_listings").select(`
                *,
                profiles (
                    username,
                    full_name
                )
            `).eq("status","active").order("created_at",{ascending:!1});if(t)throw console.error("Supabase fetch error:",t),t;return console.log("Fetched items:",e),e||[]}catch(e){return console.error("Error fetching items:",e),[]}}function f(e,t=!1){var o,c;const s=new Date(e.created_at).toLocaleDateString();let a=e.image_url;!a&&e.images&&e.images.length>0&&(a=e.images[0]),a||(a="https://via.placeholder.com/300x200?text=No+Image");let r="";return t?r=`
            <div class="item-actions-grid">
                <button class="btn-buy" data-action="buy" data-id="${e.id}">Buy</button>
                <button class="btn-contact" data-action="contact" data-seller-id="${e.seller_id}">Contact Seller</button>
                <button class="btn-save" data-action="save" data-item-id="${e.id}">Save</button>
                <button class="btn-view" data-action="view" data-id="${e.id}">View Details</button>
            </div>
        `:r=`
            <div class="item-actions-preview">
                <button class="btn-primary btn-full" data-action="view" data-id="${e.id}">View Item</button>
            </div>
        `,`
        <div class="marketplace-item" data-id="${e.id}" data-user-id="${e.seller_id}">
            <div class="item-image" style="background-image: url('${a}'); background-size: cover; background-position: center;"></div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${n(e.title||"Untitled Item")}</h3>
                    <span class="item-price">R ${parseFloat(e.price||0).toLocaleString()}</span>
                </div>
                <div class="item-meta" style="margin-bottom: 0.5rem; font-size: 0.85rem; color: #666;">
                    <span>By ${n(((o=e.profiles)==null?void 0:o.username)||((c=e.profiles)==null?void 0:c.full_name)||"Anonymous")}</span>
                </div>
                <p class="item-date">Posted on ${s}</p>
                <p class="item-description">${n(e.description)}</p>
                
                ${r}
            </div>
        </div>
    `}function n(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function m(e){if(!await d()){alert("Please log in to save items."),document.dispatchEvent(new CustomEvent("open-auth-modal"));return}const t=await l();if(t)try{const{data:s,error:a}=await i.from("saved_items").select("id").eq("user_id",t.id).eq("item_id",e).maybeSingle();if(a)throw a;if(s){const{error:r}=await i.from("saved_items").delete().eq("id",s.id);if(r)throw r;return{saved:!1,message:"Item removed from bookmarks"}}else{const{error:r}=await i.from("saved_items").insert([{user_id:t.id,item_id:e}]);if(r)throw r;return{saved:!0,message:"Item saved successfully!"}}}catch(s){throw console.error("Save error:",s),s}}function g(){document.addEventListener("click",async e=>{if(e.target.classList.contains("btn-save")){const t=e.target.dataset.itemId,s=e.target;s.disabled=!0;try{const a=await m(t);s.classList.toggle("active",a.saved),s.textContent=a.saved?"Saved":"Save",console.log(a.message)}catch{alert("Failed to save item.")}finally{s.disabled=!1}}})}export{f as c,v as f,g as i};
