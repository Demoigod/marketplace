// ===== AUTHENTICATION SYSTEM =====

// User storage key
const USERS_KEY = 'marketplace_users';
const SESSION_KEY = 'marketplace_session';

// Initialize users array if not exists
function initializeStorage() {
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify([]));
    }
}

// Get all users
function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

// Save users
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Generate unique ID
function generateId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Register new user
function registerUser(email, password, name, role) {
    initializeStorage();
    const users = getUsers();

    // Check if user already exists
    if (users.find(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
    }

    // Create new user
    const newUser = {
        id: generateId(),
        email: email,
        password: password, // In production, this should be hashed
        name: name,
        role: role, // 'buyer' or 'seller'
        createdAt: new Date().toISOString(),
        purchases: [],
        listings: [],
        downloads: [],
        savedItems: [],
        sales: []
    };

    users.push(newUser);
    saveUsers(users);

    return { success: true, message: 'Registration successful', user: newUser };
}

// Login user
function loginUser(email, password) {
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return { success: false, message: 'Invalid email or password' };
    }

    // Create session
    const session = {
        userId: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        loggedIn: true,
        loginTime: new Date().toISOString()
    };

    localStorage.setItem(SESSION_KEY, JSON.stringify(session));

    return { success: true, message: 'Login successful', user: user };
}

// Logout user
function logoutUser() {
    localStorage.removeItem(SESSION_KEY);
    return { success: true, message: 'Logged out successfully' };
}

// Get current session
function getCurrentSession() {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
}

// Check if user is logged in
function isLoggedIn() {
    const session = getCurrentSession();
    return session && session.loggedIn;
}

// Get current user data
function getCurrentUser() {
    const session = getCurrentSession();
    if (!session) return null;

    const users = getUsers();
    return users.find(u => u.id === session.userId);
}

// Update user data
function updateUser(userId, updates) {
    const users = getUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return { success: false, message: 'User not found' };
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);

    return { success: true, message: 'User updated', user: users[userIndex] };
}

// Add purchase to user
function addPurchase(userId, item) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not logged in' };

    const purchase = {
        id: generateId(),
        itemId: item.id,
        itemTitle: item.title,
        price: item.price,
        category: item.category,
        purchaseDate: new Date().toISOString()
    };

    user.purchases.push(purchase);
    updateUser(userId, { purchases: user.purchases });

    return { success: true, message: 'Purchase recorded', purchase: purchase };
}

// Add listing to seller
function addListing(userId, item) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not logged in' };

    const listing = {
        ...item,
        sellerId: userId,
        listedDate: new Date().toISOString(),
        views: 0,
        status: 'active'
    };

    user.listings.push(listing);
    updateUser(userId, { listings: user.listings });

    return { success: true, message: 'Listing added', listing: listing };
}

// Add download to user
function addDownload(userId, resource) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not logged in' };

    const download = {
        id: generateId(),
        resourceId: resource.id,
        resourceTitle: resource.title,
        resourceType: resource.type,
        course: resource.course,
        downloadDate: new Date().toISOString()
    };

    user.downloads.push(download);
    updateUser(userId, { downloads: user.downloads });

    return { success: true, message: 'Download recorded', download: download };
}

// Toggle saved item
function toggleSavedItem(userId, itemId) {
    const user = getCurrentUser();
    if (!user) return { success: false, message: 'Not logged in' };

    const index = user.savedItems.indexOf(itemId);

    if (index > -1) {
        user.savedItems.splice(index, 1);
        updateUser(userId, { savedItems: user.savedItems });
        return { success: true, message: 'Item removed from saved', saved: false };
    } else {
        user.savedItems.push(itemId);
        updateUser(userId, { savedItems: user.savedItems });
        return { success: true, message: 'Item saved', saved: true };
    }
}

// Record sale
function recordSale(sellerId, itemId, buyerId, price) {
    const users = getUsers();
    const seller = users.find(u => u.id === sellerId);

    if (!seller) return { success: false, message: 'Seller not found' };

    const sale = {
        id: generateId(),
        itemId: itemId,
        buyerId: buyerId,
        price: price,
        saleDate: new Date().toISOString()
    };

    if (!seller.sales) seller.sales = [];
    seller.sales.push(sale);

    // Update listing status
    const listing = seller.listings.find(l => l.id === itemId);
    if (listing) {
        listing.status = 'sold';
    }

    updateUser(sellerId, { sales: seller.sales, listings: seller.listings });

    return { success: true, message: 'Sale recorded', sale: sale };
}

// Get user statistics
function getUserStats(userId) {
    const user = getCurrentUser();
    if (!user) return null;

    const stats = {
        totalPurchases: user.purchases?.length || 0,
        totalSpent: user.purchases?.reduce((sum, p) => sum + (p.price || 0), 0) || 0,
        totalDownloads: user.downloads?.length || 0,
        savedItemsCount: user.savedItems?.length || 0,
        totalListings: user.listings?.length || 0,
        activeListings: user.listings?.filter(l => l.status === 'active').length || 0,
        soldListings: user.listings?.filter(l => l.status === 'sold').length || 0,
        totalSales: user.sales?.length || 0,
        totalRevenue: user.sales?.reduce((sum, s) => sum + (s.price || 0), 0) || 0
    };

    return stats;
}

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        registerUser,
        loginUser,
        logoutUser,
        getCurrentSession,
        isLoggedIn,
        getCurrentUser,
        updateUser,
        addPurchase,
        addListing,
        addDownload,
        toggleSavedItem,
        recordSale,
        getUserStats
    };
}
