import{i as b,g as x,s as a}from"./auth-BNhlD6S9.js";import"./admin-Bu9uiZ5z.js";let l=null,n=null,f=null;const g=document.getElementById("conversationsList"),p=document.getElementById("chatArea");document.addEventListener("DOMContentLoaded",async()=>{if(!await b()){window.location.href="index.html";return}n=await x(),k();const t=new URLSearchParams(window.location.search),s=t.get("seller_id"),i=t.get("listing_id");s&&i&&await S(s,i),h(),E()});async function h(){if(n)try{const{data:e,error:t}=await a.from("conversations").select(`
                *,
                item:market_listings(title, price, image_url),
                buyer:profiles!buyer_id(username, avatar_url),
                seller:profiles!seller_id(username, avatar_url)
            `).or(`buyer_id.eq.${n.id},seller_id.eq.${n.id}`).order("updated_at",{ascending:!1});if(t)throw t;const s=await Promise.all(e.map(async i=>{const{data:r}=await a.from("messages").select("*").eq("conversation_id",i.id).order("created_at",{ascending:!1}).limit(1).single(),o=i.buyer_id===n.id,d=o?i.seller:i.buyer,c=o?i.seller_id:i.buyer_id,{data:m}=await a.from("profiles").select("immutable_user_code").eq("id",c).single(),{count:w}=await a.from("messages").select("*",{count:"exact",head:!0}).eq("conversation_id",i.id).is("read_at",null).neq("sender_id",n.id);return{...i,partnerName:(d==null?void 0:d.username)||"User",partnerId:c,displayId:(m==null?void 0:m.immutable_user_code)||c.slice(0,6).toUpperCase(),lastMessage:(r==null?void 0:r.content)||((r==null?void 0:r.message_type)!=="text"?"Sent a file":"No messages yet"),lastTime:r?T(r.created_at):"",unreadCount:w||0}}));C(s)}catch(e){console.error("Inbox load error:",e)}}function C(e){if(g){if(e.length===0){g.innerHTML='<div class="p-8 text-center text-gray-400">No conversations yet.</div>';return}g.innerHTML=e.map(t=>`
        <div class="conversation-item ${t.id===l?"active":""}" 
             onclick="window.selectConversation('${t.id}')">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <span style="font-weight:700; color:var(--text-main); font-size:0.95rem;">${u(t.partnerName)}</span>
                    <div style="font-size:0.7rem; color:var(--text-muted);">ID: ${t.displayId}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.75rem; color:var(--text-muted);">${t.lastTime}</div>
                    ${t.unreadCount>0?`<span style="display:inline-block; background:var(--primary-color); color:white; font-size:0.7rem; padding:1px 6px; border-radius:10px; font-weight:700; margin-top:4px;">${t.unreadCount}</span>`:""}
                </div>
            </div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${t.unreadCount>0?"font-weight:600;":""}">
                ${u(t.lastMessage||"")}
            </div>
            ${t.item?`<div style="font-size:0.75rem; color:var(--primary-color); font-weight:600; margin-top:4px;">Item: ${u(t.item.title)}</div>`:""}
        </div>
    `).join("")}}window.selectConversation=async e=>{l=e,$(),await v(e)};function $(){document.querySelectorAll(".conversation-item").forEach(e=>{var t;e.classList.remove("active"),(t=e.getAttribute("onclick"))!=null&&t.includes(l)&&e.classList.add("active")})}async function v(e){if(p){p.innerHTML='<div class="flex items-center justify-center h-full"><div class="spinner"></div></div>';try{const{data:t,error:s}=await a.from("messages").select("*").eq("conversation_id",e).order("created_at",{ascending:!0});if(s)throw s;const{data:i}=await a.from("conversations").select("*, item:market_listings(*), buyer:profiles!buyer_id(username), seller:profiles!seller_id(username)").eq("id",e).single(),r=i.buyer_id===n.id?i.seller:i.buyer,o=i.buyer_id===n.id?i.seller_id:i.buyer_id,{data:d}=await a.from("profiles").select("immutable_user_code").eq("id",o).single(),c=(d==null?void 0:d.immutable_user_code)||o.slice(0,6).toUpperCase();I(t,(r==null?void 0:r.username)||"User",c,i.item),_(e),L(e)}catch(t){console.error("Chat load error:",t)}}}function I(e,t,s,i){p.innerHTML=`
        <div class="chat-header">
            <div>
                <h3 style="font-weight:700; font-size:1.1rem;">${u(t)}</h3>
                <span style="font-size:0.75rem; color:var(--text-muted);">User ID: ${s}</span>
            </div>
        </div>
        ${i?`
            <div class="chat-item-header">
                <img src="${i.image_url||"https://via.placeholder.com/40"}" class="chat-item-img">
                <div class="chat-item-info">
                    <div class="chat-item-title">${u(i.title)}</div>
                    <div class="chat-item-price">R ${i.price}</div>
                </div>
                <a href="listings.html?id=${i.id}" class="action-btn" style="padding:4px 12px; font-size:0.8rem;">View Item</a>
            </div>
        `:""}
        <div id="messagesList" class="messages-list">
            ${e.map(o=>y(o)).join("")}
        </div>
        <div class="chat-input-area">
            <div class="upload-btn-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <input type="file" id="fileAttach" onchange="window.handleChatUpload(this)">
            </div>
            <textarea id="msgInput" class="message-input" placeholder="Type a message..." rows="1"></textarea>
            <button onclick="window.sendChatMessage()" class="send-btn">Send</button>
        </div>
    `;const r=document.getElementById("messagesList");r.scrollTop=r.scrollHeight,document.getElementById("msgInput").addEventListener("keypress",o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),window.sendChatMessage())})}function y(e){const t=e.sender_id===n.id;let s=u(e.content||"");return e.message_type==="image"?s=`<img src="${e.file_url}" style="max-width:100%; border-radius:8px; display:block;">`:e.message_type==="file"&&(s=`<a href="${e.file_url}" target="_blank" class="attachment-file"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg> Document</a>`),`
        <div class="message-bubble ${t?"message-sent":"message-received"}">
            ${s}
            <div class="read-status">
                ${q(e.created_at)}
                ${t?e.read_at?" • Seen":" • Sent":""}
            </div>
        </div>
    `}window.sendChatMessage=async()=>{const e=document.getElementById("msgInput"),t=e.value.trim();if(!t||!l)return;e.value="";const{data:s}=await a.from("conversations").select("buyer_id, seller_id").eq("id",l).single(),i=s.buyer_id===n.id?s.seller_id:s.buyer_id,{error:r}=await a.from("messages").insert([{conversation_id:l,sender_id:n.id,receiver_id:i,content:t,message_type:"text"}]);r&&console.error("Send error:",r)};window.handleChatUpload=async e=>{const t=e.files[0];if(!t||!l)return;const s=`${Date.now()}_${t.name}`,i=`${n.id}/${s}`;try{const{error:r}=await a.storage.from("chat-attachments").upload(i,t);if(r)throw r;const{data:{publicUrl:o}}=a.storage.from("chat-attachments").getPublicUrl(i),{data:d}=await a.from("conversations").select("buyer_id, seller_id").eq("id",l).single(),c=d.buyer_id===n.id?d.seller_id:d.buyer_id,m=t.type.startsWith("image/")?"image":"file";await a.from("messages").insert([{conversation_id:l,sender_id:n.id,receiver_id:c,message_type:m,file_url:o}])}catch(r){console.error("Upload Error:",r),alert("Failed to upload file.")}};function L(e){f&&a.removeChannel(f),f=a.channel(`chat:${e}`).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:`conversation_id=eq.${e}`},t=>{if(t.eventType==="INSERT"){const s=document.getElementById("messagesList");if(s){const i=document.createElement("div");i.innerHTML=y(t.new),s.appendChild(i.firstElementChild),s.scrollTop=s.scrollHeight,t.new.sender_id!==n.id&&_(e)}}else t.eventType==="UPDATE"&&v(e)}).subscribe()}function E(){a.channel("inbox-updates").on("postgres_changes",{event:"*",schema:"public",table:"messages"},()=>{h()}).subscribe()}async function _(e){await a.from("messages").update({read_at:new Date().toISOString()}).eq("conversation_id",e).neq("sender_id",n.id).is("read_at",null)}async function S(e,t){if(e===n.id){alert("You cannot message yourself.");return}try{const{data:s}=await a.from("conversations").select("id").eq("listing_id",t).eq("buyer_id",n.id).eq("seller_id",e).single();if(s){window.selectConversation(s.id);return}const{data:i,error:r}=await a.from("conversations").insert([{listing_id:t,buyer_id:n.id,seller_id:e}]).select().single();if(r)throw r;window.selectConversation(i.id)}catch(s){console.error("Conv Error:",s)}}function T(e){const t=new Date(e),s=new Date;return t.toDateString()===s.toDateString()?t.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}):t.toLocaleDateString([],{month:"short",day:"numeric"})}function q(e){return new Date(e).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}function u(e){if(!e)return"";const t=document.createElement("div");return t.textContent=e,t.innerHTML}function k(){const e=document.getElementById("convSearch");e&&e.addEventListener("input",t=>{const s=t.target.value.toLowerCase();document.querySelectorAll(".conversation-item").forEach(i=>{i.style.display=i.textContent.toLowerCase().includes(s)?"block":"none"})})}
