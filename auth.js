// ===== SUPABASE AUTHENTICATION SYSTEM =====
import { supabase } from './supabase-config.js'

// Register new user
// Register new user
export async function registerUser(email, password, userData) {
    try {
        const { firstName, lastName, username, phone, role } = userData;
        // 1. Sign up user with Supabase Auth including metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName,
                    username: username,
                    phone: phone,
                    role: role
                }
            }
        });

        if (authError) throw authError;

        // If email confirmation is disabled, we get a session immediately
        if (authData.session) {
            return { success: true, message: 'Registration successful!', user: authData.user };
        }

        // Return success for email verification flow
        return { success: true, message: 'Registration successful! Please check your email for verification.', user: authData.user };

    } catch (error) {
        console.error('Registration error:', error.message);
        return { success: false, message: error.message };
    }
}

// Login user
export async function loginUser(email, password) {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;

        return { success: true, message: 'Login successful', user: data.user };
    } catch (error) {
        console.error('Login error:', error.message);
        return { success: false, message: error.message };
    }
}

// Logout user
export async function logoutUser() {
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;

        // Clear any remaining local storage session items if needed
        localStorage.removeItem('marketplace_session');

        return { success: true, message: 'Logged out successfully' };
    } catch (error) {
        console.error('Logout error:', error.message);
        return { success: false, message: error.message };
    }
}

// Get current session
export async function getCurrentSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
        console.error('Session error:', error.message);
        return null;
    }
    return session;
}

// Check if user is logged in
export async function isLoggedIn() {
    const session = await getCurrentSession();
    return !!session;
}
export const checkAuthStatus = isLoggedIn;

