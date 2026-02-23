import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// If '@tailwindcss/vite' is a valid plugin in your project keep it, otherwise use PostCSS + tailwindcss config.
import tailwindcss from "@tailwindcss/vite";
import viteCompression from "vite-plugin-compression";

// export default defineConfig({
//   plugins: [react(), basicSsl()],
//   server: {
//     host: true,
//     https: true,
//   },
// });

export default defineConfig(({ mode }) => {
  const isDebug = process.env.DEBUG_BUNDLE === "1" || mode === "development";

  return {
    plugins: [
      react(),
      tailwindcss(),
      // Put compression last. For debugging set DEBUG_BUNDLE=1 to avoid compressing outputs.
      !isDebug && viteCompression({ algorithm: "brotliCompress" }),
      !isDebug && viteCompression({ algorithm: "gzip" }),
    ].filter(Boolean),

  

    resolve: {
      alias: {
        // Force everything to use the same react/react-dom instances
        react: path.resolve(__dirname, "node_modules/react"),
        "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      },
    },

    optimizeDeps: {
      include: ["react", "react-dom", "react-router", "react-router-dom"],
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
            if (id.includes("node_modules")) {
              // Group heavy 3D / ML libs separately
              if (
                id.includes("@react-three") ||
                id.includes("three") ||
                id.includes("face-api") ||
                id.includes("@tensorflow")
              ) {
                return "vendor-3d-ml";
              }

              // Put everything from node_modules (including react/react-dom/router) into a single vendor chunk
              return "vendor";
            }
          },
        },
      },
    },
  };
});
