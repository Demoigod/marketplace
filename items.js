import { supabase } from './supabase-config.js';
import { isLoggedIn } from './auth.js';

/**
 * Fetches all active items from the marketplace.
 */
export async function fetchAllItems() {
    try {
        const { data, error } = await supabase
            .from('items')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching items:', error);
        return [];
    }
}

/**
 * Renders an item card following exact user requirements.
 */
export function createItemCard(item, isAuth = false) {
    const postedDate = new Date(item.created_at).toLocaleDateString();
    const mainImage = item.images && item.images.length > 0 ? item.images[0] : 'https://via.placeholder.com/300x200';

    // Disable certain actions for unauthenticated users
    const disabledAttr = isAuth ? '' : 'disabled';
    const loginPrompt = isAuth ? '' : 'title="Please login to use this feature"';

    return `
        <div class="marketplace-item" data-id="${item.id}" data-user-id="${item.user_id}">
            <div class="item-image" style="background-image: url('${mainImage}'); background-size: cover; background-position: center;"></div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${escapeHtml(item.title)}</h3>
                    <span class="item-price">$${parseFloat(item.price).toFixed(2)}</span>
                </div>
                <p class="item-date">Posted on ${postedDate}</p>
                <p class="item-description">${escapeHtml(item.description)}</p>
                
                
                <div class="item-actions-grid">
                    <button class="btn-buy" ${disabledAttr} ${loginPrompt} data-action="buy" data-id="${item.id}">Buy</button>
                    <button class="btn-contact" ${disabledAttr} ${loginPrompt} data-action="contact" data-seller-id="${item.user_id}">Contact Seller</button>
                    <button class="btn-view" data-action="view" data-id="${item.id}">View</button>
                    <button class="btn-save" data-action="save" data-item-id="${item.id}">Save</button>
                </div>
            </div>
        </div>
    `;
}

// Helper to escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
