import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      'warper': path.resolve(__dirname, '../../'),
    },
  },
  server: {
    port: 3001,
  },
});
