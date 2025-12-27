import express, { Request, Response } from 'express';
import axios from 'axios';
import { apiLimiter } from '../middleware/rateLimiter';

const router = express.Router();

// Apply rate limiting
router.use(apiLimiter);

const RSS_PROXY_API_KEY = process.env.RSS_PROXY_API_KEY || 'demo';
const RSS_PROXY_URL = process.env.RSS_PROXY_URL || 'https://api.rss2json.com/v1/api.json';

router.get('/feed', async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    
    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'URL parameter is required' });
    }
    
    // Validate URL
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format' });
    }
    
    // Fetch RSS feed through proxy
    const proxyUrl = `${RSS_PROXY_URL}?rss_url=${encodeURIComponent(url)}${RSS_PROXY_API_KEY ? `&api_key=${RSS_PROXY_API_KEY}` : ''}`;
    
    const response = await axios.get(proxyUrl, {
      timeout: 10000,
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.data.items && Array.isArray(response.data.items)) {
      res.json({
        items: response.data.items.slice(0, 10), // Limit to 10 items
        feed: response.data.feed || {}
      });
    } else {
      res.status(500).json({ error: 'Invalid RSS feed format' });
    }
  } catch (error: any) {
    console.error('RSS fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch RSS feed' });
  }
});

export default router;

