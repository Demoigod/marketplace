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

    // 3. Check for partner_id in URL (starting new conversation)
    const urlParams = new URLSearchParams(window.location.search);
    const partnerId = urlParams.get('partner_id');

    if (partnerId) {
        await startNewConversation(partnerId);
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
        // Fetch conversations where current user is user1 or user2
        const { data: conversations, error } = await supabase
            .from('conversations')
            .select(`
                *,
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

        // Note: In a larger app, we would only fetch the last message via a view or RPC
        // For MVP, we'll process the returned messages locally
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

    // Process and sort by latest message
    // Also need to fetch partner names if not available.
    // For MVP, we will fetch partner names in batch or individually.

    const processed = await Promise.all(conversations.map(async (conv) => {
        const partnerId = conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id;

        // Fetch partner name
        const { data: partner } = await supabase.from('users').select('name').eq('id', partnerId).single();
        const partnerName = partner ? partner.name : 'Unknown User';

        // Get last message - standardized on .content, falling back to .body for legacy support
        const msgs = conv.messages || [];
        msgs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        const lastMsg = msgs[0];
        const lastMessageText = lastMsg ? (lastMsg.content || lastMsg.body || 'New message') : 'No messages';

        return {
            ...conv,
            partnerName,
            lastMessage: lastMessageText,
            lastTime: lastMsg ? new Date(lastMsg.created_at).toLocaleDateString() : '',
            unread: lastMsg && !lastMsg.read && lastMsg.sender_id !== currentUser.id
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
    const content = msg.content || msg.body || ''; // Support both for safety
    return `
        <div class="message-bubble ${isMe ? 'message-sent' : 'message-received'}">
            ${content}
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
    // Listen for new messages in ANY conversation to update the sidebar list
    supabase
        .channel('public:messages:global')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
        }, async (payload) => {
            // Check if we are involved in this conversation
            const { data: conv } = await supabase
                .from('conversations')
                .select('id')
                .eq('id', payload.new.conversation_id)
                .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
                .single();

            if (conv) {
                // Refresh sidebar list
                loadConversations();
            }
        })
        .subscribe();
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
