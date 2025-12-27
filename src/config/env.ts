// Centralized environment variable configuration
// All environment variables should be accessed through this file

export const config = {
  // Weather API Keys
  openWeatherApiKey: import.meta.env.VITE_OPENWEATHER_API_KEY || '',
  weatherApiKey: import.meta.env.VITE_WEATHERAPI_KEY || '',
  
  // RSS Feed Configuration
  rssProxyApiKey: import.meta.env.VITE_RSS_PROXY_API_KEY || 'demo',
  rssProxyUrl: import.meta.env.VITE_RSS_PROXY_URL || 'https://api.rss2json.com/v1/api.json',
  
  // App Configuration
  appName: import.meta.env.VITE_APP_NAME || 'SnowHound',
  appUrl: import.meta.env.VITE_APP_URL || '',
  
  // Feature Flags
  enableRSSFeeds: import.meta.env.VITE_ENABLE_RSS_FEEDS !== 'false',
  enableMockData: import.meta.env.VITE_ENABLE_MOCK_DATA === 'true',
  
  // API Configuration
  apiTimeout: parseInt(import.meta.env.VITE_API_TIMEOUT || '10000', 10),
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

