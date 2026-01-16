import { supabase } from './supabase-config.js';
import { getCurrentUser, logoutUser } from './auth.js';


document.addEventListener('DOMContentLoaded', async () => {
    updateDate();
    await initDashboard();
    setupSidebar();
});

function updateDate() {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
        const now = new Date();
        const options = { month: 'long', day: 'numeric', year: 'numeric' };
        dateEl.textContent = `Today is ${now.toLocaleDateString('en-US', options)}`;
    }
}

async function initDashboard() {
    const user = await getCurrentUser();
    if (!user) return;

    // 1. Sync all profile UI elements (Header + Page content)
    syncProfileUI(user);

    // 2. Load Metrics (Only if elements exist)

    // 2. Load Metrics (Only if elements exist)
    if (document.getElementById('countListings')) {
        loadCounts(user.id);
    }

    // 3. Load Activity Feeds
    if (document.getElementById('activityFeed1') || document.getElementById('notificationFeed')) {
        loadActivityFeeds();
    }

    // 5. Load User Specific Listings
    if (document.getElementById('myListingsFeed')) {
        loadMyListings(user.id);
        setupRealtimeListings(user.id);
    }

    // 6. Global Unread Messages Notifications
    loadUnreadMessages(user.id);
    subscribeToNewMessages(user.id);
}

/**
 * Fetches and displays listings belonging only to the authenticated user.
 */
async function loadMyListings(userId) {
    const listEl = document.getElementById('myListingsFeed');
    const badgeEl = document.getElementById('myListingsCountBadge');
    if (!listEl) return;

    try {
        const { data: listings, error } = await supabase
            .from('market_listings')
            .select('title, price, status, created_at')
            .eq('seller_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        if (badgeEl) badgeEl.textContent = listings.length;

        // Update the metric card count too if it exists
        const mainCountEl = document.getElementById('countListings');
        if (mainCountEl) mainCountEl.textContent = listings.length;

        if (listings.length === 0) {
            listEl.innerHTML = '<div class="p-4 text-center text-gray-500">You haven\'t posted anything yet.</div>';
            return;
        }

        listEl.innerHTML = listings.map(item => `
            <div class="activity-item">
                <div class="logo-box" style="background: #F8F9FA; color: var(--primary-color); width: 32px; height: 32px;">
                    <span style="font-size: 0.8rem; font-weight: 800;">🛒</span>
                </div>
                <div class="act-body">
                    <span class="act-user">${item.title}</span>
                    <span class="act-desc">R ${item.price} • <span class="status-tag ${item.status}">${item.status.toUpperCase()}</span></span>
                </div>
                <span class="act-time">${new Date(item.created_at).toLocaleDateString()}</span>
            </div>
        `).join('');

    } catch (err) {
        console.error('Error loading my listings:', err);
        listEl.innerHTML = '<div class="p-4 text-red-500">Could not load your listings.</div>';
    }
}

/**
 * Listens for real-time changes to the market_listings table.
 */
function setupRealtimeListings(userId) {
    supabase
        .channel('my-listings-changes')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'market_listings',
            filter: `seller_id=eq.${userId}`
        }, (payload) => {
            console.log('Real-time listing change detected:', payload.eventType);
            loadMyListings(userId);
        })
        .subscribe();
}

async function loadCounts(userId) {
    try {
        // Real listing count
        const { count: listingCount } = await supabase
            .from('market_listings')
            .select('*', { count: 'exact', head: true })
            .eq('seller_id', userId);

        document.getElementById('countListings').textContent = listingCount || 0;

        // Sample data for others (to be integrated with real tables later)
        document.getElementById('countMessages').textContent = '12';
        document.getElementById('unreadBadge').textContent = '6';
        document.getElementById('countResources').textContent = '6';
        document.getElementById('countSales').textContent = '3';
    } catch (e) {
        console.error('Error loading metrics:', e);
    }
}

function loadActivityFeeds() {
    const feed1 = document.getElementById('activityFeed1');
    const feed2 = document.getElementById('activityFeed2');
    const notifFeed = document.getElementById('notificationFeed');

    const activityData = [
        { name: 'John Doe', action: 'Bought item from seller', time: '30 mins ago' },
        { name: 'Jane Smith', action: 'Listed a new textbook', time: '1 hour ago' },
        { name: 'Alex Brown', action: 'Commented on your post', time: '2 hours ago' }
    ];

    const notifData = [
        { name: 'John Doe', desc: 'sent you a message', time: '10 mins ago' },
        { name: 'System', desc: 'Your document was approved', time: '1 hour ago' },
        { name: 'Market', desc: 'New comment on your listing', time: '2 hours ago' }
    ];

    if (feed1) feed1.innerHTML = activityData.map(item => renderActivityItem(item)).join('');
    if (feed2) feed2.innerHTML = activityData.map(item => renderActivityItem(item)).join('');
    if (notifFeed) notifFeed.innerHTML = notifData.map(item => renderNotifItem(item)).join('');
}

