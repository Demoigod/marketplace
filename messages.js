import { supabase } from './supabase-config.js';
import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';

// State
let currentConversationId = null;
let currentUser = null;
let realtimeSubscription = null;
let allConversations = [];

// DOM Elements
const conversationsList = document.getElementById('conversationsList');
const chatArea = document.getElementById('chatArea');

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard
    const session = await isLoggedIn();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = await getCurrentUser();

    // 2. Initialize Dashboard UI
    updateUserProfile();
    setupEventListeners();

    // 3. Check for partner_id and item_id in URL
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('partner_id');
    const itemId = urlParams.get('item_id');

    if (partnerId) {
        await startNewConversation(partnerId, itemId);
    }

    // 4. Load initial list
    loadConversations();

    // 5. Global subscriptions
    setupGlobalSubscription();

    // Handle logout/auth changes
    supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'index.html';
        }
    });
});

async function updateUserProfile() {
    if (currentUser) {
        const adminNameElements = document.querySelectorAll('.admin-name');
        adminNameElements.forEach(el => el.textContent = currentUser.name || 'User');

        const avatarImages = document.querySelectorAll('.avatar');
        avatarImages.forEach(img => {
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name || 'User')}&background=368CBF&color=fff`;
        });
    }
}

function setupEventListeners() {
    // 1. Conversation Search
    const searchInput = document.getElementById('convSearch');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            const items = document.querySelectorAll('.conversation-item');
            items.forEach(item => {
                const name = item.querySelector('span[style*="font-weight:600"]').textContent.toLowerCase();
                const lastMsg = item.querySelector('div[style*="font-size:0.9rem"]').textContent.toLowerCase();
                if (name.includes(query) || lastMsg.includes(query)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }

    // 2. Logout Logic (sidebar)
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                await logoutUser();
                window.location.href = 'index.html';
            }
        });
    }
}

async function loadConversations() {
    if (!currentUser) return;

    try {
        // Fetch conversations joined with items
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                item:items(title, price, image_url),
                messages (
                    content,
                    created_at,
                    read,
                    sender_id
                )
            `)
            .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;
        renderConversationsList(conversations || []);
    } catch (err) {
        console.error('Error loading conversations:', err);
        if (conversationsList) {
            conversationsList.innerHTML = '<div class="p-4 text-red-500">Error loading inbox. Please refresh.</div>';
        }
    }
}

async function renderConversationsList(conversations) {
    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = '<div class="p-4 text-gray-500 text-center">No conversations yet</div>';
        return;
    }

    const processed = await Promise.all(conversations.map(async (conv) => {
        const partnerId = conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id;
        const { data: partner } = await supabase.from('users').select('name').eq('id', partnerId).single();
        const partnerName = partner ? partner.name : 'Unknown User';

        const msgs = conv.messages || [];
        msgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const lastMsg = msgs[0];
        const lastMessageText = lastMsg ? (lastMsg.content || 'New message') : 'No messages';

        return {
            ...conv,
            partnerName,
            lastMessage: lastMessageText,
            lastTime: lastMsg ? new Date(lastMsg.created_at).toLocaleDateString() : '',
            unread: lastMsg && !lastMsg.read && lastMsg.sender_id !== currentUser.id,
            itemTitle: conv.item ? conv.item.title : null
        };
    }));

    conversationsList.innerHTML = processed.map(c => `
        <div class="conversation-item ${c.id === currentConversationId ? 'active' : ''}" onclick="window.routerOpenChat('${c.id}')">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="font-weight:600; color:var(--text-primary);">${c.partnerName}</span>
                <span style="font-size:0.8rem; color:var(--text-secondary);">${c.lastTime}</span>
            </div>
            ${c.itemTitle ? `<div style="font-size:0.75rem; color:#368CBF; margin-bottom:2px; font-weight:600;">Item: ${c.itemTitle}</div>` : ''}
            <div style="font-size:0.9rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${c.unread ? '<span style="color:#368CBF;">● </span>' : ''}${c.lastMessage}
            </div>
        </div>
    `).join('');
}

window.routerOpenChat = (id) => {
    loadChat(id);
};

async function loadChat(conversationId) {
    currentConversationId = conversationId;
    document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));

    chatArea.innerHTML = '<div style="padding:40px; display:flex; justify-content:center;"><div class="spinner"></div></div>';

    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        // Fetch conversation details with item join
        const { data: conv } = await supabase
            .from('conversations')
            .select('*, item:items(*)')
            .eq('id', conversationId)
            .single();

        const partnerId = conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id;
        const { data: partner } = await supabase.from('users').select('name').eq('id', partnerId).single();

        renderChatArea(messages, partner ? partner.name : 'User', partnerId, conv.item);
        subscribeToConversation(conversationId);
        markMessagesRead(conversationId);

    } catch (err) {
        console.error('Chat load error:', err);
        chatArea.innerHTML = 'Error loading chat.';
    }
}

