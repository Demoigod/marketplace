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
                <div class="item-price">R ${parseFloat(item.price || 0).toLocaleString()}</div>
                
                <div class="item-meta">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <span>By ${escapeHtml(item.profiles?.username || item.profiles?.full_name || 'Anonymous')}</span>
                </div>
                <div class="item-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Posted on ${postedDate}</span>
                </div>
                <div class="item-directions">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>Directions Available</span>
                </div>
                
                <button class="btn-view-item" data-action="view" data-id="${item.id}">View Detailed Info</button>
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
