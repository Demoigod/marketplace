import{g as l,s as r}from"./auth-B4SlU3WG.js";import"./admin-Chfn7G1P.js";document.addEventListener("DOMContentLoaded",async()=>{const t=await l();if(!t){window.location.href="index.html";return}await c(t.id)});async function c(t){const a=document.getElementById("myListingsGrid");try{const{data:e,error:o}=await r.from("market_listings").select("*").eq("seller_id",t).order("created_at",{ascending:!1});if(o)throw o;if(!e||e.length===0){a.innerHTML=`
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                    <h3>No listings found</h3>
                    <p>You haven't listed any items for sale yet.</p>
                    <a href="post-item.html" class="btn-primary" style="display: inline-block; margin-top: 1rem; text-decoration: none;">Post an Item</a>
                </div>
            `;return}a.innerHTML=e.map(s=>g(s)).join(""),document.querySelectorAll(".status-select").forEach(s=>{s.addEventListener("change",async i=>{const n=i.target.dataset.id,d=i.target.value;await u(n,d)})}),document.querySelectorAll(".delete-btn").forEach(s=>{s.addEventListener("click",async i=>{const n=i.target.dataset.id;confirm("Are you sure you want to delete this listing? It cannot be undone.")&&await p(n)})})}catch(e){console.error("Error loading my listings:",e),a.innerHTML='<div style="color: red; padding: 2rem;">Error loading listings. Please refresh.</div>'}}function g(t){let a="https://via.placeholder.com/300x200?text=No+Image";if(t.images&&Array.isArray(t.images)&&t.images.length>0)a=t.images[0];else if(typeof t.images=="string"&&t.images.startsWith("["))try{const e=JSON.parse(t.images);e.length>0&&(a=e[0])}catch{}return`
        <div class="item-card" id="card-${t.id}">
            <div class="card-image">
                <img src="${a}" alt="${t.title}" loading="lazy">
                <span class="price-tag">R ${t.price}</span>
            </div>
            <div class="card-content">
                <h3 class="item-title">${t.title}</h3>
                <p class="item-meta">${t.category} • ${new Date(t.created_at).toLocaleDateString()}</p>
                
                <div class="status-actions">
                    <select class="status-select" data-id="${t.id}">
                        <option value="active" ${t.status==="active"?"selected":""}>Active 🟢</option>
                        <option value="sold" ${t.status==="sold"?"selected":""}>Sold 🔴</option>
                        <option value="pending" ${t.status==="pending"?"selected":""}>Pending 🟡</option>
                    </select>
                    <button class="delete-btn" data-id="${t.id}">🗑️</button>
                </div>
            </div>
        </div>
    `}async function u(t,a){try{const{error:e}=await r.from("market_listings").update({status:a}).eq("id",t);if(e)throw e;alert(`Status updated to ${a}`)}catch(e){console.error("Failed to update status:",e),alert("Failed to update status.")}}async function p(t){try{const{error:a}=await r.from("market_listings").delete().eq("id",t);if(a)throw a;const e=document.getElementById(`card-${t}`);e&&e.remove(),alert("Listing deleted.")}catch(a){console.error("Failed to delete:",a),alert("Failed to delete listing.")}}
