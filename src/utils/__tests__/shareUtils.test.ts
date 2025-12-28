import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateShareUrl, copyToClipboard, shareContent } from '../shareUtils';
import { Location } from '../../types/weather';

describe('shareUtils', () => {
  describe('generateShareUrl', () => {
    it('should generate URL with location only', () => {
      const location: Location = {
        id: 'test',
        name: 'Test Location',
        lat: 40.7128,
        lon: -74.0060,
        type: 'search'
      };
      
      const url = generateShareUrl(location);
      expect(url).toContain('lat=40.7128');
      expect(url).toContain('lon=-74.006');
      expect(url).toContain('name=Test+Location');
    });

    it('should include selected models in URL', () => {
      const location: Location = {
        id: 'test',
        name: 'Test',
        lat: 40,
        lon: -74,
        type: 'search'
      };
      
      const url = generateShareUrl(location, ['gfs', 'ecmwf']);
      expect(url).toContain('models=gfs%2Cecmwf');
    });

    it('should handle null location', () => {
      const url = generateShareUrl(null);
      expect(url).toBeTruthy();
      expect(url).not.toContain('lat=');
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      // Mock clipboard API
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined)
        }
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should use modern clipboard API when available', async () => {
      const text = 'test text';
      const result = await copyToClipboard(text);
      
      expect(result).toBe(true);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(text);
    });

    it('should fallback to execCommand when clipboard API unavailable', async () => {
      // Remove clipboard API
      delete (navigator as any).clipboard;
      
      // Mock execCommand
      document.execCommand = vi.fn().mockReturnValue(true);
      
      const text = 'test text';
      const result = await copyToClipboard(text);
      
      expect(result).toBe(true);
      expect(document.execCommand).toHaveBeenCalledWith('copy');
    });
  });

  describe('shareContent', () => {
    beforeEach(() => {
      Object.assign(navigator, {
        share: vi.fn(),
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined)
        }
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('should use native share API when available', async () => {
      (navigator.share as any).mockResolvedValue(undefined);
      
      const result = await shareContent('Title', 'Text', 'https://example.com');
      
      expect(result).toBe('shared');
      expect(navigator.share).toHaveBeenCalledWith({
        title: 'Title',
        text: 'Text',
        url: 'https://example.com'
      });
    });

    it('should fallback to clipboard when share fails', async () => {
      (navigator.share as any).mockRejectedValue(new Error('Share failed'));
      
      const result = await shareContent('Title', 'Text', 'https://example.com');
      
      expect(result).toBe('copied');
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('https://example.com');
    });

    it('should return failed when user cancels share', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      (navigator.share as any).mockRejectedValue(abortError);
      
      const result = await shareContent('Title', 'Text', 'https://example.com');
      
      expect(result).toBe('failed');
    });
  });
});

