import { ForecastData } from '../types/weather';
import { format, parseISO } from 'date-fns';
import DataStatusIndicator from './DataStatusIndicator';

interface TableViewProps {
  forecasts: ForecastData[];
  onHideModel?: (modelId: string) => void;
}

export default function TableView({ forecasts, onHideModel }: TableViewProps) {
  const dates = forecasts[0]?.data.map(d => d.timestamp) || [];

  return (
    <div className="overflow-x-auto">
      <h3 className="text-lg md:text-xl font-semibold mb-4">Detailed Forecast Table</h3>
      <div className="overflow-x-auto overscroll-x-contain">
        <table className="w-full text-left min-w-[600px]">
        <thead>
          <tr className="border-b border-white/20">
            <th className="pb-3 pr-6 pl-6 w-auto text-sm md:text-base font-semibold sticky left-0 bg-slate-900/95 z-10">Date</th>
            {forecasts.map((forecast) => (
              <th key={forecast.model} className="pb-3 px-3 md:px-4 text-center min-w-[120px]">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="font-semibold text-sm md:text-base">{forecast.model}</div>
                  <div className="text-xs text-gray-400 font-normal">{forecast.provider}</div>
                  <DataStatusIndicator
                    isMock={forecast.isMock ?? false}
                    provider={forecast.provider}
                    compact
                    onHide={forecast.isMock && onHideModel ? () => onHideModel(forecast.model) : undefined}
                    modelName={forecast.model}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dates.map((date, dateIndex) => (
            <tr key={dateIndex} className="border-b border-white/10 hover:bg-white/5 active:bg-white/10 transition-colors">
              <td className="py-3 pr-6 pl-6 w-auto font-medium text-sm md:text-base sticky left-0 bg-slate-900/95 z-10 whitespace-nowrap">
                {format(parseISO(date), 'MMM d, yyyy')}
              </td>
              {forecasts.map((forecast) => {
                const dataPoint = forecast.data[dateIndex];
                return (
                  <td key={forecast.model} className="py-3 px-3 md:px-4 text-center">
                    {dataPoint ? (
                      <div className="space-y-0.5">
                        <div className="text-base md:text-lg font-semibold text-blue-400">
                          {dataPoint.snowfall.toFixed(1)}"
                        </div>
                        <div className="text-xs text-gray-400">
                          {dataPoint.temperature.toFixed(0)}°F
                        </div>
                        <div className="text-xs text-gray-500">
                          {dataPoint.windSpeed.toFixed(0)} mph
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-600">-</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}

