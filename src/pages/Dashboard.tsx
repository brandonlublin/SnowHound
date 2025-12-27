import { useState, useEffect } from 'react';
import { Snowflake, Loader2 } from 'lucide-react';
import { Location, ForecastData } from '../types/weather';
import { LocationService } from '../services/locationService';
import { WeatherService } from '../services/weatherApi';
import { hasWeatherApiKeys as hasAPIKeys } from '../config/env';
import { WEATHER_MODELS } from '../services/weatherModels';
import LocationSearch from '../components/LocationSearch';
import LocationDisplay from '../components/LocationDisplay';
import ModelSelector from '../components/ModelSelector';
import ComparisonView from '../components/ComparisonView';
import SummaryCard from '../components/SummaryCard';
import FiveDayForecast from '../components/FiveDayForecast';
import RSSFeed from '../components/RSSFeed';
import DataStatusIndicator from '../components/DataStatusIndicator';
import RateLimitWarning from '../components/RateLimitWarning';

type ViewType = 'graph' | 'table' | 'chart';

export default function Dashboard() {
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gfs', 'ecmwf']);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('graph');
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<{ message?: string; retryAfter?: number } | null>(null);

  // Try to get current location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const currentLoc = await LocationService.getCurrentLocation();
        setLocation(currentLoc);
      } catch (error) {
        console.log('Could not get current location:', error);
        // Default to a popular ski resort
        setLocation({
          id: 'vail',
          name: 'Vail, CO',
          lat: 39.6403,
          lon: -106.3742,
          type: 'search',
          elevation: 8150
        });
      }
    };
    initializeLocation();
  }, []);

  // Load forecasts when location or models change
  useEffect(() => {
    if (location && selectedModels.length > 0) {
      loadForecasts();
    }
  }, [location, selectedModels]);

  const loadForecasts = async () => {
    if (!location || selectedModels.length === 0) return;

    setLoading(true);
    setError(null);
    
    try {
      setRateLimitError(null);
      const data = await WeatherService.getMultipleForecasts(location, selectedModels);
      setForecasts(data);
    } catch (err: any) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load forecasts';
      
      // Check for rate limit errors
      if (err.response?.status === 429) {
        const retryAfter = err.response.headers['retry-after'];
        setRateLimitError({
          message: err.response?.data?.message || 'Too many requests. Please slow down.',
          retryAfter: retryAfter ? parseInt(retryAfter, 10) : undefined
        });
      } else {
        setError(errorMessage);
      }
      console.error('Error loading forecasts:', err);
      
      // If backend is enabled but failing, suggest checking backend
      if (errorMessage.includes('Backend') || errorMessage.includes('ECONNREFUSED')) {
        console.warn('Backend connection failed. Make sure the backend server is running.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = (newLocation: Location) => {
    setLocation(newLocation);
  };

  const handleToggleModel = (modelId: string) => {
    setSelectedModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleHideModel = (modelName: string) => {
    // Find the model ID from the model name
    const model = WEATHER_MODELS.find(m => m.name === modelName);
    if (model) {
      // Remove it from selected models
      setSelectedModels(prev => prev.filter(id => id !== model.id));
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/20 bg-black/20 backdrop-blur-md sticky top-0 z-50 safe-top">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
            <Snowflake className="w-6 h-6 md:w-8 md:h-8 text-blue-400 flex-shrink-0" />
            <h1 className="text-xl md:text-3xl font-bold truncate">SnowHound</h1>
            <span className="text-gray-400 text-xs md:text-sm hidden sm:inline">Where is the snow?</span>
          </div>
          <LocationSearch 
            onLocationSelect={handleLocationSelect}
            currentLocation={location || undefined}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-8 safe-bottom">
        {/* Rate Limit Warning */}
        {rateLimitError && (
          <RateLimitWarning
            message={rateLimitError.message}
            retryAfter={rateLimitError.retryAfter}
          />
        )}
        
        {/* API Status Banner */}
        {!hasAPIKeys() && (
          <div className="mb-6">
            <DataStatusIndicator
              isMock={true}
              provider="No API keys configured"
            />
          </div>
        )}
        
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
            Error: {error}
          </div>
        )}

        {/* Location Display */}
        {location && (
          <LocationDisplay location={location} selectedModels={selectedModels} />
        )}

        {/* Model Selector */}
        <div className="mb-8">
          <ModelSelector
            selectedModels={selectedModels}
            onToggleModel={handleToggleModel}
            maxSelection={5}
          />
        </div>

        {/* Summary Cards */}
        {forecasts.length > 0 && (
          <div className="mb-8">
            <SummaryCard forecasts={forecasts} />
          </div>
        )}

        {/* 7-Day Forecast */}
        {forecasts.length > 0 && (
          <div className="mb-8">
            <FiveDayForecast forecasts={forecasts} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-400">Loading forecasts from {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}...</p>
          </div>
        )}

        {/* Comparison View */}
        {!loading && forecasts.length > 0 && (
          <div className="mb-8">
            <ComparisonView
              forecasts={forecasts}
              viewType={viewType}
              onViewTypeChange={setViewType}
              onHideModel={handleHideModel}
            />
          </div>
        )}

        {/* RSS Feed */}
        <div className="mb-8">
          <RSSFeed />
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/20 bg-black/20 backdrop-blur-md mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400 text-sm">
          <p>SnowHound - Comprehensive snowfall monitoring powered by multiple weather models</p>
          <p className="mt-2">
            Data from: OpenWeatherMap, WeatherAPI.com, National Weather Service, and more
          </p>
        </div>
      </footer>
    </div>
  );
}

