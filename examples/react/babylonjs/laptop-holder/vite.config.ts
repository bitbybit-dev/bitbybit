import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    base: '/laptop-holder/',
    server: {
        port: 3000,
    },
    worker: {
        format: 'es',
    },
});
