/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Weather API Keys
  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_WEATHERAPI_KEY?: string;
  
  // RSS Feed Configuration
  readonly VITE_RSS_PROXY_API_KEY?: string;
  readonly VITE_RSS_PROXY_URL?: string;
  
  // App Configuration
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  
  // Feature Flags
  readonly VITE_ENABLE_RSS_FEEDS?: string;
  readonly VITE_ENABLE_MOCK_DATA?: string;
  
  // API Configuration
  readonly VITE_API_TIMEOUT?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_USE_BACKEND?: string;
  
  // Vite built-in
  readonly MODE: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

