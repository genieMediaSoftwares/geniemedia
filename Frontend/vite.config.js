import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    // Source maps for the first-party bundles. There are no secrets in the
    // frontend — the only environment value it reads is the public API base URL
    // — and having real maps makes production errors debuggable instead of
    // being minified noise.
    sourcemap: true,
    // Inline anything under 4 kB as a data URI rather than spending a round
    // trip on it. Above that the browser cache is worth more than the request.
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        // Split the long-lived vendor code out of the app bundle so a content
        // change to the site does not invalidate React in everyone's cache.
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) {
            return 'react-vendor';
          }
          if (id.includes('react-router')) return 'router';
          // TipTap/ProseMirror is deliberately NOT given a manual chunk. It is
          // only reachable through the lazily-imported admin editor, so Rollup
          // already emits it as an async chunk. Naming it manually promoted it
          // to a static import of the entry, which put a <link rel=modulepreload>
          // for 372 kB of editor code in the <head> of every public page.
        },
      },
    },
  },
})
