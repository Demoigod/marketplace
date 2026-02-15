import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        sourcemap: true,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                messages: resolve(__dirname, 'messages.html'),
                item: resolve(__dirname, 'item.html'),
                privacy: resolve(__dirname, 'privacy.html'),
                admin: resolve(__dirname, 'admin.html'),
                'free-resources': resolve(__dirname, 'free-resources.html'),
                account: resolve(__dirname, 'account.html'),
                'post-item': resolve(__dirname, 'post-item.html'),
                'my-listings': resolve(__dirname, 'my-listings.html'),
                checkout: resolve(__dirname, 'checkout.html'),
                'skills-hub': resolve(__dirname, 'skills-hub.html'),
            },
        },
    },
});
