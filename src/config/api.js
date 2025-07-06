// src/config/api.js
export const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://dietly-backend.onrender.com/api/v1",
};

// Helper function to get the full API URL
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};
