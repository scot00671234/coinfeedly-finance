# Database Setup - Automatic Railway Deployment

## Overview
The Coin Feedly platform uses PostgreSQL with automatic table creation and data seeding for Railway deployment.

## Database Tables
The system automatically creates these tables on first run:

### 1. Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 2. Articles Table
```sql
CREATE TABLE articles (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  summary TEXT NOT NULL,
  category TEXT NOT NULL,
  author_name TEXT NOT NULL,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  image_url TEXT,
  featured BOOLEAN DEFAULT FALSE,
  tags TEXT[] DEFAULT '{}',
  related_symbols TEXT[] DEFAULT '{}',
  view_count INTEGER DEFAULT 0,
  share_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 3. Market Data Table
```sql
CREATE TABLE market_data (
  id SERIAL PRIMARY KEY,
  symbol TEXT NOT NULL,
  name TEXT NOT NULL,
  price DECIMAL(18,8) NOT NULL,
  change DECIMAL(18,8) NOT NULL,
  change_percent DECIMAL(10,4) NOT NULL,
  volume DECIMAL(20,2),
  market_cap DECIMAL(20,2),
  type TEXT NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_symbol_type UNIQUE(symbol, type)
);
```

### 4. News Events Table
```sql
CREATE TABLE news_events (
  id SERIAL PRIMARY KEY,
  headline TEXT,
  description TEXT,
  category TEXT,
  source TEXT NOT NULL,
  url TEXT,
  published_at TIMESTAMP WITH TIME ZONE NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  article_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Database Indexes
Performance-optimized indexes are created automatically:
- `idx_articles_category`: Fast category filtering
- `idx_articles_featured`: Featured articles lookup
- `idx_articles_published_at`: Chronological sorting
- `idx_news_events_processed`: Unprocessed events filtering
- `idx_market_data_symbol`: Symbol-based queries
- `idx_market_data_type`: Type-based filtering

## Auto-Initialization Process
1. **Connection**: Establishes PostgreSQL connection using `DATABASE_URL`
2. **Table Creation**: Creates all tables if they don't exist
3. **Index Creation**: Adds performance indexes
4. **Data Seeding**: Populates sample data if database is empty
5. **Verification**: Confirms all tables are accessible

## Sample Data
If no articles exist, the system seeds:
- Welcome article explaining the platform
- Sample market data (Bitcoin)
- Basic configuration data

## Environment Requirements
- `DATABASE_URL`: PostgreSQL connection string (provided by Railway)
- SSL enabled for production connections
- Connection pooling configured (max 20 connections)

## Connection Configuration
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});
```

## Production Readiness
- ✅ Automatic table creation
- ✅ Performance indexes
- ✅ Data seeding
- ✅ SSL configuration
- ✅ Connection pooling
- ✅ Error handling
- ✅ Railway compatibility

## Monitoring
The database setup includes:
- Connection health checks
- Table existence verification
- Sample data validation
- Performance index confirmation

Ready for automatic Railway deployment!