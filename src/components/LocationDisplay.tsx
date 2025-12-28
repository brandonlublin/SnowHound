import { MapPin, Navigation, Star, Search, ExternalLink, Share2, Check, Mountain } from 'lucide-react';
import { useState, KeyboardEvent, useEffect, memo } from 'react';
import { Location } from '../types/weather';
import { generateShareUrl, shareContent } from '../utils/shareUtils';
import ExportButton from './ExportButton';
import { ForecastData } from '../types/weather';
import ResortLinks from './ResortLinks';
import { LocationService } from '../services/locationService';

interface LocationDisplayProps {
  location: Location;
  selectedModels?: string[];
  forecasts?: ForecastData[];
  onLocationUpdate?: (location: Location) => void;
}

function LocationDisplay({ location, selectedModels, forecasts = [], onLocationUpdate }: LocationDisplayProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'sharing'>('idle');
  const [isFavorite, setIsFavorite] = useState(false);

  const handleShare = async () => {
    setShareStatus('sharing');
    const shareUrl = generateShareUrl(location, selectedModels);
    const result = await shareContent(
      `SnowHound - ${location.name}`,
      `Check out the snowfall forecast for ${location.name}`,
      shareUrl
    );
    
    if (result === 'copied') {
      setShareStatus('copied');
      setTimeout(() => setShareStatus('idle'), 2000);
    } else {
      setShareStatus('idle');
    }
  };

  // Check if location is favorite on mount and when location changes
  useEffect(() => {
    setIsFavorite(LocationService.isFavorite(location.id));
  }, [location.id]);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      LocationService.removeFavorite(location.id);
      setIsFavorite(false);
      // Update location type if it was a favorite
      if (location.type === 'favorite' && onLocationUpdate) {
        onLocationUpdate({ ...location, type: 'search' });
      }
    } else {
      LocationService.addFavorite(location);
      setIsFavorite(true);
      // Update location type to favorite
      if (onLocationUpdate) {
        onLocationUpdate({ ...location, type: 'favorite' });
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  const getLocationTypeIcon = () => {
    switch (location.type) {
      case 'current':
        return <Navigation className="w-4 h-4 text-blue-400" />;
      case 'favorite':
        return <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />;
      case 'search':
        return <Search className="w-4 h-4 text-green-400" />;
      default:
        return <MapPin className="w-4 h-4 text-gray-400" />;
    }
  };

  const getLocationTypeLabel = () => {
    switch (location.type) {
      case 'current':
        return 'Current Location';
      case 'favorite':
        return 'Favorite Location';
      case 'search':
        return 'Searched Location';
      default:
        return 'Location';
    }
  };

  const mapUrl = `https://www.google.com/maps?q=${location.lat},${location.lon}`;

  return (
    <div className="card mb-6" role="region" aria-label="Location information">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0" aria-hidden="true">
              <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl md:text-2xl font-bold mb-1 truncate">{location.name}</h2>
              <div className="flex items-center gap-2 flex-wrap" aria-label={`Location type: ${getLocationTypeLabel()}`}>
                {getLocationTypeIcon()}
                <span className="text-xs md:text-sm text-gray-400">{getLocationTypeLabel()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
            <div className="flex items-center gap-3 p-3 glass rounded-lg" role="group" aria-label="Coordinates">
              <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0" aria-hidden="true">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 mb-0.5">Coordinates</p>
                <p className="text-sm font-medium truncate" aria-label={`Latitude ${location.lat.toFixed(4)} degrees ${location.lat >= 0 ? 'North' : 'South'}, Longitude ${Math.abs(location.lon).toFixed(4)} degrees ${location.lon >= 0 ? 'East' : 'West'}`}>
                  {location.lat.toFixed(4)}°{location.lat >= 0 ? 'N' : 'S'}, {Math.abs(location.lon).toFixed(4)}°{location.lon >= 0 ? 'E' : 'W'}
                </p>
              </div>
            </div>

            {location.elevation && (
              <div className="flex items-center gap-3 p-3 glass rounded-lg" role="group" aria-label={`Elevation: ${location.elevation.toLocaleString()} feet`}>
                <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0" aria-hidden="true">
                  <Mountain className="w-4 h-4 text-purple-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Elevation</p>
                  <p className="text-sm font-medium">
                    {location.elevation.toLocaleString()} ft
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleToggleFavorite}
              onKeyDown={(e) => handleKeyDown(e, handleToggleFavorite)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleToggleFavorite();
              }}
              className={`btn-secondary ${isFavorite ? 'text-yellow-400' : ''}`}
              aria-label={isFavorite ? `Remove ${location.name} from favorites` : `Add ${location.name} to favorites`}
              aria-pressed={isFavorite}
            >
              <Star className={`w-4 h-4 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} aria-hidden="true" />
              <span>{isFavorite ? 'Favorited' : 'Add to Favorites'}</span>
            </button>
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
              aria-label={`View ${location.name} on Google Maps`}
            >
              <ExternalLink className="w-4 h-4" aria-hidden="true" />
              <span>View on Map</span>
            </a>
            <button
              onClick={handleShare}
              onKeyDown={(e) => handleKeyDown(e, handleShare)}
              onTouchStart={(e) => {
                e.preventDefault();
                handleShare();
              }}
              className="btn-secondary"
              disabled={shareStatus === 'sharing'}
              aria-label={shareStatus === 'copied' ? 'Link copied to clipboard' : 'Share forecast'}
              aria-live="polite"
            >
              {shareStatus === 'copied' ? (
                <>
                  <Check className="w-4 h-4 text-green-400" aria-hidden="true" />
                  <span className="text-green-400">Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4" aria-hidden="true" />
                  <span>Share</span>
                </>
              )}
            </button>
            {forecasts.length > 0 && selectedModels && (
              <ExportButton
                location={location}
                forecasts={forecasts}
                selectedModels={selectedModels}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Resort Links */}
      <ResortLinks location={location} />
    </div>
  );
}

export default memo(LocationDisplay);

