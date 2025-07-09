import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: __dirname,
  server: {
    port: 3003, // Use a different port for this example
  },
  resolve: {
    alias: {
      'warper': path.resolve(__dirname, '../../'),
    },
  },
});
