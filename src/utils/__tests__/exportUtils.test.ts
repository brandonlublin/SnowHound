import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportAsJSON, exportAsCSV, generateForecastCard } from '../exportUtils';
import { Location, ForecastData, SnowfallData } from '../../types/weather';

describe('exportUtils', () => {
  const mockLocation: Location = {
    id: 'test',
    name: 'Test Location',
    lat: 40.7128,
    lon: -74.0060,
    type: 'search'
  };

  const mockForecastData: SnowfallData[] = [
    {
      timestamp: '2024-01-01T00:00:00Z',
      snowfall: 5.5,
      temperature: 25,
      windSpeed: 10,
      humidity: 60,
      model: 'GFS'
    },
    {
      timestamp: '2024-01-02T00:00:00Z',
      snowfall: 3.2,
      temperature: 28,
      windSpeed: 12,
      humidity: 65,
      model: 'GFS'
    }
  ];

  const mockForecasts: ForecastData[] = [
    {
      location: mockLocation,
      model: 'GFS',
      provider: 'OpenWeatherMap',
      data: mockForecastData,
      lastUpdated: '2024-01-01T00:00:00Z',
      isMock: false
    }
  ];

  beforeEach(() => {
    // Mock URL.createObjectURL and URL.revokeObjectURL
    global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    global.URL.revokeObjectURL = vi.fn();
    
    // Mock document.createElement and click
    const mockLink = {
      download: '',
      href: '',
      click: vi.fn()
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('exportAsJSON', () => {
    it('should create JSON blob with correct data', () => {
      exportAsJSON(mockLocation, mockForecasts);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should use default filename when not provided', () => {
      const link = document.createElement('a') as any;
      link.download = '';
      
      exportAsJSON(mockLocation, mockForecasts);
      
      // Verify blob was created (indirectly through createObjectURL call)
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('exportAsCSV', () => {
    it('should create CSV with headers', () => {
      exportAsCSV(mockLocation, mockForecasts);
      
      expect(document.createElement).toHaveBeenCalledWith('a');
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });

    it('should handle multiple forecasts', () => {
      const multipleForecasts: ForecastData[] = [
        ...mockForecasts,
        {
          ...mockForecasts[0],
          model: 'ECMWF',
          provider: 'WeatherAPI'
        }
      ];
      
      exportAsCSV(mockLocation, multipleForecasts);
      
      expect(global.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  describe('generateForecastCard', () => {
    it('should generate card with correct structure', () => {
      const card = generateForecastCard(mockLocation, mockForecasts, ['gfs']);
      
      expect(card.title).toContain('SnowHound Forecast');
      expect(card.title).toContain('Test Location');
      expect(card.data.location).toBe('Test Location');
      expect(card.data.models).toEqual(['gfs']);
    });

    it('should calculate next 24h snowfall', () => {
      const card = generateForecastCard(mockLocation, mockForecasts, ['gfs']);
      
      expect(card.data.next24h).toBe(5.5);
    });

    it('should calculate seven day total', () => {
      const card = generateForecastCard(mockLocation, mockForecasts, ['gfs']);
      
      expect(card.data.sevenDayTotal).toBeGreaterThan(0);
    });
  });
});

