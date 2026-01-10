import { supabase } from './supabase-config.js';
import { getCurrentUser, isLoggedIn } from './auth.js';
import { initNavigation } from './navbar.js';

let currentUser = null;
let currentConversationId = null;
let messagesSubscription = null;

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
    // 1. Initialize Navigation
    await initNavigation();

    // 2. Check Authentication
    if (!await isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = await getCurrentUser();
    if (!currentUser) return;

    // 3. Handle incoming "Message Seller" intent
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('seller_id') || urlParams.get('partner_id');

    if (partnerId) {
        // Automatically start or fetch the conversation
        const conversationId = await getOrCreateConversation(partnerId);
        if (conversationId) {
            currentConversationId = conversationId;
            await loadChat(conversationId);
        }
    }

    // 4. Load Conversations List
    await loadConversations();

    // 5. Setup UI Listeners
    setupEventListeners();
});

// --- CORE MESSAGING FUNCTIONS ---

/**
 * Fetches an existing conversation or creates a new one between two users.
 * Ensures user1_id < user2_id to maintain uniqueness.
 */
async function getOrCreateConversation(partnerId) {
    if (partnerId === currentUser.id) {
        alert("You cannot message yourself!");
        return null;
    }

    // Order IDs to match database constraint (user1_id < user2_id)
    const [u1, u2] = [currentUser.id, partnerId].sort();

    try {
        // Try to find existing conversation
        const { data: existing, error: fetchError } = await supabase
            .from('conversations')
            .select('id')
            .eq('user1_id', u1)
            .eq('user2_id', u2)
            .maybeSingle();

        if (existing) return existing.id;

        // Create new if doesn't exist
        const { data: created, error: createError } = await supabase
            .from('conversations')
            .insert([{ user1_id: u1, user2_id: u2 }])
            .select('id')
            .single();

        if (createError) throw createError;
        return created.id;

    } catch (error) {
        console.error('Error getting/creating conversation:', error);
        return null;
    }
}

/**
 * Loads all conversations for the current user.
 */
async function loadConversations() {
    const container = document.getElementById('conversationsContainer');

    try {
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                id,
                created_at,
                user1:users!user1_id (id, name),
                user2:users!user2_id (id, name)
            `)
            .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        renderConversations(conversations);
    } catch (error) {
        console.error('Error loading conversations:', error);
        container.innerHTML = '<p class="error-msg">Failed to load conversations.</p>';
    }
}

/**
 * Loads and subscribes to messages for a specific conversation.
 */
async function loadChat(conversationId) {
    currentConversationId = conversationId;

    // Toggle UI visibility
    document.getElementById('emptyChatState').style.display = 'none';
    document.getElementById('activeChatContainer').style.display = 'flex';

    // Clear previous messages and show loading
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = '<div class="loading-messages">Loading messages...</div>';

    // 1. Fetch History
    await fetchMessageHistory(conversationId);

    // 2. Subscribe to Realtime Updates
    subscribeToMessages(conversationId);

    // 3. Update Header
    updateChatHeader(conversationId);
}

async function fetchMessageHistory(conversationId) {
    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;
        renderMessages(messages);
        scrollToBottom();
    } catch (error) {
        console.error('Error fetching history:', error);
    }
}

async function sendMessage(body) {
    if (!currentConversationId || !body.trim()) return;

    try {
        const { error } = await supabase
            .from('messages')
            .insert([{
                conversation_id: currentConversationId,
                sender_id: currentUser.id,
                body: body
            }]);

        if (error) throw error;
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message.');
    }
}

// --- REALTIME ---

function subscribeToMessages(conversationId) {
    // Remove existing subscription if any
    if (messagesSubscription) {
        supabase.removeChannel(messagesSubscription);
    }

    messagesSubscription = supabase
        .channel(`chat:${conversationId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
            appendMessage(payload.new);
        })
        .subscribe();
}

// --- UI HELPERS ---

function renderConversations(conversations) {
    const container = document.getElementById('conversationsContainer');
    if (!conversations.length) {
        container.innerHTML = '<p class="empty-msg">No conversations yet.</p>';
        return;
    }

    container.innerHTML = conversations.map(c => {
        const partner = c.user1.id === currentUser.id ? c.user2 : c.user1;
        const isActive = c.id === currentConversationId ? 'active' : '';

        return `
            <div class="conversation-item ${isActive}" data-id="${c.id}">
                <div class="conversation-info">
                    <span class="partner-name">${partner.name || 'Anonymous'}</span>
                    <span class="last-activity">${new Date(c.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
    }).join('');

    // Add click listeners
    container.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            loadChat(id);
            // Highlight active
            container.querySelectorAll('.conversation-item').forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function renderMessages(messages) {
    const messagesList = document.getElementById('messagesList');
    messagesList.innerHTML = messages.map(m => createMessageHtml(m)).join('');
}

function appendMessage(message) {
    const messagesList = document.getElementById('messagesList');
    // Check if message already exists (sometimes realtime and manual fetch overlap)
    if (document.querySelector(`[data-msg-id="${message.id}"]`)) return;

    const div = document.createElement('div');
    div.innerHTML = createMessageHtml(message);
    messagesList.appendChild(div.firstElementChild);
    scrollToBottom();
}

function createMessageHtml(m) {
    const isMine = m.sender_id === currentUser.id;
    const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="message ${isMine ? 'sent' : 'received'}" data-msg-id="${m.id}">
            <div class="message-body">${escapeHtml(m.body)}</div>
            <span class="message-time">${time}</span>
        </div>
    `;
}

async function updateChatHeader(conversationId) {
    // Fetch conversation again to get partner details (or use cache)
    const { data } = await supabase
        .from('conversations')
        .select('user1:users!user1_id (name), user2:users!user2_id (name)')
        .eq('id', conversationId)
        .single();

    if (data) {
        // Logic to determine partner name would be here
        // Simplified for now - usually we'd pass the name from the click event
    }
}

function setupEventListeners() {
    const form = document.getElementById('messageForm');
    const input = document.getElementById('messageInput');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const body = input.value;
        input.value = '';
        await sendMessage(body);
    });

    const backBtn = document.getElementById('backToConversations');
    if (backBtn) {
        backBtn.addEventListener('click', () => {
            document.querySelector('.message-page-container').classList.remove('mobile-chat-active');
        });
    }
}

function scrollToBottom() {
    const messagesList = document.getElementById('messagesList');
    messagesList.scrollTop = messagesList.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
