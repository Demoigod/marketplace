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
 * Renders an item card following exact user requirements (Mockup Style).
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

    return `
        <div class="marketplace-item" data-id="${item.id}" data-user-id="${item.seller_id}">
            <div class="item-image" style="background-image: url('${mainImage}');"></div>
            <div class="item-content">
                <h3 class="item-title">${escapeHtml(item.title || 'Untitled Item')}</h3>
                <span class="item-price">R ${parseFloat(item.price || 0).toLocaleString()}</span>
                
                <div class="item-meta">
                    By ${escapeHtml(item.profiles?.username || item.profiles?.full_name || 'Anonymous')}
                </div>
                <div class="item-date">
                    Posted on ${postedDate}
                </div>
                <div class="item-desc-short">
                    ${escapeHtml(item.description || '').substring(0, 60)}${item.description?.length > 60 ? '...' : ''}
                </div>
                
                <div class="item-actions-preview">
                    <button class="btn-view-item" data-action="view" data-id="${item.id}">View Item</button>
                </div>
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
