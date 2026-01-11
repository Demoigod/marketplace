import { supabase } from './supabase-config.js';
import { isLoggedIn, getCurrentUser } from './auth.js';
import { initNavigation } from './navbar.js';

// State
let currentConversationId = null;
let currentUser = null;
let realtimeSubscription = null;

// DOM Elements
const conversationsList = document.getElementById('conversationsList');
const chatArea = document.getElementById('chatArea');
const sidebar = document.getElementById('conversationsSidebar');

document.addEventListener('DOMContentLoaded', async () => {
    await initNavigation();

    if (!await isLoggedIn()) {
        window.location.href = 'index.html'; // Redirect if not auth
        return;
    }

    currentUser = await getCurrentUser();

    // Check for partner_id in URL (starting new conversation)
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('partner_id'); // e.g., from "Contact Seller"

    if (partnerId) {
        await startNewConversation(partnerId);
    }

    // Load initial list
    loadConversations();

    // Subscribe to global new messages/conversations (optional, for list updates)
    setupGlobalSubscription();

    // Handle mobile view transitions if needed
    // (Simpler implementation for MVP)
});

async function loadConversations() {
    try {
        // Fetch conversations where current user is user1 or user2
        // We join with profiles to get names (assuming we have a users view or similar, or just fetch blindly for MVP)
        // Since we don't have a direct relation setup in JS purely easily without views on the backend for 'partner_name',
        // we might do a second fetch or use a function.
        // Let's assume standard 'conversations' table trigger/view or just fetch IDs and resolve names.

        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
                messages:messages(content, created_at, read, sender_id)
            `)
            .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        renderConversationsList(conversations);
    } catch (err) {
        console.error('Error loading conversations:', err);
        conversationsList.innerHTML = '<div class="p-4 text-red-500">Failed to load conversations</div>';
    }
}

async function renderConversationsList(conversations) {
    if (!conversations || conversations.length === 0) {
        conversationsList.innerHTML = '<div class="p-4 text-gray-500 text-center">No conversations yet</div>';
        return;
    }

    // Process and sort by latest message
    // Also need to fetch partner names if not available.
    // For MVP, we will fetch partner names in batch or individually.

    const processed = await Promise.all(conversations.map(async (conv) => {
        const partnerId = conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id;
        // Fetch partner name
        // Ideally cache this
        const { data: partner } = await supabase.from('users').select('name').eq('id', partnerId).single();
        const partnerName = partner ? partner.name : 'Unknown User';

        // Get last message
        // Supabase select above might return all messages, which is heavy.
        // Optimized: .limit(1) on nested? Not supported deeply easily.
        // Just picking the last from the array if strictly ordered or sorting.
        // Better: `order` applied to children.
        // select('*, messages(*)') order is tricky.
        // Re-sorting locally:
        const msgs = conv.messages || [];
        msgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const lastMsg = msgs[0];

        return {
            ...conv,
            partnerName,
            lastMessage: lastMsg ? lastMsg.content : 'No messages',
            lastTime: lastMsg ? new Date(lastMsg.created_at).toLocaleDateString() : '',
            unread: lastMsg && !lastMsg.read && lastMsg.sender_id !== currentUser.id // rudimentary unread check
        };
    }));

    conversationsList.innerHTML = processed.map(c => `
        <div class="conversation-item ${c.id === currentConversationId ? 'active' : ''}" onclick="window.routerOpenChat('${c.id}')">
            <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                <span style="font-weight:600; color:var(--text-primary);">${c.partnerName}</span>
                <span style="font-size:0.8rem; color:var(--text-secondary);">${c.lastTime}</span>
            </div>
            <div style="font-size:0.9rem; color:var(--text-secondary); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                ${c.unread ? '<span style="color:var(--color-primary);">● </span>' : ''}${c.lastMessage}
            </div>
        </div>
    `).join('');
}

// Global expose for onclick
window.routerOpenChat = (id) => {
    loadChat(id);
};

async function loadChat(conversationId) {
    currentConversationId = conversationId;
    // Highlight list item
    document.querySelectorAll('.conversation-item').forEach(el => el.classList.remove('active'));
    // Re-render list to show active state would be cleaner, but simple toggle for now:
    // Actually, calling loadConversations again might be overkill.

    // Fetch Messages
    chatArea.innerHTML = '<div class="p-4 flex justify-center"><div class="spinner"></div></div>'; // Spinner placeholder

    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true }); // Oldest first

        if (error) throw error;

        // Get partner name again (optimize context later)
        const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
        const partnerId = conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id;
        const { data: partner } = await supabase.from('users').select('name').eq('id', partnerId).single();

        renderChatArea(messages, partner ? partner.name : 'User', partnerId);
        subscribeToConversation(conversationId);

        // Mark as read
        markMessagesRead(conversationId);

    } catch (err) {
        console.error('Chat load error:', err);
        chatArea.innerHTML = 'Error loading chat.';
    }
}

function renderChatArea(messages, partnerName, partnerId) {
    chatArea.innerHTML = `
        <div class="chat-header">
            <h3 class="font-bold text-lg">${partnerName}</h3>
            <!-- Actions like block or profile could go here -->
        </div>
        <div id="messagesList" class="messages-list">
            ${messages.length ? messages.map(msg => renderMessageBubble(msg)).join('') : '<p class="text-center text-gray-400 mt-4">No messages yet. Say hi!</p>'}
        </div>
        <div class="chat-input-area">
            <textarea id="messageInput" class="message-input" rows="1" placeholder="Type a message..."></textarea>
            <button id="sendBtn" class="send-btn">Send</button>
        </div>
    `;

    // Scroll to bottom
    const list = document.getElementById('messagesList');
    list.scrollTop = list.scrollHeight;

    // Attach listeners
    const sendBtn = document.getElementById('sendBtn');
    const input = document.getElementById('messageInput');

    sendBtn.onclick = () => sendMessage(input.value);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input.value);
        }
    });

    async function sendMessage(text) {
        if (!text.trim()) return;

        // Optimistic UI update? Or wait for confirm. Wait for confirm is safer for MVP.
        input.value = '';

        const { error } = await supabase
            .from('messages')
            .insert([{
                conversation_id: currentConversationId,
                sender_id: currentUser.id,
                content: text
            }]);

        if (error) {
            alert('Failed to send');
            input.value = text;
        }
        // Realtime will handle the append
    }
}

function renderMessageBubble(msg) {
    const isMe = msg.sender_id === currentUser.id;
    return `
        <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
            ${msg.content}
        </div>
    `;
}

function subscribeToConversation(conversationId) {
    if (realtimeSubscription) supabase.removeChannel(realtimeSubscription);

    realtimeSubscription = supabase
        .channel(`public:messages:conversation_id=eq.${conversationId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${conversationId}` }, payload => {
            const newMsg = payload.new;
            const list = document.getElementById('messagesList');
            if (list) {
                // If "empty state" exists, remove it
                if (list.querySelector('p.text-center')) list.innerHTML = '';

                // Append
                const div = document.createElement('div');
                div.innerHTML = renderMessageBubble(newMsg).trim(); // trim helps with node creation
                list.appendChild(div.firstChild);
                list.scrollTop = list.scrollHeight;

                // Mark read if we are viewing
                if (newMsg.sender_id !== currentUser.id) {
                    markMessagesRead(conversationId);
                }
            }
        })
        .subscribe();
}

function setupGlobalSubscription() {
    // Listen for new conversations or messages in other threads to update the sidebar list
    // This is more complex, MVP can skip or just poll.
    // Ideally subscribe to 'messages' where receiver is current User, but RLS prevents filtering effectively on 'receiver' unless strictly modeled.
    // For now, simpler: just periodic refresh or relying on user interaction.
}

async function markMessagesRead(conversationId) {
    const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', currentUser.id) // Only mark partner's messages
        .eq('read', false);
}

// Logic to Create Conversation if it doesn't exist
async function startNewConversation(partnerId) {
    if (partnerId === currentUser.id) return; // Can't chat with self

    // 1. Check if exists
    // We need to check in canonical order or just check both directions
    // RLS usually handles visibility.
    // Canonical: user1_id < user2_id

    let u1 = currentUser.id < partnerId ? currentUser.id : partnerId;
    let u2 = currentUser.id < partnerId ? partnerId : currentUser.id;

    const { data: existing } = await supabase
        .from('conversations')
        .select('id')
        .eq('user1_id', u1)
        .eq('user2_id', u2)
        .single();

    if (existing) {
        loadChat(existing.id);
    } else {
        // Create
        const { data: newConv, error } = await supabase
            .from('conversations')
            .insert([{ user1_id: u1, user2_id: u2 }])
            .select()
            .single();

        if (error) {
            console.error('Create conv error:', error);
            alert('Could not start conversation');
        } else {
            loadChat(newConv.id);
            // Refresh list
            loadConversations();
        }
    }
}
