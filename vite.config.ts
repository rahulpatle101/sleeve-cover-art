import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  // Evidence under research/ must never be served or bundled.
  // Evidence and studies are never watched (test browsers write profiles there; a watch event would reload the page).
  server: { fs: { deny: ['research/**'] }, watch: { ignored: ['**/production/**', '**/studies/**', '**/research/**', '**/screens/**', '**/release/**'] } },
});
