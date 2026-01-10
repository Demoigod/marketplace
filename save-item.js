import { supabase } from './supabase-config.js';
import { getCurrentUser, isLoggedIn } from './auth.js';

/**
 * Saves or unsaves an item for the authenticated user.
 * Implements "Prevent duplicate saves" logic.
 */
export async function toggleSaveItem(itemId) {
    if (!await isLoggedIn()) {
        alert("Please log in to save items.");
        document.dispatchEvent(new CustomEvent('open-auth-modal'));
        return;
    }

    const user = await getCurrentUser();
    if (!user) return;

    try {
        // 1. Check if already saved (Duplicate prevention)
        const { data: existing, error: fetchError } = await supabase
            .from('saved_items')
            .select('id')
            .eq('user_id', user.id)
            .eq('item_id', itemId)
            .maybeSingle();

        if (fetchError) throw fetchError;

        if (existing) {
            // 2. Unsave if already exists
            const { error: deleteError } = await supabase
                .from('saved_items')
                .delete()
                .eq('id', existing.id);

            if (deleteError) throw deleteError;
            return { saved: false, message: 'Item removed from bookmarks' };
        } else {
            // 3. Save if doesn't exist
            const { error: insertError } = await supabase
                .from('saved_items')
                .insert([{ user_id: user.id, item_id: itemId }]);

            if (insertError) throw insertError;
            return { saved: true, message: 'Item saved successfully!' };
        }
    } catch (error) {
        console.error('Save error:', error);
        throw error;
    }
}

/**
 * Setup listeners for save buttons globally
 */
export function initSaveListeners() {
    document.addEventListener('click', async (e) => {
        if (e.target.classList.contains('btn-save')) {
            const itemId = e.target.dataset.itemId;
            const btn = e.target;

            btn.disabled = true;
            try {
                const result = await toggleSaveItem(itemId);
                btn.classList.toggle('active', result.saved);
                btn.textContent = result.saved ? 'Saved' : 'Save';
                // Feedback could be a toast or simple alert
                console.log(result.message);
            } catch (err) {
                alert("Failed to save item.");
            } finally {
                btn.disabled = false;
            }
        }
    });
}
