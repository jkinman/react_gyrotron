import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
  },
  resolve: {
    alias: {
      'react-gyrotron': path.resolve(__dirname, '../dist/index.esm.js'), // Directly point to ESM build
    },
  },
});