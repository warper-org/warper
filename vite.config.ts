import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import path from 'path';

export default defineConfig({
  root: 'examples',
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      'warper': path.resolve(__dirname, './'),
    },
  },
  server: {
    open: '/list/index.html'
  }
});