function renderActivityItem(item) {
    return `
        <div class="activity-item">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random" class="act-avatar">
            <div class="act-body">
                <span class="act-user">${item.name}</span>
                <span class="act-desc">${item.action}</span>
            </div>
            <span class="act-time">${item.time}</span>
        </div>
    `;
}

function renderNotifItem(item) {
    return `
        <div class="activity-item">
            <img src="https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=F1F3F5&color=368CBF" class="act-avatar" style="border-radius: 8px;">
            <div class="act-body">
                <span class="act-user">${item.name} ${item.desc}</span>
                <span class="act-time">${item.time}</span>
            </div>
            <span style="color: #ADB5BD; font-size: 1.2rem;">...</span>
        </div>
    `;
}

function loadOnlineUsers() {
    const grid = document.getElementById('onlineGrid');
    const users = ['John', 'Emily', 'Alex', 'Sarah', 'Mike', 'Sophia', 'Linda'];

    if (grid) {
        grid.innerHTML = users.map(u => `
            <div class="online-u">
                <img src="https://ui-avatars.com/api/?name=${u}&background=random">
                <span>${u}</span>
            </div>
        `).join('');
    }
}

/**
 * Centralized Sidebar & Header Navigation Logic
 * Handles transitions, auth guards, and automatic active states.
 */
function setupSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (!sidebar) return;

    // 1. Set Automatic Active State based on current URL
    const currentPath = window.location.pathname.split('/').pop() || 'admin.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // 2. Sidebar Link Handling (Event Delegation)
    sidebar.addEventListener('click', async (e) => {
        const link = e.target.closest('.nav-link');
        if (!link) return;

        if (link.id === 'sidebarLogout') {
            e.preventDefault();
            handleLogout();
            return;
        }

        const href = link.getAttribute('href');
        if (href === '#' || !href) {
            e.preventDefault();
            return;
        }

        // Auth Guard Check
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && href !== 'index.html') {
            e.preventDefault();
            window.location.href = 'index.html';
            return;
        }
    });

    // 3. Global Header Triggers (Profile, Search, etc.)
    const profileToggle = document.getElementById('profileToggle');
    if (profileToggle) {
        profileToggle.addEventListener('click', () => {
            window.location.href = 'account.html';
        });
    }

    // Initialize Header Profile Info (if elements exist)
    syncProfileUI();
}

/**
 * CRITICAL FIX: Unified UI Synching for all Profile data
 * Handles Header, Sidebar, and Account page middle section.
 */
