import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ForecastData } from '../types/weather';
import { format, parseISO } from 'date-fns';

interface ChartViewProps {
  forecasts: ForecastData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function ChartView({ forecasts }: ChartViewProps) {
  // Calculate total snowfall for each model
  const totals = forecasts.map(forecast => ({
    model: forecast.model,
    total: forecast.data.reduce((sum, d) => sum + d.snowfall, 0),
    avg: forecast.data.reduce((sum, d) => sum + d.snowfall, 0) / forecast.data.length,
    max: Math.max(...forecast.data.map(d => d.snowfall)),
    color: COLORS[forecasts.indexOf(forecast) % COLORS.length]
  }));

  // Daily comparison chart
  const dailyData = forecasts[0]?.data.map((_, index) => {
    const dataPoint: any = {
      date: format(parseISO(forecasts[0].data[index].timestamp), 'MMM d')
    };
    
    forecasts.forEach((forecast) => {
      if (forecast.data[index]) {
        dataPoint[forecast.model] = forecast.data[index].snowfall;
      }
    });
    
    return dataPoint;
  }) || [];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xl font-semibold mb-4">Total Snowfall by Model</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={totals}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="model" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" label={{ value: 'Total Snowfall (inches)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Bar dataKey="total" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-xl font-semibold mb-4">Daily Snowfall Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <YAxis stroke="#9ca3af" label={{ value: 'Snowfall (inches)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            {forecasts.map((forecast, index) => (
              <Bar
                key={forecast.model}
                dataKey={forecast.model}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {totals.map((total) => (
          <div key={total.model} className="card text-center">
            <h4 className="text-lg font-semibold mb-2">{total.model}</h4>
            <div className="space-y-1">
              <div>
                <span className="text-2xl font-bold text-blue-400">{total.total.toFixed(1)}"</span>
                <p className="text-xs text-gray-400">Total</p>
              </div>
              <div>
                <span className="text-lg font-semibold">{total.avg.toFixed(1)}"</span>
                <p className="text-xs text-gray-400">Average</p>
              </div>
              <div>
                <span className="text-lg font-semibold">{total.max.toFixed(1)}"</span>
                <p className="text-xs text-gray-400">Maximum</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

