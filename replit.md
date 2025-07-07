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
- **Primary Database**: PostgreSQL hosted on Neon
- **ORM**: Drizzle with schema-first approach
- **Connection Pool**: Neon serverless connection pooling
- **Schema Management**: Drizzle migrations for version control

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
- **WebSocket Server**: Enables real-time data broadcasting

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

## Changelog

- July 07, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.