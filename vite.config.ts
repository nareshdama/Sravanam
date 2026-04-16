import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/**
 * Production: smaller initial chunk (p5 + ephemeris lazy-loaded from main),
 * stable vendor chunk names, modern ES target for less transpilation.
 */
export default defineConfig({
  plugins: [react()],
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
