import { useState, useEffect, lazy, Suspense } from 'react';
import { Snowflake, Filter, Star } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Location, ForecastData } from '../types/weather';
import { LocationService } from '../services/locationService';
import { WeatherService } from '../services/weatherApi';
import { hasWeatherApiKeys as hasAPIKeys, config } from '../config/env';
import { WEATHER_MODELS } from '../services/weatherModels';
import LocationSearch from '../components/LocationSearch';
import LocationDisplay from '../components/LocationDisplay';
import FilterSidebar from '../components/FilterSidebar';
import DataStatusIndicator from '../components/DataStatusIndicator';
import RateLimitWarning from '../components/RateLimitWarning';
import { ForecastSkeleton, SummaryCardSkeleton, ComparisonViewSkeleton } from '../components/skeletons';

// Lazy load heavy components
const SummaryCard = lazy(() => import('../components/SummaryCard'));
const FiveDayForecast = lazy(() => import('../components/FiveDayForecast'));
const ComparisonView = lazy(() => import('../components/ComparisonView'));

type ViewType = 'graph' | 'table' | 'chart';

export default function Dashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
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

  // Try to get current location on mount and when URL params change
  useEffect(() => {
    const initializeLocation = async () => {
      // First, check if there's a location saved in localStorage (from favorites dashboard)
      const savedLocation = localStorage.getItem('snowhound-location');
      if (savedLocation) {
        try {
          const location = JSON.parse(savedLocation);
          setLocation(location);
          // Clear it so it doesn't persist on next load
          localStorage.removeItem('snowhound-location');
          return;
        } catch (error) {
          console.error('Failed to parse saved location:', error);
          localStorage.removeItem('snowhound-location');
        }
      }

      // Check URL parameters for location (from share links or favorites)
      const lat = searchParams.get('lat');
      const lon = searchParams.get('lon');
      const name = searchParams.get('name');
      const elevation = searchParams.get('elevation');
      const modelsParam = searchParams.get('models');

      if (lat && lon && name) {
        setLocation({
          id: `url-${lat}-${lon}`,
          name: name,
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          type: 'search',
          elevation: elevation ? parseInt(elevation, 10) : undefined
        });
        if (modelsParam) {
          setSelectedModels(modelsParam.split(','));
        }
        return;
      }

      // Only try geolocation/default if we don't already have a location set
      // and there are no URL params (prevents resetting on navigation)
      if (location && !lat && !lon) {
        return;
      }

      // Try to get current location via geolocation
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
          // Fallback to Crystal Mountain, WA (home mountain)
          setLocation({
            id: 'crystal-mountain-wa',
            name: 'Crystal Mountain, WA',
            lat: 46.9361,
            lon: -121.4744,
            type: 'search',
            elevation: 7012
          });
        }
      }
    };
    initializeLocation();
  }, [searchParams]); // Re-run when URL params change

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
                  className="btn-icon relative"
                  aria-label={`View ${favoriteCount} favorite location${favoriteCount !== 1 ? 's' : ''}`}
                  aria-describedby="favorite-count"
                >
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" aria-hidden="true" />
                  <span className="hidden sm:inline text-sm whitespace-nowrap">
                    Favorites
                  </span>
                  <span id="favorite-count" className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center font-semibold" aria-label={`${favoriteCount} favorites`}>
                    {favoriteCount}
                  </span>
                </button>
              )}
              <button
                onClick={() => setShowModelSelector(!showModelSelector)}
                className="btn-icon relative"
                aria-label={`Toggle weather model filter. ${selectedModels.length} model${selectedModels.length !== 1 ? 's' : ''} selected`}
                aria-expanded={showModelSelector}
                aria-haspopup="true"
              >
                <Filter className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" aria-hidden="true" />
                <span className="hidden md:inline text-sm whitespace-nowrap">
                  Models
                </span>
                <span className="md:hidden text-xs whitespace-nowrap">
                  Weather Models
                </span>
                {selectedModels.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center font-semibold" aria-label={`${selectedModels.length} models selected`}>
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
      <main id="main-content" className="container mx-auto px-3 md:px-4 py-4 md:py-8 safe-bottom" role="main">
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
              onLocationUpdate={setLocation}
            />
          </div>
        )}

        {/* Summary Cards */}
        {loading && forecasts.length === 0 ? (
          <div className="mb-6">
            <SummaryCardSkeleton />
          </div>
        ) : forecasts.length > 0 ? (
          <div className="mb-6">
            <Suspense fallback={<SummaryCardSkeleton />}>
              <SummaryCard forecasts={forecasts} />
            </Suspense>
          </div>
        ) : null}

        {/* 7-Day Forecast */}
        {loading && forecasts.length === 0 ? (
          <div className="mb-6">
            <ForecastSkeleton />
          </div>
        ) : forecasts.length > 0 ? (
          <div className="mb-6">
            <Suspense fallback={<ForecastSkeleton />}>
              <FiveDayForecast forecasts={forecasts} location={location || undefined} />
            </Suspense>
          </div>
        ) : null}

        {/* Comparison View */}
        {loading && forecasts.length === 0 ? (
          <div className="mb-6">
            <ComparisonViewSkeleton />
          </div>
        ) : !loading && forecasts.length > 0 ? (
          <div className="mb-6">
            <Suspense fallback={<ComparisonViewSkeleton />}>
              <ComparisonView
                forecasts={forecasts}
                viewType={viewType}
                onViewTypeChange={setViewType}
                onHideModel={handleHideModel}
              />
            </Suspense>
          </div>
        ) : null}

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

