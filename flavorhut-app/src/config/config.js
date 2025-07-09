// src/config/config.js

const config = {
  // API Base URL - changes based on environment
  API_BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  
  // App configuration
  APP_NAME: 'FlavorHut',
  APP_VERSION: '1.0.0',
  
  // Default settings
  DEFAULT_PAGE_SIZE: 12,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  
  // Image settings
  IMAGE_QUALITY: 0.8,
  THUMBNAIL_SIZE: 300,
  
  // Auth settings
  TOKEN_EXPIRY: '30d',
  
  // Development settings
  IS_DEVELOPMENT: import.meta.env.DEV,
  IS_PRODUCTION: import.meta.env.PROD
};

export default config; 
