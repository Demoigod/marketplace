import { supabase } from './supabase-config.js';
import { initNavigation } from './navbar.js';
import { isLoggedIn, getCurrentUser } from './auth.js';

let currentConversationId = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    await initNavigation();

    // 1. Verify Auth
    if (!await isLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }

    currentUser = await getCurrentUser();

    // 2. Get Conversation ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    currentConversationId = urlParams.get('conversation_id');

    if (!currentConversationId) {
        window.location.href = 'index.html';
        return;
    }

    // 3. Initialize Chat
    await loadConversationDetails();
    await loadMessages();
    subscribeToMessages();

    // 4. Setup Form
    const messageForm = document.getElementById('messageForm');
    messageForm.addEventListener('submit', handleSendMessage);

    // 5. Back Button
    document.getElementById('backBtn').addEventListener('click', () => {
        window.history.back();
    });
});

/**
 * Loads the user names and details for the header
 */
async function loadConversationDetails() {
    try {
        const { data: conv, error } = await supabase
            .from('conversations')
            .select('*')
            .eq('id', currentConversationId)
            .single();

        if (error) throw error;

        // Determine partner ID
        const partnerId = conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id;

        // Fetch partner name
        const { data: partner, error: pError } = await supabase
            .from('users')
            .select('name')
            .eq('id', partnerId)
            .single();

        if (pError) {
            console.warn('Could not load partner name, using fallback');
            document.getElementById('chatPartnerName').textContent = 'Chat Partner';
        } else {
            document.getElementById('chatPartnerName').textContent = partner.name || 'Chat Partner';
        }

    } catch (err) {
        console.error('Error loading conversation details:', err.message);
        document.getElementById('messagesList').innerHTML = `<div class="error-state">Conversation not found or access denied.</div>`;
        throw err; // Stop further loading
    }
}

/**
 * Loads entire message history for this conversation
 */
async function loadMessages() {
    const list = document.getElementById('messagesList');

    try {
        const { data: messages, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', currentConversationId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        list.innerHTML = '';
        if (messages.length === 0) {
            list.innerHTML = '<div class="empty-state">No messages yet. Say hello!</div>';
        } else {
            messages.forEach(msg => appendMessageToUI(msg));
        }

        scrollToBottom();

    } catch (err) {
        list.innerHTML = `<div class="error-state">Error loading messages: ${err.message}</div>`;
    }
}

/**
 * Subscribes to Supabase Realtime for new messages
 */
function subscribeToMessages() {
    supabase
        .channel(`chat:${currentConversationId}`)
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${currentConversationId}`
        }, (payload) => {
            appendMessageToUI(payload.new);
            scrollToBottom();
        })
        .subscribe();
}

/**
 * Handles sending a new message
 */
async function handleSendMessage(e) {
    e.preventDefault();
    const input = document.getElementById('messageInput');
    const body = input.value.trim();

    if (!body || !currentConversationId) return;

    input.value = ''; // Optimistic clear

    try {
        const { error } = await supabase
            .from('messages')
            .insert([{
                conversation_id: currentConversationId,
                sender_id: currentUser.id,
                body: body
            }]);

        if (error) throw error;

    } catch (err) {
        alert('Failed to send message: ' + err.message);
        input.value = body; // Restore on error
    }
}

/**
 * UI Helper: Appends a single message bubble
 */
function appendMessageToUI(msg) {
    const list = document.getElementById('messagesList');
    const isSent = msg.sender_id === currentUser.id;

    // Remove empty state if it exists
    const emptyState = list.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const msgDiv = document.createElement('div');
    msgDiv.className = `message-bubble ${isSent ? 'sent' : 'received'}`;
    msgDiv.innerHTML = `
        <div class="message-content">${escapeHtml(msg.body)}</div>
        <div class="message-time">${new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
    `;

    list.appendChild(msgDiv);
}

function scrollToBottom() {
    const list = document.getElementById('messagesList');
    list.scrollTop = list.scrollHeight;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
