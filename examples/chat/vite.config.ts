import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    port: 3004,
  },
  resolve: {
    alias: {
      'warper': path.resolve(__dirname, '../../'),
    },
  },
});
