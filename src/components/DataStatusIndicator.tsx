import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { config } from '../config/env';

interface DataStatusIndicatorProps {
  isMock: boolean;
  provider: string;
  compact?: boolean;
  onHide?: () => void;
  modelName?: string;
}

export default function DataStatusIndicator({ isMock, provider, compact = false, onHide, modelName }: DataStatusIndicatorProps) {
  if (compact) {
    return (
      <span 
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
          isMock 
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30 cursor-pointer' 
            : 'bg-green-500/20 text-green-400 border border-green-500/30'
        }`}
        onClick={isMock && onHide ? (e) => {
          e.stopPropagation();
          onHide();
        } : undefined}
        title={isMock && onHide ? `Click to hide ${modelName || 'this model'}` : undefined}
      >
        {isMock ? (
          <>
            <AlertCircle className="w-3 h-3" />
            Mock
            {onHide && <X className="w-3 h-3 ml-1" />}
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3 h-3" />
            Live
          </>
        )}
      </span>
    );
  }

  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
      isMock 
        ? 'bg-yellow-500/10 border border-yellow-500/30' 
        : 'bg-green-500/10 border border-green-500/30'
    }`}>
      {isMock ? (
        <>
          <AlertCircle className="w-4 h-4 text-yellow-400" />
          <div>
            <p className="text-sm font-medium text-yellow-400">Using Mock Data</p>
            <p className="text-xs text-gray-400">
              {config.useBackend 
                ? 'Backend API unavailable - Using mock data' 
                : 'API keys not configured - Add keys in .env for real data'}
            </p>
          </div>
        </>
      ) : (
        <>
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <div>
            <p className="text-sm font-medium text-green-400">Live Data</p>
            <p className="text-xs text-gray-400">Source: {provider}</p>
          </div>
        </>
      )}
    </div>
  );
}

