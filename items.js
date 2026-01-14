import { supabase } from './supabase-config.js';
import { isLoggedIn } from './auth.js';

/**
 * Fetches all active items from the marketplace.
 */
export async function fetchAllItems() {
    try {
        console.log('Attempting to fetch items with profile join...');
        // Try fetch with join (Ideal)
        const { data, error } = await supabase
            .from('market_listings')
            .select(`
                *,
                profiles (
                    username,
                    full_name
                )
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (!error) {
            console.log('Successfully fetched items with join:', data?.length);
            return data || [];
        }

        console.warn('Fetch with join failed, trying fallback without join. Error:', error);

        // Fallback: Fetch without join (Resilient)
        const { data: fallbackData, error: fallbackError } = await supabase
            .from('market_listings')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (fallbackError) {
            console.error('Ultimate fetch failure:', fallbackError);
            throw fallbackError;
        }

        console.log('Fallback fetch successful:', fallbackData?.length);
        return fallbackData || [];

    } catch (error) {
        console.error('Critical items fetch error:', error);
        return [];
    }
}

/**
 * Renders an item card following exact user requirements.
 */
export function createItemCard(item, isAuth = false) {
    const postedDate = new Date(item.created_at).toLocaleDateString();

    // Prioritize image_url, fallback to images array, then placeholder
    let mainImage = item.image_url;
    if (!mainImage && item.images && item.images.length > 0) {
        mainImage = item.images[0];
    }
    if (!mainImage) {
        mainImage = 'https://via.placeholder.com/300x200?text=No+Image';
    }

    // Unified actions logic for guest vs member
    let actionsHtml = '';

    if (isAuth) {
        // Authenticated user: Show full interaction buttons
        actionsHtml = `
            <div class="item-actions-grid">
                <button class="btn-buy" data-action="buy" data-id="${item.id}">Buy</button>
                <button class="btn-contact" data-action="contact" data-seller-id="${item.seller_id}">Contact Seller</button>
                <button class="btn-save" data-action="save" data-item-id="${item.id}">Save</button>
                <button class="btn-view" data-action="view" data-id="${item.id}">View Details</button>
            </div>
        `;
    } else {
        // Guest user: Show simplified preview with a clear 'View' CTA
        actionsHtml = `
            <div class="item-actions-preview">
                <button class="btn-primary btn-full" data-action="view" data-id="${item.id}">View Item</button>
            </div>
        `;
    }

    return `
        <div class="marketplace-item" data-id="${item.id}" data-user-id="${item.seller_id}">
            <div class="item-image" style="background-image: url('${mainImage}'); background-size: cover; background-position: center;"></div>
            <div class="item-content">
                <div class="item-header">
                    <h3 class="item-title">${escapeHtml(item.title || 'Untitled Item')}</h3>
                    <span class="item-price">R ${parseFloat(item.price || 0).toLocaleString()}</span>
                </div>
                <div class="item-meta" style="margin-bottom: 0.5rem; font-size: 0.85rem; color: #666;">
                    <span>By ${escapeHtml(item.profiles?.username || item.profiles?.full_name || 'Anonymous')}</span>
                </div>
                <p class="item-date">Posted on ${postedDate}</p>
                <p class="item-description">${escapeHtml(item.description)}</p>
                
                ${actionsHtml}
            </div>
        </div>
    `;
}

// Helper to escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
