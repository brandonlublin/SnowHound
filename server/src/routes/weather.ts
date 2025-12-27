import express, { Request, Response } from 'express';
import { weatherLimiter } from '../middleware/rateLimiter';
import {
  getOpenWeatherForecast,
  getWeatherAPIForecast,
  getNWSForecast,
  geocodeLocation,
  getCachedForecast,
  cacheForecast
} from '../services/weatherService';

const router = express.Router();

// Apply rate limiting to all weather routes
router.use(weatherLimiter);

// Validate location coordinates
const validateLocation = (req: Request, res: Response, next: express.NextFunction) => {
  const { lat, lon } = req.body.location || req.query;
  
  if (lat === undefined || lon === undefined) {
    return res.status(400).json({ error: 'Location (lat, lon) is required' });
  }
  
  const latNum = parseFloat(lat);
  const lonNum = parseFloat(lon);
  
  if (isNaN(latNum) || isNaN(lonNum)) {
    return res.status(400).json({ error: 'Invalid coordinates' });
  }
  
  if (latNum < -90 || latNum > 90 || lonNum < -180 || lonNum > 180) {
    return res.status(400).json({ error: 'Coordinates out of range' });
  }
  
  req.body.location = { lat: latNum, lon: lonNum };
  next();
};

// Get forecast by provider
router.post('/forecast', validateLocation, async (req: Request, res: Response) => {
  try {
    const { location, model, provider } = req.body;
    
    if (!location || !model || !provider) {
      return res.status(400).json({ error: 'Missing required fields: location, model, provider' });
    }
    
    // Check cache first
    const cached = await getCachedForecast(location, model);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }
    
    // Fetch from appropriate API
    let data;
    switch (provider.toLowerCase()) {
      case 'openweathermap':
        data = await getOpenWeatherForecast(location);
        break;
      case 'weatherapi':
        data = await getWeatherAPIForecast(location);
        break;
      case 'nws':
      case 'national weather service':
        data = await getNWSForecast(location);
        break;
      default:
        return res.status(400).json({ error: 'Invalid provider' });
    }
    
    // Cache the result
    await cacheForecast(location, model, data);
    
    res.json({ ...data, cached: false });
  } catch (error: any) {
    console.error('Forecast error:', error);
    
    // Don't override rate limit errors
    if (error.status === 429) {
      return res.status(429).json({ 
        error: error.message || 'Too many requests',
        retryAfter: error.retryAfter
      });
    }
    
    res.status(500).json({ error: error.message || 'Failed to fetch forecast' });
  }
});

// Geocode location
router.get('/geocode', async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const results = await geocodeLocation(q);
    res.json(results);
  } catch (error: any) {
    console.error('Geocoding error:', error);
    res.status(500).json({ error: error.message || 'Failed to geocode location' });
  }
});

export default router;

