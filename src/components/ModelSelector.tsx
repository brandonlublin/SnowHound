import { Check } from 'lucide-react';
import { WEATHER_MODELS } from '../services/weatherModels';
import { getApiKeyStatus } from '../config/env';

interface ModelSelectorProps {
  selectedModels: string[];
  onToggleModel: (modelId: string) => void;
  maxSelection?: number;
}

export default function ModelSelector({ selectedModels, onToggleModel, maxSelection = 5 }: ModelSelectorProps) {
  const apiStatus = getApiKeyStatus();
  
  // Determine if a model will use mock data
  const willUseMock = (modelId: string): boolean => {
    switch (modelId) {
      case 'gfs':
      case 'nam':
      case 'hrrr':
        return false; // NWS doesn't need API key
      case 'ecmwf':
      case 'ukmet':
      case 'gem':
      case 'jma':
        return !apiStatus.openWeather;
      default:
        return !apiStatus.weatherAPI;
    }
  };
  
  const handleToggle = (modelId: string) => {
    if (selectedModels.includes(modelId)) {
      onToggleModel(modelId);
    } else if (selectedModels.length < maxSelection) {
      onToggleModel(modelId);
    }
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Select Weather Models ({selectedModels.length}/{maxSelection})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {WEATHER_MODELS.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const isDisabled = !isSelected && selectedModels.length >= maxSelection;
          
          return (
            <button
              key={model.id}
              onClick={() => handleToggle(model.id)}
              onTouchStart={(e) => {
                if (!isDisabled) {
                  e.preventDefault();
                  handleToggle(model.id);
                }
              }}
              disabled={isDisabled}
              className={`
                relative p-3 md:p-4 rounded-lg border-2 transition-all text-left touch-target active:scale-95
                ${isSelected
                  ? 'border-blue-400 bg-blue-400/20 active:bg-blue-400/30'
                  : isDisabled
                  ? 'border-gray-600 bg-gray-800/20 opacity-50 cursor-not-allowed'
                  : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10 active:bg-white/20'
                }
              `}
            >
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <Check className="w-5 h-5 text-blue-400" />
                </div>
              )}
              <div className="pr-6">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-lg">{model.name}</h4>
                  {willUseMock(model.id) && (
                    <span className="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
                      Mock
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 mb-2">{model.provider}</p>
                <p className="text-xs text-gray-500">{model.description}</p>
              </div>
            </button>
          );
        })}
      </div>
      {selectedModels.length === 0 && (
        <p className="mt-4 text-sm text-yellow-400">Select at least one model to view forecasts</p>
      )}
    </div>
  );
}

