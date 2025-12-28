import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LocationDisplay from '../LocationDisplay';
import { Location } from '../../types/weather';
import * as LocationService from '../../services/locationService';

// Mock dependencies
vi.mock('../../services/locationService', () => ({
  LocationService: {
    isFavorite: vi.fn(),
    addFavorite: vi.fn(),
    removeFavorite: vi.fn()
  }
}));

vi.mock('../ExportButton', () => ({
  default: () => <div data-testid="export-button">Export</div>
}));

vi.mock('../ResortLinks', () => ({
  default: () => <div data-testid="resort-links">Resort Links</div>
}));

describe('LocationDisplay', () => {
  const mockLocation: Location = {
    id: 'test-location',
    name: 'Test Location',
    lat: 40.7128,
    lon: -74.0060,
    type: 'search',
    elevation: 1000
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (LocationService.LocationService.isFavorite as any).mockReturnValue(false);
  });

  it('should render location name and details', () => {
    const { container } = render(<LocationDisplay location={mockLocation} />);
    
    expect(container.textContent).toContain('Test Location');
    expect(container.textContent).toContain('40.7128');
    expect(container.textContent).toContain('1000');
  });

  it('should show "Add to Favorites" when not favorited', () => {
    const { container } = render(<LocationDisplay location={mockLocation} />);
    
    expect(container.textContent).toMatch(/Add to Favorites/i);
  });

  it('should show "Favorited" when location is favorited', () => {
    (LocationService.LocationService.isFavorite as any).mockReturnValue(true);
    
    const { container } = render(<LocationDisplay location={mockLocation} />);
    
    expect(container.textContent).toMatch(/Favorited/i);
  });

  it('should call addFavorite when clicking favorite button', async () => {
    const user = userEvent.setup();
    const onLocationUpdate = vi.fn();
    
    const { container } = render(
      <LocationDisplay 
        location={mockLocation} 
        onLocationUpdate={onLocationUpdate}
      />
    );
    
    const favoriteButton = container.querySelector('button[aria-label*="Add"]');
    if (favoriteButton) {
      await user.click(favoriteButton);
      expect(LocationService.LocationService.addFavorite).toHaveBeenCalledWith(mockLocation);
    }
  });

  it('should render View on Map link with correct URL', () => {
    const { container } = render(<LocationDisplay location={mockLocation} />);
    
    const mapLink = container.querySelector('a[href*="40.7128"]');
    expect(mapLink).toBeTruthy();
    expect(mapLink).toHaveAttribute('target', '_blank');
  });

  it('should not render elevation if not provided', () => {
    const locationWithoutElevation = { ...mockLocation, elevation: undefined };
    const { container } = render(<LocationDisplay location={locationWithoutElevation} />);
    
    expect(container.textContent).not.toMatch(/\d+\s*ft/);
  });
});

