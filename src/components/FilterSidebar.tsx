import { X, Check } from 'lucide-react';
import { WEATHER_MODELS } from '../services/weatherModels';
import { getApiKeyStatus } from '../config/env';

interface FilterSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModels: string[];
  onToggleModel: (modelId: string) => void;
  maxSelection?: number;
}

export default function FilterSidebar({
  isOpen,
  onClose,
  selectedModels,
  onToggleModel,
  maxSelection = 5
}: FilterSidebarProps) {
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
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-slate-900/95 backdrop-blur-lg border-l border-white/20 z-50
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
          safe-top safe-bottom
          overflow-y-auto
        `}
        aria-label="Model filter sidebar"
      >
        <div className="p-4 md:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Weather Models</h2>
              <p className="text-xs text-gray-400 mt-0.5">Select models to compare</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors touch-target flex-shrink-0"
              aria-label="Close filter sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Selection count */}
          <div className="mb-4 p-3 glass rounded-lg">
            <p className="text-sm text-gray-300">
              {selectedModels.length} of {maxSelection} selected
            </p>
            {selectedModels.length === 0 && (
              <p className="text-xs text-yellow-400 mt-1">Select at least one model</p>
            )}
          </div>

          {/* Model list */}
          <div className="space-y-2">
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
                    w-full relative p-3 rounded-lg border transition-all text-left touch-target active:scale-[0.98]
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
                      <Check className="w-4 h-4 text-blue-400" />
                    </div>
                  )}
                  <div className="pr-8">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm">{model.name}</h3>
                      {willUseMock(model.id) && (
                        <span className="text-[10px] px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded">
                          Mock
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mb-1">{model.provider}</p>
                    <p className="text-xs text-gray-500 line-clamp-2">{model.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

