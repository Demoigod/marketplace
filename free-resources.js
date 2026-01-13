import { supabase } from './supabase-config.js';
import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';

let allResources = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard: Redirect to homepage if not logged in
    const session = await isLoggedIn();
    if (!session) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Initialize Page
    updateUserProfile();
    await loadResources();
    setupEventListeners();

    // 3. Global Auth Logic: Handle Logout
    supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') {
            window.location.href = 'index.html';
        }
    });
});

async function updateUserProfile() {
    const user = await getCurrentUser();
    if (user) {
        const adminNameElements = document.querySelectorAll('.admin-name');
        adminNameElements.forEach(el => el.textContent = user.name || 'User');

        const avatarImages = document.querySelectorAll('.avatar');
        avatarImages.forEach(img => {
            img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'User')}&background=368CBF&color=fff`;
        });
    }
}

async function loadResources() {
    const grid = document.getElementById('resourcesGrid');
    if (!grid) return;

    try {
        const { data, error } = await supabase
            .from('free_resources')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allResources = data || [];
        renderResources();
    } catch (error) {
        console.error('Error fetching resources:', error.message);
        grid.innerHTML = '<div style="padding: 40px; text-align: center; color: #991B1B; grid-column: 1/-1;">' +
            'Failed to load resources. Please try again later.' +
            '</div>';
    }
}

function renderResources() {
    const grid = document.getElementById('resourcesGrid');
    if (!grid) return;

    const filtered = allResources.filter(res => {
        if (currentCategory === 'all') return true;
        return res.type === currentCategory;
    });

    if (filtered.length === 0) {
        grid.innerHTML = '<div style="padding: 60px; text-align: center; color: #6b7280; grid-column: 1/-1;">' +
            '<p style="font-size: 1.1rem;">No resources found in this category.</p>' +
            '</div>';
        return;
    }

    grid.innerHTML = filtered.map(resource => createResourceCard(resource)).join('');
}

function createResourceCard(resource) {
    const icons = {
        notes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
        slides: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>`,
        exam: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>`,
        info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`
    };

    const typeIcons = {
        notes: icons.notes,
        slides: icons.slides,
        exam: icons.exam,
        info: icons.info
    };

    return `
        <div class="resource-card">
            <div style="display: flex; gap: 16px; align-items: flex-start;">
                <div class="resource-icon-wrapper">
                    ${typeIcons[resource.type] || icons.notes}
                </div>
                <div style="flex: 1;">
                    <span class="resource-badge badge-${resource.type || 'notes'}">${resource.type || 'Resource'}</span>
                    <h3 style="font-size: 1.1rem; font-weight: 600; margin-top: 4px; color: #111827;">${resource.title}</h3>
                    <p style="font-size: 0.9rem; color: #6b7280; margin-top: 2px;">${resource.course || 'General'}</p>
                </div>
            </div>
            <div class="resource-meta">
                <span>File: ${resource.file_type || 'PDF'}</span>
                <span>${new Date(resource.created_at).toLocaleDateString()}</span>
            </div>
            <button class="download-btn" data-id="${resource.id}" data-url="${resource.file_url}">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download
            </button>
        </div>
    `;
}

function setupEventListeners() {
    // 1. Tab Filtering
    const tabs = document.querySelectorAll('.resource-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.dataset.category;
            renderResources();
        });
    });

    // 2. Search Logic
    const searchInput = document.getElementById('resourceSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            const query = e.target.value.toLowerCase();
            const grid = document.getElementById('resourcesGrid');

            const filtered = allResources.filter(res => {
                const matchesSearch = res.title.toLowerCase().includes(query) ||
                    res.course.toLowerCase().includes(query);
                const matchesCategory = currentCategory === 'all' || res.type === currentCategory;
                return matchesSearch && matchesCategory;
            });

            if (filtered.length === 0) {
                grid.innerHTML = '<div style="padding: 60px; text-align: center; color: #6b7280; grid-column: 1/-1;">No matching resources found.</div>';
            } else {
                grid.innerHTML = filtered.map(resource => createResourceCard(resource)).join('');
            }
        }, 300));
    }

    // 3. Download Action
    const resourcesGrid = document.getElementById('resourcesGrid');
    if (resourcesGrid) {
        resourcesGrid.addEventListener('click', async (e) => {
            const btn = e.target.closest('.download-btn');
            if (!btn) return;

            const resourceId = btn.dataset.id;
            const fileUrl = btn.dataset.url;

            if (fileUrl) {
                // In a real app, this might be a signed URL from Supabase Storage
                // For MVP, we'll open the URL if it exists
                window.open(fileUrl, '_blank');

                // Track download in analytics (optional)
                await supabase.from('resource_downloads').insert([
                    { resource_id: resourceId, user_id: (await getCurrentUser()).id }
                ]);
            } else {
                alert('This resource file is currently unavailable.');
            }
        });
    }

    // 4. Logout
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                await logoutUser();
                window.location.href = 'index.html';
            }
        });
    }
}

function debounce(func, wait) {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
