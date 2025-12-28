# Deploy Backend to Render

## Step-by-Step Guide

### 1. Sign Up / Log In
- Go to [render.com](https://render.com)
- Sign up with GitHub (recommended) or email

### 2. Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository: `brandonlublin/SnowHound`

### 3. Configure the Service

**Basic Settings:**
- **Name**: `snowhound-api` (or any name you like)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main`
- **Root Directory**: `server` ⚠️ **Important: Set this to `server`**
- **Runtime**: `Node`
- **Build Command**: `npm install --production=false && npm run build`
  - ⚠️ **Important**: Use `--production=false` to ensure TypeScript types (devDependencies) are installed during build
- **Start Command**: `npm start`

**Environment Variables:**
Click "Add Environment Variable" and add these:

```
NODE_ENV=production
PORT=10000
FRONTEND_URL=https://snowhound.me
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/snowhound
OPENWEATHER_API_KEY=your_openweather_api_key_here
WEATHERAPI_KEY=your_weatherapi_key_here
```

**Important Notes:**
- `PORT=10000` - Render uses port from `PORT` env var or defaults to 10000
- `MONGODB_URI` - Your MongoDB Atlas connection string
- Replace `your_openweather_api_key_here` with your actual API key
- Replace `your_weatherapi_key_here` with your actual API key
- ⚠️ **Do NOT set `NODE_ENV=production` before the build** - TypeScript types are in devDependencies and need to be installed during build

### 4. Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait 2-5 minutes for deployment to complete
4. You'll get a URL like: `https://snowhound-api.onrender.com`

### 5. Update Frontend

Once deployed, you'll get a backend URL. Update your GitHub Actions workflow:

1. Go to your GitHub repo → `.github/workflows/deploy.yml`
2. Update the `VITE_API_BASE_URL` to your Render backend URL
3. Set `VITE_USE_BACKEND: 'true'`
4. Commit and push

### 6. Test

1. Visit your backend health endpoint: `https://your-backend-url.onrender.com/health`
2. Should return: `{"status":"ok","timestamp":"..."}`
3. If it works, your frontend can now use it!

## Render Free Tier Notes

- ✅ **Free forever** (not a trial)
- ⚠️ Services spin down after 15 min inactivity (first request may be slow)
- ✅ Free SSL included
- ✅ Good for low-to-medium traffic

## Troubleshooting

**Build fails:**
- Check that Root Directory is set to `server`
- Verify Build Command: `npm install && npm run build`
- Check logs in Render dashboard

**Service won't start:**
- Verify Start Command: `npm start`
- Check that `PORT` env var is set to `10000`
- Check logs in Render dashboard

**Can't connect from frontend:**
- Verify `FRONTEND_URL` is set to `https://snowhound.me`
- Check CORS settings in backend
- Make sure backend is deployed and running

## Next Steps

After backend is deployed:
1. Copy your backend URL (e.g., `https://snowhound-api.onrender.com`)
2. Update `.github/workflows/deploy.yml` with that URL
3. Set `VITE_USE_BACKEND: 'true'`
4. Push changes
5. Your frontend will now use the backend!

