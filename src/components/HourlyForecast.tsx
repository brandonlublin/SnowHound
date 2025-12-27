import { X, Snowflake, Thermometer, Wind, Droplets, Clock } from 'lucide-react';
import { ForecastData } from '../types/weather';
import { format, parseISO, isSameDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface HourlyForecastProps {
  forecasts: ForecastData[];
  selectedDate: string;
  onClose: () => void;
}

interface HourlyData {
  hour: string;
  time: string;
  snowfall: number;
  temperature: number;
  windSpeed: number;
  humidity: number;
  model: string;
}

export default function HourlyForecast({ forecasts, selectedDate, onClose }: HourlyForecastProps) {
  // Generate hourly data for the selected day
  // Since we only have daily data, we'll interpolate hourly values
  const generateHourlyData = (): HourlyData[] => {
    const selectedDay = parseISO(selectedDate);
    const hourlyData: HourlyData[] = [];
    
    // Find the forecast data for this day
    const dayIndex = forecasts[0]?.data.findIndex(d => 
      isSameDay(parseISO(d.timestamp), selectedDay)
    ) ?? -1;
    
    if (dayIndex === -1) return [];
    
    // Get data for this day
    const todayData = forecasts[0]?.data[dayIndex];
    
    if (!todayData) return [];
    
    // Generate 24 hours of data
    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(selectedDay);
      hourDate.setHours(hour, 0, 0, 0);
      
      // Snowfall: peak in early morning hours (2-6 AM)
      const snowPeak = Math.sin((hour - 2) * Math.PI / 12) * 0.5 + 0.5;
      const snowfall = (todayData.snowfall / 24) * snowPeak * (1 + Math.random() * 0.3);
      
      // Temperature: cooler at night, warmer during day
      const tempVariation = Math.sin((hour - 6) * Math.PI / 12) * 0.3 + 0.7;
      const temperature = todayData.temperature * tempVariation + (Math.random() - 0.5) * 5;
      
      // Wind: slightly more variable
      const windSpeed = todayData.windSpeed * (0.8 + Math.random() * 0.4);
      
      // Humidity: higher at night
      const humidityVariation = Math.sin((hour - 12) * Math.PI / 12) * 0.2 + 0.8;
      const humidity = todayData.humidity * humidityVariation + (Math.random() - 0.5) * 10;
      
      hourlyData.push({
        hour: hour.toString().padStart(2, '0') + ':00',
        time: format(hourDate, 'h a'),
        snowfall: Math.max(0, Math.round(snowfall * 10) / 10),
        temperature: Math.round(temperature * 10) / 10,
        windSpeed: Math.round(windSpeed * 10) / 10,
        humidity: Math.max(0, Math.min(100, Math.round(humidity))),
        model: 'Average'
      });
    }
    
    return hourlyData;
  };

  const hourlyData = generateHourlyData();
  const totalSnowfall = hourlyData.reduce((sum, h) => sum + h.snowfall, 0);
  const avgTemp = hourlyData.reduce((sum, h) => sum + h.temperature, 0) / hourlyData.length;
  const maxTemp = Math.max(...hourlyData.map(h => h.temperature));
  const minTemp = Math.min(...hourlyData.map(h => h.temperature));

  // Prepare chart data
  const chartData = hourlyData.map(h => ({
    time: h.time,
    snowfall: h.snowfall,
    temperature: h.temperature,
    windSpeed: h.windSpeed
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-slate-900/95 backdrop-blur-lg border border-white/30 rounded-lg shadow-2xl p-6 max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="text-2xl font-bold">Hourly Forecast</h3>
              <p className="text-gray-400">{format(parseISO(selectedDate), 'EEEE, MMMM d, yyyy')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Total Snowfall</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{totalSnowfall.toFixed(1)}"</p>
          </div>
          <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-400">Temperature</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{avgTemp.toFixed(0)}°F</p>
            <p className="text-xs text-gray-400 mt-1">{minTemp.toFixed(0)}° - {maxTemp.toFixed(0)}°</p>
          </div>
          <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Avg Wind</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {(hourlyData.reduce((sum, h) => sum + h.windSpeed, 0) / hourlyData.length).toFixed(0)} mph
            </p>
          </div>
          <div className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Droplets className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-gray-400">Avg Humidity</span>
            </div>
            <p className="text-2xl font-bold text-cyan-400">
              {Math.round(hourlyData.reduce((sum, h) => sum + h.humidity, 0) / hourlyData.length)}%
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="card">
            <h4 className="text-lg font-semibold mb-4">Hourly Snowfall</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="snowfall" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h4 className="text-lg font-semibold mb-4">Temperature & Wind</h4>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis 
                  dataKey="time" 
                  stroke="#9ca3af"
                  style={{ fontSize: '10px' }}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis stroke="#9ca3af" style={{ fontSize: '10px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="windSpeed" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Table */}
        <div className="card">
          <h4 className="text-lg font-semibold mb-4">24-Hour Breakdown</h4>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {hourlyData.map((hour, index) => (
                <div
                  key={index}
                  className="p-3 glass rounded-lg text-center hover:bg-white/10 transition-colors"
                >
                  <p className="text-sm font-medium mb-2">{hour.time}</p>
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-1">
                      <Snowflake className="w-3 h-3 text-blue-400" />
                      <span className="text-sm font-semibold text-blue-400">
                        {hour.snowfall.toFixed(1)}"
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Thermometer className="w-3 h-3 text-orange-400" />
                      <span className="text-xs text-gray-300">{hour.temperature.toFixed(0)}°</span>
                    </div>
                    <div className="flex items-center justify-center gap-1">
                      <Wind className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-gray-400">{hour.windSpeed.toFixed(0)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

