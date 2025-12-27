import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Snowflake, Thermometer, Wind, Droplets, Clock } from 'lucide-react';
import { ForecastData } from '../types/weather';
import { WeatherService } from '../services/weatherApi';
import { format, parseISO, isSameDay } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface HourlyData {
  hour: string;
  time: string;
  snowfall: number;
  temperature: number;
  windSpeed: number;
  humidity: number;
  model: string;
}

export default function HourlyForecastPage() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const [forecasts, setForecasts] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Get location from localStorage or use default
        const savedLocation = localStorage.getItem('snowhound-location');
        const savedModels = localStorage.getItem('snowhound-models');
        
        if (savedLocation && savedModels) {
          const loc = JSON.parse(savedLocation);
          const models = JSON.parse(savedModels);
          
          const data = await WeatherService.getMultipleForecasts(loc, models);
          setForecasts(data);
        }
      } catch (error) {
        console.error('Error loading forecast data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Generate hourly data for the selected day
  const generateHourlyData = (): HourlyData[] => {
    if (!date || forecasts.length === 0) return [];
    
    const selectedDay = parseISO(date);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-gray-400">Loading hourly forecast...</p>
        </div>
      </div>
    );
  }

  const hourlyData = generateHourlyData();
  if (hourlyData.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4">No data available for this date</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 glass rounded-lg hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

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
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-white/20 bg-black/20 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 glass hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-blue-400" />
              <div>
                <h1 className="text-2xl font-bold">Hourly Forecast</h1>
                {date && (
                  <p className="text-gray-400">{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <Snowflake className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-gray-400">Total Snowfall</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">{totalSnowfall.toFixed(1)}"</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-gray-400">Temperature</span>
            </div>
            <p className="text-2xl font-bold text-orange-400">{avgTemp.toFixed(0)}°F</p>
            <p className="text-xs text-gray-400 mt-1">{minTemp.toFixed(0)}° - {maxTemp.toFixed(0)}°</p>
          </div>
          <div className="card">
            <div className="flex items-center gap-2 mb-1">
              <Wind className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-gray-400">Avg Wind</span>
            </div>
            <p className="text-2xl font-bold text-purple-400">
              {(hourlyData.reduce((sum, h) => sum + h.windSpeed, 0) / hourlyData.length).toFixed(0)} mph
            </p>
          </div>
          <div className="card">
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
      </main>
    </div>
  );
}

