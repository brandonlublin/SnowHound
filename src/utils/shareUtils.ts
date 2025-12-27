import { Location } from '../types/weather';

/**
 * Generates a shareable URL with location and model parameters
 */
export function generateShareUrl(
  location: Location | null,
  selectedModels?: string[],
  date?: string
): string {
  const baseUrl = window.location.origin;
  const params = new URLSearchParams();
  
  if (location) {
    params.set('lat', location.lat.toString());
    params.set('lon', location.lon.toString());
    params.set('name', location.name);
  }
  
  if (selectedModels && selectedModels.length > 0) {
    params.set('models', selectedModels.join(','));
  }
  
  if (date) {
    params.set('date', date);
  }
  
  return `${baseUrl}${params.toString() ? `?${params.toString()}` : ''}`;
}

/**
 * Copies text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Attempts to use native share API, falls back to copying to clipboard
 */
export async function shareContent(
  title: string,
  text: string,
  url: string
): Promise<'shared' | 'copied' | 'failed'> {
  // Try native share API first (mobile)
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url
      });
      return 'shared';
    } catch (err: any) {
      // User cancelled or share failed, fall through to copy
      if (err.name === 'AbortError') {
        return 'failed'; // User cancelled
      }
    }
  }

  // Fallback: Copy to clipboard
  const success = await copyToClipboard(url);
  return success ? 'copied' : 'failed';
}