async function syncProfileUI(existingUser = null) {
    console.log('--- SYNC ATTEMPT START ---');
    try {
        const user = existingUser || await getCurrentUser();
        if (!user) {
            console.warn('Sync aborted: User object not found.');
            return;
        }

        const applyUpdates = () => {
            // 1. Resolve Data with string safety
            const first = String(user.first_name || user.user_metadata?.first_name || '');
            const last = String(user.last_name || user.user_metadata?.last_name || '');
            const uname = String(user.username || user.user_metadata?.username || 'User');
            const email = String(user.email || '');
            const phone = String(user.phone || user.phone_number || '');
            const displayId = String(user.immutable_user_code || (user.id ? user.id.slice(0, 6).toUpperCase() : '000000'));

            // Determine full display name
            let fullDisplay = uname;
            if (first) fullDisplay = `${first} ${last}`.trim();
            if (fullDisplay === 'User' && first) fullDisplay = `${first} ${last}`.trim();

            const avatarSrc = user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullDisplay)}&background=368CBF&color=fff`;

            // 2. Element Registry (ID -> Value/Action)
            const registry = [
                { id: 'userName', attr: 'textContent', val: fullDisplay },
                { id: 'welcomeTitle', attr: 'textContent', val: `Welcome, ${first || uname} 👋` },
                { id: 'userId', attr: 'textContent', val: `ID: ${displayId}` },
                { id: 'profileFullName', attr: 'textContent', val: fullDisplay },
                { id: 'profileRole', attr: 'textContent', val: (user.role || 'Member').charAt(0).toUpperCase() + (user.role || 'Member').slice(1) },
                { id: 'publicUserIdDisplay', attr: 'textContent', val: `ID: #${displayId}` },
                { id: 'topNavAvatar', attr: 'src', val: avatarSrc },
                { id: 'userAvatar', attr: 'src', val: avatarSrc },
                { id: 'profileAvatar', attr: 'src', val: avatarSrc },
                { id: 'firstName', attr: 'value', val: first },
                { id: 'lastName', attr: 'value', val: last },
                { id: 'username', attr: 'value', val: uname },
                { id: 'email', attr: 'value', val: email },
                { id: 'phone', attr: 'value', val: phone }
            ];

            registry.forEach(item => {
                const el = document.getElementById(item.id);
                if (el) {
                    if (item.attr === 'value') {
                        el.value = item.val;
                        el.placeholder = item.val || 'Not provided';
                    } else {
                        el[item.attr] = item.val;
                    }
                }
            });

            // CRITICAL FIX: Inject Avatar Upload UI if User has cached HTML
            const avatarImg = document.getElementById('profileAvatar');
            if (avatarImg && !avatarImg.closest('.avatar-upload-wrapper')) {
                console.log('Detected cached HTML: Injecting Avatar Upload UI...');
                const wrapper = document.createElement('div');
                wrapper.className = 'avatar-upload-wrapper';
                wrapper.style.position = 'relative';
                wrapper.style.display = 'inline-block';

                // Clone image to preserve it
                const newImg = avatarImg.cloneNode(true);
                wrapper.appendChild(newImg);

                // Add Overlay
                const label = document.createElement('label');
                label.className = 'avatar-edit-overlay';
                label.htmlFor = 'avatarInput';
                label.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>`;
                wrapper.appendChild(label);

                // Add Input
                const input = document.createElement('input');
                input.type = 'file';
                input.id = 'avatarInput';
                input.accept = 'image/*';
                input.style.display = 'none';
                wrapper.appendChild(input);

                // Add "Change Photo" Link
                const linkDiv = document.createElement('div');
                linkDiv.style.marginTop = '5px';
                linkDiv.style.marginLeft = '-10px';
                linkDiv.innerHTML = `<label for="avatarInput" style="font-size: 0.8rem; color: var(--primary-color); cursor: pointer; text-decoration: underline;">Change Photo</label>`;

                // Perform Replacement
                avatarImg.parentNode.insertBefore(wrapper, avatarImg);
                avatarImg.parentNode.insertBefore(linkDiv, wrapper.nextSibling);
                avatarImg.remove(); // Remove old orphan image

                // Add CSS if missing
                if (!document.getElementById('avatar-styles')) {
                    const style = document.createElement('style');
                    style.id = 'avatar-styles';
                    style.textContent = `
                        .avatar-edit-overlay { position: absolute; bottom: 0; right: 0; background: #368CBF; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid white; transition: transform 0.2s; }
                        .avatar-edit-overlay:hover { transform: scale(1.1); }
                    `;
                    document.head.appendChild(style);
                }
            }

            // CRITICAL FIX: Inject Username Edit UI if User has cached HTML
            const usernameInput = document.getElementById('username');
            if (usernameInput && usernameInput.hasAttribute('readonly') && document.querySelector('.profile-form')) {
                console.log('Detected cached HTML: Injecting Username Edit UI...');

                // 1. Transform Input
                usernameInput.removeAttribute('readonly');
                usernameInput.placeholder = 'Choose a unique username';
                usernameInput.autocomplete = 'off';
                usernameInput.classList.add('editable-username'); // Marker

                // 2. Add Feedback Area
                if (!document.getElementById('usernameFeedback')) {
                    const feedback = document.createElement('small');
                    feedback.id = 'usernameFeedback';
                    feedback.style.display = 'block';
                    feedback.style.marginTop = '4px';
                    feedback.style.fontSize = '0.75rem';
                    feedback.style.minHeight = '1.2em';
                    usernameInput.parentNode.appendChild(feedback);
                }

                // 3. Add Save Button
                if (!document.getElementById('saveProfileBtn')) {
                    const btnDiv = document.createElement('div');
                    btnDiv.className = 'form-actions';
                    btnDiv.style.marginTop = '0.5rem';
                    btnDiv.style.textAlign = 'right';
                    btnDiv.innerHTML = `<button id="saveProfileBtn" class="btn-primary" style="padding: 0.75rem 1.5rem; border-radius: 6px; border: none; background: #368CBF; color: white; font-weight: 600; cursor: pointer; opacity: 0.5; pointer-events: none; transition: opacity 0.2s;">Save Changes</button>`;
                    usernameInput.parentNode.parentNode.appendChild(btnDiv); // append to form-grid or group parent? 
                    // The structure is form-grid -> form-group -> input. 
                    // We want the button after the form-group.
                    usernameInput.parentNode.after(btnDiv);
                }

                // 4. Attach Logic (Self-contained to bypass stale account.js)
                const saveBtn = document.getElementById('saveProfileBtn');
                const feedback = document.getElementById('usernameFeedback');
                let originalName = usernameInput.value;

                usernameInput.addEventListener('focus', () => { if (!originalName) originalName = usernameInput.value; });
                usernameInput.addEventListener('input', (e) => {
                    const val = e.target.value.trim();
                    const valid = /^[a-zA-Z0-9_]{3,20}$/.test(val);
                    if (val === originalName) {
                        saveBtn.style.opacity = '0.5'; saveBtn.style.pointerEvents = 'none'; feedback.textContent = ''; usernameInput.style.borderColor = '#d1d5db';
                    } else if (!valid) {
                        saveBtn.style.opacity = '0.5'; saveBtn.style.pointerEvents = 'none'; feedback.textContent = 'Invalid format (3-20 chars, alphanumeric/_)'; feedback.style.color = 'red'; usernameInput.style.borderColor = 'red';
                    } else {
                        saveBtn.style.opacity = '1'; saveBtn.style.pointerEvents = 'auto'; feedback.textContent = 'Looks good!'; feedback.style.color = 'green'; usernameInput.style.borderColor = 'green';
                    }
                });

                saveBtn.addEventListener('click', async () => {
                    const newName = usernameInput.value.trim();
                    saveBtn.textContent = 'Saving...'; saveBtn.disabled = true;
                    try {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) throw new Error('Not logged in');
                        const { error } = await supabase.from('profiles').update({ username: newName }).eq('id', user.id);
                        if (error) { if (error.code === '23505') throw new Error('Username taken'); else throw error; }
                        alert('Username updated!');
                        originalName = newName;
                        saveBtn.textContent = 'Saved';
                        setTimeout(() => { saveBtn.textContent = 'Save Changes'; saveBtn.style.opacity = '0.5'; saveBtn.style.pointerEvents = 'none'; }, 2000);
                    } catch (err) {
                        alert(err.message);
                        saveBtn.textContent = 'Save Changes'; saveBtn.disabled = false;
                    }
                });
            }

            console.log('--- SYNC SUCCESSFUL ---');
        };

        // Run immediately
        applyUpdates();

        // Also run in 300ms to catch any late DOM transitions or browser autofill delays
        setTimeout(applyUpdates, 300);

    } catch (error) {
        console.error('CRITICAL ERROR during Profile UI sync:', error);
    }
}

// Alias for compatibility with cached scripts
const syncHeaderProfile = syncProfileUI;
window.syncProfileUI = syncProfileUI; // Also export to window for debugging

/**
 * Robust Logout Implementation
 */
async function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        try {
            await logoutUser();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout failed:', error);
            // Force redirect if API fails
            window.location.href = 'index.html';
        }
    }
}

/**
 * Global Notifications: Unread Messages Count
 */
async function loadUnreadMessages(userId) {
    try {
        const { count, error } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('receiver_id', userId)
            .is('read_at', null);

        if (error) throw error;

        // Update Header Badge
        const headerBadge = document.getElementById('unreadBadge');
        if (headerBadge) {
            headerBadge.textContent = count || 0;
            headerBadge.style.display = count > 0 ? 'flex' : 'none';
        }

        // Update Dashboard Metric Card
        const metricCount = document.getElementById('countMessages');
        if (metricCount) {
            metricCount.textContent = count || 0;
        }

        // Update Sidebar Badge (if exists)
        const sidebarLink = document.querySelector('a[href="messages.html"]');
        if (sidebarLink && count > 0) {
            let badge = sidebarLink.querySelector('.sidebar-badge');
            if (!badge) {
                badge = document.createElement('span');
                badge.className = 'sidebar-badge';
                badge.style = "background: #E63946; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; margin-left: auto; font-weight: 700;";
                sidebarLink.appendChild(badge);
            }
            badge.textContent = count;
        } else if (sidebarLink) {
            const badge = sidebarLink.querySelector('.sidebar-badge');
            if (badge) badge.remove();
        }

    } catch (err) {
        console.error('Error loading unread count:', err);
    }
}

function subscribeToNewMessages(userId) {
    supabase
        .channel('global-unread-sync')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'messages',
            filter: `receiver_id=eq.${userId}`
        }, () => {
            loadUnreadMessages(userId);
        })
        .subscribe();
}
