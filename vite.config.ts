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
          // Chart vendor chunk - include recharts AND React so React is available
          if (id.includes('node_modules/recharts') || 
              id.includes('node_modules/react') ||
              id.includes('node_modules/react-dom') ||
              id.includes('node_modules/react-is')) {
            return 'chart-vendor';
          }
          
          // React router (not needed by recharts)
          if (id.includes('node_modules/react-router')) {
            return 'react-vendor';
          }
          
          // Utils chunk
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/axios')) {
            return 'utils';
          }
        },
        // Ensure ES module format for proper module resolution
        format: 'es'
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    // Ensure proper handling of CommonJS modules
    commonjsOptions: {
      transformMixedEsModules: true
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'recharts'],
    esbuildOptions: {
      target: 'es2020'
    }
  }
})

