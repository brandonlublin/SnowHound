import { AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ModelConfidence } from '../utils/modelConfidence';

interface ModelConfidenceIndicatorProps {
  confidence: ModelConfidence;
  showDetails?: boolean;
}

export default function ModelConfidenceIndicator({ 
  confidence, 
  showDetails = false 
}: ModelConfidenceIndicatorProps) {
  const getConfidenceColor = () => {
    switch (confidence.agreement) {
      case 'high':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'low':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
    }
  };

  const getConfidenceIcon = () => {
    switch (confidence.agreement) {
      case 'high':
        return <CheckCircle2 className="w-3 h-3" />;
      case 'medium':
        return <AlertTriangle className="w-3 h-3" />;
      case 'low':
        return <AlertCircle className="w-3 h-3" />;
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs border ${getConfidenceColor()}`}
        title={`${confidence.confidence.toFixed(0)}% confidence - ${confidence.agreement} agreement`}
      >
        {getConfidenceIcon()}
        <span>{confidence.confidence.toFixed(0)}%</span>
      </span>
      {showDetails && (
        <span className="text-xs text-gray-400">
          {confidence.agreement === 'high' && 'Models agree'}
          {confidence.agreement === 'medium' && 'Some variance'}
          {confidence.agreement === 'low' && 'High variance'}
        </span>
      )}
    </div>
  );
}

