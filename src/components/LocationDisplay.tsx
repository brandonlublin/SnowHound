import { MapPin, Navigation, Star, Search, ExternalLink, Share2, Check } from 'lucide-react';
import { useState } from 'react';
import { Location } from '../types/weather';
import { generateShareUrl, shareContent } from '../utils/shareUtils';

interface LocationDisplayProps {
  location: Location;
  selectedModels?: string[];
}

export default function LocationDisplay({ location, selectedModels }: LocationDisplayProps) {
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'sharing'>('idle');

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
    <div className="card mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <MapPin className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-2xl font-bold">{location.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                {getLocationTypeIcon()}
                <span className="text-sm text-gray-400">{getLocationTypeLabel()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <MapPin className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Coordinates</p>
                <p className="text-sm font-medium">
                  {location.lat.toFixed(4)}°{location.lat >= 0 ? 'N' : 'S'}, {Math.abs(location.lon).toFixed(4)}°{location.lon >= 0 ? 'E' : 'W'}
                </p>
              </div>
            </div>

            {location.elevation && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Navigation className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400">Elevation</p>
                  <p className="text-sm font-medium">
                    {location.elevation.toLocaleString()} ft
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 md:px-4 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors group flex-shrink-0 touch-target"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                <span className="text-xs md:text-sm text-gray-300 group-hover:text-blue-400 transition-colors whitespace-nowrap">
                  View on Map
                </span>
              </a>
              <button
                onClick={handleShare}
                onTouchStart={(e) => {
                  e.preventDefault();
                  handleShare();
                }}
                className="flex items-center gap-2 px-3 md:px-4 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors group flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed touch-target active:scale-95"
                title="Share this forecast"
                disabled={shareStatus === 'sharing'}
                aria-label="Share forecast"
              >
                {shareStatus === 'copied' ? (
                  <>
                    <Check className="w-4 h-4 text-green-400" />
                    <span className="text-xs md:text-sm text-green-400 whitespace-nowrap">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    <span className="text-xs md:text-sm text-gray-300 group-hover:text-blue-400 transition-colors whitespace-nowrap">
                      Share
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

