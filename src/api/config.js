// Base URL resolution: accept VITE_API_URL (preferred) or VITE_API_BASE_URL for compatibility.
// Allow both explicit env config and auto fallback.
// Priority order:
// 1. VITE_API_URL (explicit)
// 2. VITE_API_BASE_URL (legacy name)
// 3. If in production and none provided, use deployed Render URL as a safe default.
// 4. If in dev, fallback to localhost.
const DEFAULT_RENDER_URL = 'https://ecommerce-scraper-82ig.onrender.com';

// In development, allow opting into the Vite proxy by setting VITE_USE_PROXY=1.
// When enabled, we use relative URLs (BASE_URL='') so the dev server forwards
// API requests to the backend target, avoiding CORS.
const USE_DEV_PROXY = !!(import.meta.env.DEV && import.meta.env.VITE_USE_PROXY === '1');

const rawEnv = USE_DEV_PROXY
  ? ''
  : (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim())
    || (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.trim())
    || (import.meta.env.PROD ? DEFAULT_RENDER_URL : 'http://localhost:8000');
const NORMALIZED_BASE = rawEnv.replace(/\/+$/, '');

export const API_CONFIG = {
  // Backend base URL (no trailing slash)
  BASE_URL: NORMALIZED_BASE,
  
  // API endpoints (matches your actual backend)
  ENDPOINTS: {
    // Main chat/query endpoints
    CHAT: '/chat',
    QUERY: '/query',
    
    // Database
    DB_STRUCTURE: '/db-structure',
    HEALTH_DATA: '/api/health_data',
    
    // Reviews
    REVIEWS: '/api/reviews',
    CREATE_REVIEW: '/api/reviews',
    
    // Tiki scraping
    SCRAPE_TIKI: '/api/scrape/tiki',
    SCRAPE_TIKI_CATEGORY: '/api/scrape/tiki/category',
    SCRAPE_TIKI_ELECTRONICS: '/api/scrape/tiki/electronics',
    
    // Electronics
    ELECTRONICS_CATEGORIES: '/api/electronics/categories',
    
    // Legacy (may not exist on your backend)
    TEXT_TO_SQL: '/api/text2sql',
  },

  // Request timeout (ms)
  TIMEOUT: 30000,

  // Retry configuration
  RETRY: {
    MAX_ATTEMPTS: 3,
    DELAY: 1000, // ms
  },

  // CORS settings
  CORS_MODE: 'cors',
  CREDENTIALS: 'include',
};

export default API_CONFIG;
