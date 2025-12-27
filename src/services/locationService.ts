import { Location } from '../types/weather';
import { sanitizeSearchQuery, validateCoordinates } from '../utils/validation';
import { config } from '../config/env';
import { BackendWeatherService } from './backendApi';

// Popular ski resorts and mountain ranges
const SKI_RESORTS: Location[] = [
  { id: 'vail', name: 'Vail, CO', lat: 39.6403, lon: -106.3742, type: 'search', elevation: 8150 },
  { id: 'aspen', name: 'Aspen, CO', lat: 39.1911, lon: -106.8175, type: 'search', elevation: 8000 },
  { id: 'breckenridge', name: 'Breckenridge, CO', lat: 39.4817, lon: -106.0384, type: 'search', elevation: 9600 },
  { id: 'whistler', name: 'Whistler, BC', lat: 50.1163, lon: -122.9574, type: 'search', elevation: 2182 },
  { id: 'park-city', name: 'Park City, UT', lat: 40.6461, lon: -111.4980, type: 'search', elevation: 7000 },
  { id: 'jackson-hole', name: 'Jackson Hole, WY', lat: 43.5875, lon: -110.8278, type: 'search', elevation: 6311 },
  { id: 'alta', name: 'Alta, UT', lat: 40.5886, lon: -111.6378, type: 'search', elevation: 8530 },
  { id: 'mammoth', name: 'Mammoth Mountain, CA', lat: 37.6308, lon: -119.0326, type: 'search', elevation: 11053 },
  { id: 'tahoe', name: 'Lake Tahoe, CA', lat: 39.0968, lon: -120.0324, type: 'search', elevation: 6225 },
  { id: 'telluride', name: 'Telluride, CO', lat: 37.9375, lon: -107.8123, type: 'search', elevation: 8725 },
  { id: 'crystal-mountain-wa', name: 'Crystal Mountain, WA', lat: 46.9361, lon: -121.4744, type: 'search', elevation: 7012 },
  { id: 'crystal-mountain-mi', name: 'Crystal Mountain, MI', lat: 44.5214, lon: -85.9981, type: 'search', elevation: 1025 },
];

const MOUNTAIN_RANGES: Location[] = [
  { id: 'rockies', name: 'Rocky Mountains', lat: 39.7392, lon: -105.9903, type: 'search' },
  { id: 'sierra-nevada', name: 'Sierra Nevada', lat: 37.8651, lon: -119.5383, type: 'search' },
  { id: 'cascades', name: 'Cascade Range', lat: 45.3736, lon: -121.6959, type: 'search' },
  { id: 'wasatch', name: 'Wasatch Range', lat: 40.7608, lon: -111.8910, type: 'search' },
  { id: 'alps', name: 'Alps', lat: 46.5197, lon: 9.8384, type: 'search' },
];

export class LocationService {
  static async getCurrentLocation(): Promise<Location> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            id: 'current',
            name: 'Current Location',
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            type: 'current'
          });
        },
        (error) => {
          reject(error);
        }
      );
    });
  }
  
  static searchLocations(query: string): Location[] {
    const lowerQuery = query.toLowerCase();
    const allLocations = [...SKI_RESORTS, ...MOUNTAIN_RANGES];
    
    return allLocations.filter(loc =>
      loc.name.toLowerCase().includes(lowerQuery)
    );
  }
  
  // Geocode a location using OpenStreetMap Nominatim (free, no API key needed)
  static async geocodeLocation(query: string): Promise<Location[]> {
    try {
      // Sanitize and validate input
      const sanitizedQuery = sanitizeSearchQuery(query);
      if (!sanitizedQuery || sanitizedQuery.length < 2) {
        return [];
      }
      
      // Use backend if enabled
      if (config.useBackend) {
        return BackendWeatherService.geocodeLocation(sanitizedQuery);
      }
      
      // Fallback to direct API call
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(sanitizedQuery)}&limit=5`,
        {
          headers: {
            'User-Agent': 'SnowHound Weather App' // Required by Nominatim
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      return data
        .map((item: any, index: number) => {
          const lat = parseFloat(item.lat);
          const lon = parseFloat(item.lon);
          
          // Validate coordinates
          if (!validateCoordinates(lat, lon)) {
            return null;
          }
          
          // Try to create a shorter, more readable name
          const parts = item.display_name.split(',');
          let shortName = item.display_name;
          
          // If it's a long name, try to shorten it intelligently
          if (parts.length > 3) {
            // Take first part (usually the place name) and last 2 parts (usually state/country)
            shortName = [parts[0], ...parts.slice(-2)].join(', ');
          }
          
          return {
            id: `geocoded-${item.place_id || index}`,
            name: shortName,
            lat,
            lon,
            type: 'search' as const,
            elevation: undefined // Nominatim doesn't provide elevation
          };
        })
        .filter((loc: Location | null): loc is Location => loc !== null);
    } catch (error) {
      console.error('Geocoding error:', error);
      return [];
    }
  }
  
  // Combined search: first check hardcoded locations, then geocode
  static async searchLocationsAsync(query: string): Promise<Location[]> {
    // First, check hardcoded locations
    const hardcodedResults = this.searchLocations(query);
    
    // If we found results, return them
    if (hardcodedResults.length > 0) {
      return hardcodedResults;
    }
    
    // Otherwise, try geocoding
    const geocodedResults = await this.geocodeLocation(query);
    return geocodedResults;
  }
  
  static async searchByCoordinates(lat: number, lon: number): Promise<Location> {
    // Reverse geocoding would go here (using a free API like OpenStreetMap Nominatim)
    // For now, return a basic location object
    return {
      id: `custom-${lat}-${lon}`,
      name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
      lat,
      lon,
      type: 'search'
    };
  }
  
  static getFavorites(): Location[] {
    const stored = localStorage.getItem('snowhound-favorites');
    return stored ? JSON.parse(stored) : [];
  }
  
  static addFavorite(location: Location): void {
    const favorites = this.getFavorites();
    if (!favorites.find(f => f.id === location.id)) {
      favorites.push({ ...location, type: 'favorite' });
      localStorage.setItem('snowhound-favorites', JSON.stringify(favorites));
    }
  }
  
  static removeFavorite(locationId: string): void {
    const favorites = this.getFavorites().filter(f => f.id !== locationId);
    localStorage.setItem('snowhound-favorites', JSON.stringify(favorites));
  }
  
  static isFavorite(locationId: string): boolean {
    return this.getFavorites().some(f => f.id === locationId);
  }
}

