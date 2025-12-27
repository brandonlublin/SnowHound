import { BarChart3, Table, LineChart } from 'lucide-react';
import { ForecastData } from '../types/weather';
import GraphView from './GraphView';
import TableView from './TableView';
import ChartView from './ChartView';
import DataStatusIndicator from './DataStatusIndicator';

interface ComparisonViewProps {
  forecasts: ForecastData[];
  viewType: 'graph' | 'table' | 'chart';
  onViewTypeChange: (type: 'graph' | 'table' | 'chart') => void;
  onHideModel?: (modelId: string) => void;
}

export default function ComparisonView({ forecasts, viewType, onViewTypeChange, onHideModel }: ComparisonViewProps) {
  if (forecasts.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-400">No forecasts to display. Select models and a location to get started.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => onViewTypeChange('graph')}
            onTouchStart={(e) => {
              e.preventDefault();
              onViewTypeChange('graph');
            }}
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 touch-target active:scale-95 ${
              viewType === 'graph'
                ? 'bg-blue-500 text-white'
                : 'glass hover:bg-white/20 active:bg-white/30'
            }`}
            aria-label="Graph view"
          >
            <LineChart className="w-4 h-4" />
            <span className="hidden sm:inline">Graph</span>
          </button>
          <button
            onClick={() => onViewTypeChange('table')}
            onTouchStart={(e) => {
              e.preventDefault();
              onViewTypeChange('table');
            }}
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 touch-target active:scale-95 ${
              viewType === 'table'
                ? 'bg-blue-500 text-white'
                : 'glass hover:bg-white/20 active:bg-white/30'
            }`}
            aria-label="Table view"
          >
            <Table className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button
            onClick={() => onViewTypeChange('chart')}
            onTouchStart={(e) => {
              e.preventDefault();
              onViewTypeChange('chart');
            }}
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 touch-target active:scale-95 ${
              viewType === 'chart'
                ? 'bg-blue-500 text-white'
                : 'glass hover:bg-white/20 active:bg-white/30'
            }`}
            aria-label="Chart view"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden sm:inline">Chart</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="text-xs sm:text-sm text-gray-400">
            Comparing {forecasts.length} model{forecasts.length !== 1 ? 's' : ''}
          </div>
          <div className="flex gap-2 flex-wrap">
            {forecasts.map((forecast) => (
              <DataStatusIndicator
                key={forecast.model}
                isMock={forecast.isMock ?? false}
                provider={forecast.provider}
                compact
                onHide={forecast.isMock && onHideModel ? () => onHideModel(forecast.model) : undefined}
                modelName={forecast.model}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        {viewType === 'graph' && <GraphView forecasts={forecasts} />}
        {viewType === 'table' && <TableView forecasts={forecasts} onHideModel={onHideModel} />}
        {viewType === 'chart' && <ChartView forecasts={forecasts} />}
      </div>
    </div>
  );
}

