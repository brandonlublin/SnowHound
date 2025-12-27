import { AlertCircle, X } from 'lucide-react';
import { useState } from 'react';

interface RateLimitWarningProps {
  message?: string;
  retryAfter?: number;
}

export default function RateLimitWarning({ message, retryAfter }: RateLimitWarningProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  const defaultMessage = retryAfter
    ? `Rate limit reached. Please try again in ${retryAfter} seconds.`
    : 'Rate limit reached. Please try again later.';

  return (
    <div className="mb-4 p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-200">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Rate Limit Reached</h3>
          <p className="text-sm">{message || defaultMessage}</p>
          {retryAfter && (
            <p className="text-xs text-yellow-300 mt-2">
              Retry after: {new Date(Date.now() + retryAfter * 1000).toLocaleTimeString()}
            </p>
          )}
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-yellow-400 hover:text-yellow-300 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

