import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ForecastData } from '../types/weather';
import { format, parseISO } from 'date-fns';

interface GraphViewProps {
  forecasts: ForecastData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function GraphView({ forecasts }: GraphViewProps) {
  // Transform data for Recharts
  const chartData = forecasts[0]?.data.map((_, index) => {
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
    <div className="space-y-6">
      <h3 className="text-xl font-semibold">Snowfall Forecast Comparison</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            label={{ value: 'Snowfall (inches)', angle: -90, position: 'insideLeft', style: { fill: '#9ca3af' } }}
            style={{ fontSize: '12px' }}
          />
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
            <Line
              key={forecast.model}
              type="monotone"
              dataKey={forecast.model}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

