import axios from 'axios';
import { ForecastCache } from '../models/ForecastCache';

// Load env vars at module level (they're loaded in index.ts)
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || '';
const WEATHERAPI_KEY = process.env.WEATHERAPI_KEY || '';

// Debug logging (only in development)
if (process.env.NODE_ENV !== 'production') {
  console.log('Weather Service API Keys Status:');
  console.log(`   OpenWeather: ${OPENWEATHER_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`   WeatherAPI: ${WEATHERAPI_KEY ? '✅ Configured' : '❌ Missing'}`);
}

interface Location {
  lat: number;
  lon: number;
}

interface ForecastRequest {
  location: Location;
  model: string;
}

// Generate cache key
const getCacheKey = (location: Location, model: string): string => {
  return `${location.lat.toFixed(4)},${location.lon.toFixed(4)}:${model}`;
};

// Check cache (gracefully handle MongoDB connection issues)
export const getCachedForecast = async (location: Location, model: string) => {
  try {
    const cached = await ForecastCache.findOne({
      locationKey: `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`,
      modelName: model,
      expiresAt: { $gt: new Date() }
    });
    
    if (cached) {
      return cached.data;
    }
  } catch (error) {
    // MongoDB not available, skip cache
    console.warn('Cache unavailable, fetching fresh data');
  }
  return null;
};

// Save to cache (1 hour TTL) - gracefully handle MongoDB issues
export const cacheForecast = async (location: Location, model: string, data: any) => {
  try {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);
    
    await ForecastCache.findOneAndUpdate(
      {
        locationKey: `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`,
        modelName: model
      },
      {
        locationKey: `${location.lat.toFixed(4)},${location.lon.toFixed(4)}`,
        modelName: model,
        data,
        expiresAt
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    // MongoDB not available, skip caching
    console.warn('Cache unavailable, skipping cache save');
  }
};

// OpenWeatherMap API
export const getOpenWeatherForecast = async (location: Location): Promise<any> => {
  if (!OPENWEATHER_API_KEY) {
    throw new Error('OpenWeatherMap API key not configured. Set OPENWEATHER_API_KEY in server/.env (without VITE_ prefix)');
  }
  
  try {
    const response = await axios.get(
      'https://api.openweathermap.org/data/2.5/forecast',
      {
        params: {
          lat: location.lat,
          lon: location.lon,
          appid: OPENWEATHER_API_KEY,
          units: 'imperial'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('OpenWeatherMap API error:', error.message);
    throw new Error(`OpenWeatherMap API error: ${error.message}`);
  }
};

// WeatherAPI.com
export const getWeatherAPIForecast = async (location: Location): Promise<any> => {
  if (!WEATHERAPI_KEY) {
    throw new Error('WeatherAPI key not configured. Set WEATHERAPI_KEY in server/.env');
  }
  
  try {
    const response = await axios.get(
      'https://api.weatherapi.com/v1/forecast.json',
      {
        params: {
          key: WEATHERAPI_KEY,
          q: `${location.lat},${location.lon}`,
          days: 7
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('WeatherAPI error:', error.message);
    throw new Error(`WeatherAPI error: ${error.message}`);
  }
};

// National Weather Service (no API key needed)
export const getNWSForecast = async (location: Location): Promise<any> => {
  try {
    // Get grid point
    const gridResponse = await axios.get(
      `https://api.weather.gov/points/${location.lat},${location.lon}`,
      {
        headers: {
          'User-Agent': 'SnowHound Weather App'
        }
      }
    );
    
    const forecastUrl = gridResponse.data.properties.forecast;
    const response = await axios.get(forecastUrl, {
      headers: {
        'User-Agent': 'SnowHound Weather App'
      }
    });
    
    return response.data;
  } catch (error: any) {
    console.error('NWS API error:', error.message);
    throw new Error(`NWS API error: ${error.message}`);
  }
};

// Geocoding service
export const geocodeLocation = async (query: string): Promise<any[]> => {
  try {
    const response = await axios.get(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          format: 'json',
          q: query,
          limit: 5
        },
        headers: {
          'User-Agent': 'SnowHound Weather App'
        }
      }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Geocoding error:', error.message);
    throw new Error(`Geocoding error: ${error.message}`);
  }
};

