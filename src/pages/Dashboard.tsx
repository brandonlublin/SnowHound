import { useState, useEffect } from 'react';
import { Snowflake, Loader2, Filter, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Location, ForecastData } from '../types/weather';
import { LocationService } from '../services/locationService';
import { WeatherService } from '../services/weatherApi';
import { hasWeatherApiKeys as hasAPIKeys, config } from '../config/env';
import { WEATHER_MODELS } from '../services/weatherModels';
import LocationSearch from '../components/LocationSearch';
import LocationDisplay from '../components/LocationDisplay';
import FilterSidebar from '../components/FilterSidebar';
import ComparisonView from '../components/ComparisonView';
import SummaryCard from '../components/SummaryCard';
import FiveDayForecast from '../components/FiveDayForecast';
import DataStatusIndicator from '../components/DataStatusIndicator';
import RateLimitWarning from '../components/RateLimitWarning';

type ViewType = 'graph' | 'table' | 'chart';

export default function Dashboard() {
  const navigate = useNavigate();
  const [location, setLocation] = useState<Location | null>(null);
  const [selectedModels, setSelectedModels] = useState<string[]>(['gfs', 'ecmwf']);
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState<ViewType>('graph');
  const [error, setError] = useState<string | null>(null);
  const [rateLimitError, setRateLimitError] = useState<{ message?: string; retryAfter?: number } | null>(null);
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);

  // Load favorite count
  useEffect(() => {
    const updateFavoriteCount = () => {
      setFavoriteCount(LocationService.getFavorites().length);
    };
    updateFavoriteCount();
    // Update when favorites change
    const interval = setInterval(updateFavoriteCount, 1000);
    return () => clearInterval(interval);
  }, []);

  // Try to get current location on mount
  useEffect(() => {
    const initializeLocation = async () => {
      try {
        const currentLoc = await LocationService.getCurrentLocation();
        setLocation(currentLoc);
      } catch (error) {
        console.log('Could not get current location:', error);
        // Try to use configured default location
        const defaultLoc = LocationService.getDefaultLocation();
        if (defaultLoc) {
          setLocation(defaultLoc);
        } else {
          // Fallback to Vail, CO
          setLocation({
            id: 'vail',
            name: 'Vail, CO',
            lat: 39.6403,
            lon: -106.3742,
            type: 'search',
            elevation: 8150
          });
        }
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
            <div className="ml-auto flex items-center gap-2">
              {favoriteCount > 0 && (
                <button
                  onClick={() => navigate('/favorites')}
                  className="flex items-center gap-2 px-3 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors touch-target relative"
                  aria-label="View favorite locations"
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="hidden sm:inline text-sm text-gray-300 whitespace-nowrap">
                    Favorites
                  </span>
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {favoriteCount}
                  </span>
                </button>
              )}
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="flex items-center gap-2 px-3 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors touch-target relative"
                aria-label="Toggle weather model filter"
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
                <span className="hidden md:inline text-sm text-gray-300 whitespace-nowrap">
                  Models
                </span>
                <span className="md:hidden text-xs text-gray-300 whitespace-nowrap">
                  Weather Models
                </span>
                {selectedModels.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                    {selectedModels.length}
                  </span>
                )}
              </button>
            </div>
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
        
        {/* API Status Banner - Only show in development when not using backend */}
        {!hasAPIKeys() && !config.useBackend && config.isDevelopment && (
          <div className="mb-6">
            <DataStatusIndicator
              isMock={true}
              provider="Using mock data (no API keys)"
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
          <div className="mb-6">
            <LocationDisplay 
              location={location} 
              selectedModels={selectedModels}
              forecasts={forecasts}
            />
          </div>
        )}

        {/* Summary Cards */}
        {forecasts.length > 0 && (
          <div className="mb-6">
            <SummaryCard forecasts={forecasts} />
          </div>
        )}

        {/* 7-Day Forecast */}
        {forecasts.length > 0 && (
          <div className="mb-6">
            <FiveDayForecast forecasts={forecasts} location={location || undefined} />
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="card text-center py-12 mb-6">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
            <p className="text-gray-400">Loading forecasts from {selectedModels.length} model{selectedModels.length !== 1 ? 's' : ''}...</p>
          </div>
        )}

        {/* Comparison View */}
        {!loading && forecasts.length > 0 && (
          <div className="mb-6">
            <ComparisonView
              forecasts={forecasts}
              viewType={viewType}
              onViewTypeChange={setViewType}
              onHideModel={handleHideModel}
            />
          </div>
        )}

      </main>

      {/* Filter Sidebar */}
      <FilterSidebar
        isOpen={showModelSelector}
        onClose={() => setShowModelSelector(false)}
        selectedModels={selectedModels}
        onToggleModel={handleToggleModel}
        maxSelection={5}
      />

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

