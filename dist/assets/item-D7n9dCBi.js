import{a as d,i as o,s as l}from"./navbar-DAxEynKi.js";/* empty css               */document.addEventListener("DOMContentLoaded",async()=>{await d();const a=new URLSearchParams(window.location.search).get("id");if(!a){window.location.href="index.html";return}c(a)});async function c(i){const a=document.getElementById("itemDetailContainer"),e=await o();try{const{data:t,error:s}=await l.from("items").select("*").eq("id",i).single();if(s||!t)throw new Error("Item not found");const n=t.images&&t.images.length>0?t.images[0]:"https://via.placeholder.com/600x400";a.innerHTML=`
                    <div class="item-detail-grid">
                        <div class="item-visuals">
                            <img src="${n}" alt="${t.title}" class="main-detail-image">
                        </div>
                        <div class="item-info-panel">
                            <h1 class="detail-title">${t.title}</h1>
                            <div class="detail-meta">
                                <span class="detail-price">$${parseFloat(t.price).toFixed(2)}</span>
                                <span class="detail-date">Posted ${new Date(t.created_at).toLocaleDateString()}</span>
                            </div>
                            <div class="detail-description">
                                <h3>Description</h3>
                                <p>${t.description}</p>
                            </div>
                            <div class="detail-actions">
                                <button class="btn-primary btn-full ${e?"":"disabled"}" onclick="handleBuyAction('${t.id}')">Buy Now</button>
                                <button class="btn-secondary btn-full ${e?"":"disabled"}" onclick="handleContactAction('${t.user_id}')">Contact Seller</button>
                            </div>
                        </div>
                    </div>
                `}catch(t){a.innerHTML=`<div class="error-state">${t.message}</div>`}}
