import { API_CONFIG } from './config';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// In-memory cache and de-duplication for identical requests
const responseCache = new Map(); // key -> { ts, data }
const inflightRequests = new Map(); // key -> Promise
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 mins

const makeCacheKey = (endpoint, body) => {
  try {
    return `${endpoint}|${typeof body === 'string' ? body : JSON.stringify(body || {})}`;
  } catch {
    return `${endpoint}|[unserializable]`;
  }
};

// Helper function to make API requests with timeout and optional caching
export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const { useCache = false, timeout = API_CONFIG?.TIMEOUT || 30000 } = options;

  const init = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const bodyForKey = init.body ?? null;
  const cacheKey = useCache ? makeCacheKey(endpoint, bodyForKey) : null;

  // Serve from cache if valid
  if (useCache && cacheKey && responseCache.has(cacheKey)) {
    const entry = responseCache.get(cacheKey);
    if (Date.now() - entry.ts < CACHE_TTL_MS) {
      return entry.data;
    } else {
      responseCache.delete(cacheKey);
    }
  }

  // Coalesce identical in-flight requests
  if (useCache && cacheKey && inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey);
  }

  // Compose abort controller to combine caller's signal with timeout
  const controller = new AbortController();
  const callerSignal = options.signal;
  const onCallerAbort = () => controller.abort();
  if (callerSignal) {
    if (callerSignal.aborted) controller.abort();
    else callerSignal.addEventListener('abort', onCallerAbort, { once: true });
  }
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  init.signal = controller.signal;

  const exec = fetch(url, init)
    .then(async (response) => {
      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`API Error Details:`, {
          endpoint,
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
        });

        let errorMessage;
        try {
          const errorJson = JSON.parse(errorBody);
          console.error('Parsed Error JSON:', errorJson);
          errorMessage = JSON.stringify(errorJson.detail || errorJson.message || errorJson);
        } catch {
          errorMessage = errorBody;
        }
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorMessage}`);
      }
      return response.json();
    })
    .finally(() => {
      clearTimeout(timeoutId);
      if (callerSignal) callerSignal.removeEventListener('abort', onCallerAbort);
    })
    .catch((error) => {
      if (error?.name === 'AbortError') {
        // Distinguish between timeout and user cancel for logging clarity
        if (callerSignal?.aborted) {
          console.log('Request was cancelled by user');
        } else {
          console.warn(`Request to ${endpoint} aborted (likely timeout after ${timeout}ms)`);
        }
      } else {
        console.error(`API Error at ${endpoint}:`, error);
      }
      throw error;
    });

  if (useCache && cacheKey) {
    inflightRequests.set(cacheKey, exec);
  }

  try {
    const data = await exec;
    if (useCache && cacheKey) {
      responseCache.set(cacheKey, { ts: Date.now(), data });
      inflightRequests.delete(cacheKey);
    }
    return data;
  } catch (e) {
    if (useCache && cacheKey) inflightRequests.delete(cacheKey);
    throw e;
  }
};

// CHATBOT ENDPOINTS

export const askChatbot = async (question, model = 'gpt-4o-mini', signal = null, opts = {}) => {
  try {
    // Backend expects: { messages: [...], model?: string }
    const requestBody = {
      messages: [
        {
          role: 'user',
          content: question
        }
      ],
      model: model
    };
    
    console.log('Sending to /chat:', requestBody);

    const response = await apiCall('/chat', {
      method: 'POST',
      body: JSON.stringify(requestBody),
      signal: signal,
      useCache: opts.useCache ?? true,
    });
    return response;
  } catch (error) {
    console.error('Failed to get chatbot response:', error);
    console.error('Request was:', { question, model });
    throw error;
  }
};

export const queryBackend = async (query) => {
  try {
    const response = await apiCall('/query', {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
    return response;
  } catch (error) {
    console.error('Failed to query backend:', error);
    throw error;
  }
};



// HEALTH & DATABASE

export const getHealthData = async (userId) => {
  try {
    const response = await apiCall(`/api/health_data/${userId}`);
    return response;
  } catch (error) {
    console.error('Health data check failed:', error);
    throw error;
  }
};

export const getDbStructure = async () => {
  try {
    const response = await apiCall('/db-structure', {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Failed to get DB structure:', error);
    throw error;
  }
};


// REVIEWS ENDPOINTS

export const getProductReviews = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = queryString ? `/api/reviews?${queryString}` : '/api/reviews';
    const response = await apiCall(endpoint);
    return response;
  } catch (error) {
    console.error('Failed to fetch product reviews:', error);
    throw error;
  }
};

export const createReview = async (reviewData) => {
  try {
    const response = await apiCall('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
    return response;
  } catch (error) {
    console.error('Failed to create review:', error);
    throw error;
  }
};




// TIKI SCRAPING ENDPOINTS

export const scrapeTikiProduct = async (productData) => {
  try {
    const response = await apiCall('/api/scrape/tiki', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
    return response;
  } catch (error) {
    console.error('Failed to scrape Tiki product:', error);
    throw error;
  }
};

export const scrapeTikiCategory = async (categoryData) => {
  try {
    const response = await apiCall('/api/scrape/tiki/category', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
    return response;
  } catch (error) {
    console.error('Failed to scrape Tiki category:', error);
    throw error;
  }
};

//scrape specific type of product for now
export const scrapeTikiElectronics = async (electronicsData) => {
  try {
    const response = await apiCall('/api/scrape/tiki/electronics', {
      method: 'POST',
      body: JSON.stringify(electronicsData),
    });
    return response;
  } catch (error) {
    console.error('Failed to scrape Tiki electronics:', error);
    throw error;
  }
};

export const getElectronicsCategories = async () => {
  try {
    const response = await apiCall('/api/electronics/categories');
    return response;
  } catch (error) {
    console.error('Failed to get electronics categories:', error);
    throw error;
  }
};

export const scrapeProduct = async (productName) => {
  console.warn('scrapeProduct is deprecated. Use scrapeTikiProduct instead.');
  try {
    const response = await apiCall('/api/scrape/tiki', {
      method: 'POST',
      body: JSON.stringify({ product_name: productName }),
    });
    return response;
  } catch (error) {
    console.error('Failed to scrape product:', error);
    throw error;
  }
};

export const queryWithNLToSQL = async (naturalLanguageQuery) => {
  try {
    const response = await apiCall('/api/text2sql', {
      method: 'POST',
      body: JSON.stringify({ query: naturalLanguageQuery }),
    });
    return response;
  } catch (error) {
    console.error('Failed to process NL to SQL query:', error);
    throw error;
  }
};
