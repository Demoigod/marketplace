import { supabase } from './supabase-config.js';
import { isLoggedIn, getCurrentUser } from './auth.js';

// State
let currentConversationId = null;
let currentUser = null;
let realtimeSubscription = null;

// DOM Elements
const conversationsList = document.getElementById('conversationsList');
const chatArea = document.getElementById('chatArea');

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = await getCurrentUser();

    // 2. Initialize UI
    setupSearch();

    // 3. Check for specific conversation in URL (from listings)
    const urlParams = new URLSearchParams(window.location.search);
    const sellerId = urlParams.get('seller_id');
    const listingId = urlParams.get('listing_id');

    if (sellerId && listingId) {
        await startOrOpenConversation(sellerId, listingId);
    }

    // 4. Load Inbox
    loadInbox();

    // 5. Global Realtime for Inbox Updates
    subscribeToInbox();
});

/**
 * Loads the list of conversations for the current user.
 */
async function loadInbox() {
    if (!currentUser) return;

    try {
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                item:market_listings(title, price, image_url),
                buyer:profiles!buyer_id(username, avatar_url),
                seller:profiles!seller_id(username, avatar_url)
            `)
            .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        // For each conversation, fetch the last message
        const inboxData = await Promise.all(conversations.map(async (conv) => {
            const { data: lastMsg } = await supabase
                .from('messages')
                .select('*')
                .eq('conversation_id', conv.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            const isBuyer = conv.buyer_id === currentUser.id;
            const partner = isBuyer ? conv.seller : conv.buyer;
            const partnerId = isBuyer ? conv.seller_id : conv.buyer_id;

            // Get partner's immutable code for display
            const { data: partnerProfile } = await supabase
                .from('profiles')
                .select('immutable_user_code')
                .eq('id', partnerId)
                .single();

            // Count unread
            const { count: unreadCount } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('conversation_id', conv.id)
                .is('read_at', null)
                .neq('sender_id', currentUser.id);

            return {
                ...conv,
                partnerName: partner?.username || 'User',
                partnerId: partnerId,
                displayId: partnerProfile?.immutable_user_code || partnerId.slice(0, 6).toUpperCase(),
                lastMessage: lastMsg?.content || (lastMsg?.message_type !== 'text' ? 'Sent a file' : 'No messages yet'),
                lastTime: lastMsg ? formatTime(lastMsg.created_at) : '',
                unreadCount: unreadCount || 0
            };
        }));

        renderInbox(inboxData);
    } catch (err) {
        console.error('Inbox load error:', err);
    }
}

function renderInbox(data) {
    if (!conversationsList) return;
    if (data.length === 0) {
        conversationsList.innerHTML = '<div class="p-8 text-center text-gray-400">No conversations yet.</div>';
        return;
    }

    conversationsList.innerHTML = data.map(conv => `
        <div class="conversation-item ${conv.id === currentConversationId ? 'active' : ''}" 
             onclick="window.selectConversation('${conv.id}')">
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <span style="font-weight:700; color:var(--text-main); font-size:0.95rem;">${escapeHtml(conv.partnerName)}</span>
                    <div style="font-size:0.7rem; color:var(--text-muted);">ID: ${conv.displayId}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:0.75rem; color:var(--text-muted);">${conv.lastTime}</div>
                    ${conv.unreadCount > 0 ? `<span style="display:inline-block; background:var(--primary-color); color:white; font-size:0.7rem; padding:1px 6px; border-radius:10px; font-weight:700; margin-top:4px;">${conv.unreadCount}</span>` : ''}
                </div>
            </div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; ${conv.unreadCount > 0 ? 'font-weight:600;' : ''}">
                ${escapeHtml(conv.lastMessage || '')}
            </div>
            ${conv.item ? `<div style="font-size:0.75rem; color:var(--primary-color); font-weight:600; margin-top:4px;">Item: ${escapeHtml(conv.item.title)}</div>` : ''}
        </div>
    `).join('');
}

window.selectConversation = async (id) => {
    currentConversationId = id;
    renderInboxActiveState();
    await loadChat(id);
};

function renderInboxActiveState() {
    document.querySelectorAll('.conversation-item').forEach(el => {
        el.classList.remove('active');
        if (el.getAttribute('onclick')?.includes(currentConversationId)) {
            el.classList.add('active');
        }
    });
}

/**
 * Loads the messages for a specific conversation.
 */
async function loadChat(convId) {
    if (!chatArea) return;
    chatArea.innerHTML = '<div class="flex items-center justify-center h-full"><div class="spinner"></div></div>';

    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        const { data: conv } = await supabase
            .from('conversations')
            .select('*, item:market_listings(*), buyer:profiles!buyer_id(username), seller:profiles!seller_id(username)')
            .eq('id', convId)
            .single();

        const partner = conv.buyer_id === currentUser.id ? conv.seller : conv.buyer;
        const partnerId = conv.buyer_id === currentUser.id ? conv.seller_id : conv.buyer_id;

        // Ensure we have the code for the chat header too
        const { data: pProfile } = await supabase.from('profiles').select('immutable_user_code').eq('id', partnerId).single();
        const displayId = pProfile?.immutable_user_code || partnerId.slice(0, 6).toUpperCase();

        renderChatWindow(messages, partner?.username || 'User', displayId, conv.item);

        // Mark as read
        markAsRead(convId);

        // Subscribe to real-time messages
        subscribeToChat(convId);

    } catch (err) {
        console.error('Chat load error:', err);
    }
}

function renderChatWindow(messages, partnerName, displayId, item) {
    chatArea.innerHTML = `
        <div class="chat-header">
            <div>
                <h3 style="font-weight:700; font-size:1.1rem;">${escapeHtml(partnerName)}</h3>
                <span style="font-size:0.75rem; color:var(--text-muted);">User ID: ${displayId}</span>
            </div>
        </div>
        ${item ? `
            <div class="chat-item-header">
                <img src="${item.image_url || 'https://via.placeholder.com/40'}" class="chat-item-img">
                <div class="chat-item-info">
                    <div class="chat-item-title">${escapeHtml(item.title)}</div>
                    <div class="chat-item-price">R ${item.price}</div>
                </div>
                <a href="listings.html?id=${item.id}" class="action-btn" style="padding:4px 12px; font-size:0.8rem;">View Item</a>
            </div>
        ` : ''}
        <div id="messagesList" class="messages-list">
            ${messages.map(msg => renderMessage(msg)).join('')}
        </div>
        <div class="chat-input-area">
            <div class="upload-btn-wrapper">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>
                <input type="file" id="fileAttach" onchange="window.handleChatUpload(this)">
            </div>
            <textarea id="msgInput" class="message-input" placeholder="Type a message..." rows="1"></textarea>
            <button onclick="window.sendChatMessage()" class="send-btn">Send</button>
        </div>
    `;

    const list = document.getElementById('messagesList');
    list.scrollTop = list.scrollHeight;

    // Enter key support
    document.getElementById('msgInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            window.sendChatMessage();
        }
    });
}

function renderMessage(msg) {
    const isMe = msg.sender_id === currentUser.id;
    let contentHtml = escapeHtml(msg.content || '');

    if (msg.message_type === 'image') {
        contentHtml = `<img src="${msg.file_url}" style="max-width:100%; border-radius:8px; display:block;">`;
    } else if (msg.message_type === 'file') {
        contentHtml = `<a href="${msg.file_url}" target="_blank" class="attachment-file"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path><polyline points="13 2 13 9 20 9"></polyline></svg> Document</a>`;
    }

    return `
        <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
            ${contentHtml}
            <div class="read-status">
                ${formatTimeShort(msg.created_at)}
                ${isMe ? (msg.read_at ? ' • Seen' : ' • Sent') : ''}
            </div>
        </div>
    `;
}

window.sendChatMessage = async () => {
    const input = document.getElementById('msgInput');
    const content = input.value.trim();
    if (!content || !currentConversationId) return;

    input.value = '';

    // Get partner ID from existing current chat
    const { data: conv } = await supabase.from('conversations').select('buyer_id, seller_id').eq('id', currentConversationId).single();
    const receiverId = conv.buyer_id === currentUser.id ? conv.seller_id : conv.buyer_id;

    const { error } = await supabase
        .from('messages')
        .insert([{
            conversation_id: currentConversationId,
            sender_id: currentUser.id,
            receiver_id: receiverId,
            content: content,
            message_type: 'text'
        }]);

    if (error) console.error('Send error:', error);
};

window.handleChatUpload = async (input) => {
    const file = input.files[0];
    if (!file || !currentConversationId) return;

    const fileName = `${Date.now()}_${file.name}`;
    const filePath = `${currentUser.id}/${fileName}`;

    try {
        const { error: uploadError } = await supabase.storage
            .from('chat-attachments')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('chat-attachments')
            .getPublicUrl(filePath);

        const { data: conv } = await supabase.from('conversations').select('buyer_id, seller_id').eq('id', currentConversationId).single();
        const receiverId = conv.buyer_id === currentUser.id ? conv.seller_id : conv.buyer_id;

        const type = file.type.startsWith('image/') ? 'image' : 'file';

        await supabase.from('messages').insert([{
            conversation_id: currentConversationId,
            sender_id: currentUser.id,
            receiver_id: receiverId,
            message_type: type,
            file_url: publicUrl
        }]);

    } catch (err) {
        console.error('Upload Error:', err);
        alert('Failed to upload file.');
    }
};

/**
 * Real-time Subscriptions
 */
function subscribeToChat(convId) {
    if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);

    realtimeSubscription = supabase
        .channel(`chat:${convId}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${convId}`
        }, payload => {
            if (payload.eventType === 'INSERT') {
                const list = document.getElementById('messagesList');
                if (list) {
                    const div = document.createElement('div');
                    div.innerHTML = renderMessage(payload.new);
                    list.appendChild(div.firstElementChild);
                    list.scrollTop = list.scrollHeight;

                    if (payload.new.sender_id !== currentUser.id) {
                        markAsRead(convId);
                    }
                }
            } else if (payload.eventType === 'UPDATE') {
                // If a message was marked as read, we might want to update the bubble
                loadChat(convId); // Simple refresh for now
            }
        })
        .subscribe();
}

function subscribeToInbox() {
    supabase
        .channel('inbox-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
            loadInbox();
        })
        .subscribe();
}

async function markAsRead(convId) {
    await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('conversation_id', convId)
        .neq('sender_id', currentUser.id)
        .is('read_at', null);
}

/**
 * Conversation Creation Logic (Contact Seller Button Redirect)
 */
async function startOrOpenConversation(sellerId, listingId) {
    if (sellerId === currentUser.id) {
        alert("You cannot message yourself.");
        return;
    }

    try {
        // Find existing
        const { data: existing } = await supabase
            .from('conversations')
            .select('id')
            .eq('listing_id', listingId)
            .eq('buyer_id', currentUser.id)
            .eq('seller_id', sellerId)
            .single();

        if (existing) {
            window.selectConversation(existing.id);
            return;
        }

        // Create new
        const { data: newConv, error } = await supabase
            .from('conversations')
            .insert([{
                listing_id: listingId,
                buyer_id: currentUser.id,
                seller_id: sellerId
            }])
            .select()
            .single();

        if (error) throw error;
        window.selectConversation(newConv.id);

    } catch (err) {
        console.error('Conv Error:', err);
    }
}

/**
 * UI Helpers
 */
function formatTime(iso) {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString()) {
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function formatTimeShort(iso) {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function setupSearch() {
    const input = document.getElementById('convSearch');
    if (!input) return;
    input.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.style.display = item.textContent.toLowerCase().includes(query) ? 'block' : 'none';
        });
    });
}
