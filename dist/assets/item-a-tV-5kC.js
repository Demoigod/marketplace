import{s as v}from"./auth-BNhlD6S9.js";/* empty css              */import"./admin-C48qMl0r.js";document.addEventListener("DOMContentLoaded",async()=>{const t=new URLSearchParams(window.location.search).get("id");if(!t){window.location.href="listings.html";return}f(t)});async function f(a){var r,n,o,l;const t=document.getElementById("itemDetailContainer");try{const{data:e,error:p}=await v.from("market_listings").select(`
                        *,
                        profiles (
                            username,
                            full_name,
                            avatar_url,
                            immutable_user_code
                        )
                    `).eq("id",a).single();if(p||!e)throw new Error("Item not found or has been removed.");let i=[];e.image_url&&i.push(e.image_url),e.images&&Array.isArray(e.images)&&e.images.forEach(s=>{s&&!i.includes(s)&&i.push(s)}),i.length===0&&i.push("https://via.placeholder.com/600x400?text=No+Image");const u=i[0],c=((r=e.profiles)==null?void 0:r.username)||((n=e.profiles)==null?void 0:n.full_name)||"Anonymous Seller",g=((o=e.profiles)==null?void 0:o.immutable_user_code)||e.seller_id.slice(0,6).toUpperCase(),h=((l=e.profiles)==null?void 0:l.avatar_url)||`https://ui-avatars.com/api/?name=${encodeURIComponent(c)}&background=368CBF&color=fff`;let d="";i.length>1&&(d='<div class="detail-thumbnails">'+i.map((s,m)=>`
                            <img src="${s}" 
                                 class="thumbnail-img ${m===0?"active":""}" 
                                 onclick="changeMainImage('${s}', this)"
                                 alt="Thumbnail ${m+1}">
                        `).join("")+"</div>"),t.innerHTML=`
                    <div class="item-detail-container">
                        <div class="detail-visuals">
                            <img src="${u}" alt="${e.title}" class="detail-main-img" id="mainImageDisplay">
                            ${d}
                        </div>
                        <div class="detail-info-panel">
                            <span class="detail-category">${e.category||"MARKETPLACE"}</span>
                            <h1 class="detail-title">${e.title}</h1>
                            
                            <div class="detail-price-box">
                                <span class="detail-currency">R</span>
                                <span class="detail-price">${parseFloat(e.price).toLocaleString()}</span>
                            </div>

                            <div class="detail-section">
                                <h4>Description</h4>
                                <div class="detail-description">
                                    ${e.description||"No description provided."}
                                </div>
                            </div>

                            <div class="detail-section">
                                <h4>Listing Details</h4>
                                <p style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">
                                    <strong>Status:</strong> <span class="status-tag active" style="font-size: 0.7rem;">${e.status.toUpperCase()}</span>
                                </p>
                                <p style="font-size: 0.9rem; color: var(--text-muted);">
                                    <strong>Posted:</strong> ${new Date(e.created_at).toLocaleDateString(void 0,{year:"numeric",month:"long",day:"numeric"})}
                                </p>
                            </div>

                            <div class="detail-seller-card">
                                <img src="${h}" class="seller-avatar">
                                <div class="seller-meta-info">
                                    <span class="name">${c}</span>
                                    <span class="id">User ID: #${g}</span>
                                </div>
                            </div>

                            <div class="detail-actions-grid">
                                <button class="btn-primary" onclick="window.handleBuyAction('${e.id}')" style="width: 100%; height: 48px; border-radius: 12px; font-weight: 700;">Buy Now</button>
                                <button class="btn-secondary" onclick="window.handleContactAction('${e.seller_id}', '${e.id}')" style="width: 100%; height: 48px; border-radius: 12px; font-weight: 700; background: transparent; color: var(--primary-color); border: 2px solid var(--primary-color);">Contact Seller</button>
                            </div>
                        </div>
                    </div>
                `}catch(e){console.error("Render error:",e),t.innerHTML=`
                    <div class="p-12 text-center">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">❌</div>
                        <h3 style="font-weight: 800; font-size: 1.5rem; margin-bottom: 0.5rem;">Oops!</h3>
                        <p style="color: var(--text-muted);">${e.message}</p>
                        <a href="listings.html" class="btn-primary" style="display: inline-block; margin-top: 2rem; padding: 0.75rem 2rem; text-decoration: none; border-radius: 10px;">Back to Marketplace</a>
                    </div>
                `}}window.changeMainImage=(a,t)=>{const r=document.getElementById("mainImageDisplay");r&&(r.src=a,document.querySelectorAll(".thumbnail-img").forEach(n=>n.classList.remove("active")),t&&t.classList.add("active"))};window.handleBuyAction=a=>{window.location.href=`checkout.html?id=${a}`};window.handleContactAction=(a,t)=>{window.location.href=`messages.html?seller_id=${a}&listing_id=${t}`};
