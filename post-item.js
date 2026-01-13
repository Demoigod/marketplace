import { supabase } from './supabase-config.js';
import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';

let selectedFiles = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Auth Guard
    const loggedIn = await isLoggedIn();
    if (!loggedIn) {
        window.location.href = 'index.html';
        return;
    }

    // 2. Initialize Page
    updateTopNav();
    setupEventListeners();
});

async function updateTopNav() {
    const user = await getCurrentUser();
    if (user) {
        const topNavName = document.getElementById('topNavName');
        const topNavAvatar = document.getElementById('topNavAvatar');
        const displayName = user.username || user.name || 'User';

        if (topNavName) topNavName.textContent = displayName;
        if (topNavAvatar) {
            topNavAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=368CBF&color=fff`;
        }
    }
}

function setupEventListeners() {
    const imageInput = document.getElementById('imageInput');
    const imageGrid = document.getElementById('imageGrid');
    const postForm = document.getElementById('postItemForm');
    const logoutBtn = document.querySelector('.logout-btn');

    // Image Upload Handling
    imageInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (selectedFiles.length + files.length > 5) {
            alert('You can only upload up to 5 images.');
            return;
        }

        files.forEach(file => {
            selectedFiles.push(file);
            renderPreview(file);
        });

        imageInput.value = ''; // Reset input to allow re-selecting same file
    });

    // Form Submission
    postForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Posting...';

        try {
            const user = await getCurrentUser();
            if (!user) throw new Error('Authentication required');

            // 1. Upload Images
            const imageUrls = await uploadImages(user.id);

            // 2. Submit to Database
            const itemData = {
                seller_id: user.id, // Immutable UUID from session
                seller_public_id: user.publicUserId || null, // 6-digit public ID
                title: document.getElementById('title').value,
                description: document.getElementById('description').value,
                price: parseFloat(document.getElementById('price').value),
                category: document.getElementById('category').value,
                image_url: imageUrls[0] || null, // Primary image
                images: imageUrls, // All images
                status: 'active'
            };

            const { data, error } = await supabase
                .from('market_listings')
                .insert([itemData])
                .select();

            if (error) throw error;

            alert('Item posted successfully!');
            window.location.href = 'listings.html';

        } catch (err) {
            console.error('Post error:', err);
            alert(`Error: ${err.message}`);
            submitBtn.disabled = false;
            submitBtn.textContent = 'List Item Now';
        }
    });

    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            if (confirm('Are you sure you want to logout?')) {
                await logoutUser();
                window.location.href = 'index.html';
            }
        });
    }
}

function renderPreview(file) {
    const grid = document.getElementById('imageGrid');
    const uploadBtn = document.getElementById('uploadBtn');

    const div = document.createElement('div');
    div.className = 'image-preview-box';

    const img = document.createElement('img');
    img.src = URL.createObjectURL(file);

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-img';
    removeBtn.textContent = '×';
    removeBtn.onclick = () => {
        selectedFiles = selectedFiles.filter(f => f !== file);
        div.remove();
    };

    div.appendChild(img);
    div.appendChild(removeBtn);
    grid.insertBefore(div, uploadBtn);
}

async function uploadImages(userId) {
    const urls = [];

    for (const file of selectedFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from('listing-images')
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('listing-images')
            .getPublicUrl(filePath);

        urls.push(publicUrl);
    }

    return urls;
}
