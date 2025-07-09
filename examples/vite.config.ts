import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';

export default defineConfig({
  root: __dirname,
  server: {
    open: '/index.html',
  },
  plugins: [react(), wasm(), topLevelAwait()],
  resolve: {
    alias: {
      warper: path.resolve(__dirname, '../'),
    },
  },
});
