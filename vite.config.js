import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// Vite config with dev-time proxy to avoid browser CORS during local development.
// It proxies API routes to the backend specified by VITE_API_URL (or defaults to the Render URL).
export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_URL || 'https://ecommerce-scraper-aki2.onrender.com';

  return defineConfig({
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        // Core endpoints used by the app
        '/chat': {
          target,
          changeOrigin: true,
          secure: true,
        },
        '/query': {
          target,
          changeOrigin: true,
          secure: true,
        },
        '/db-structure': {
          target,
          changeOrigin: true,
          secure: true,
        },
        '/health': {
          target,
          changeOrigin: true,
          secure: true,
        },
        // Group all /api/* endpoints (scraping, reviews, etc.)
        '/api': {
          target,
          changeOrigin: true,
          secure: true,
        },
        // Optional: docs if needed during dev
        '/docs': {
          target,
          changeOrigin: true,
          secure: true,
        },
      },
    },
  });
};
