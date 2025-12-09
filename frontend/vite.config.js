import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Optional plugin: compress build output
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Generate Brotli + Gzip compressed .br & .gz files
    viteCompression({ algorithm: 'brotliCompress' }),
    viteCompression({ algorithm: 'gzip' })
  ],

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },

  build: {
    manifest: true,

    // ⭐ Code-splitting optimization
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Split React ecosystem
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // Remaining third-party modules
            return 'vendor';
          }
        }
      }
    },

    // Better caching: hashed file names
    chunkSizeWarningLimit: 600,
    sourcemap: false,
    cssCodeSplit: true,
  }
});
