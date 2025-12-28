import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, MapPin, X } from 'lucide-react';
import { Location, ForecastData } from '../types/weather';
import { LocationService } from '../services/locationService';
import { WeatherService } from '../services/weatherApi';
import { CardSkeleton } from '../components/skeletons';

interface FavoriteLocationWithForecast {
  location: Location;
  forecast: ForecastData | null;
  loading: boolean;
}

export default function FavoritesDashboard() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteLocationWithForecast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    const favoriteLocations = LocationService.getFavorites();
    
    if (favoriteLocations.length === 0) {
      setLoading(false);
      return;
    }

    setFavorites(
      favoriteLocations.map(loc => ({
        location: loc,
        forecast: null,
        loading: true
      }))
    );

    // Load forecasts for all favorites
    const forecasts = await Promise.all(
      favoriteLocations.map(async (loc) => {
        try {
          // Use default models (GFS and ECMWF)
          const defaultModels = ['gfs', 'ecmwf'];
          const forecastData = await WeatherService.getMultipleForecasts(loc, defaultModels);
          // Return average of all models
          return forecastData.length > 0 ? forecastData[0] : null;
        } catch (error) {
          console.error(`Error loading forecast for ${loc.name}:`, error);
          return null;
        }
      })
    );

    setFavorites(
      favoriteLocations.map((loc, index) => ({
        location: loc,
        forecast: forecasts[index],
        loading: false
      }))
    );
    setLoading(false);
  };

  const handleRemoveFavorite = (locationId: string) => {
    LocationService.removeFavorite(locationId);
    loadFavorites();
  };

  const handleSelectLocation = (location: Location) => {
    // Save to localStorage and navigate to main dashboard
    localStorage.setItem('snowhound-location', JSON.stringify(location));
    navigate('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
        <div className="container mx-auto py-8">
          <div className="card text-center py-12">
            <Star className="w-16 h-16 mx-auto mb-4 text-yellow-400 opacity-50" />
            <h2 className="text-2xl font-bold mb-2">No Favorite Locations</h2>
            <p className="text-gray-400 mb-6">
              Add locations to your favorites to see them here
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-4">
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Favorite Locations</h1>
            <p className="text-gray-400">Quick view of your saved locations</p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 glass hover:bg-white/20 rounded-lg transition-colors"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div
              key={fav.location.id}
              className="card hover:bg-white/15 transition-colors cursor-pointer relative group"
              onClick={() => handleSelectLocation(fav.location)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFavorite(fav.location.id);
                }}
                className="absolute top-3 right-3 p-1.5 glass hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity touch-target"
                aria-label="Remove from favorites"
              >
                <X className="w-4 h-4 text-red-400" />
              </button>

              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold truncate">{fav.location.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">
                      {fav.location.lat.toFixed(2)}°N, {Math.abs(fav.location.lon).toFixed(2)}°W
                    </span>
                  </div>
                </div>
              </div>

              {fav.loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : fav.forecast ? (
                <div className="space-y-3">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-blue-400">
                        {fav.forecast.data.slice(0, 7).reduce((sum, d) => sum + d.snowfall, 0).toFixed(1)}"
                      </span>
                      <span className="text-sm text-gray-400">7-day total</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-gray-400">Next 24h</p>
                      <p className="font-semibold text-blue-400">
                        {fav.forecast.data[0]?.snowfall.toFixed(1) || '0.0'}"
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-400">Peak Day</p>
                      <p className="font-semibold text-purple-400">
                        {Math.max(...fav.forecast.data.map(d => d.snowfall)).toFixed(1)}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500 text-sm">
                  Forecast unavailable
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

