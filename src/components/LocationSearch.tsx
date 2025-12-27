import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, X, Loader2 } from 'lucide-react';
import { Location } from '../types/weather';
import { LocationService } from '../services/locationService';

interface LocationSearchProps {
  onLocationSelect: (location: Location) => void;
  currentLocation?: Location;
}

export default function LocationSearch({ onLocationSelect, currentLocation }: LocationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [favorites, setFavorites] = useState<Location[]>([]);
  const [showFavorites, setShowFavorites] = useState(false);
  const [searching, setSearching] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFavorites(LocationService.getFavorites());
  }, []);

  // Close dropdown when clicking/touching outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowFavorites(false);
        setResults([]);
        setQuery('');
      }
    };

    if (showFavorites || results.length > 0) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [showFavorites, results.length]);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length === 0) {
      setResults([]);
      setSearching(false);
      return;
    }

    // Debounce search - wait 500ms after user stops typing
    setSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // First check hardcoded locations (instant)
        const hardcodedResults = LocationService.searchLocations(query);
        
        if (hardcodedResults.length > 0) {
          setResults(hardcodedResults);
          setSearching(false);
        } else {
          // If no hardcoded results, try geocoding
          const geocodedResults = await LocationService.geocodeLocation(query);
          setResults(geocodedResults);
          setSearching(false);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
        setSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const handleSelect = (location: Location) => {
    onLocationSelect(location);
    setQuery('');
    setResults([]);
  };

  const handleAddFavorite = (location: Location) => {
    LocationService.addFavorite(location);
    setFavorites(LocationService.getFavorites());
  };

  const handleRemoveFavorite = (locationId: string) => {
    LocationService.removeFavorite(locationId);
    setFavorites(LocationService.getFavorites());
  };

  const handleUseCurrentLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      onLocationSelect(location);
    } catch (error) {
      alert('Unable to get your location. Please search for a location instead.');
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ski resorts, mountains, or locations..."
            className="w-full pl-10 pr-10 md:pr-4 py-3 md:py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              onTouchStart={(e) => {
                e.preventDefault();
                setQuery('');
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white touch-target p-1"
              aria-label="Clear search"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFavorites(!showFavorites)}
          onTouchStart={(e) => {
            e.preventDefault();
            setShowFavorites(!showFavorites);
          }}
          className="px-3 md:px-4 py-3 glass rounded-lg hover:bg-white/20 active:bg-white/30 transition-colors touch-target"
          title="Favorites"
          aria-label="Toggle favorites"
        >
          <Star className={`w-5 h-5 ${showFavorites ? 'fill-yellow-400 text-yellow-400' : ''}`} />
        </button>
        <button
          onClick={handleUseCurrentLocation}
          onTouchStart={(e) => {
            e.preventDefault();
            handleUseCurrentLocation();
          }}
          className="px-3 md:px-4 py-3 glass rounded-lg hover:bg-white/20 active:bg-white/30 transition-colors touch-target"
          title="Use Current Location"
          aria-label="Use current location"
        >
          <MapPin className="w-5 h-5" />
        </button>
      </div>

      {(results.length > 0 || showFavorites) && (
        <div className="absolute z-50 w-full mt-2 bg-slate-900/95 backdrop-blur-lg border border-white/30 rounded-lg shadow-2xl p-3 md:p-4 max-h-[60vh] md:max-h-96 overflow-y-auto overscroll-contain">
          {showFavorites ? (
            <div>
              <h3 className="text-lg font-semibold mb-3">Favorites</h3>
              {favorites.length === 0 ? (
                <p className="text-gray-400">No favorites yet. Add locations to favorites to save them.</p>
              ) : (
                <div className="space-y-2">
                  {favorites.map((fav) => (
                    <div
                      key={fav.id}
                      className="flex items-center justify-between p-3 md:p-3 hover:bg-white/10 active:bg-white/20 rounded-lg cursor-pointer transition-colors touch-target"
                      onClick={() => handleSelect(fav)}
                      onTouchStart={(e) => {
                        e.preventDefault();
                        handleSelect(fav);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="font-medium">{fav.name}</p>
                          {fav.elevation && (
                            <p className="text-sm text-gray-400">{fav.elevation.toLocaleString()} ft</p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(fav.id);
                        }}
                        onTouchStart={(e) => {
                          e.stopPropagation();
                          handleRemoveFavorite(fav.id);
                        }}
                        className="p-2 hover:bg-white/20 active:bg-white/30 rounded touch-target"
                        aria-label="Remove favorite"
                      >
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {searching && results.length === 0 && (
                <div className="flex items-center justify-center py-4 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span>Searching...</span>
                </div>
              )}
              {!searching && results.length === 0 && query.length > 0 && (
                <div className="text-center py-4 text-gray-400">
                  <p>No locations found</p>
                  <p className="text-xs mt-1">Try a different search term</p>
                </div>
              )}
              {results.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 md:p-3 hover:bg-white/10 active:bg-white/20 rounded-lg cursor-pointer transition-colors touch-target"
                  onClick={() => handleSelect(result)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    handleSelect(result);
                  }}
                >
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-blue-400" />
                        <div>
                          <p className="font-medium">{result.name}</p>
                          {result.elevation ? (
                            <p className="text-sm text-gray-400">{result.elevation.toLocaleString()} ft</p>
                          ) : (
                            <p className="text-sm text-gray-400">
                              {result.lat.toFixed(4)}°{result.lat >= 0 ? 'N' : 'S'}, {Math.abs(result.lon).toFixed(4)}°{result.lon >= 0 ? 'E' : 'W'}
                            </p>
                          )}
                        </div>
                      </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddFavorite(result);
                    }}
                    onTouchStart={(e) => {
                      e.stopPropagation();
                      handleAddFavorite(result);
                    }}
                    className="p-2 hover:bg-white/20 active:bg-white/30 rounded touch-target"
                    aria-label="Add to favorites"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        LocationService.isFavorite(result.id)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-400'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {currentLocation && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-300">
          <MapPin className="w-4 h-4" />
          <span>Current: {currentLocation.name}</span>
        </div>
      )}
    </div>
  );
}

