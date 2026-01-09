import { supabase } from './supabase-config.js';
import { getCurrentUser, isLoggedIn } from './auth.js';
import { initNavigation } from './navbar.js';

let currentUser = null;
let currentConversationId = null;
let conversationsSubscription = null;
let messagesSubscription = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initNavigation();

    // Check auth
    if (!await isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = await getCurrentUser();
    if (!currentUser) return;

    // Check for "New Message" intent from URL
    const urlParams = new URLSearchParams(window.location.search);
    const sellerId = urlParams.get('seller_id');
    const itemId = urlParams.get('item_id');

    if (sellerId && itemId) {
        // User wants to message a seller
        await startNewConversation(sellerId, itemId);
    }

    // Load conversations list
    await loadConversations();

    // Setup back button for mobile
    document.getElementById('backToConversations').addEventListener('click', showConversationsList);

    // Setup message form
    document.getElementById('messageForm').addEventListener('submit', handleSendMessage);
});

// Create or Get Conversation
async function startNewConversation(sellerId, itemId) {
    if (sellerId === currentUser.id) {
        alert("You cannot message yourself!");
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
    }

    try {
        // Check if conversation already exists
        const { data: existing, error: fetchError } = await supabase
            .from('conversations')
            .select('*')
            .eq('item_id', itemId)
            .eq('seller_id', sellerId)
            .eq('buyer_id', currentUser.id)
            .single();

        if (existing) {
            currentConversationId = existing.id;
        } else {
            // Create new conversation
            const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert([{
                    item_id: itemId,
                    seller_id: sellerId,
                    buyer_id: currentUser.id
                }])
                .select()
                .single();

            if (createError) throw createError;
            currentConversationId = newConv.id;
        }

        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);

        // Open chat immediately
        await loadChat(currentConversationId);

    } catch (error) {
        console.error('Error starting conversation:', error);
        alert('Could not start conversation.');
    }
}

// Load List of Conversations
async function loadConversations() {
    try {
        // Fetch conversations where user is buyer OR seller
        // We need to join with 'marketplace_items' to get item title
        // And 'users' to get partner name (requires complex query or multiple fetches)

        const { data: convs, error } = await supabase
            .from('conversations')
            .select(`
                *,
                marketplace_items (title),
                buyer:users!buyer_id (id, name),
                seller:users!seller_id (id, name)
            `)
            .or(`buyer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        renderConversationsList(convs);

    } catch (error) {
        console.error('Error loading conversations:', error);
        document.getElementById('conversationsContainer').innerHTML = '<p class="p-4 text-red-500">Failed to load messages.</p>';
    }
}

function renderConversationsList(conversations) {
    const container = document.getElementById('conversationsContainer');

    if (conversations.length === 0) {
        container.innerHTML = '<p class="p-6 text-center text-gray-500">No conversations yet.</p>';
        return;
    }

    container.innerHTML = conversations.map(c => {
        const isBuyer = c.buyer_id === currentUser.id;
        const partner = isBuyer ? c.seller : c.buyer;
        const isActive = c.id === currentConversationId ? 'active' : '';
        const date = new Date(c.updated_at).toLocaleDateString();

        return `
            <div class="conversation-item ${isActive}" onclick="loadChat('${c.id}')">
                <div class="conversation-header">
                    <span class="conversation-partner">${partner ? partner.name : 'Unknown User'}</span>
                    <span class="conversation-time">${date}</span>
                </div>
                <div class="conversation-item-title">${c.marketplace_items ? c.marketplace_items.title : 'Unknown Item'}</div>
                <div class="conversation-preview">Click to view messages...</div>
            </div>
        `;
    }).join('');
}

// Load Specific Chat
window.loadChat = async function (conversationId) {
    currentConversationId = conversationId;

    // UI Updates
    document.querySelector('.message-page-container').classList.add('mobile-chat-active');
    document.getElementById('emptyChatState').style.display = 'none';
    document.getElementById('activeChatContainer').style.display = 'flex';

    // Highlight sidebar item
    document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
    // (In a real app, find the specific element and add active class)

    // Load Messages
    loadMessages(conversationId);

    // Update Header Info (fetch specific conv details if needed, or grab from list cache)
    // For now, let's just fetch details again for safety
    updateChatHeader(conversationId);
}

async function updateChatHeader(conversationId) {
    const { data } = await supabase
        .from('conversations')
        .select(`
            *,
            marketplace_items (title),
            buyer:users!buyer_id (name),
            seller:users!seller_id (name)
        `)
        .eq('id', conversationId)
        .single();

    if (data) {
        const isBuyer = data.buyer_id === currentUser.id;
        const partnerName = isBuyer ? data.seller.name : data.buyer.name;
        document.getElementById('chatPartnerName').textContent = partnerName;
        document.getElementById('chatItemTitle').textContent = data.marketplace_items ? data.marketplace_items.title : 'Item';
    }
}

async function loadMessages(conversationId) {
    const list = document.getElementById('messagesList');
    list.innerHTML = '<div class="text-center p-4 text-gray-400">Loading history...</div>';

    const { data: messages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error('Error loading messages:', error);
        return;
    }

    renderMessages(messages);
    scrollToBottom();

    // Subscribe to new messages (simplified for this task)
    // In a full app, we'd unsubscribe previous listeners first
    setupRealtimeMessages(conversationId);
}

function renderMessages(messages) {
    const list = document.getElementById('messagesList');
    if (messages.length === 0) {
        list.innerHTML = '<div class="text-center p-4 text-gray-400">No messages yet. Say hello!</div>';
        return;
    }

    list.innerHTML = messages.map(m => {
        const isMine = m.sender_id === currentUser.id;
        const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        return `
            <div class="message ${isMine ? 'sent' : 'received'}">
                <div class="message-content">${escapeHtml(m.content)}</div>
                <span class="message-time">${time}</span>
            </div>
        `;
    }).join('');
}

async function handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('messageInput');
    const content = input.value.trim();

    if (!content || !currentConversationId) return;

    try {
        input.value = ''; // Optimistic clear

        const { error } = await supabase
            .from('messages')
            .insert([{
                conversation_id: currentConversationId,
                sender_id: currentUser.id,
                content: content
            }]);

        if (error) throw error;

        // In real-time setup, the listener would render it. 
        // For now, let's manually append or re-fetch.
        loadMessages(currentConversationId);

    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message');
    }
}

function scrollToBottom() {
    const list = document.getElementById('messagesList');
    list.scrollTop = list.scrollHeight;
}

function showConversationsList() {
    document.querySelector('.message-page-container').classList.remove('mobile-chat-active');
    currentConversationId = null;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Simple Realtime helper
function setupRealtimeMessages(conversationId) {
    if (messagesSubscription) supabase.removeChannel(messagesSubscription);

    messagesSubscription = supabase
        .channel(`public:messages:conversation_id=eq.${conversationId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, payload => {
            loadMessages(conversationId); // Simply reload for now
        })
        .subscribe();
}
