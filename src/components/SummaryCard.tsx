import { Snowflake, Thermometer, Wind, Droplets } from 'lucide-react';
import { ForecastData } from '../types/weather';
import { calculateSnowQuality } from '../utils/snowQuality';
import SnowQualityIndicator from './SnowQualityIndicator';

interface SummaryCardProps {
  forecasts: ForecastData[];
}

export default function SummaryCard({ forecasts }: SummaryCardProps) {
  if (forecasts.length === 0) {
    return null;
  }

  // Calculate averages across all models
  const allData = forecasts.flatMap(f => f.data);
  const totalSnowfall = allData.reduce((sum, d) => sum + d.snowfall, 0) / forecasts.length;
  const avgTemperature = allData.reduce((sum, d) => sum + d.temperature, 0) / allData.length;
  const avgWindSpeed = allData.reduce((sum, d) => sum + d.windSpeed, 0) / allData.length;
  const avgHumidity = allData.reduce((sum, d) => sum + d.humidity, 0) / allData.length;
  
  const maxSnowfall = Math.max(...forecasts.map(f => 
    Math.max(...f.data.map(d => d.snowfall))
  ));
  
  const nextSnowfall = forecasts[0]?.data[0]?.snowfall || 0;
  const snowQuality = calculateSnowQuality(forecasts, 0);

  return (
    <div className="space-y-4">
      {snowQuality && (
        <SnowQualityIndicator quality={snowQuality} />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Snowflake className="w-6 h-6 text-blue-400" />
            <h4 className="font-semibold">Next 24h</h4>
          </div>
          <p className="text-3xl font-bold text-blue-400">{nextSnowfall.toFixed(1)}"</p>
          <p className="text-sm text-gray-400 mt-1">Expected snowfall</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Snowflake className="w-6 h-6 text-cyan-400" />
            <h4 className="font-semibold">7-Day Total</h4>
          </div>
          <p className="text-3xl font-bold text-cyan-400">{totalSnowfall.toFixed(1)}"</p>
          <p className="text-sm text-gray-400 mt-1">Average across models</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Snowflake className="w-6 h-6 text-purple-400" />
            <h4 className="font-semibold">Peak Day</h4>
          </div>
          <p className="text-3xl font-bold text-purple-400">{maxSnowfall.toFixed(1)}"</p>
          <p className="text-sm text-gray-400 mt-1">Maximum forecast</p>
        </div>

        <div className="card">
          <div className="flex items-center gap-3 mb-2">
            <Thermometer className="w-6 h-6 text-orange-400" />
            <h4 className="font-semibold">Conditions</h4>
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold">{avgTemperature.toFixed(0)}°F</p>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <div className="flex items-center gap-1">
                <Wind className="w-4 h-4" />
                {avgWindSpeed.toFixed(0)} mph
              </div>
              <div className="flex items-center gap-1">
                <Droplets className="w-4 h-4" />
                {avgHumidity.toFixed(0)}%
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
