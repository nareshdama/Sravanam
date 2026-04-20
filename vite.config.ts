import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { defineConfig } from 'vitest/config'

/**
 * Production: smaller initial chunk (p5 + ephemeris lazy-loaded from main),
 * stable vendor chunk names, modern ES target for less transpilation.
 *
 * PWA: vite-plugin-pwa + Workbox generates a precache manifest of the built
 * assets (the hashed JS/CSS). Runtime caching covers fonts and any same-origin
 * GETs that slip through. `registerType: 'prompt'` surfaces an in-app update
 * banner rather than silently refreshing while the user is mid-session.
 */
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false, // we register manually from main.ts to control UX
      includeAssets: ['favicon.ico', 'icon.svg', 'apple-touch-icon-180x180.png'],
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'font',
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.destination === 'image' && url.origin === self.location.origin,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'Sravanam — Vedic Meditation',
        short_name: 'Sravanam',
        description:
          'Binaural-beat meditation with Vedic intentions, Saptaswar frequencies, and a living Sri Yantra mandala.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        background_color: '#0c1028',
        theme_color: '#0c1028',
        categories: ['health', 'lifestyle', 'music'],
        lang: 'en',
        dir: 'ltr',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: {
        enabled: false, // keep dev server fast; test SW against `npm run preview`
        type: 'module',
      },
    }),
  ],
  build: {
    target: 'es2022',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/p5')) return 'vendor-p5'
          if (id.includes('astronomy-engine')) return 'vendor-astro'
          if (id.includes('node_modules/three')) return 'vendor-three'
          if (id.includes('@react-three') || id.includes('/react-dom/')) return 'vendor-r3f'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // p5 alone is ~1 MB minified; split chunk keeps it off the critical path.
    chunkSizeWarningLimit: 1400,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
