import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React vendor chunk (cached separately)
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // UI library chunk
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-select',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
          ],
          // Charts (loaded on-demand with analytics pages)
          'vendor-charts': ['recharts'],
          // Animation library
          'vendor-motion': ['framer-motion'],
          // Heavy libraries loaded on-demand
          'vendor-excel': ['xlsx'],
          'vendor-docparse': ['mammoth'],
          // Supabase client
          'vendor-supabase': ['@supabase/supabase-js'],
          // React Query
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
}));
