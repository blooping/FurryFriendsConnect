import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@shared": path.resolve(__dirname, "../shared"),
      "@assets": path.resolve(__dirname, "../attached_assets"),
    },
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor libraries
          vendor: ['react', 'react-dom'],
          // PDF.js is large, separate it
          pdf: ['pdfjs-dist', 'react-pdf'],
          // UI components
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          // Query and routing
          query: ['@tanstack/react-query', 'wouter'],
          // Form handling
          forms: ['react-hook-form', 'zod'],
          // Icons and motion
          motion: ['framer-motion', 'lucide-react', 'react-icons']
        }
      }
    },
    // Increase chunk size warning limit to reduce noise
    chunkSizeWarningLimit: 600,
    // Enable source maps for better debugging
    sourcemap: false,
    // Optimize for production
    minify: 'esbuild',
    target: 'es2020'
  },
  // Optimize deps during dev
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@tanstack/react-query',
      'wouter'
    ],
    exclude: ['pdfjs-dist']
  }
});
