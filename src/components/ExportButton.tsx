import { Download, Share2, FileJson, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';
import { Location } from '../types/weather';
import { ForecastData } from '../types/weather';
import { exportAsJSON, exportAsCSV, generateForecastCard } from '../utils/exportUtils';
import { generateShareUrl, shareContent } from '../utils/shareUtils';

interface ExportButtonProps {
  location: Location;
  forecasts: ForecastData[];
  selectedModels: string[];
}

export default function ExportButton({ location, forecasts, selectedModels }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleExportJSON = () => {
    try {
      exportAsJSON(location, forecasts);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleExportCSV = () => {
    try {
      exportAsCSV(location, forecasts);
      setIsOpen(false);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const handleShare = async () => {
    setExporting(true);
    try {
      const shareUrl = generateShareUrl(location, selectedModels);
      const card = generateForecastCard(location, forecasts, selectedModels);
      
      await shareContent(
        card.title,
        card.description,
        shareUrl
      );
    } catch (error) {
      console.error('Share failed:', error);
    } finally {
      setExporting(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 md:px-4 py-2 glass hover:bg-white/20 active:bg-white/30 rounded-lg transition-colors touch-target"
        aria-label="Export or share forecast"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline text-sm">Export</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-xl z-[101] border border-white/20">
            <div className="p-2 space-y-1">
              <button
                onClick={handleShare}
                disabled={exporting}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-left touch-target"
              >
                <Share2 className="w-4 h-4" />
                <span className="text-sm">Share Link</span>
              </button>
              <button
                onClick={handleExportJSON}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-left touch-target"
              >
                <FileJson className="w-4 h-4" />
                <span className="text-sm">Export JSON</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 active:bg-white/20 transition-colors text-left touch-target"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="text-sm">Export CSV</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

