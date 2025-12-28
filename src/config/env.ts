// Centralized environment variable configuration
// All environment variables should be accessed through this file

export const config = {
  // Weather API Keys
  openWeatherApiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
  weatherApiKey: import.meta.env.VITE_WEATHERAPI_KEY || '',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'SnowHound',
  appUrl: import.meta.env.VITE_APP_URL || '',
  
  // Default Location (format: "name,lat,lon,elevation" or "name,lat,lon")
  defaultLocation: import.meta.env.VITE_DEFAULT_LOCATION || '',
  
  // Feature Flags
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  
  // API Configuration
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '30000', 10), // 30 seconds for Render cold starts
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  useBackend: import.meta.env.VITE_USE_BACKEND === 'true',
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  mode: import.meta.env.MODE,
} as const;

// Helper functions
export const hasWeatherApiKeys = (): boolean => {
  return config.openWeatherApiKey.length > 0 || config.weatherApiKey.length > 0;
};

export const getApiKeyStatus = () => {
  return {
    openWeather: config.openWeatherApiKey.length > 0,
    weatherAPI: config.weatherApiKey.length > 0,
    nws: true, // NWS doesn't need API key
  };
};

