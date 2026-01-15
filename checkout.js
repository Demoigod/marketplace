import { supabase } from './supabase-config.js';
import { getCurrentUser } from './auth.js';

let currentItem = null;
let currentUser = null;

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');

    if (!itemId) {
        window.location.href = 'listings.html';
        return;
    }

    try {
        currentUser = await getCurrentUser();
        if (!currentUser) {
            window.location.href = 'index.html';
            return;
        }

        // Render Buyer Details
        renderBuyerDetails(currentUser);

        // Fetch Item
        await loadOrderDetails(itemId);

    } catch (err) {
        console.error('Checkout Init Error:', err);
        alert('Could not initialize checkout.');
        window.location.href = 'listings.html';
    }
});

function renderBuyerDetails(user) {
    const nameEl = document.getElementById('buyerName');
    const idEl = document.getElementById('buyerId');
    if (nameEl) nameEl.textContent = user.username || 'User';
    if (idEl) idEl.textContent = `ID: ${user.immutable_user_code}`;
}

async function loadOrderDetails(itemId) {
    const loader = document.getElementById('checkoutLoading');
    const ui = document.getElementById('checkoutUI');

    loader.style.display = 'block';
    ui.style.visibility = 'hidden';

    const { data: item, error } = await supabase
        .from('market_listings')
        .select(`
            *,
            profiles (username, immutable_user_code)
        `)
        .eq('id', itemId)
        .single();

    if (error || !item) {
        alert('Item not found or unavailable.');
        window.location.href = 'listings.html';
        return;
    }

    if (item.status !== 'active') {
        alert('This item has already been sold or removed.');
        window.location.href = 'listings.html';
        return;
    }

    currentItem = item;

    // Render Item
    const summaryCard = document.getElementById('itemSummaryCard');
    const totalEl = document.getElementById('totalAmount');
    const btn = document.getElementById('confirmOrderBtn');

    const img = item.image_url || (item.images && item.images[0]) || 'https://via.placeholder.com/80';

    summaryCard.innerHTML = `
        <img src="${img}" class="summary-img">
        <div class="summary-info">
            <h3>${item.title}</h3>
            <div class="price">R ${parseFloat(item.price).toLocaleString()}</div>
            <div style="font-size: 0.85rem; color: #666; margin-top: 4px;">Seller: ${item.profiles?.username} #${item.profiles?.immutable_user_code}</div>
        </div>
    `;

    totalEl.textContent = `R ${parseFloat(item.price).toLocaleString()}`;
    btn.innerHTML = `Confirm & Pay R ${parseFloat(item.price).toLocaleString()}`;

    loader.style.display = 'none';
    ui.style.visibility = 'visible';
}

window.processCheckout = async () => {
    if (!currentItem || !currentUser) return;

    const btn = document.getElementById('confirmOrderBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';

    try {
        // 1. Create Transaction Record
        const { data: txn, error: txnError } = await supabase
            .from('transactions')
            .insert([{
                buyer_id: currentUser.id,
                seller_id: currentItem.seller_id,
                listing_id: currentItem.id,
                amount: currentItem.price,
                status: 'completed',
                payment_method: 'simulation'
            }])
            .select()
            .single();

        if (txnError) throw txnError;

        // 2. Mark Item as Sold
        const { error: updateError } = await supabase
            .from('market_listings')
            .update({ status: 'sold' })
            .eq('id', currentItem.id);

        if (updateError) throw updateError;

        // 3. Success! Redirect
        if (confirm(`Payment Successful! You bought ${currentItem.title}. Redirect to messages to coordinate pickup?`)) {
            window.location.href = `messages.html?seller_id=${currentItem.seller_id}&listing_id=${currentItem.id}`;
        } else {
            window.location.href = 'listings.html';
        }

    } catch (err) {
        console.error('Checkout Process Error:', err);
        alert('Transaction failed: ' + err.message);
        btn.disabled = false;
        btn.textContent = 'Try Again';
    }
};
