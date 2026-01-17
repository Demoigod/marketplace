import { supabase } from './supabase-config.js';
import { isLoggedIn, getCurrentUser } from './auth.js';
import './admin.js'; // Ensure sidebar injection/logic

document.addEventListener('DOMContentLoaded', async () => {
    // Auth check
    const user = await getCurrentUser();
    if (!user) {
        window.location.href = 'index.html';
        return;
    }

    await loadMyListings(user.id);
});

async function loadMyListings(userId) {
    const grid = document.getElementById('myListingsGrid');

    try {
        const { data: listings, error } = await supabase
            .from('market_listings')
            .select('*')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (!listings || listings.length === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 4rem;">
                    <h3>No listings found</h3>
                    <p>You haven't listed any items for sale yet.</p>
                    <a href="post-item.html" class="btn-primary" style="display: inline-block; margin-top: 1rem; text-decoration: none;">Post an Item</a>
                </div>
            `;
            return;
        }

        grid.innerHTML = listings.map(item => createMyListingCard(item)).join('');

        // Attach event listeners for status changes
        document.querySelectorAll('.status-select').forEach(select => {
            select.addEventListener('change', async (e) => {
                const itemId = e.target.dataset.id;
                const newStatus = e.target.value;
                await updateListingStatus(itemId, newStatus);
            });
        });

        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const itemId = e.target.dataset.id;
                if (confirm('Are you sure you want to delete this listing? It cannot be undone.')) {
                    await deleteListing(itemId);
                }
            });
        });

    } catch (err) {
        console.error('Error loading my listings:', err);
        grid.innerHTML = '<div style="color: red; padding: 2rem;">Error loading listings. Please refresh.</div>';
    }
}

function createMyListingCard(item) {
    // Handle image parsing
    let imageUrl = 'https://via.placeholder.com/300x200?text=No+Image';
    if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0];
    } else if (typeof item.images === 'string' && item.images.startsWith('[')) {
        try {
            const parsed = JSON.parse(item.images);
            if (parsed.length > 0) imageUrl = parsed[0];
        } catch (e) { }
    }

    return `
        <div class="item-card" id="card-${item.id}">
            <div class="card-image">
                <img src="${imageUrl}" alt="${item.title}" loading="lazy">
                <span class="price-tag">R ${item.price}</span>
            </div>
            <div class="card-content">
                <h3 class="item-title">${item.title}</h3>
                <p class="item-meta">${item.category} • ${new Date(item.created_at).toLocaleDateString()}</p>
                
                <div class="status-actions">
                    <select class="status-select" data-id="${item.id}">
                        <option value="active" ${item.status === 'active' ? 'selected' : ''}>Active 🟢</option>
                        <option value="sold" ${item.status === 'sold' ? 'selected' : ''}>Sold 🔴</option>
                        <option value="pending" ${item.status === 'pending' ? 'selected' : ''}>Pending 🟡</option>
                    </select>
                    <button class="delete-btn" data-id="${item.id}">🗑️</button>
                </div>
            </div>
        </div>
    `;
}

async function updateListingStatus(itemId, newStatus) {
    try {
        const { error } = await supabase
            .from('market_listings')
            .update({ status: newStatus })
            .eq('id', itemId);

        if (error) throw error;
        alert(`Status updated to ${newStatus}`);
    } catch (err) {
        console.error('Failed to update status:', err);
        alert('Failed to update status.');
    }
}

async function deleteListing(itemId) {
    try {
        const { error } = await supabase
            .from('market_listings')
            .delete()
            .eq('id', itemId);

        if (error) throw error;

        // Remove from DOM
        const card = document.getElementById(`card-${itemId}`);
        if (card) card.remove();

        alert('Listing deleted.');
    } catch (err) {
        console.error('Failed to delete:', err);
        alert('Failed to delete listing.');
    }
}
