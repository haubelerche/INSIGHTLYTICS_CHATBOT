/**
 * Product scraping API
 */
import { apiCall } from './client';

export const scrapeProduct = async (productName) => {
  return apiCall('/api/scrape', {
    method: 'POST',
    body: JSON.stringify({ product_name: productName }),
  });
};

export default scrapeProduct;
