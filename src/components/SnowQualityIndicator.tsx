import { Thermometer, Wind, Droplets, Snowflake } from 'lucide-react';
import { SnowQualityMetrics } from '../utils/snowQuality';

interface SnowQualityIndicatorProps {
  quality: SnowQualityMetrics;
  compact?: boolean;
}

export default function SnowQualityIndicator({ quality, compact = false }: SnowQualityIndicatorProps) {
  const getQualityColor = () => {
    switch (quality.quality) {
      case 'excellent':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'good':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'fair':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'poor':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  };

  const getQualityLabel = () => {
    switch (quality.quality) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Good';
      case 'fair':
        return 'Fair';
      case 'poor':
        return 'Poor';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getQualityColor()}`}>
          <Snowflake className="w-3 h-3" />
          {getQualityLabel()}
        </span>
        <span className="text-xs text-gray-400">{quality.score.toFixed(0)}%</span>
      </div>
    );
  }

  return (
    <div className="p-4 glass rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold">Snow Quality</h4>
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getQualityColor()}`}>
          {getQualityLabel()} ({quality.score.toFixed(0)}%)
        </span>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Thermometer className={`w-4 h-4 ${
            quality.factors.temperature === 'ideal' ? 'text-green-400' :
            quality.factors.temperature === 'warm' ? 'text-orange-400' : 'text-blue-400'
          }`} />
          <div>
            <p className="text-gray-400 text-xs">Temp</p>
            <p className="font-medium">{quality.temperature.toFixed(0)}°F</p>
            <p className="text-xs text-gray-500 capitalize">{quality.factors.temperature}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Wind className={`w-4 h-4 ${
            quality.factors.wind === 'calm' ? 'text-green-400' :
            quality.factors.wind === 'moderate' ? 'text-yellow-400' : 'text-red-400'
          }`} />
          <div>
            <p className="text-gray-400 text-xs">Wind</p>
            <p className="font-medium">{quality.windSpeed.toFixed(0)} mph</p>
            <p className="text-xs text-gray-500 capitalize">{quality.factors.wind}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Droplets className={`w-4 h-4 ${
            quality.factors.humidity === 'dry' ? 'text-green-400' :
            quality.factors.humidity === 'moderate' ? 'text-yellow-400' : 'text-blue-400'
          }`} />
          <div>
            <p className="text-gray-400 text-xs">Humidity</p>
            <p className="font-medium">{quality.humidity.toFixed(0)}%</p>
            <p className="text-xs text-gray-500 capitalize">{quality.factors.humidity}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

