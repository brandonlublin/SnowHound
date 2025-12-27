import axios from 'axios';
import { Location, ForecastData, SnowfallData } from '../types/weather';
import { config } from '../config/env';

const API_BASE_URL = config.apiBaseUrl;

// Transform backend response to ForecastData format
const transformForecastData = (
  backendData: any,
  location: Location,
  model: string,
  provider: string
): ForecastData => {
  // Handle different API response formats
  let data: SnowfallData[] = [];
  
  if (backendData.list) {
    // OpenWeatherMap format
    data = backendData.list.map((item: any) => ({
      timestamp: item.dt_txt,
      snowfall: item.snow?.['3h'] || 0,
      temperature: item.main.temp,
      windSpeed: item.wind.speed,
      humidity: item.main.humidity,
      model
    }));
  } else if (backendData.forecast?.forecastday) {
    // WeatherAPI format
    data = backendData.forecast.forecastday.map((day: any) => ({
      timestamp: day.date,
      snowfall: day.day.totalsnow_cm ? day.day.totalsnow_cm / 2.54 : 0,
      temperature: day.day.avgtemp_f,
      windSpeed: day.day.maxwind_mph,
      humidity: day.day.avghumidity,
      model
    }));
  } else if (backendData.properties?.periods) {
    // NWS format
    data = backendData.properties.periods
      .filter((period: any) => period.isDaytime)
      .slice(0, 7)
      .map((period: any) => ({
        timestamp: period.startTime,
        snowfall: period.snowfallAmount?.value || 0,
        temperature: period.temperature,
        windSpeed: parseInt(period.windSpeed.split(' ')[0]) || 0,
        humidity: 0,
        model
      }));
  }
  
  return {
    location,
    model,
    provider,
    data,
    lastUpdated: new Date().toISOString(),
    isMock: false
  };
};

export class BackendWeatherService {
  static async getForecast(
    location: Location,
    model: string,
    provider: string
  ): Promise<ForecastData> {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/weather/forecast`,
        {
          location: {
            lat: location.lat,
            lon: location.lon
          },
          model,
          provider
        },
        {
          timeout: config.apiTimeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Remove cached flag from response before transforming
      const { cached, ...forecastData } = response.data;
      
      return transformForecastData(forecastData, location, model, provider);
    } catch (error: any) {
      console.error('Backend API error:', error);
      
      // Provide more detailed error message
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Backend server is not running. Please start the server with: npm run dev:server');
      }
      if (error.code === 'ERR_NETWORK') {
        throw new Error('Cannot connect to backend. Check VITE_API_BASE_URL in .env');
      }
      if (error.response) {
        throw new Error(error.response.data?.error || `Backend error: ${error.response.status}`);
      }
      throw new Error(error.message || 'Failed to fetch forecast from backend');
    }
  }
  
  static async getMultipleForecasts(
    location: Location,
    modelIds: string[],
    modelProviderMap: Record<string, string>
  ): Promise<ForecastData[]> {
    const promises = modelIds.map(async (modelId) => {
      const provider = modelProviderMap[modelId] || 'openweathermap';
      // Get model name from ID - map to actual model names
      const modelNameMap: Record<string, string> = {
        'gfs': 'GFS',
        'ecmwf': 'ECMWF',
        'nam': 'NAM',
        'hrrr': 'HRRR',
        'ukmet': 'UKMET',
        'gem': 'GEM',
        'jma': 'JMA'
      };
      const modelName = modelNameMap[modelId] || modelId.toUpperCase();
      return this.getForecast(location, modelName, provider);
    });
    
    return Promise.all(promises);
  }
  
  static async geocodeLocation(query: string): Promise<Location[]> {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/weather/geocode`,
        {
          params: { q: query },
          timeout: config.apiTimeout
        }
      );
      
      return response.data.map((item: any, index: number) => ({
        id: `geocoded-${item.place_id || index}`,
        name: item.display_name.split(',').slice(0, 2).join(', '),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: 'search' as const
      }));
    } catch (error: any) {
      console.error('Backend geocoding error:', error);
      return [];
    }
  }
}

