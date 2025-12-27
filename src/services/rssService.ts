import { RSSFeed, RSSItem } from '../types/weather';
import { config } from '../config/env';
import axios from 'axios';

// Popular weather-related RSS feeds
export const WEATHER_RSS_FEEDS: RSSFeed[] = [
  {
    id: 'nws-alerts',
    name: 'NWS Weather Alerts',
    url: 'https://alerts.weather.gov/cap/us.php?x=0',
    description: 'National Weather Service alerts'
  },
  {
    id: 'weather-gov',
    name: 'NOAA Weather',
    url: 'https://www.weather.gov/rss.php',
    description: 'NOAA weather updates'
  },
  {
    id: 'weather-underground',
    name: 'Weather Underground',
    url: 'https://rss.weather.com/rss/national/rss_nwf.xml',
    description: 'Weather Underground forecasts'
  }
];

// Note: Twitter/X RSS feeds are not directly available anymore
// You would need to use Twitter API v2 (paid) or scrape (not recommended)
// For now, we'll use weather service RSS feeds

export class RSSService {
  static async fetchRSSFeed(feedUrl: string): Promise<RSSItem[]> {
    try {
      if (!config.enableRSSFeeds) {
        return [];
      }
      
      // Use backend if enabled
      if (config.useBackend) {
        try {
          const response = await axios.get(
            `${config.apiBaseUrl}/api/rss/feed`,
            {
              params: { url: feedUrl },
              timeout: config.apiTimeout
            }
          );
          
          if (response.data.items && Array.isArray(response.data.items)) {
            return response.data.items.map((item: any, index: number) => ({
              id: `${feedUrl}-${index}-${Date.now()}`,
              title: item.title || 'Untitled',
              description: item.description || item.content || item.contentSnippet || '',
              link: item.link || item.url || feedUrl,
              pubDate: item.pubDate || item.publishedDate || new Date().toISOString(),
              author: item.author || item.creator
            }));
          }
        } catch (error) {
          console.warn('Backend RSS fetch failed, falling back to direct proxy');
        }
      }
      
      // Fallback to direct proxy (if backend not enabled or failed)
      try {
        const apiKey = config.rssProxyApiKey;
        const baseUrl = config.rssProxyUrl;
        const proxyUrl = `${baseUrl}?rss_url=${encodeURIComponent(feedUrl)}${apiKey ? `&api_key=${apiKey}` : ''}`;
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(config.apiTimeout)
        });
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.items && Array.isArray(data.items)) {
            return data.items.slice(0, 10).map((item: any, index: number) => ({
              id: `${feedUrl}-${index}-${Date.now()}`,
              title: item.title || 'Untitled',
              description: item.description || item.content || item.contentSnippet || '',
              link: item.link || item.url || feedUrl,
              pubDate: item.pubDate || item.publishedDate || new Date().toISOString(),
              author: item.author || item.creator
            }));
          }
        }
      } catch (e) {
        // Silently fail - proxy services are unreliable
      }
      
      return [];
    } catch (error) {
      return [];
    }
  }
  
  static async fetchAllFeeds(): Promise<Map<string, RSSItem[]>> {
    const results = new Map<string, RSSItem[]>();
    
    for (const feed of WEATHER_RSS_FEEDS) {
      const items = await this.fetchRSSFeed(feed.url);
      results.set(feed.id, items);
    }
    
    return results;
  }
}

