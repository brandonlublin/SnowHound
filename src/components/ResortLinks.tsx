import { Camera, Map, ExternalLink } from 'lucide-react';
import { Location } from '../types/weather';
import { ResortService } from '../services/resortService';

interface ResortLinksProps {
  location: Location;
}

export default function ResortLinks({ location }: ResortLinksProps) {
  const resortInfo = ResortService.getResortInfo(location);

  if (!resortInfo) {
    return null;
  }

  return (
    <div className="card mt-4" role="region" aria-label="Resort information and links">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Map className="w-5 h-5 text-blue-400" aria-hidden="true" />
        Resort Information
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="list">
        {resortInfo.webcams && resortInfo.webcams.length > 0 && (
          <a
            href={resortInfo.webcams[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary justify-start"
            role="listitem"
            aria-label="View resort webcams (opens in new tab)"
          >
            <Camera className="w-4 h-4" aria-hidden="true" />
            <span>Webcams</span>
            <ExternalLink className="w-3 h-3 ml-auto" aria-hidden="true" />
          </a>
        )}
        {resortInfo.trailConditionsUrl && (
          <a
            href={resortInfo.trailConditionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary justify-start"
            role="listitem"
            aria-label="View trail conditions (opens in new tab)"
          >
            <Map className="w-4 h-4" aria-hidden="true" />
            <span>Trail Conditions</span>
            <ExternalLink className="w-3 h-3 ml-auto" aria-hidden="true" />
          </a>
        )}
        {resortInfo.liftStatusUrl && (
          <a
            href={resortInfo.liftStatusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary justify-start"
            role="listitem"
            aria-label="View lift status (opens in new tab)"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <span>Lift Status</span>
            <ExternalLink className="w-3 h-3 ml-auto" aria-hidden="true" />
          </a>
        )}
        {resortInfo.website && (
          <a
            href={resortInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary justify-start"
            role="listitem"
            aria-label="Visit official resort website (opens in new tab)"
          >
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            <span>Official Website</span>
            <ExternalLink className="w-3 h-3 ml-auto" aria-hidden="true" />
          </a>
        )}
      </div>
    </div>
  );
}