function renderChatArea(messages, partnerName, partnerId, item) {
    chatArea.innerHTML = `
        <div class="chat-header">
            <h3 class="font-bold text-lg">${partnerName}</h3>
        </div>
        ${item ? `
        <div class="chat-item-header">
            <img src="${item.image_url || 'https://via.placeholder.com/40'}" class="chat-item-img" alt="Item">
            <div class="chat-item-info">
                <div class="chat-item-title">${item.title}</div>
                <div class="chat-item-price">R ${item.price}</div>
            </div>
            <a href="item.html?id=${item.id}" class="btn btn-sm" style="font-size: 0.8rem; padding: 4px 12px;">View Item</a>
        </div>
        ` : ''}
        <div id="messagesList" class="messages-list">
            ${messages.length ? messages.map(msg => renderMessageBubble(msg)).join('') : '<p class="text-center text-gray-400 mt-4">No messages yet. Say hi!</p>'}
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
    `;

    const list = document.getElementById('messagesList');
    list.scrollTop = list.scrollHeight;

    const sendBtn = document.getElementById('sendBtn');
    const input = document.getElementById('messageInput');
    const fileInput = document.getElementById('fileInput');

    sendBtn.onclick = () => sendMessage(input.value);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input.value);
        }
    });

    fileInput.onchange = async () => {
        const file = fileInput.files[0];
        if (file) {
            await handleFileUpload(file);
        }
    };
}

async function handleFileUpload(file) {
    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `attachments/${currentUser.id}/${fileName}`;

    try {
        // 1. Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('message-attachments')
            .upload(filePath, file);

        if (error) throw error;

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from('message-attachments')
            .getPublicUrl(filePath);

        // 3. Send message with attachment
        const isImage = file.type.startsWith('image/');
        await sendMessage('', {
            url: publicUrl,
            type: isImage ? 'image' : 'file'
        });

    } catch (err) {
        console.error('Upload error:', err);
        alert('Failed to upload file. Ensure you have the "message-attachments" bucket created.');
    }
}

async function sendMessage(text, attachment = null) {
    if (!text.trim() && !attachment) return;

    const input = document.getElementById('messageInput');
    if (input) input.value = '';

    const { error } = await supabase
        .from('messages')
        .insert([{
            conversation_id: currentConversationId,
            sender_id: currentUser.id,
            content: text,
            attachment_url: attachment ? attachment.url : null,
            attachment_type: attachment ? attachment.type : null
        }]);

    if (error) {
        console.error('Send error:', error);
        alert('Failed to send message');
    }
}

function renderMessageBubble(msg) {
    const isMe = msg.sender_id === currentUser.id;
    const content = msg.content || '';

    let attachmentHtml = '';
    if (msg.attachment_url) {
        if (msg.attachment_type === 'image') {
            attachmentHtml = `<div class="attachment-preview"><img src="${msg.attachment_url}" class="attachment-img"></div>`;
        } else {
            attachmentHtml = `<a href="${msg.attachment_url}" target="_blank" class="attachment-file">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                </svg>
                Download File
            </a>`;
        }
    }

    return `
        <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
            <div>${content}</div>
            ${attachmentHtml}
            ${isMe && msg.read ? '<div class="read-status">Seen</div>' : ''}
        </div>
    `;
}

function subscribeToConversation(conversationId) {
    if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);

    realtimeSubscription = supabase
        .channel(`public:messages:conversation_id=eq.${conversationId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, payload => {
            if (payload.eventType === 'INSERT') {
                const newMsg = payload.new;
                const list = document.getElementById('messagesList');
                if (list) {
                    if (list.querySelector('p.text-center')) list.innerHTML = '';
                    const div = document.createElement('div');
                    div.innerHTML = renderMessageBubble(newMsg).trim();
                    list.appendChild(div.firstChild);
                    list.scrollTop = list.scrollHeight;

                    if (newMsg.sender_id !== currentUser.id) {
                        markMessagesRead(conversationId);
                    }
                }
            } else if (payload.eventType === 'UPDATE') {
                // Handle read status updates live
                loadChat(conversationId); // Simple way to refresh UI for seen status
            }
        })
        .subscribe();
}

function setupGlobalSubscription() {
    supabase
        .channel('public:messages:global')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
        }, async (payload) => {
            const { data: conv } = await supabase
                .from('conversations')
                .select('id')
                .eq('id', payload.new.conversation_id)
                .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
                .single();

            if (conv) {
                loadConversations();
            }
        })
        .subscribe();
}

async function markMessagesRead(conversationId) {
    await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUser.id)
        .eq('read', false);
}

async function startNewConversation(partnerId, itemId = null) {
    if (partnerId === currentUser.id) return;

    let u1 = currentUser.id < partnerId ? currentUser.id : partnerId;
    let u2 = currentUser.id < partnerId ? partnerId : currentUser.id;

    // Check for existing conversation with item_id
    let query = supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', u1)
        .eq('user2_id', u2);

    if (itemId) {
        query = query.eq('item_id', itemId);
    } else {
        query = query.is('item_id', null);
    }

    const { data: existing } = await query.single();

    if (existing) {
        loadChat(existing.id);
    } else {
        const { data: newConv, error } = await supabase
            .from('conversations')
            .insert([{
                user1_id: u1,
                user2_id: u2,
                item_id: itemId
            }])
            .select()
            .single();

        if (error) {
            console.error('Create conv error:', error);
            alert('Could not start conversation');
        } else {
            loadChat(newConv.id);
            loadConversations();
        }
    }
}
