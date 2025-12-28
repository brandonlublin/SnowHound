// IMPORTANT: Load environment variables FIRST, before any other imports
// This ensures env vars are available when other modules are loaded
import dotenv from 'dotenv';
import path from 'path';

// Load .env from server directory
// Try current working directory first (for dev with ts-node)
const envPath = path.resolve(process.cwd(), '.env');
const result = dotenv.config({ path: envPath });

if (result.error && process.env.NODE_ENV !== 'production') {
  console.warn(`⚠️  Could not load .env from ${envPath}: ${result.error.message}`);
}

// Fallback: try relative to compiled location (for production)
if (!process.env.OPENWEATHER_API_KEY) {
  const fallbackPath = path.resolve(__dirname, '../.env');
  const fallbackResult = dotenv.config({ path: fallbackPath });
  if (fallbackResult.error && process.env.NODE_ENV !== 'production') {
    console.warn(`⚠️  Could not load .env from ${fallbackPath}: ${fallbackResult.error.message}`);
  }
}

// Final fallback: default location (current directory)
if (!process.env.OPENWEATHER_API_KEY) {
  dotenv.config();
}

// Now import other modules (they can safely use process.env)
import express from 'express';
import cors from 'cors';
import { connectDB } from './utils/database';
import weatherRoutes from './routes/weather';
import rssRoutes from './routes/rss';

// Debug: Log environment variable status (without exposing keys)
console.log('🔧 Environment check:');
console.log(`   OPENWEATHER_API_KEY: ${process.env.OPENWEATHER_API_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   WEATHERAPI_KEY: ${process.env.WEATHERAPI_KEY ? '✅ Set' : '❌ Not set'}`);
console.log(`   MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Root route
app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    service: 'SnowHound API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      weather: '/api/weather/forecast',
      geocode: '/api/weather/geocode',
      rss: '/api/rss/feed'
    }
  });
});

// Health check
app.get('/health', (req: express.Request, res: express.Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/weather', weatherRoutes);
app.use('/api/rss', rssRoutes);

// Start server (MongoDB connection is optional for basic functionality)
const startServer = async () => {
  try {
    await connectDB();
    console.log(`📊 MongoDB connected`);
  } catch (error) {
    console.warn('⚠️  MongoDB connection failed. Server will continue without caching.');
    console.warn('   Make sure MongoDB is running or set MONGODB_URI in .env');
  }
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    
    // Check API keys
    if (!process.env.OPENWEATHER_API_KEY && !process.env.WEATHERAPI_KEY) {
      console.warn('⚠️  No weather API keys configured. Some models may not work.');
    }
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default app;

