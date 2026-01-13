import{s as r,i as o,g as d}from"./auth-DlafXHy2.js";async function u(){try{const{data:e,error:t}=await r.from("market_listings").select(`
                *,
                seller:profiles(username)
            `).order("created_at",{ascending:!1});if(t)throw t;return e||[]}catch(e){return console.error("Error fetching items:",e),[]}}function m(e,t=!1){const a=new Date(e.created_at).toLocaleDateString(),s=e.images&&e.images.length>0?e.images[0]:"https://via.placeholder.com/300x200";let i="";return t?i=`
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
            <div class="item-image" style="background-image: url('${s}'); background-size: cover; background-position: center;"></div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${n(e.title)}</h3>
                    <span class="item-price">$${parseFloat(e.price).toFixed(2)}</span>
                </div>
                <p class="item-date">Posted on ${a}</p>
                <p class="item-description">${n(e.description)}</p>
                
                ${i}
            </div>
        </div>
    `}function n(e){const t=document.createElement("div");return t.textContent=e,t.innerHTML}async function c(e){if(!await o()){alert("Please log in to save items."),document.dispatchEvent(new CustomEvent("open-auth-modal"));return}const t=await d();if(t)try{const{data:a,error:s}=await r.from("saved_items").select("id").eq("user_id",t.id).eq("item_id",e).maybeSingle();if(s)throw s;if(a){const{error:i}=await r.from("saved_items").delete().eq("id",a.id);if(i)throw i;return{saved:!1,message:"Item removed from bookmarks"}}else{const{error:i}=await r.from("saved_items").insert([{user_id:t.id,item_id:e}]);if(i)throw i;return{saved:!0,message:"Item saved successfully!"}}}catch(a){throw console.error("Save error:",a),a}}function v(){document.addEventListener("click",async e=>{if(e.target.classList.contains("btn-save")){const t=e.target.dataset.itemId,a=e.target;a.disabled=!0;try{const s=await c(t);a.classList.toggle("active",s.saved),a.textContent=s.saved?"Saved":"Save",console.log(s.message)}catch{alert("Failed to save item.")}finally{a.disabled=!1}}})}export{m as c,u as f,v as i};
