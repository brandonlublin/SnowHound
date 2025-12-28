/// <reference types="vite/client" />

interface ImportMetaEnv {
  // Weather API Keys
  readonly VITE_OPENWEATHER_API_KEY?: string;
  readonly VITE_WEATHERAPI_KEY?: string;
  
  // App Configuration
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_URL?: string;
  
  // Feature Flags
  readonly VITE_ENABLE_MOCK_DATA?: string;
  
  // Default Location (format: "name,lat,lon,elevation" or "name,lat,lon")
  readonly VITE_DEFAULT_LOCATION?: string;
  
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

