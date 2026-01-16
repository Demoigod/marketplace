import { supabase } from './supabase-config.js';
import { isLoggedIn, logoutUser, getCurrentUser } from './auth.js';
import './admin.js'; // Force inclusion of admin logic (UI injection)

document.addEventListener('DOMContentLoaded', async () => {
    // account.html is now handled by the unified syncProfileUI() in admin.js
    console.log('Account page specialized logic ready.');
    setupEventListeners();
});

function setupEventListeners() {
    const logoutBtn = document.getElementById('sidebarLogout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to logout?')) {
                await logoutUser();
                window.location.href = 'index.html';
            }
        });
    }

    // Avatar Upload Logic
    const avatarInput = document.getElementById('avatarInput');
    if (avatarInput) {
        avatarInput.addEventListener('change', async (e) => {
            console.log('Avatar input changed');
            const file = e.target.files[0];
            if (!file) {
                console.log('No file selected');
                return;
            }
            alert('File selected: ' + file.name + ' (' + Math.round(file.size / 1024) + 'KB). Starting upload...');

            // Basic validation
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                alert('File size must be less than 2MB');
                return;
            }

            try {
                // Show uploading state (optional improvement: replace icon with spinner)
                const overlay = document.querySelector('.avatar-edit-overlay');
                const originalContent = overlay.innerHTML;
                overlay.innerHTML = '<span style="font-size: 10px;">⏳</span>';

                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const fileExt = file.name.split('.').pop();
                const fileName = `${Date.now()}.${fileExt}`;
                const filePath = `${user.id}/${fileName}`;

                // 1. Upload to Storage
                const { error: uploadError } = await supabase.storage
                    .from('avatars')
                    .upload(filePath, file, { upsert: true });

                if (uploadError) throw uploadError;

                // 2. Get Public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('avatars')
                    .getPublicUrl(filePath);

                // 3. Update Profile
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ avatar_url: publicUrl })
                    .eq('id', user.id);

                if (updateError) throw updateError;

                // 4. Refresh UI
                if (window.syncProfileUI) {
                    // Update the local user object for immediate feedback if needed, 
                    // but syncProfileUI usually fetches fresh data or we can pass the partial update.
                    const updatedUser = { ...user, avatar_url: publicUrl };
                    // We need to re-fetch to get the full profile merged data usually, 
                    // or just let syncProfileUI handle the fetch if called without args.
                    // For speed, let's call it and also manually set DOM for instant feel.
                    document.getElementById('profileAvatar').src = publicUrl;
                    document.getElementById('topNavAvatar').src = publicUrl;
                    alert('Profile picture updated!');
                } else {
                    window.location.reload();
                }

                overlay.innerHTML = originalContent;

            } catch (err) {
                console.error('Avatar upload failed:', err);
                alert('Failed to update profile picture: ' + err.message);
                document.querySelector('.avatar-edit-overlay').innerHTML = `
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                `;
            }
        });
    }

    // Verify Initial Username State
    const usernameInput = document.getElementById('username');
    const saveBtn = document.getElementById('saveProfileBtn');
    const feedback = document.getElementById('usernameFeedback');
    let originalUsername = '';

    if (usernameInput && saveBtn && feedback) {

        // Remove readonly if it was stuck (though HTML update should handle it)
        usernameInput.removeAttribute('readonly');
        usernameInput.style.cursor = 'text';
        usernameInput.style.backgroundColor = 'white';

        usernameInput.addEventListener('focus', () => {
            if (!originalUsername) originalUsername = usernameInput.value;
        });

        usernameInput.addEventListener('input', (e) => {
            const val = e.target.value.trim();
            const valid = /^[a-zA-Z0-9_]{3,20}$/.test(val);

            if (val === originalUsername) {
                saveBtn.style.opacity = '0.5';
                saveBtn.style.pointerEvents = 'none';
                feedback.textContent = '';
                usernameInput.style.borderColor = '#d1d5db';
            } else if (!valid) {
                saveBtn.style.opacity = '0.5';
                saveBtn.style.pointerEvents = 'none';
                feedback.textContent = 'Username must be 3-20 chars, alphanumeric or underscore.';
                feedback.style.color = 'red';
                usernameInput.style.borderColor = 'red';
            } else {
                saveBtn.style.opacity = '1';
                saveBtn.style.pointerEvents = 'auto';
                feedback.textContent = 'Looks good! Click save to check availability.';
                feedback.style.color = 'green';
                usernameInput.style.borderColor = 'green';
            }
        });

        saveBtn.addEventListener('click', async () => {
            const newUsername = usernameInput.value.trim();
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;

            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error('Not authenticated');

                const { error } = await supabase
                    .from('profiles')
                    .update({ username: newUsername })
                    .eq('id', user.id);

                if (error) {
                    if (error.code === '23505') { // Unique violation
                        throw new Error('This username is already taken.');
                    }
                    throw error;
                }

                alert('Username updated successfully!');
                originalUsername = newUsername; // Sync state
                saveBtn.textContent = 'Saved';
                setTimeout(() => {
                    saveBtn.textContent = 'Save Changes';
                    saveBtn.style.opacity = '0.5';
                    saveBtn.style.pointerEvents = 'none';
                }, 2000);

                if (window.syncProfileUI) {
                    document.getElementById('profileFullName').textContent = newUsername;
                    document.getElementById('userName').textContent = newUsername;
                }

            } catch (err) {
                console.error('Update failed:', err);
                feedback.textContent = err.message;
                feedback.style.color = 'red';
                usernameInput.style.borderColor = 'red';
                saveBtn.textContent = 'Save Changes';
                saveBtn.disabled = false;
            }
        });
    }
}
