import { supabase } from './supabase-config.js';
import { isLoggedIn, getCurrentUser } from './auth.js';
import { initNavigation } from './navbar.js';

let currentUser = null;

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

    // 3. Load Conversations
    await loadConversations();

    // 4. Setup Realtime for the Inbox (to refresh list on new messages)
    subscribeToInboxUpdates();
});

/**
 * Loads all conversations where the user is a participant
 */
async function loadConversations() {
    const container = document.getElementById('conversationsContainer');
    container.innerHTML = '<div class="loading-state">Loading your messages...</div>';

    try {
        const { data: convs, error } = await supabase
            .from('conversations')
            .select('*')
            .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!convs || convs.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No messages yet.</p>
                    <a href="index.html" class="btn-primary" style="margin-top: 1rem; display: inline-block;">Browse Marketplace</a>
                </div>`;
            return;
        }

        container.innerHTML = '';

        // Render each conversation item
        for (const conv of convs) {
            const partnerId = conv.user1_id === currentUser.id ? conv.user2_id : conv.user1_id;
            const partnerName = await getPartnerName(partnerId);

            const card = document.createElement('div');
            card.className = 'conversation-card';
            card.onclick = () => window.location.href = `chat.html?conversation_id=${conv.id}`;

            card.innerHTML = `
                <div class="conv-avatar">${partnerName.charAt(0).toUpperCase()}</div>
                <div class="conv-details">
                    <div class="conv-top">
                        <span class="conv-name">${partnerName}</span>
                        <span class="conv-time">${new Date(conv.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="conv-preview">Click to view conversation</div>
                </div>
            `;
            container.appendChild(card);
        }

    } catch (err) {
        console.error('Error loading inbox:', err.message);
        container.innerHTML = `<div class="error-state">Error: ${err.message}</div>`;
    }
}

/**
 * Simple helper to get partner name from ID
 */
async function getPartnerName(id) {
    try {
        const { data, error } = await supabase
            .from('users')
            .select('name')
            .eq('id', id)
            .single();

        if (error || !data) return 'Chat Partner';
        return data.name;
    } catch {
        return 'Chat Partner';
    }
}

/**
 * Refreshes the inbox list if a new conversation is started
 */
function subscribeToInboxUpdates() {
    supabase
        .channel('inbox-updates')
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations',
            filter: `user1_id=eq.${currentUser.id}`
        }, (payload) => loadConversations())
        .on('postgres_changes', {
            event: 'INSERT',
            schema: 'public',
            table: 'conversations',
            filter: `user2_id=eq.${currentUser.id}`
        }, (payload) => loadConversations())
        .subscribe();
}
