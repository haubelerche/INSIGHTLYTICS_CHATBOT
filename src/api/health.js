/**
 * Health check API
 */
import { apiCall } from './client';

export const checkHealth = async () => {
  return apiCall('/health');
};

export default checkHealth;
