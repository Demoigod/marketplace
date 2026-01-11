import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                dashboard: resolve(__dirname, 'dashboard.html'),
                messages: resolve(__dirname, 'messages.html'),
                item: resolve(__dirname, 'item.html'),
                privacy: resolve(__dirname, 'privacy.html'),
            },
        },
    },
});
