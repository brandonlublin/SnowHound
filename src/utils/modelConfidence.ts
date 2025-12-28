import { ForecastData } from '../types/weather';

export interface ModelConfidence {
  date: string;
  confidence: number; // 0-100, where 100 = all models agree perfectly
  agreement: 'high' | 'medium' | 'low';
  variance: number; // Standard deviation of snowfall predictions
  models: {
    model: string;
    snowfall: number;
  }[];
}

/**
 * Calculate model confidence and agreement for a given date
 */
export function calculateModelConfidence(
  forecasts: ForecastData[],
  dateIndex: number
): ModelConfidence | null {
  if (forecasts.length === 0) return null;

  const date = forecasts[0].data[dateIndex]?.timestamp;
  if (!date) return null;

  // Get snowfall values from all models for this date
  const snowfallValues = forecasts
    .map(forecast => {
      const dataPoint = forecast.data[dateIndex];
      return dataPoint ? {
        model: forecast.model,
        snowfall: dataPoint.snowfall
      } : null;
    })
    .filter((v): v is { model: string; snowfall: number } => v !== null);

  if (snowfallValues.length === 0) return null;

  // Calculate mean
  const mean = snowfallValues.reduce((sum, v) => sum + v.snowfall, 0) / snowfallValues.length;

  // Calculate variance (standard deviation)
  const variance = Math.sqrt(
    snowfallValues.reduce((sum, v) => sum + Math.pow(v.snowfall - mean, 2), 0) / snowfallValues.length
  );

  // Calculate coefficient of variation (CV) - lower CV = higher agreement
  const cv = mean > 0 ? variance / mean : variance;

  // Convert to confidence score (0-100)
  // Lower CV = higher confidence
  // For snowfall, we consider:
  // - CV < 0.2 = high confidence (models agree within 20%)
  // - CV < 0.5 = medium confidence
  // - CV >= 0.5 = low confidence
  let confidence: number;
  let agreement: 'high' | 'medium' | 'low';

  if (cv < 0.2) {
    confidence = 100 - (cv / 0.2) * 20; // 80-100
    agreement = 'high';
  } else if (cv < 0.5) {
    confidence = 80 - ((cv - 0.2) / 0.3) * 30; // 50-80
    agreement = 'medium';
  } else {
    confidence = 50 - Math.min((cv - 0.5) * 50, 50); // 0-50
    agreement = 'low';
  }

  // Special case: if all models predict 0, that's high confidence
  if (mean === 0 && variance === 0) {
    confidence = 100;
    agreement = 'high';
  }

  return {
    date,
    confidence: Math.max(0, Math.min(100, confidence)),
    agreement,
    variance,
    models: snowfallValues
  };
}

/**
 * Calculate confidence for all dates in the forecast
 */
export function calculateAllConfidences(forecasts: ForecastData[]): ModelConfidence[] {
  if (forecasts.length === 0) return [];

  const maxLength = Math.max(...forecasts.map(f => f.data.length));
  const confidences: ModelConfidence[] = [];

  for (let i = 0; i < maxLength; i++) {
    const confidence = calculateModelConfidence(forecasts, i);
    if (confidence) {
      confidences.push(confidence);
    }
  }

  return confidences;
}

/**
 * Get overall confidence score for the forecast period
 */
export function getOverallConfidence(confidences: ModelConfidence[]): {
  score: number;
  agreement: 'high' | 'medium' | 'low';
  label: string;
} {
  if (confidences.length === 0) {
    return { score: 0, agreement: 'low', label: 'No data' };
  }

  const avgConfidence = confidences.reduce((sum, c) => sum + c.confidence, 0) / confidences.length;
  
  // Determine overall agreement based on average
  let agreement: 'high' | 'medium' | 'low';
  let label: string;

  if (avgConfidence >= 75) {
    agreement = 'high';
    label = 'High Agreement';
  } else if (avgConfidence >= 50) {
    agreement = 'medium';
    label = 'Moderate Agreement';
  } else {
    agreement = 'low';
    label = 'Low Agreement';
  }

  return {
    score: Math.round(avgConfidence),
    agreement,
    label
  };
}

