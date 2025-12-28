import { BarChart3, Table, LineChart } from 'lucide-react';
import { KeyboardEvent } from 'react';
import { ForecastData } from '../types/weather';
import GraphView from './GraphView';
import TableView from './TableView';
import ChartView from './ChartView';
import DataStatusIndicator from './DataStatusIndicator';
import { calculateAllConfidences, getOverallConfidence } from '../utils/modelConfidence';

interface ComparisonViewProps {
  forecasts: ForecastData[];
  viewType: 'graph' | 'table' | 'chart';
  onViewTypeChange: (type: 'graph' | 'table' | 'chart') => void;
  onHideModel?: (modelId: string) => void;
}

export default function ComparisonView({ forecasts, viewType, onViewTypeChange, onHideModel }: ComparisonViewProps) {
  if (forecasts.length === 0) {
    return (
      <div className="card text-center py-12" role="status" aria-live="polite">
        <p className="text-gray-400">No forecasts to display. Select models and a location to get started.</p>
      </div>
    );
  }

  // Calculate model confidence
  const confidences = calculateAllConfidences(forecasts);
  const overallConfidence = getOverallConfidence(confidences);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, type: 'graph' | 'table' | 'chart') => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onViewTypeChange(type);
    }
  };

  return (
    <div className="space-y-4" role="region" aria-label="Forecast comparison">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-2 flex-wrap" role="tablist" aria-label="View type selection">
          <button
            onClick={() => onViewTypeChange('graph')}
            onKeyDown={(e) => handleKeyDown(e, 'graph')}
            onTouchStart={(e) => {
              e.preventDefault();
              onViewTypeChange('graph');
            }}
            role="tab"
            aria-selected={viewType === 'graph'}
            aria-controls="forecast-view"
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 touch-target active:scale-95 ${
              viewType === 'graph'
                ? 'bg-blue-500 text-white'
                : 'glass hover:bg-white/20 active:bg-white/30'
            }`}
            aria-label="Graph view"
          >
            <LineChart className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline text-sm">Graph</span>
          </button>
          <button
            onClick={() => onViewTypeChange('table')}
            onKeyDown={(e) => handleKeyDown(e, 'table')}
            onTouchStart={(e) => {
              e.preventDefault();
              onViewTypeChange('table');
            }}
            role="tab"
            aria-selected={viewType === 'table'}
            aria-controls="forecast-view"
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 touch-target active:scale-95 ${
              viewType === 'table'
                ? 'bg-blue-500 text-white'
                : 'glass hover:bg-white/20 active:bg-white/30'
            }`}
            aria-label="Table view"
          >
            <Table className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline text-sm">Table</span>
          </button>
          <button
            onClick={() => onViewTypeChange('chart')}
            onKeyDown={(e) => handleKeyDown(e, 'chart')}
            onTouchStart={(e) => {
              e.preventDefault();
              onViewTypeChange('chart');
            }}
            role="tab"
            aria-selected={viewType === 'chart'}
            aria-controls="forecast-view"
            className={`px-3 md:px-4 py-2 rounded-lg transition-colors flex items-center gap-2 touch-target active:scale-95 ${
              viewType === 'chart'
                ? 'bg-blue-500 text-white'
                : 'glass hover:bg-white/20 active:bg-white/30'
            }`}
            aria-label="Chart view"
          >
            <BarChart3 className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline text-sm">Chart</span>
          </button>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-wrap">
          <div className="text-sm text-gray-400 whitespace-nowrap">
            Comparing {forecasts.length} model{forecasts.length !== 1 ? 's' : ''}
          </div>
          {forecasts.length > 1 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Confidence:</span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${
                  overallConfidence.agreement === 'high'
                    ? 'text-green-400 bg-green-500/20 border-green-500/30'
                    : overallConfidence.agreement === 'medium'
                    ? 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
                    : 'text-red-400 bg-red-500/20 border-red-500/30'
                }`}
                title={overallConfidence.label}
              >
                {overallConfidence.score}% - {overallConfidence.label}
              </span>
            </div>
          )}
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

              <div className="card" id="forecast-view" role="tabpanel" aria-live="polite">
                {viewType === 'graph' && <GraphView forecasts={forecasts} />}
                {viewType === 'table' && <TableView forecasts={forecasts} onHideModel={onHideModel} />}
                {viewType === 'chart' && <ChartView forecasts={forecasts} />}
              </div>
    </div>
  );
}

