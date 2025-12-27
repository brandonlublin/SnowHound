import { useEffect, useState } from 'react';
import { Rss, ExternalLink, RefreshCw } from 'lucide-react';
import { RSSItem } from '../types/weather';
import { RSSService, WEATHER_RSS_FEEDS } from '../services/rssService';
import { format, parseISO } from 'date-fns';

export default function RSSFeed() {
  const [items, setItems] = useState<Map<string, RSSItem[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [expandedFeed, setExpandedFeed] = useState<string | null>(null);

  const loadFeeds = async () => {
    setLoading(true);
    try {
      const feedData = await RSSService.fetchAllFeeds();
      setItems(feedData);
    } catch (error) {
      console.error('Error loading RSS feeds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeeds();
    // Refresh every 30 minutes
    const interval = setInterval(loadFeeds, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Rss className="w-5 h-5" />
          Weather Updates & Alerts
        </h3>
        <button
          onClick={loadFeeds}
          disabled={loading}
          className="p-2 glass rounded-lg hover:bg-white/20 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && items.size === 0 ? (
        <div className="text-center py-8 text-gray-400">Loading weather updates...</div>
      ) : (
        <div className="space-y-4">
          {WEATHER_RSS_FEEDS.map((feed) => {
            const feedItems = items.get(feed.id) || [];
            const isExpanded = expandedFeed === feed.id;
            const displayItems = isExpanded ? feedItems : feedItems.slice(0, 3);
            const hasItems = feedItems.length > 0;

            return (
              <div key={feed.id} className="border-b border-white/10 pb-4 last:border-0">
                <button
                  onClick={() => setExpandedFeed(isExpanded ? null : feed.id)}
                  className="w-full text-left mb-2"
                >
                  <h4 className="font-semibold text-lg hover:text-blue-400 transition-colors">
                    {feed.name}
                  </h4>
                  <p className="text-sm text-gray-400">{feed.description}</p>
                </button>
                {!hasItems && !loading ? (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-400">
                      RSS feeds are currently unavailable
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      RSS feeds require a backend proxy to bypass CORS restrictions. Free proxy services are often rate-limited or unavailable.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      For production use, set up a backend proxy or use a paid RSS service.
                    </p>
                  </div>
                ) : hasItems ? (
                  <div className="mt-3 space-y-2">
                    {displayItems.map((item) => (
                      <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block p-3 glass rounded-lg hover:bg-white/10 transition-colors group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h5 className="font-medium group-hover:text-blue-400 transition-colors line-clamp-2">
                              {item.title}
                            </h5>
                            {item.description && (
                              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                                {item.description.replace(/<[^>]*>/g, '').substring(0, 150)}...
                              </p>
                            )}
                            <p className="text-xs text-gray-500 mt-2">
                              {item.pubDate && format(parseISO(item.pubDate), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-400 flex-shrink-0 mt-1" />
                        </div>
                      </a>
                    ))}
                    {feedItems.length > 3 && (
                      <button
                        onClick={() => setExpandedFeed(isExpanded ? null : feed.id)}
                        className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                      >
                        {isExpanded ? 'Show less' : `Show ${feedItems.length - 3} more`}
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

