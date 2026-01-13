import{i as x,g as E,s as l,b as C}from"./auth-DlafXHy2.js";/* empty css              *//* empty css               */let h=null,i=null,f=null;const m=document.getElementById("conversationsList"),p=document.getElementById("chatArea");document.addEventListener("DOMContentLoaded",async()=>{if(!await x()){window.location.href="index.html";return}i=await E(),q(),L();const t=new URLSearchParams(window.location.search),s=t.get("partner_id"),n=t.get("item_id");s&&await I(s,n),y(),B(),l.auth.onAuthStateChange(a=>{a==="SIGNED_OUT"&&(window.location.href="index.html")})});async function q(){i&&(document.querySelectorAll(".admin-name").forEach(s=>s.textContent=i.name||"User"),document.querySelectorAll(".avatar").forEach(s=>{s.src=`https://ui-avatars.com/api/?name=${encodeURIComponent(i.name||"User")}&background=368CBF&color=fff`}))}function L(){const e=document.getElementById("convSearch");e&&e.addEventListener("input",s=>{const n=s.target.value.toLowerCase();document.querySelectorAll(".conversation-item").forEach(r=>{const d=r.querySelector('span[style*="font-weight:600"]').textContent.toLowerCase(),c=r.querySelector('div[style*="font-size:0.9rem"]').textContent.toLowerCase();d.includes(n)||c.includes(n)?r.style.display="block":r.style.display="none"})});const t=document.querySelector(".logout-btn");t&&t.addEventListener("click",async()=>{confirm("Are you sure you want to logout?")&&(await C(),window.location.href="index.html")})}async function y(){if(i)try{const{data:e,error:t}=await l.from("conversations").select(`
                *,
                item:market_listings(title, price, image_url),
                messages (
                    content,
                    created_at,
                    read,
                    sender_id
                )
            `).or(`user1_id.eq.${i.id},user2_id.eq.${i.id}`).order("updated_at",{ascending:!1});if(t)throw t;S(e||[])}catch(e){console.error("Error loading conversations:",e),m&&(m.innerHTML='<div class="p-4 text-red-500">Error loading inbox. Please refresh.</div>')}}async function S(e){if(!e||e.length===0){m.innerHTML='<div class="p-4 text-gray-500 text-center">No conversations yet</div>';return}const t=await Promise.all(e.map(async s=>{const n=s.user1_id===i.id?s.user2_id:s.user1_id,{data:a}=await l.from("profiles").select("username, public_user_id").eq("id",n).single(),r=a?a.username:"Unknown User",d=a?a.public_user_id:null,c=s.messages||[];c.sort((b,$)=>new Date($.created_at)-new Date(b.created_at));const o=c[0],u=o?o.content||"New message":"No messages";return{...s,partnerName:r,partnerPublicId:d,lastMessage:u,lastTime:o?new Date(o.created_at).toLocaleDateString():"",unread:o&&!o.read&&o.sender_id!==i.id,itemTitle:s.item?s.item.title:null}}));m.innerHTML=t.map(s=>`
        <div class="conversation-item ${s.id===h?"active":""}" onclick="window.routerOpenChat('${s.id}')">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <div>
                    <span style="font-weight:600; color:var(--text-primary);">${s.partnerName}</span>
                    ${s.partnerPublicId?`
                        <div style="font-size:0.7rem; color:var(--text-secondary); margin-top:2px; opacity:0.8;">
                            ID: ${s.partnerPublicId}
                        </div>
                    `:""}
                </div>
                <span style="font-size:0.8rem; color:var(--text-secondary);">${s.lastTime}</span>
            </div>
            ${s.itemTitle?`<div style="font-size:0.75rem; color:#368CBF; margin-bottom:2px; font-weight:600;">Item: ${s.itemTitle}</div>`:""}
            <div style="font-size:0.9rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${s.unread?'<span style="color:#368CBF;">● </span>':""}${s.lastMessage}
            </div>
        </div>
    `).join("")}window.routerOpenChat=e=>{g(e)};async function g(e){h=e,document.querySelectorAll(".conversation-item").forEach(t=>t.classList.remove("active")),p.innerHTML='<div style="padding:40px; display:flex; justify-content:center;"><div class="spinner"></div></div>';try{const{data:t,error:s}=await l.from("messages").select("*").eq("conversation_id",e).order("created_at",{ascending:!0});if(s)throw s;const{data:n}=await l.from("conversations").select("*, item:market_listings(*)").eq("id",e).single(),a=n.user1_id===i.id?n.user2_id:n.user1_id,{data:r}=await l.from("profiles").select("username").eq("id",a).single();T(t,r?r.username:"User",a,n.item),k(e),_(e)}catch(t){console.error("Chat load error:",t),p.innerHTML="Error loading chat."}}function T(e,t,s,n){p.innerHTML=`
        <div class="chat-header">
            <h3 class="font-bold text-lg">${t}</h3>
        </div>
        ${n?`
        <div class="chat-item-header">
            <img src="${n.image_url||"https://via.placeholder.com/40"}" class="chat-item-img" alt="Item">
            <div class="chat-item-info">
                <div class="chat-item-title">${n.title}</div>
                <div class="chat-item-price">R ${n.price}</div>
            </div>
            <a href="item.html?id=${n.id}" class="btn btn-sm" style="font-size: 0.8rem; padding: 4px 12px;">View Item</a>
        </div>
        `:""}
        <div id="messagesList" class="messages-list">
            ${e.length?e.map(o=>w(o)).join(""):'<p class="text-center text-gray-400 mt-4">No messages yet. Say hi!</p>'}
        </div>
        <div class="chat-input-area">
            <div class="upload-btn-wrapper">
                <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
                </svg>
                <input type="file" id="fileInput" name="attachment">
            </div>
            <textarea id="messageInput" class="message-input" rows="1" placeholder="Type a message..."></textarea>
            <button id="sendBtn" class="send-btn">Send</button>
        </div>
    `;const a=document.getElementById("messagesList");a.scrollTop=a.scrollHeight;const r=document.getElementById("sendBtn"),d=document.getElementById("messageInput"),c=document.getElementById("fileInput");r.onclick=()=>v(d.value),d.addEventListener("keypress",o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),v(d.value))}),c.onchange=async()=>{const o=c.files[0];o&&await M(o)}}async function M(e){const t=`${Date.now()}_${e.name}`,s=`attachments/${i.id}/${t}`;try{const{data:n,error:a}=await l.storage.from("message-attachments").upload(s,e);if(a)throw a;const{data:{publicUrl:r}}=l.storage.from("message-attachments").getPublicUrl(s),d=e.type.startsWith("image/");await v("",{url:r,type:d?"image":"file"})}catch(n){console.error("Upload error:",n),alert('Failed to upload file. Ensure you have the "message-attachments" bucket created.')}}async function v(e,t=null){if(!e.trim()&&!t)return;const s=document.getElementById("messageInput");s&&(s.value="");const{error:n}=await l.from("messages").insert([{conversation_id:h,sender_id:i.id,content:e,attachment_url:t?t.url:null,attachment_type:t?t.type:null}]);n&&(console.error("Send error:",n),alert("Failed to send message"))}function w(e){const t=e.sender_id===i.id,s=e.content||"";let n="";return e.attachment_url&&(e.attachment_type==="image"?n=`<div class="attachment-preview"><img src="${e.attachment_url}" class="attachment-img"></div>`:n=`<a href="${e.attachment_url}" target="_blank" class="attachment-file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                Download File
            </a>`),`
        <div class="message-bubble ${t?"message-sent":"message-received"}">
            <div>${s}</div>
            ${n}
            ${t&&e.read?'<div class="read-status">Seen</div>':""}
        </div>
    `}function k(e){f&&l.removeChannel(f),f=l.channel(`public:messages:conversation_id=eq.${e}`).on("postgres_changes",{event:"*",schema:"public",table:"messages",filter:`conversation_id=eq.${e}`},t=>{if(t.eventType==="INSERT"){const s=t.new,n=document.getElementById("messagesList");if(n){n.querySelector("p.text-center")&&(n.innerHTML="");const a=document.createElement("div");a.innerHTML=w(s).trim(),n.appendChild(a.firstChild),n.scrollTop=n.scrollHeight,s.sender_id!==i.id&&_(e)}}else t.eventType==="UPDATE"&&g(e)}).subscribe()}function B(){l.channel("public:messages:global").on("postgres_changes",{event:"INSERT",schema:"public",table:"messages"},async e=>{const{data:t}=await l.from("conversations").select("id").eq("id",e.new.conversation_id).or(`user1_id.eq.${i.id},user2_id.eq.${i.id}`).single();t&&y()}).subscribe()}async function _(e){await l.from("messages").update({read:!0}).eq("conversation_id",e).neq("sender_id",i.id).eq("read",!1)}async function I(e,t=null){if(!e||e==="null"||e===i.id)return;const s=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;if(!s.test(e)){console.warn("Invalid partnerId:",e);return}(t==="null"||t==="")&&(t=null),t&&!s.test(t)&&(console.warn("Invalid itemId:",t),t=null);let n=i.id<e?i.id:e,a=i.id<e?e:i.id,r=l.from("conversations").select("id").eq("user1_id",n).eq("user2_id",a);t?r=r.eq("item_id",t):r=r.is("item_id",null);const{data:d,error:c}=await r.single();if(d)g(d.id);else if(c&&c.code!=="PGRST116")console.error("Error checking for existing conversation:",c),c.message.includes('column "item_id" does not exist')?alert("Database error: Please ensure you have run the messaging-upgrade.sql script in your Supabase SQL Editor."):alert(`Error checking conversation: ${c.message}`);else{const{data:o,error:u}=await l.from("conversations").insert([{user1_id:n,user2_id:a,item_id:t}]).select().single();u?(console.error("Create conv error:",u),u.message.includes('column "item_id" does not exist')?alert("Database error: Please ensure you have run the messaging-upgrade.sql script in your Supabase SQL Editor."):alert(`Could not start conversation: ${u.message}`)):(g(o.id),y())}}
