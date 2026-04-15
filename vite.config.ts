import { defineConfig } from 'vitest/config'

/**
 * Production: smaller initial chunk (p5 + ephemeris lazy-loaded from main),
 * stable vendor chunk names, modern ES target for less transpilation.
 */
export default defineConfig({
  build: {
    target: 'es2022',
    minify: 'esbuild',
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/p5')) return 'vendor-p5'
          if (id.includes('astronomy-engine')) return 'vendor-astro'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
    // p5 alone is ~1 MB minified; split chunk keeps it off the critical path.
    chunkSizeWarningLimit: 1100,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
