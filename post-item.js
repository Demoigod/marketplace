import { supabase } from './supabase-config.js';
import { isLoggedIn, getCurrentUser } from './auth.js';

/**
 * Handles the logic for posting a new item.
 * Strictly uses Supabase Auth as the source of truth for user_id.
 */
export async function handleItemPost(event) {
    event.preventDefault();

    // 1. Verify Authentication
    if (!await isLoggedIn()) {
        alert("Please log in to post an item.");
        // Optional: trigger login modal here
        document.dispatchEvent(new CustomEvent('open-auth-modal'));
        return;
    }

    const user = await getCurrentUser();
    if (!user) return;

    // 2. Extract and Validate Form Data
    const form = event.target;
    const title = form.querySelector('#itemTitle').value;
    const price = parseFloat(form.querySelector('#itemPrice').value);
    const description = form.querySelector('#itemDescription').value;
    const category = form.querySelector('#itemCategory').value;
    // Note: Image handling would typically involve storage upload first
    // For this MVP, we use the placeholder from the system
    const images = ['https://placeholder.com/600x400'];

    if (!title || isNaN(price) || !description) {
        alert("Please fill in all required fields.");
        return;
    }

    try {
        // 3. Insert into Supabase (user_id is authenticated session ID)
        const { data, error } = await supabase
            .from('items') // Use the new standardized table name
            .insert([{
                user_id: user.id, // Authenticated user ID
                title,
                description,
                price,
                images,
                // We also keep category/condition if requested by UI, 
                // but prompt specified these 4 primary fields
                category,
                condition: form.querySelector('#itemCondition')?.value || 'good'
            }])
            .select()
            .single();

        if (error) throw error;

        // 4. Success UI Feedback
        console.log('Item posted successfully:', data);
        alert('Your item is now live!');
        form.reset();

        // Optional: Close modal if applicable
        const modal = document.getElementById('uploadModal');
        if (modal) modal.classList.remove('active');

        // Refresh feed
        document.dispatchEvent(new CustomEvent('item-posted'));

    } catch (error) {
        console.error('Error posting item:', error.message);
        alert('Error: ' + error.message);
    }
}

/**
 * Handles the logic for uploading a free resource.
 */
export async function handleResourceUpload(event) {
    event.preventDefault();

    if (!await isLoggedIn()) {
        alert("Please log in to upload resources.");
        document.dispatchEvent(new CustomEvent('open-auth-modal'));
        return;
    }

    const user = await getCurrentUser();
    if (!user) return;

    const form = event.target;
    const title = form.querySelector('#resourceTitle').value;
    const type = form.querySelector('#resourceType').value;
    const course = form.querySelector('#resourceCourse').value;
    const year = parseInt(form.querySelector('#resourceYear').value) || new Date().getFullYear();
    const description = form.querySelector('#resourceDescription').value;

    if (!title || !type || !course) {
        alert("Please fill in required fields (Title, Type, Course).");
        return;
    }

    try {
        const { data, error } = await supabase
            .from('free_resources')
            .insert([{
                uploader_id: user.id,
                title,
                type,
                course,
                year,
                description
            }])
            .select()
            .single();

        if (error) throw error;

        console.log('Resource uploaded successfully:', data);
        alert('Resource uploaded successfully!');
        form.reset();

        const modal = document.getElementById('resourceModal');
        if (modal) modal.classList.remove('active');

        // Optional: refresh resources list if needed
        // Since many pages might not have the resources grid, we check first
        const resourcesGrid = document.getElementById('resourcesGrid');
        if (resourcesGrid) {
            // Trigger a refresh event or call refresh function if global
            window.location.reload(); // Simple refresh for now or dispatch event
        }

    } catch (error) {
        console.error('Error uploading resource:', error.message);
        alert('Error: ' + error.message);
    }
}

