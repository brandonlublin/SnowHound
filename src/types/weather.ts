export interface Location {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: 'current' | 'search' | 'favorite';
  elevation?: number;
}

export interface WeatherModel {
  id: string;
  name: string;
  provider: string;
  description: string;
}

export interface SnowfallData {
  timestamp: string;
  snowfall: number; // inches
  temperature: number; // fahrenheit
  windSpeed: number; // mph
  humidity: number; // percentage
  model: string;
}

export interface ForecastData {
  location: Location;
  model: string;
  provider: string;
  data: SnowfallData[];
  lastUpdated: string;
  isMock?: boolean; // Indicates if this is mock data or real API data
}

export interface WeatherComparison {
  location: Location;
  models: ForecastData[];
  comparisonType: 'graph' | 'table' | 'chart';
}

export interface RSSFeed {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface RSSItem {
  id: string;
  title: string;
  description: string;
  link: string;
  pubDate: string;
  author?: string;
}

