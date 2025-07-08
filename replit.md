# Coin Feedly - Financial News Platform

## Overview

Coin Feedly is a modern financial news platform that provides real-time market data, AI-generated articles, and comprehensive financial analysis. The application combines live market feeds with intelligent content generation to deliver timely and relevant financial news to users.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query for server state management
- **Real-time Updates**: WebSocket connection for live market data
- **Build Tool**: Vite with custom configuration

### Backend Architecture
- **Runtime**: Node.js with Express server
- **Database**: PostgreSQL with Drizzle ORM
- **Real-time Communication**: WebSocket server for live updates
- **API Design**: RESTful endpoints with structured error handling
- **Content Generation**: Google Gemini AI for article generation

### Data Storage Solutions
- **Primary Database**: PostgreSQL with Railway deployment support
- **ORM**: Drizzle with schema-first approach
- **Connection Pool**: Standard PostgreSQL connection pooling
- **Schema Management**: Automatic table creation on startup

## Key Components

### Database Schema
The application uses four main entities:
- **Users**: Basic user authentication and management
- **Articles**: AI-generated financial news articles with metadata
- **Market Data**: Real-time market information for stocks, crypto, and commodities
- **News Events**: Raw news events that trigger article generation

### External Service Integrations
- **Google Gemini AI**: Powers article generation and sentiment analysis
- **Yahoo Finance API**: Provides stock market data and quotes
- **CoinGecko API**: Supplies cryptocurrency market information
- **WebSocket Server**: Enables real-time data broadcasting (optional for Railway)

### Frontend Components
- **Market Ticker**: Live scrolling market data display
- **Article Cards**: Responsive news article presentations
- **Market Overview**: Dashboard-style market summaries
- **Real-time Updates**: WebSocket-powered live data feeds

## Data Flow

1. **Market Data Collection**: External APIs (Yahoo Finance, CoinGecko) fetch real-time market data
2. **News Event Processing**: Raw news events are captured and analyzed for relevance
3. **Content Generation**: Gemini AI processes news events to generate comprehensive articles
4. **Real-time Broadcasting**: WebSocket server pushes updates to connected clients
5. **Client Updates**: Frontend automatically refreshes data without page reloads

## External Dependencies

### Core Services
- **Neon Database**: PostgreSQL hosting with serverless architecture
- **Google Gemini AI**: Natural language processing and content generation
- **Yahoo Finance**: Stock market data and financial quotes
- **CoinGecko**: Cryptocurrency market information

### Development Tools
- **Vite**: Fast build tool with hot module replacement
- **Drizzle Kit**: Database migrations and schema management
- **shadcn/ui**: Pre-built accessible UI components
- **TanStack Query**: Server state management and caching

## Deployment Strategy

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles server code with external dependencies
- **Database**: Drizzle migrations handle schema updates

### Environment Configuration
- **Development**: Hot reloading with Vite dev server
- **Production**: Express serves static files and API endpoints
- **Database**: Environment-based connection strings

### Real-time Features
- **WebSocket**: Persistent connections for live updates
- **Connection Management**: Automatic reconnection and error handling
- **Broadcast System**: Efficient message distribution to all clients

## Deployment for Railway

### Automatic Database Setup
- **Zero Configuration**: Database tables are created automatically on startup
- **Self-Seeding**: Sample data is populated if no articles exist
- **Migration System**: Built-in migration system handles schema creation
- **Environment Ready**: Only requires DATABASE_URL and API keys

### Railway Deployment Steps
1. Connect your GitHub repository to Railway
2. Set environment variables:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `GEMINI_API_KEY` (Google Gemini API key)
3. Deploy - everything else is automatic

### What Happens on Deploy
- Frontend builds with Vite to optimized static files
- Backend bundles with ESBuild for production
- Database tables created automatically on first run
- RSS feeds start pulling real news immediately
- AI content generation begins
- WebSocket server starts for live market data

## Changelog

- July 07, 2025. Initial setup
- July 07, 2025. Redesigned homepage as modern news front page
  - Removed black hero section and created newspaper-style layout
  - Added category navigation: World, US, UK, Companies, Tech, Markets, Crypto
  - Created featured articles section with sidebar for trending topics
  - Added proper category pages for all news sections
  - Integrated Gemini AI for article generation with API key
- July 07, 2025. Transformed to clean Bloomberg/Palantir-style article feed
  - Removed breaking news banners, notifications, and profile elements
  - Removed all fake market data displays
  - Created clean, uniform article feed layout for all categories
  - Integrated real news API service for authentic content generation
  - Set up automatic news updates every 30 minutes
  - Simplified all pages to focus purely on article content
- July 07, 2025. Migrated to Replit environment with real data sources
  - Set up PostgreSQL database and ran migrations
  - Integrated RSS feeds for authentic news sources (BBC, CoinTelegraph, Reuters, etc.)
  - Connected Google Gemini AI for article generation
  - Configured automatic news updates every 1 hour from RSS feeds
  - Established real-time market data connections
- July 07, 2025. Railway deployment preparation
  - Added automatic database table creation system
  - Built migration system that runs on server startup
  - Created data seeding for initial articles and market data
  - Added Railway configuration files
  - Made application fully self-contained for zero-config deployment
- July 08, 2025. Replit Agent to Replit migration
  - Migrated from Neon serverless to standard PostgreSQL for Railway compatibility
  - Fixed database connection issues with proper SSL configuration
  - Updated migration system with retry logic for Railway deployment
  - Made WebSocket server optional for Railway environment
  - Added database connection testing and error handling
  - Created Railway-specific configuration files

## User Preferences

Preferred communication style: Simple, everyday language.
Design preference: Bloomberg/Palantir-style clean article feeds only.