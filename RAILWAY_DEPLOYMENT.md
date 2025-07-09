# Railway Deployment Guide for Coin Feedly

## Quick Deploy to Railway

### 1. Connect Your Repository
- Go to [Railway](https://railway.app)
- Click "New Project" → "Deploy from GitHub repo"
- Select your `coinfeedly-finance` repository

### 2. Set Environment Variables
In Railway dashboard, add these variables:
- `DATABASE_URL` - Railway will auto-generate this when you add PostgreSQL
- `GEMINI_API_KEY` - Your Google Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### 3. Add PostgreSQL Database
- In Railway dashboard, click "New" → "Database" → "PostgreSQL"
- This automatically creates DATABASE_URL environment variable

### 4. Deploy
- Railway will automatically detect the build configuration
- Deployment takes 2-3 minutes
- Your app will be available at: `your-project-name.up.railway.app`

## What Happens During Deployment

### Build Process
1. `npm install` - Installs all dependencies
2. `vite build` - Builds frontend assets
3. `node build-server.js` - Creates optimized server bundle
4. Creates `dist/index.js` with Railway-compatible paths

### Database Setup
- Automatically creates all required tables:
  - `users` - User authentication
  - `articles` - Financial news articles
  - `market_data` - Real-time market information
  - `news_events` - RSS feed events
- Sets up database indexes for performance
- Seeds sample data if database is empty

### Features Available After Deploy
- Real-time financial news articles
- Market data ticker
- Category-based news browsing
- AI-generated content with Google Gemini
- Responsive design for mobile/desktop
- Automatic news updates from RSS feeds

## Configuration Files

### `railway.json`
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### `nixpacks.toml`
```toml
[variables]
NODE_ENV = "production"

[phases.build]
cmds = ["npm install", "npm run build"]

[phases.start]
cmd = "npm start"
```

### `Procfile`
```
web: NODE_ENV=production node dist/index.js
```

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is set correctly
- Check PostgreSQL service is running in Railway
- Review deploy logs for connection errors

### Build Failures
- Check if all dependencies are in package.json
- Verify Node.js version compatibility
- Review build logs for specific errors

### Runtime Errors
- Check if GEMINI_API_KEY is valid
- Verify all environment variables are set
- Monitor application logs in Railway dashboard

## API Key Setup

### Google Gemini API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add as `GEMINI_API_KEY` environment variable in Railway
4. Used for AI article generation and sentiment analysis

## Performance Optimization

### Database
- Connection pooling with 20 max connections
- Automatic reconnection on failures
- Indexed columns for fast queries

### Server
- Bundled with esbuild for minimal size
- Static file serving for frontend assets
- Gzip compression enabled

### Frontend
- Optimized build with Vite
- Code splitting for faster loading
- Responsive design for all devices

## Monitoring

### Railway Dashboard
- View real-time logs
- Monitor resource usage
- Track deployment history

### Application Health
- Automatic restart on failures
- Health check endpoints
- Error logging and reporting

## Security

### Database
- SSL connections enforced
- Parameterized queries prevent SQL injection
- Connection timeout limits

### API
- Rate limiting on endpoints
- Input validation with Zod schemas
- CORS configuration for frontend

## Scaling

### Horizontal Scaling
Railway automatically handles:
- Load balancing
- Auto-scaling based on traffic
- Zero-downtime deployments

### Database Scaling
- Connection pooling optimized for Railway
- Query optimization with indexes
- Automatic failover support

## Support

If you encounter issues:
1. Check Railway deployment logs
2. Verify environment variables are set
3. Review this documentation
4. Check GitHub Issues for known problems

Your Coin Feedly deployment should be live within 5 minutes of connecting to Railway!