import{a as _,i as b,g as L,s as d}from"./navbar-DAxEynKi.js";/* empty css               */let p=null,r=null,m=null;const u=document.getElementById("conversationsList"),g=document.getElementById("chatArea");document.getElementById("conversationsSidebar");document.addEventListener("DOMContentLoaded",async()=>{if(await _(),!await b()){window.location.href="index.html";return}r=await L();const t=new URLSearchParams(window.location.search).get("partner_id");t&&await q(t),f()});async function f(){try{const{data:e,error:t}=await d.from("conversations").select(`
                *,
                messages:messages(content, created_at, read, sender_id)
            `).or(`user1_id.eq.${r.id},user2_id.eq.${r.id}`).order("updated_at",{ascending:!1});if(t)throw t;C(e)}catch(e){console.error("Error loading conversations:",e),u.innerHTML='<div class="p-4 text-red-500">Failed to load conversations</div>'}}async function C(e){if(!e||e.length===0){u.innerHTML='<div class="p-4 text-gray-500 text-center">No conversations yet</div>';return}const t=await Promise.all(e.map(async s=>{const n=s.user1_id===r.id?s.user2_id:s.user1_id,{data:o}=await d.from("users").select("name").eq("id",n).single(),i=o?o.name:"Unknown User",c=s.messages||[];c.sort((l,h)=>new Date(h.created_at)-new Date(l.created_at));const a=c[0];return{...s,partnerName:i,lastMessage:a?a.content:"No messages",lastTime:a?new Date(a.created_at).toLocaleDateString():"",unread:a&&!a.read&&a.sender_id!==r.id}}));u.innerHTML=t.map(s=>`
        <div class="conversation-item ${s.id===p?"active":""}" onclick="window.routerOpenChat('${s.id}')">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="font-weight:600; color:var(--text-primary);">${s.partnerName}</span>
                <span style="font-size:0.8rem; color:var(--text-secondary);">${s.lastTime}</span>
            </div>
            <div style="font-size:0.9rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${s.unread?'<span style="color:var(--color-primary);">● </span>':""}${s.lastMessage}
            </div>
        </div>
    `).join("")}window.routerOpenChat=e=>{v(e)};async function v(e){p=e,document.querySelectorAll(".conversation-item").forEach(t=>t.classList.remove("active")),g.innerHTML='<div class="p-4 flex justify-center"><div class="spinner"></div></div>';try{const{data:t,error:s}=await d.from("messages").select("*").eq("conversation_id",e).order("created_at",{ascending:!0});if(s)throw s;const{data:n}=await d.from("conversations").select("*").eq("id",e).single(),o=n.user1_id===r.id?n.user2_id:n.user1_id,{data:i}=await d.from("users").select("name").eq("id",o).single();M(t,i?i.name:"User",o),x(e),y(e)}catch(t){console.error("Chat load error:",t),g.innerHTML="Error loading chat."}}function M(e,t,s){g.innerHTML=`
        <div class="chat-header">
            <h3 class="font-bold text-lg">${t}</h3>
            <!-- Actions like block or profile could go here -->
        </div>
        <div id="messagesList" class="messages-list">
            ${e.length?e.map(a=>w(a)).join(""):'<p class="text-center text-gray-400 mt-4">No messages yet. Say hi!</p>'}
        </div>
        <div class="chat-input-area">
            <textarea id="messageInput" class="message-input" rows="1" placeholder="Type a message..."></textarea>
            <button id="sendBtn" class="send-btn">Send</button>
        </div>
    `;const n=document.getElementById("messagesList");n.scrollTop=n.scrollHeight;const o=document.getElementById("sendBtn"),i=document.getElementById("messageInput");o.onclick=()=>c(i.value),i.addEventListener("keypress",a=>{a.key==="Enter"&&!a.shiftKey&&(a.preventDefault(),c(i.value))});async function c(a){if(!a.trim())return;i.value="";const{error:l}=await d.from("messages").insert([{conversation_id:p,sender_id:r.id,content:a}]);l&&(alert("Failed to send"),i.value=a)}}function w(e){return`
        <div class="message-bubble ${e.sender_id===r.id?"message-sent":"message-received"}">
            ${e.content}
        </div>
    `}function x(e){m&&d.removeChannel(m),m=d.channel(`public:messages:conversation_id=eq.${e}`).on("postgres_changes",{event:"INSERT",schema:"public",table:"messages",filter:`conversation_id=eq.${e}`},t=>{const s=t.new,n=document.getElementById("messagesList");if(n){n.querySelector("p.text-center")&&(n.innerHTML="");const o=document.createElement("div");o.innerHTML=w(s).trim(),n.appendChild(o.firstChild),n.scrollTop=n.scrollHeight,s.sender_id!==r.id&&y(e)}}).subscribe()}async function y(e){const{error:t}=await d.from("messages").update({read:!0}).eq("conversation_id",e).neq("sender_id",r.id).eq("read",!1)}async function q(e){if(e===r.id)return;let t=r.id<e?r.id:e,s=r.id<e?e:r.id;const{data:n}=await d.from("conversations").select("id").eq("user1_id",t).eq("user2_id",s).single();if(n)v(n.id);else{const{data:o,error:i}=await d.from("conversations").insert([{user1_id:t,user2_id:s}]).select().single();i?(console.error("Create conv error:",i),alert("Could not start conversation")):(v(o.id),f())}}
