import axios from 'axios';
import { Location, ForecastData, SnowfallData } from '../types/weather';
import { WEATHER_MODELS } from './weatherModels';
import { config } from '../config/env';
import { BackendWeatherService } from './backendApi';

// Free weather API endpoints
const OPENWEATHER_API_KEY = config.openWeatherApiKey;
const WEATHERAPI_KEY = config.weatherApiKey;

// Mock data generator for demonstration (since we need API keys)
const generateMockForecast = (location: Location, model: string, provider: string): ForecastData => {
  const data: SnowfallData[] = [];
  const now = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() + i);
    
    // Simulate realistic snowfall data
    const baseSnowfall = Math.random() * 6; // 0-6 inches
    const temperature = 20 + Math.random() * 20; // 20-40°F
    const windSpeed = 5 + Math.random() * 15; // 5-20 mph
    const humidity = 60 + Math.random() * 30; // 60-90%
    
    data.push({
      timestamp: date.toISOString(),
      snowfall: Math.round(baseSnowfall * 10) / 10,
      temperature: Math.round(temperature * 10) / 10,
      windSpeed: Math.round(windSpeed * 10) / 10,
      humidity: Math.round(humidity),
      model
    });
  }
  
  return {
    location,
    model,
    provider,
    data,
    lastUpdated: new Date().toISOString(),
    isMock: true
  };
};

export class WeatherService {
  // OpenWeatherMap API
  static async getOpenWeatherForecast(location: Location, model: string): Promise<ForecastData> {
    if (!OPENWEATHER_API_KEY || config.enableMockData) {
      return generateMockForecast(location, model, 'OpenWeatherMap (Mock)');
    }
    
    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast`,
        {
          params: {
            lat: location.lat,
            lon: location.lon,
            appid: OPENWEATHER_API_KEY,
            units: 'imperial'
          }
        }
      );
      
      const data: SnowfallData[] = response.data.list.map((item: any) => ({
        timestamp: item.dt_txt,
        snowfall: item.snow?.['3h'] || 0,
        temperature: item.main.temp,
        windSpeed: item.wind.speed,
        humidity: item.main.humidity,
        model
      }));
      
      return {
        location,
        model,
        provider: 'OpenWeatherMap',
        data,
        lastUpdated: new Date().toISOString(),
        isMock: false
      };
    } catch (error) {
      // Silently fall back to mock data if API key is missing or request fails
      return generateMockForecast(location, model, 'OpenWeatherMap (Mock)');
    }
  }
  
  // WeatherAPI.com
  static async getWeatherAPIForecast(location: Location, model: string): Promise<ForecastData> {
    if (!WEATHERAPI_KEY || config.enableMockData) {
      return generateMockForecast(location, model, 'WeatherAPI (Mock)');
    }
    
    try {
      const response = await axios.get(
        `https://api.weatherapi.com/v1/forecast.json`,
        {
          params: {
            key: WEATHERAPI_KEY,
            q: `${location.lat},${location.lon}`,
            days: 7
          }
        }
      );
      
      const data: SnowfallData[] = response.data.forecast.forecastday.map((day: any) => ({
        timestamp: day.date,
        snowfall: day.day.totalsnow_cm ? day.day.totalsnow_cm / 2.54 : 0, // cm to inches
        temperature: day.day.avgtemp_f,
        windSpeed: day.day.maxwind_mph,
        humidity: day.day.avghumidity,
        model
      }));
      
      return {
        location,
        model,
        provider: 'WeatherAPI.com',
        data,
        lastUpdated: new Date().toISOString(),
        isMock: false
      };
    } catch (error) {
      console.error('WeatherAPI error:', error);
      return generateMockForecast(location, model, 'WeatherAPI (Mock)');
    }
  }
  
  // National Weather Service (free, no API key needed)
  static async getNWSForecast(location: Location, model: string): Promise<ForecastData> {
    try {
      // Get grid point from lat/lon
      const gridResponse = await axios.get(
        `https://api.weather.gov/points/${location.lat},${location.lon}`
      );
      
      const forecastUrl = gridResponse.data.properties.forecast;
      const response = await axios.get(forecastUrl);
      
      const data: SnowfallData[] = response.data.properties.periods
        .filter((period: any) => period.isDaytime)
        .slice(0, 7)
        .map((period: any) => ({
          timestamp: period.startTime,
          snowfall: period.snowfallAmount?.value || 0,
          temperature: period.temperature,
          windSpeed: parseInt(period.windSpeed.split(' ')[0]) || 0,
          humidity: 0, // NWS doesn't provide humidity in this endpoint
          model
        }));
      
      return {
        location,
        model,
        provider: 'National Weather Service',
        data,
        lastUpdated: new Date().toISOString(),
        isMock: false
      };
    } catch (error) {
      console.error('NWS API error:', error);
      return generateMockForecast(location, model, 'NWS (Mock)');
    }
  }
  
  // Get forecast for a specific model
  static async getForecast(location: Location, modelId: string): Promise<ForecastData> {
    const model = WEATHER_MODELS.find(m => m.id === modelId);
    if (!model) {
      throw new Error(`Model ${modelId} not found`);
    }
    
    // Use backend if enabled
    if (config.useBackend) {
      // Map model to provider
      let provider = 'openweathermap';
      switch (modelId) {
        case 'gfs':
        case 'nam':
        case 'hrrr':
          provider = 'nws';
          break;
        case 'ecmwf':
        case 'ukmet':
        case 'gem':
        case 'jma':
          provider = 'openweathermap';
          break;
        default:
          provider = 'weatherapi';
      }
      
      return BackendWeatherService.getForecast(location, model.name, provider);
    }
    
    // Fallback to direct API calls
    switch (modelId) {
      case 'gfs':
      case 'nam':
      case 'hrrr':
        return this.getNWSForecast(location, model.name);
      case 'ecmwf':
      case 'ukmet':
      case 'gem':
      case 'jma':
        return this.getOpenWeatherForecast(location, model.name);
      default:
        return this.getWeatherAPIForecast(location, model.name);
    }
  }
  
  // Get forecasts for multiple models
  static async getMultipleForecasts(
    location: Location,
    modelIds: string[]
  ): Promise<ForecastData[]> {
    if (config.useBackend) {
      try {
        // Map models to providers
        const modelProviderMap: Record<string, string> = {};
        modelIds.forEach(modelId => {
          switch (modelId) {
            case 'gfs':
            case 'nam':
            case 'hrrr':
              modelProviderMap[modelId] = 'nws';
              break;
            case 'ecmwf':
            case 'ukmet':
            case 'gem':
            case 'jma':
              modelProviderMap[modelId] = 'openweathermap';
              break;
            default:
              modelProviderMap[modelId] = 'weatherapi';
          }
        });
        
        return await BackendWeatherService.getMultipleForecasts(location, modelIds, modelProviderMap);
      } catch (error: any) {
        console.warn('Backend failed, falling back to direct API calls:', error.message);
        // Fallback to direct API calls if backend fails
        const promises = modelIds.map(modelId => this.getForecast(location, modelId));
        return Promise.all(promises);
      }
    }
    
    // Fallback to direct API calls
    const promises = modelIds.map(modelId => this.getForecast(location, modelId));
    return Promise.all(promises);
  }
}

