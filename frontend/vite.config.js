import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// If '@tailwindcss/vite' is a valid plugin in your project keep it, otherwise use PostCSS + tailwindcss config.
import tailwindcss from '@tailwindcss/vite';
import viteCompression from 'vite-plugin-compression';

export default defineConfig(({ mode }) => {
  const isDebug = process.env.DEBUG_BUNDLE === '1' || mode === 'development';

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Put compression last. For debugging set DEBUG_BUNDLE=1 to avoid compressing outputs.
      !isDebug && viteCompression({ algorithm: 'brotliCompress' }),
      !isDebug && viteCompression({ algorithm: 'gzip' })
    ].filter(Boolean),

    resolve: {
      alias: {
        // Force everything to use the same react/react-dom instances
        react: path.resolve(__dirname, 'node_modules/react'),
        'react-dom': path.resolve(__dirname, 'node_modules/react-dom')
      }
    },

    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router', 'react-router-dom']
    },

    build: {
      manifest: true,
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 1200,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id) return;
            if (id.includes('node_modules')) {
              // Put React + react-dom + router into their own chunk
              if (
                id.includes('/react/') ||
                id.includes('/react-dom/') ||
                id.includes('react-router') ||
                id.includes('react-router-dom')
              ) {
                return 'vendor-react';
              }

              // Split heavy 3D / ML libs into separate chunk to keep vendor small
              if (
                id.includes('@react-three') ||
                id.includes('three') ||
                id.includes('face-api') ||
                id.includes('@tensorflow')
              ) {
                return 'vendor-3d-ml';
              }

              // Fallback vendor chunk for other node_modules
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
