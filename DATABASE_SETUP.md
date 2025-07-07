# Database Setup for Railway Deployment

## Automatic Database Creation

The application automatically creates all necessary database tables when it starts up. No manual SQL commands are required.

### What happens on startup:

1. **Migration Check**: The app checks if tables exist
2. **Table Creation**: Creates all required tables if they don't exist:
   - `users` - User authentication
   - `news_events` - Raw news data from RSS feeds
   - `articles` - AI-generated articles with content
   - `market_data` - Real-time market information

3. **Data Seeding**: If no articles exist, creates sample data:
   - 3 initial featured articles
   - Sample market data for major stocks and crypto
   - Proper foreign key relationships

### Environment Variables Required:

For Railway deployment, ensure these environment variables are set:

```
DATABASE_URL=postgresql://username:password@hostname:port/database
GEMINI_API_KEY=your_google_gemini_api_key
GOOGLE_API_KEY=your_google_api_key (fallback)
```

### Deployment Process:

1. **Build Phase**: 
   - Frontend: Vite builds optimized React app
   - Backend: ESBuild bundles Node.js server

2. **Start Phase**:
   - Database migrations run automatically
   - Sample data is seeded if needed
   - RSS feeds start fetching real news
   - WebSocket server starts for live updates

### Features:

- **Zero Configuration**: No manual database setup required
- **Auto-scaling**: Tables created on-demand
- **Real Data**: RSS feeds from BBC, Reuters, CoinTelegraph
- **AI Content**: Google Gemini generates article content
- **Live Updates**: WebSocket real-time market data

The application is fully self-contained and will work immediately after deployment to Railway with just the environment variables configured.