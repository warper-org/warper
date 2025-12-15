import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

export default defineConfig({
  plugins: [react(), wasm(), topLevelAwait()],
  root: __dirname,
  base: '/chat/',
  server: {
    port: 3004,
  },
  resolve: {
    alias: {
      'warper': path.resolve(__dirname, '../../'),
    },
  },
  build: {
    target: 'esnext',
  },
});
