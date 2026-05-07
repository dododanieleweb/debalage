import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    // Split vendor libraries into separate cacheable chunks
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — changes rarely, cached long-term
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          // Supabase client — large but stable
          'vendor-supabase': ['@supabase/supabase-js'],
          // Icon library — only what's imported via tree-shaking
          'vendor-lucide': ['lucide-react'],
        },
      },
    },
    // Raise warning threshold slightly (we're splitting anyway)
    chunkSizeWarningLimit: 400,
  },
})
