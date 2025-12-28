import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Snowflake, Calendar, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { ForecastData, Location } from '../types/weather';
import { format, parseISO } from 'date-fns';
import { calculateSnowDepth, getSeasonTotal } from '../utils/snowDepthTracking';

interface FiveDayForecastProps {
  forecasts: ForecastData[];
  location?: Location;
}

export default function FiveDayForecast({ forecasts, location }: FiveDayForecastProps) {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(true);
  const [seasonTotal, setSeasonTotal] = useState<number | null>(null);

  useEffect(() => {
    if (location) {
      const total = getSeasonTotal(location);
      setSeasonTotal(total);
      
      // Calculate and save depth data
      calculateSnowDepth(location, forecasts);
    }
  }, [location, forecasts]);
  if (forecasts.length === 0) {
    return null;
  }

  // Get next 7 days of data
  const days = forecasts[0]?.data.slice(0, 7) || [];
  
  // Calculate average snowfall for each day across all models
  const dailyAverages = days.map((_, dayIndex) => {
    const daySnowfall = forecasts.map(forecast => {
      const dayData = forecast.data[dayIndex];
      return dayData ? dayData.snowfall : 0;
    });
    
    const avg = daySnowfall.reduce((sum, val) => sum + val, 0) / daySnowfall.length;
    const max = Math.max(...daySnowfall);
    const min = Math.min(...daySnowfall);
    
    return {
      date: days[dayIndex]?.timestamp || '',
      avg: avg,
      max: max,
      min: min
    };
  });

  const total5Day = dailyAverages.reduce((sum, day) => sum + day.avg, 0);

  return (
    <div className="card">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between gap-3 mb-4 hover:opacity-80 transition-opacity touch-target"
        aria-label={isExpanded ? 'Collapse forecast' : 'Expand forecast'}
      >
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 md:w-6 md:h-6 text-blue-400 flex-shrink-0" />
          <h3 className="text-lg md:text-xl font-semibold text-left">Next 7 Days Expected Snowfall</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-400 flex-shrink-0" />
        )}
      </button>

      {isExpanded && (
        <>
          <div className="mb-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-baseline gap-2 flex-wrap">
              <Snowflake className="w-5 h-5 text-blue-400" />
              <span className="text-3xl font-bold text-blue-400">{total5Day.toFixed(1)}"</span>
              <span className="text-gray-400">total expected</span>
              {seasonTotal !== null && seasonTotal > 0 && (
                <div className="flex items-center gap-1 ml-auto text-sm text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Season: {seasonTotal.toFixed(1)}"</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
        {dailyAverages.map((day, index) => {
          const date = parseISO(day.date);
          const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          return (
            <div
              key={index}
              onClick={() => {
                // Save location and models to localStorage for the hourly page
                const location = forecasts[0]?.location;
                const models = forecasts.map(f => {
                  // Find model ID from model name
                  const modelMap: Record<string, string> = {
                    'GFS': 'gfs',
                    'ECMWF': 'ecmwf',
                    'NAM': 'nam',
                    'HRRR': 'hrrr',
                    'UKMET': 'ukmet',
                    'GEM': 'gem',
                    'JMA': 'jma'
                  };
                  return modelMap[f.model] || f.model.toLowerCase();
                });
                
                if (location) {
                  localStorage.setItem('snowhound-location', JSON.stringify(location));
                  localStorage.setItem('snowhound-models', JSON.stringify(models));
                }
                
                // Navigate to hourly forecast page
                navigate(`/hourly/${encodeURIComponent(day.date)}`);
              }}
              onTouchStart={(e) => {
                e.preventDefault();
                const location = forecasts[0]?.location;
                const models = forecasts.map(f => {
                  const modelMap: Record<string, string> = {
                    'GFS': 'gfs',
                    'ECMWF': 'ecmwf',
                    'NAM': 'nam',
                    'HRRR': 'hrrr',
                    'UKMET': 'ukmet',
                    'GEM': 'gem',
                    'JMA': 'jma'
                  };
                  return modelMap[f.model] || f.model.toLowerCase();
                });
                
                if (location) {
                  localStorage.setItem('snowhound-location', JSON.stringify(location));
                  localStorage.setItem('snowhound-models', JSON.stringify(models));
                }
                
                navigate(`/hourly/${encodeURIComponent(day.date)}`);
              }}
              className="flex items-center justify-between p-3 md:p-4 glass rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors cursor-pointer touch-target active:scale-[0.98]"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className="w-16 text-left">
                  <p className="text-sm font-medium">
                    {isToday ? 'Today' : format(date, 'EEE')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {format(date, 'MMM d')}
                  </p>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl font-bold text-blue-400">
                      {day.avg.toFixed(1)}"
                    </span>
                    <span className="text-sm text-gray-400">avg</span>
                  </div>
                  {day.max !== day.min && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>Range: {day.min.toFixed(1)}" - {day.max.toFixed(1)}"</span>
                    </div>
                  )}
                </div>

                {/* Visual bar representation */}
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min((day.avg / Math.max(...dailyAverages.map(d => d.avg))) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
          </div>
        </>
      )}
    </div>
  );
}

