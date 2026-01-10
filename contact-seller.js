import { supabase } from './supabase-config.js';
import { isLoggedIn, getCurrentUser } from './auth.js';

/**
 * Main handler for the "Contact Seller" button.
 * Orchestrates conversation creation and redirection.
 */
export async function handleContactSeller(sellerId) {
    // 1. Check Authentication
    if (!await isLoggedIn()) {
        alert("Please log in to contact the seller.");
        document.dispatchEvent(new CustomEvent('open-auth-modal'));
        return;
    }

    const user = await getCurrentUser();
    if (!user) return;

    // 2. Prevent Self-Messaging
    if (user.id === sellerId) {
        alert("You cannot message yourself about your own item.");
        return;
    }

    try {
        // 3. Deterministic User ID Ordering
        // user1_id is always the smaller UUID to prevent duplicates
        const [user1_id, user2_id] = [user.id, sellerId].sort();

        // 4. Find or Create Conversation
        // Attempt to find existing first
        let { data: conversation, error: fetchError } = await supabase
            .from('conversations')
            .select('id')
            .eq('user1_id', user1_id)
            .eq('user2_id', user2_id)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (!conversation) {
            // Create new if not found
            const { data: newConv, error: createError } = await supabase
                .from('conversations')
                .insert([{ user1_id, user2_id }])
                .select()
                .single();

            if (createError) throw createError;
            conversation = newConv;
        }

        // 5. Redirect to Chat Page
        window.location.href = `chat.html?conversation_id=${conversation.id}`;

    } catch (err) {
        console.error('Messaging error:', err.message);
        alert('Could not start conversation: ' + err.message);
    }
}

// Global exposure for onclick handlers
window.handleContactAction = handleContactSeller;
