import { supabase } from './supabase-config.js';
import { getCurrentUser } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    const submitBtn = document.getElementById('submitBtn');
    const successMsg = document.getElementById('successMsg');
    const errorMsg = document.getElementById('errorMsg');

    // Check if running in browser
    if (!dropZone) return;

    let selectedFile = null;

    // Drag and drop handlers
    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#2563EB';
        dropZone.style.background = '#eff6ff';
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = '#f8fafc';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = '#f8fafc';

        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file.');
            return;
        }
        selectedFile = file;
        fileName.textContent = `Selected: ${file.name}`;
        fileName.style.color = '#059669';
        fileName.style.fontWeight = '600';
        submitBtn.disabled = false;
    }

    submitBtn.addEventListener('click', async () => {
        if (!selectedFile) return;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';
        errorMsg.style.display = 'none';

        try {
            const user = await getCurrentUser();
            if (!user) throw new Error("Not logged in");

            // 1. Simulate Upload (In real app, upload to Storage)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 2. Update Role in Database
            const { error } = await supabase
                .from('profiles')
                .update({ role: 'seller' })
                .eq('id', user.id);

            if (error) throw error;

            // 3. Show Success
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'block';

            // Fire confetti if we had it, but simple redirect for now
        } catch (err) {
            console.error(err);
            errorMsg.textContent = 'Verification failed: ' + err.message;
            errorMsg.style.display = 'block';
            submitBtn.textContent = 'Submit for Verification';
            submitBtn.disabled = false;
        }
    });
});