// Get current user profile data
export async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch additional profile data from profiles table
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        if (profileError) {
            console.warn('Profile not found, using basic auth data:', profileError.message);
            // Fallback to basic data from auth metadata + auth object
            return {
                id: user.id,
                email: user.email,
                username: user.user_metadata?.username || user.user_metadata?.name || 'User',
                first_name: user.user_metadata?.first_name || '',
                last_name: user.user_metadata?.last_name || '',
                phone: user.user_metadata?.phone || '',
                role: user.user_metadata?.role || 'buyer',
                avatar_url: user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.username || 'User')}&background=368CBF&color=fff`,
                immutable_user_code: null,
                purchases: [],
                listings: [],
                sales: [],
                downloads: [],
                savedItems: [],
                uploadedResources: []
            };
        }

        // Fetch activity data with relational joins
        // Note: Relation names updated to match new schema logic
        // Initialize activity data with empty defaults
        let purchases = [], listings = [], sellerListingsForSales = [], downloads = [], savedItems = [], uploadedResources = [];

        try {
            const results = await Promise.all([
                supabase.from('purchases').select('*').eq('buyer_id', user.id).order('purchase_date', { ascending: false }).then(r => r.data || []),
                supabase.from('market_listings').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }).then(r => r.data || []),
                supabase.from('market_listings').select('id').eq('seller_id', user.id).then(r => r.data || []),
                supabase.from('downloads').select('*, resource:free_resources(*)').eq('user_id', user.id).order('download_date', { ascending: false }).then(r => r.data || []),
                supabase.from('saved_items').select('*').eq('profile_id', user.id).then(r => r.data || []),
                supabase.from('free_resources').select('*').eq('uploader_id', user.id).order('created_at', { ascending: false }).then(r => r.data || [])
            ]);
            [purchases, listings, sellerListingsForSales, downloads, savedItems, uploadedResources] = results;
        } catch (e) {
            console.warn('Error fetching supplementary activity data:', e.message);
        }

        // Post-process sales
        let sales = [];
        try {
            if (sellerListingsForSales && sellerListingsForSales.length > 0) {
                const myItemIds = sellerListingsForSales.map(l => l.id);
                const { data: salesData } = await supabase
                    .from('purchases')
                    .select('*')
                    .in('item_id', myItemIds);
                sales = salesData || [];
            }
        } catch (e) {
            console.warn('Could not fetch sales data:', e.message);
        }

        return {
            ...profile,
            id: user.id,
            first_name: profile?.first_name || user.user_metadata?.first_name || '',
            last_name: profile?.last_name || user.user_metadata?.last_name || '',
            username: profile?.username || user.user_metadata?.username || user.user_metadata?.name || 'User',
            email: profile?.email || user.email || '',
            phone: profile?.phone_number || user.user_metadata?.phone || '',
            immutable_user_code: profile?.immutable_user_code || null,
            purchases: purchases,
            listings: listings,
            sales: sales,
            downloads: downloads,
            savedItems: savedItems,
            uploadedResources: uploadedResources
        };
    } catch (error) {
        console.error('Get user error:', error.message);
        return null;
    }
}

// Update user profile
export async function updateUser(updates) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not logged in');

        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;

        return { success: true, message: 'User updated', user: data };
    } catch (error) {
        console.error('Update user error:', error.message);
        return { success: false, message: error.message };
    }
}

// Add purchase to user
export async function addPurchase(item) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not logged in');

        const { data, error } = await supabase
            .from('purchases')
            .insert([
                {
                    buyer_id: user.id,
                    item_id: item.id,
                    item_title: item.title,
                    price: item.price,
                    category: item.category
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return { success: true, message: 'Purchase recorded', purchase: data };
    } catch (error) {
        console.error('Add purchase error:', error.message);
        return { success: false, message: error.message };
    }
}

// Add listing to seller
export async function addListing(item) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not logged in');

        const { data, error } = await supabase
            .from('market_listings')
            .insert([
                {
                    ...item,
                    seller_id: user.id, // Absolute identity linking
                    status: 'active'
                }
            ])
            .select()
            .single();

        if (error) throw error;

        return { success: true, message: 'Listing added', listing: data };
    } catch (error) {
        console.error('Add listing error:', error.message);
        return { success: false, message: error.message };
    }
}

// Add download to user
export async function addDownload(resource) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not logged in');

        const { data, error } = await supabase
            .from('downloads')
            .insert([
                {
                    user_id: user.id,
                    resource_id: resource.id
                }
            ])
            .select()
            .single();

        if (error) throw error;

        // Increment download count on the resource
        await supabase.rpc('increment_resource_downloads', { resource_id: resource.id });

        return { success: true, message: 'Download recorded', download: data };
    } catch (error) {
        console.error('Add download error:', error.message);
        return { success: false, message: error.message };
    }
}

// Toggle saved item
export async function toggleSavedItem(itemId) {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not logged in');

        // Check if already saved
        const { data: existing } = await supabase
            .from('saved_items')
            .select('*')
            .eq('profile_id', user.id)
            .eq('item_id', itemId)
            .single();

        if (existing) {
            // Remove it
            const { error } = await supabase
                .from('saved_items')
                .delete()
                .eq('profile_id', user.id)
                .eq('item_id', itemId);

            if (error) throw error;
            return { success: true, message: 'Item removed from saved', saved: false };
        } else {
            // Add it
            const { error } = await supabase
                .from('saved_items')
                .insert([{ profile_id: user.id, item_id: itemId }]);

            if (error) throw error;
            return { success: true, message: 'Item saved', saved: true };
        }
    } catch (error) {
        console.error('Toggle saved error:', error.message);
        return { success: false, message: error.message };
    }
}

// Get user statistics
export async function getUserStats() {
    try {
        const profile = await getCurrentUser();
        if (!profile) return null;

        const stats = {
            // Buyer Stats
            totalPurchases: profile.purchases.length,
            totalSpent: profile.purchases.reduce((sum, p) => sum + (p.price || 0), 0),
            totalDownloads: profile.downloads.length,
            savedItemsCount: profile.savedItems.length,

            // Seller Stats
            totalListings: profile.listings.length,
            activeListings: profile.listings.filter(l => l.status === 'active').length,
            soldListings: profile.listings.filter(l => l.status === 'sold').length,
            totalSales: profile.sales.length,
            totalRevenue: profile.sales.reduce((sum, s) => sum + (s.price || 0), 0),
            uploadedResourcesCount: profile.uploadedResources.length
        };

        return stats;
    } catch (error) {
        console.error('Get stats error:', error.message);
        return null;
    }
}

