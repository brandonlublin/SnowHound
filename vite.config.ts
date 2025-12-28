import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React vendor chunk
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          // Chart vendor chunk (recharts and dependencies)
          if (id.includes('node_modules/recharts') || id.includes('node_modules/react-is')) {
            return 'chart-vendor';
          }
          // Utils chunk
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/axios')) {
            return 'utils';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Disable sourcemaps in production for smaller bundle
    minify: 'esbuild' // Faster and smaller than terser
  }
})

