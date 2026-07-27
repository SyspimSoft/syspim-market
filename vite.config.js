import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        catalog: resolve(__dirname, 'catalog.html'),
        delivery: resolve(__dirname, 'delivery.html'),
        superadmin: resolve(__dirname, 'superadmin.html'),
      },
    },
  },
});
