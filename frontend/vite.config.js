import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 7002,
    proxy: {
      '/api': { target: 'http://localhost:7052', changeOrigin: true },
      '/uploads': { target: 'http://localhost:7052', changeOrigin: true },
    },
  },
});
