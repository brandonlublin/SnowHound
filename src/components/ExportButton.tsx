import { Download, Share2, FileJson, FileSpreadsheet } from 'lucide-react';
import { useState, useEffect, useRef, KeyboardEvent } from 'react';
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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape as any);
      // Focus first item in dropdown
      setTimeout(() => {
        const firstButton = dropdownRef.current?.querySelector('button');
        firstButton?.focus();
      }, 0);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape as any);
    };
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, action: () => void) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      action();
    }
  };

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="btn-secondary"
        aria-label="Export or share forecast"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Download className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Export</span>
      </button>

      {isOpen && (
        <div
          ref={dropdownRef}
          role="menu"
          aria-label="Export options"
          className="absolute right-0 mt-2 w-48 glass rounded-lg shadow-xl z-[101] border border-white/20"
        >
          <div className="p-2 space-y-1">
            <button
              onClick={handleShare}
              onKeyDown={(e) => handleKeyDown(e, handleShare)}
              disabled={exporting}
              role="menuitem"
              className="w-full btn-ghost justify-start"
              aria-label="Share forecast link"
            >
              <Share2 className="w-4 h-4" aria-hidden="true" />
              <span>Share Link</span>
            </button>
            <button
              onClick={handleExportJSON}
              onKeyDown={(e) => handleKeyDown(e, handleExportJSON)}
              role="menuitem"
              className="w-full btn-ghost justify-start"
              aria-label="Export forecast as JSON file"
            >
              <FileJson className="w-4 h-4" aria-hidden="true" />
              <span>Export JSON</span>
            </button>
            <button
              onClick={handleExportCSV}
              onKeyDown={(e) => handleKeyDown(e, handleExportCSV)}
              role="menuitem"
              className="w-full btn-ghost justify-start"
              aria-label="Export forecast as CSV file"
            >
              <FileSpreadsheet className="w-4 h-4" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

