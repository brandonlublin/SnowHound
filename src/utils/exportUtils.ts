import { Location } from '../types/weather';
import { ForecastData } from '../types/weather';

/**
 * Export forecast as JSON file
 */
export function exportAsJSON(
  location: Location,
  forecasts: ForecastData[],
  filename: string = 'snowhound-forecast.json'
): void {
  const data = {
    location,
    forecasts: forecasts.map(f => ({
      model: f.model,
      provider: f.provider,
      data: f.data.map(d => ({
        date: d.timestamp,
        snowfall: d.snowfall,
        temperature: d.temperature,
        windSpeed: d.windSpeed,
        humidity: d.humidity
      }))
    })),
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export forecast as CSV
 */
export function exportAsCSV(
  _location: Location,
  forecasts: ForecastData[],
  filename: string = 'snowhound-forecast.csv'
): void {
  const headers: string[] = ['Date'];
  forecasts.forEach(f => {
    headers.push(`${f.model} (Snowfall)`, `${f.model} (Temp)`, `${f.model} (Wind)`);
  });
  const rows: string[] = [headers.join(',')];

  const maxLength = Math.max(...forecasts.map(f => f.data.length));
  for (let i = 0; i < maxLength; i++) {
    const row: string[] = [];
    const date = forecasts[0]?.data[i]?.timestamp || '';
    row.push(date);
    
    forecasts.forEach(f => {
      const dataPoint = f.data[i];
      if (dataPoint) {
        row.push(
          dataPoint.snowfall.toString(),
          dataPoint.temperature.toString(),
          dataPoint.windSpeed.toString()
        );
      } else {
        row.push('', '', '');
      }
    });
    
    rows.push(row.join(','));
  }

  const csv = rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Generate shareable forecast card data
 */
export function generateForecastCard(
  location: Location,
  forecasts: ForecastData[],
  selectedModels: string[]
): {
  title: string;
  description: string;
  data: {
    location: string;
    next24h: number;
    sevenDayTotal: number;
    peakDay: number;
    models: string[];
  };
} {
  const next24h = forecasts[0]?.data[0]?.snowfall || 0;
  const sevenDayTotal = forecasts.reduce((sum, f) => {
    return sum + f.data.reduce((s, d) => s + d.snowfall, 0);
  }, 0) / forecasts.length;
  
  const peakDay = Math.max(...forecasts.map(f => 
    Math.max(...f.data.map(d => d.snowfall))
  ));

  return {
    title: `SnowHound Forecast: ${location.name}`,
    description: `Check out the ${sevenDayTotal.toFixed(1)}" of snow expected over the next 7 days!`,
    data: {
      location: location.name,
      next24h: next24h,
      sevenDayTotal: sevenDayTotal,
      peakDay: peakDay,
      models: selectedModels
    }
  };
}

/**
 * Copy forecast data as JSON
 */
export function copyForecastAsJSON(
  location: Location,
  forecasts: ForecastData[]
): string {
  return JSON.stringify({
    location,
    forecasts: forecasts.map(f => ({
      model: f.model,
      provider: f.provider,
      data: f.data.map(d => ({
        date: d.timestamp,
        snowfall: d.snowfall,
        temperature: d.temperature,
        windSpeed: d.windSpeed,
        humidity: d.humidity
      }))
    })),
    exportedAt: new Date().toISOString()
  }, null, 2);
}

