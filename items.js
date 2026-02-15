import { supabase } from './supabase-config.js?v=fixed';
import { isLoggedIn } from './auth.js?v=fixed';

/**
 * Fetches all active items from the marketplace.
 * Handles RLS policies: authenticated users get profile data, public users don't.
 */
export async function fetchAllItems() {
    try {
        // Check if user is authenticated
        const isAuth = await isLoggedIn();

        if (isAuth) {
            // Authenticated: Try to fetch with profile join
            console.log('Fetching items with profile data (authenticated)...');
            const { data, error } = await supabase
                .from('market_listings')
                .select(`
                    *,
                    profiles (
                        username,
                        full_name,
                        immutable_user_code
                    )
                `)
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (!error) {
                console.log('Successfully fetched items with profiles:', data?.length);
                return data || [];
            }

            console.warn('Profile join failed for authenticated user, using fallback:', error);
        } else {
            console.log('Fetching items without profile data (public user)...');
        }

        // Fallback for unauthenticated users OR if join fails
        // This query will succeed even with restrictive RLS on profiles table
        const { data: publicData, error: publicError } = await supabase
            .from('market_listings')
            .select('*')
            .eq('status', 'active')
            .order('created_at', { ascending: false });

        if (publicError) {
            console.error('Failed to fetch marketplace items:', publicError);
            throw publicError;
        }

        console.log('Successfully fetched public items:', publicData?.length);
        return publicData || [];

    } catch (error) {
        console.error('Critical items fetch error:', error);
        return [];
    }
}

/**
 * Renders an item card with conditional visibility based on authentication status.
 * Public users see privacy-protected cards, authenticated users see full details.
 */
export function createItemCard(item, isAuth = false) {
    const postedDate = new Date(item.created_at).toLocaleDateString();

    // Prioritize image_url, fallback to images array, then placeholder
    let mainImage = item.image_url;
    if (!mainImage && item.images && item.images.length > 0) {
        mainImage = item.images[0];
    }
    if (!mainImage) {
        mainImage = 'https://placehold.co/300x200?text=No+Image';
    }

    // SECURITY: Conditional seller information display
    if (isAuth) {
        // Authenticated users see full seller details
        return createAuthenticatedCard(item, mainImage, postedDate);
    } else {
        // Public users see privacy-protected card
        return createPublicCard(item, mainImage, postedDate);
    }
}

/**
 * Creates a full-featured card for authenticated users
 */
function createAuthenticatedCard(item, mainImage, postedDate) {
    const sellerName = item.profiles?.username || item.profiles?.full_name || 'Anonymous';
    const sellerId = item.profiles?.immutable_user_code || (item.seller_id ? item.seller_id.slice(0, 6).toUpperCase() : 'N/A');

    return `
        <div class="marketplace-item" data-id="${item.id}" data-user-id="${item.seller_id}">
            <div class="item-image" style="background-image: url('${mainImage}');"></div>
            <div class="item-content">
                <h3 class="item-title">${escapeHtml(item.title || 'Untitled Item')}</h3>
                <div class="item-price">R ${parseFloat(item.price || 0).toLocaleString()}</div>
                
                <div class="item-meta" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span style="font-weight: 700;">${escapeHtml(sellerName)}</span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); padding-left: 1.4rem;">Posted by User ID: ${sellerId}</span>
                </div>
                
                <div class="item-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Posted on ${postedDate}</span>
                </div>
                <div class="item-directions">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>Directions Available</span>
                </div>
                
                <div class="item-actions" style="margin-top: auto; display: flex; gap: 0.5rem;">
                    <button class="btn-view-item" data-action="view" data-id="${item.id}" style="flex:1;">View Info</button>
                    <button class="btn-view-item contact-seller-btn" 
                            data-seller-id="${item.seller_id}" 
                            data-listing-id="${item.id}"
                            style="flex:1; background:transparent; color:var(--primary-color); border-color:var(--primary-color);">
                        Contact
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Creates a privacy-protected card for public (unauthenticated) users
 */
function createPublicCard(item, mainImage, postedDate) {
    return `
        <div class="marketplace-item public-view" data-id="${item.id}">
            <div class="item-image" style="background-image: url('${mainImage}');"></div>
            <div class="item-content">
                <h3 class="item-title">${escapeHtml(item.title || 'Untitled Item')}</h3>
                <div class="item-price">R ${parseFloat(item.price || 0).toLocaleString()}</div>
                
                <div class="item-meta" style="flex-direction: column; align-items: flex-start; gap: 2px;">
                    <div style="display: flex; align-items: center; gap: 0.5rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                        <span style="font-weight: 700; color: var(--text-muted);">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px;">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Registered User
                        </span>
                    </div>
                    <span style="font-size: 0.75rem; color: var(--text-muted); padding-left: 1.4rem;">
                        <a href="#" onclick="event.preventDefault(); document.getElementById('authModal')?.classList.add('active');" style="color: var(--primary-color); text-decoration: underline;">
                            Login to view seller
                        </a>
                    </span>
                </div>
                
                <div class="item-date">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <span>Posted on ${postedDate}</span>
                </div>
                <div class="item-directions">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    <span>Category: ${escapeHtml(item.category || 'General')}</span>
                </div>
                
                <div class="item-actions" style="margin-top: auto; display: flex; gap: 0.5rem;">
                    <button class="btn-view-item" data-action="view" data-id="${item.id}" style="flex:1;">View Details</button>
                    <button class="btn-view-item" 
                            onclick="event.preventDefault(); document.getElementById('authModal')?.classList.add('active'); document.querySelector('.auth-tab[data-tab=\\'login\\']')?.click();"
                            style="flex:1; background:transparent; color:var(--primary-color); border-color:var(--primary-color); position: relative;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline; margin-right: 4px;">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        Login to Contact
                    </button>
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
