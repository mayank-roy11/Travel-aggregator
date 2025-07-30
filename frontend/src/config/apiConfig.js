// API Configuration for both local and production environments
const getApiBaseUrl = () => {
  // Check if we're in production (deployed on Render)
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production: Use the same hostname as the frontend
    return `${window.location.origin}/api`;
  }
  
  // Development: Use localhost
  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Log the API URL for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  // console.log('API Base URL:', API_BASE_URL);
} 