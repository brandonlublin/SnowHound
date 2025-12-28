import { ForecastData } from '../types/weather';

export interface SnowQualityMetrics {
  date: string;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  score: number; // 0-100
  temperature: number;
  windSpeed: number;
  humidity: number;
  factors: {
    temperature: 'ideal' | 'warm' | 'cold';
    wind: 'calm' | 'moderate' | 'strong';
    humidity: 'dry' | 'moderate' | 'humid';
  };
}

/**
 * Calculate snow quality based on temperature, wind, and humidity
 * Ideal conditions:
 * - Temperature: 20-30°F (cold enough to preserve snow, not too cold)
 * - Wind: < 15 mph (calm conditions preserve powder)
 * - Humidity: < 60% (dry air = better snow quality)
 */
export function calculateSnowQuality(
  forecasts: ForecastData[],
  dateIndex: number
): SnowQualityMetrics | null {
  if (forecasts.length === 0) return null;

  const date = forecasts[0].data[dateIndex]?.timestamp;
  if (!date) return null;

  // Average across all models
  const avgTemp = forecasts.reduce((sum, f) => {
    const dataPoint = f.data[dateIndex];
    return sum + (dataPoint?.temperature || 0);
  }, 0) / forecasts.length;

  const avgWind = forecasts.reduce((sum, f) => {
    const dataPoint = f.data[dateIndex];
    return sum + (dataPoint?.windSpeed || 0);
  }, 0) / forecasts.length;

  const avgHumidity = forecasts.reduce((sum, f) => {
    const dataPoint = f.data[dateIndex];
    return sum + (dataPoint?.humidity || 0);
  }, 0) / forecasts.length;

  // Score each factor (0-100)
  let tempScore = 100;
  if (avgTemp < 20) {
    tempScore = 60 - (20 - avgTemp) * 2; // Too cold
  } else if (avgTemp > 30) {
    tempScore = 100 - (avgTemp - 30) * 3; // Too warm
  }

  let windScore = 100;
  if (avgWind > 15) {
    windScore = 100 - (avgWind - 15) * 2; // Strong wind
  }

  let humidityScore = 100;
  if (avgHumidity > 60) {
    humidityScore = 100 - (avgHumidity - 60) * 1.5; // High humidity
  }

  // Weighted average
  const overallScore = (tempScore * 0.4 + windScore * 0.4 + humidityScore * 0.2);

  // Determine quality
  let quality: 'excellent' | 'good' | 'fair' | 'poor';
  if (overallScore >= 80) {
    quality = 'excellent';
  } else if (overallScore >= 60) {
    quality = 'good';
  } else if (overallScore >= 40) {
    quality = 'fair';
  } else {
    quality = 'poor';
  }

  // Determine factors
  const tempFactor: 'ideal' | 'warm' | 'cold' = 
    avgTemp >= 20 && avgTemp <= 30 ? 'ideal' : avgTemp > 30 ? 'warm' : 'cold';
  
  const windFactor: 'calm' | 'moderate' | 'strong' = 
    avgWind < 10 ? 'calm' : avgWind < 20 ? 'moderate' : 'strong';
  
  const humidityFactor: 'dry' | 'moderate' | 'humid' = 
    avgHumidity < 50 ? 'dry' : avgHumidity < 70 ? 'moderate' : 'humid';

  return {
    date,
    quality,
    score: Math.max(0, Math.min(100, overallScore)),
    temperature: avgTemp,
    windSpeed: avgWind,
    humidity: avgHumidity,
    factors: {
      temperature: tempFactor,
      wind: windFactor,
      humidity: humidityFactor
    }
  };
}

/**
 * Calculate snow quality for all dates
 */
export function calculateAllSnowQuality(forecasts: ForecastData[]): SnowQualityMetrics[] {
  if (forecasts.length === 0) return [];

  const maxLength = Math.max(...forecasts.map(f => f.data.length));
  const qualities: SnowQualityMetrics[] = [];

  for (let i = 0; i < maxLength; i++) {
    const quality = calculateSnowQuality(forecasts, i);
    if (quality) {
      qualities.push(quality);
    }
  }

  return qualities;
}

