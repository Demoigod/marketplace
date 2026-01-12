import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                messages: resolve(__dirname, 'messages.html'),
                item: resolve(__dirname, 'item.html'),
                privacy: resolve(__dirname, 'privacy.html'),
                admin: resolve(__dirname, 'admin.html'),
                listings: resolve(__dirname, 'listings.html'),
            },
        },
    },
});
