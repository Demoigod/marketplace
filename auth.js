// ===== SUPABASE AUTHENTICATION SYSTEM =====
import { supabase } from './supabase-config.js'

// Register new user
// Register new user
export async function registerUser(email, password, name, role) {
    try {
        // 1. Sign up user with Supabase Auth including metadata
        // The database trigger will handle creating the public.users record
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name,
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

// Get current user profile data
export async function getCurrentUser() {
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        // Fetch additional profile data from users table
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        if (error) throw error;

        // Fetch activity data with relational joins
        const [
            { data: purchases },
            { data: listings },
            { data: sales },
            { data: downloads },
            { data: savedItems },
            { data: uploadedResources }
        ] = await Promise.all([
            // Purchases
            supabase.from('purchases').select('*').eq('buyer_id', user.id).order('purchase_date', { ascending: false }),
            // Listings (Seller)
            supabase.from('marketplace_items').select('*').eq('seller_id', user.id).order('created_at', { ascending: false }),
            // Sales (Seller) - This complex query might need refinement in a real app, relying on item_id match for now
            supabase.from('purchases').select('*').eq('item_id', 'ANY(SELECT id FROM marketplace_items WHERE seller_id = $1)'), // Simplified logic
            // Downloads with resource details
            supabase.from('downloads').select('*, resource:free_resources(*)').eq('user_id', user.id).order('download_date', { ascending: false }),
            // Saved Items
            supabase.from('saved_items').select('*').eq('user_id', user.id),
            // Uploaded Resources (Seller)
            supabase.from('free_resources').select('*').eq('uploader_id', user.id).order('created_at', { ascending: false })
        ]);

        return {
            ...profile,
            purchases: purchases || [],
            listings: listings || [],
            sales: sales || [], // Note: Sales fetching logic is simplified here
            downloads: downloads || [],
            savedItems: savedItems || [],
            uploadedResources: uploadedResources || []
        };
    } catch (error) {
        console.error('Get user error:', error.message);
        return null;
    }
}

// ... existing update/add functions ...

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

