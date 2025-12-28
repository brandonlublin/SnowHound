import { ForecastData } from '../types/weather';
import { Location } from '../types/weather';

export interface SnowDepthData {
  date: string;
  depth: number;
  accumulation: number; // New snow added this day
  cumulative: number; // Total depth including previous days
}

const STORAGE_KEY = 'snowhound-snow-depth';

/**
 * Get stored snow depth history for a location
 */
export function getSnowDepthHistory(location: Location): SnowDepthData[] {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY}-${location.id}`);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading snow depth history:', error);
    return [];
  }
}

/**
 * Save snow depth data for a location
 */
export function saveSnowDepthData(location: Location, data: SnowDepthData[]): void {
  try {
    localStorage.setItem(`${STORAGE_KEY}-${location.id}`, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving snow depth data:', error);
  }
}

/**
 * Calculate cumulative snow depth from forecasts
 */
export function calculateSnowDepth(
  location: Location,
  forecasts: ForecastData[]
): SnowDepthData[] {
  if (forecasts.length === 0) return [];

  // Get historical data
  const history = getSnowDepthHistory(location);
  const lastEntry = history.length > 0 ? history[history.length - 1] : null;
  const startingDepth = lastEntry?.cumulative || 0;

  // Calculate daily accumulation from forecasts (average across models)
  const dailyAccumulation: number[] = [];
  const maxLength = Math.max(...forecasts.map(f => f.data.length));

  for (let i = 0; i < maxLength; i++) {
    const daySnowfall = forecasts.reduce((sum, f) => {
      const dataPoint = f.data[i];
      return sum + (dataPoint?.snowfall || 0);
    }, 0) / forecasts.length;

    dailyAccumulation.push(daySnowfall);
  }

  // Build cumulative depth data
  const depthData: SnowDepthData[] = [];
  let cumulative = startingDepth;

  forecasts[0].data.forEach((dataPoint, index) => {
    const accumulation = dailyAccumulation[index] || 0;
    cumulative += accumulation;

    depthData.push({
      date: dataPoint.timestamp,
      depth: cumulative,
      accumulation,
      cumulative
    });
  });

  // Save to localStorage
  const allData = [...history, ...depthData];
  // Keep only last 30 days
  const recentData = allData.slice(-30);
  saveSnowDepthData(location, recentData);

  return depthData;
}

/**
 * Get season total accumulation
 */
export function getSeasonTotal(location: Location): number {
  const history = getSnowDepthHistory(location);
  return history.reduce((sum, entry) => sum + entry.accumulation, 0);
}

