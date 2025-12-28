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
    <div className="card mt-4">
      <h4 className="font-semibold mb-3 flex items-center gap-2">
        <Map className="w-5 h-5 text-blue-400" />
        Resort Information
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {resortInfo.webcams && resortInfo.webcams.length > 0 && (
          <a
            href={resortInfo.webcams[0]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors group touch-target"
          >
            <Camera className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm text-gray-300 group-hover:text-blue-400 transition-colors">
              Webcams
            </span>
            <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
          </a>
        )}
        {resortInfo.trailConditionsUrl && (
          <a
            href={resortInfo.trailConditionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors group touch-target"
          >
            <Map className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm text-gray-300 group-hover:text-blue-400 transition-colors">
              Trail Conditions
            </span>
            <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
          </a>
        )}
        {resortInfo.liftStatusUrl && (
          <a
            href={resortInfo.liftStatusUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors group touch-target"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm text-gray-300 group-hover:text-blue-400 transition-colors">
              Lift Status
            </span>
            <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
          </a>
        )}
        {resortInfo.website && (
          <a
            href={resortInfo.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors group touch-target"
          >
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 transition-colors" />
            <span className="text-sm text-gray-300 group-hover:text-blue-400 transition-colors">
              Official Website
            </span>
            <ExternalLink className="w-3 h-3 text-gray-400 ml-auto" />
          </a>
        )}
      </div>
    </div>
  );
}

