import{a as l,i as v,g as m,s as o}from"./navbar-CJGh-4aH.js";/* empty css               */let n=null;document.addEventListener("DOMContentLoaded",async()=>{if(await l(),!await v()){window.location.href="index.html";return}n=await m(),n&&(await i(),u())});async function i(){const e=document.getElementById("conversationsContainer");e.innerHTML='<div class="loading-state">Loading your messages...</div>';try{const{data:a,error:r}=await o.from("conversations").select("*").or(`user1_id.eq.${n.id},user2_id.eq.${n.id}`).order("created_at",{ascending:!1});if(r)throw r;if(!a||a.length===0){e.innerHTML=`
                <div class="empty-state">
                    <p>No messages yet.</p>
                    <a href="index.html" class="btn-primary" style="margin-top: 1rem; display: inline-block;">Browse Marketplace</a>
                </div>`;return}e.innerHTML="";for(const t of a){const d=t.user1_id===n.id?t.user2_id:t.user1_id,c=await p(d),s=document.createElement("div");s.className="conversation-card",s.onclick=()=>window.location.href=`chat.html?conversation_id=${t.id}`,s.innerHTML=`
                <div class="conv-avatar">${c.charAt(0).toUpperCase()}</div>
                <div class="conv-details">
                    <div class="conv-top">
                        <span class="conv-name">${c}</span>
                        <span class="conv-time">${new Date(t.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="conv-preview">Click to view conversation</div>
                </div>
            `,e.appendChild(s)}}catch(a){console.error("Error loading inbox:",a.message),e.innerHTML=`<div class="error-state">Error: ${a.message}</div>`}}async function p(e){try{const{data:a,error:r}=await o.from("users").select("name").eq("id",e).single();return r||!a?"Chat Partner":a.name}catch{return"Chat Partner"}}function u(){o.channel("inbox-updates").on("postgres_changes",{event:"INSERT",schema:"public",table:"conversations",filter:`user1_id=eq.${n.id}`},e=>i()).on("postgres_changes",{event:"INSERT",schema:"public",table:"conversations",filter:`user2_id=eq.${n.id}`},e=>i()).subscribe()}
