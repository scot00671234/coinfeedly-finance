import { db, pool } from './db';
import { users, articles, marketData, newsEvents } from '@shared/schema';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  let retryCount = 0;
  const maxRetries = 5;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`🔄 Railway Database Setup (attempt ${retryCount + 1}/${maxRetries})`);
      
      // Test database connection with extended timeout for Railway
      const connectionTest = await Promise.race([
        pool.query('SELECT NOW() as current_time'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 15000))
      ]);
      
      console.log('✅ Railway PostgreSQL connection verified');
      
      // Railway-specific database setup
      console.log('🔄 Initializing Railway database schema...');
      
      // Create users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `);
      console.log('✅ Users table ready');

      // Create news_events table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS news_events (
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
        )
      `);
      console.log('✅ News events table ready');

      // Create articles table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS articles (
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
        )
      `);
      console.log('✅ Articles table ready');

      // Create market_data table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS market_data (
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
        )
      `);
      console.log('✅ Market data table ready');

      // Create indexes for Railway performance
      const indexes = [
        'CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)',
        'CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured)',
        'CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)',
        'CREATE INDEX IF NOT EXISTS idx_news_events_processed ON news_events(processed)',
        'CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol)',
        'CREATE INDEX IF NOT EXISTS idx_market_data_type ON market_data(type)'
      ];

      for (const indexQuery of indexes) {
        await pool.query(indexQuery);
      }
      console.log('✅ Database indexes created');

      // Verify all tables exist
      const tableCheck = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('users', 'articles', 'market_data', 'news_events')
        ORDER BY table_name
      `);
      
      console.log('✅ Verified tables:', tableCheck.rows.map(row => row.table_name));
      
      if (tableCheck.rows.length === 4) {
        console.log('✅ Railway database initialization completed successfully');
        return true;
      } else {
        throw new Error(`Missing tables. Expected 4, found ${tableCheck.rows.length}`);
      }
      
    } catch (error) {
      retryCount++;
      console.error(`❌ Railway setup attempt ${retryCount} failed:`, error.message);
      
      if (retryCount < maxRetries) {
        const waitTime = Math.min(retryCount * 3000, 10000);
        console.log(`⏳ Retrying Railway setup in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('❌ Railway database setup failed after all attempts');
        console.error('This may indicate a Railway PostgreSQL configuration issue');
        return false;
      }
    }
  }
  
  return false;
}

export async function seedInitialData() {
  try {
    console.log('🌱 Checking for initial data...');
    
    // Check if we already have articles
    const existingArticles = await db.select().from(articles).limit(1);
    
    if (existingArticles.length === 0) {
      console.log('🌱 Seeding initial data...');
      
      // Create sample news events and articles
      const sampleEvents = [
        {
          title: "Federal Reserve Signals Potential Rate Cuts Amid Economic Uncertainty",
          description: "The Federal Reserve Chairman's latest comments suggest a shift in monetary policy stance as inflation shows signs of cooling.",
          category: "Markets",
          source: "Financial News Network",
          url: "https://example.com/fed-rates",
          publishedAt: new Date(),
        },
        {
          title: "Tech Giants Report Strong Q4 Earnings Despite Market Volatility",
          description: "Major technology companies exceed analyst expectations with robust quarterly results across cloud and AI segments.",
          category: "Tech",
          source: "Tech Today",
          url: "https://example.com/tech-earnings",
          publishedAt: new Date(),
        },
        {
          title: "Cryptocurrency Market Experiences Renewed Institutional Interest",
          description: "Bitcoin and major altcoins surge as institutional investors increase their digital asset allocations.",
          category: "Crypto",
          source: "Crypto Weekly",
          url: "https://example.com/crypto-surge",
          publishedAt: new Date(),
        }
      ];

      for (const event of sampleEvents) {
        const [newsEvent] = await db.insert(newsEvents).values({
          title: event.title,
          description: event.description,
          category: event.category,
          source: event.source,
          url: event.url,
          publishedAt: event.publishedAt,
          processed: true
        }).returning();

        // Create corresponding article
        await db.insert(articles).values({
          title: event.title,
          summary: event.description,
          content: `This is a comprehensive analysis of ${event.title.toLowerCase()}. 

The financial markets continue to evolve in response to changing economic conditions and policy decisions. Recent developments have shown significant impact across various sectors, with investors closely monitoring key indicators.

Market participants are particularly focused on monetary policy shifts and their implications for future economic growth. The current environment presents both challenges and opportunities for different asset classes.

Technology companies have demonstrated resilience despite broader market volatility, with many reporting stronger-than-expected earnings. This performance reflects the ongoing digital transformation and increasing demand for innovative solutions.

The cryptocurrency market has also shown renewed vigor, with institutional adoption continuing to drive long-term interest in digital assets. Regulatory clarity and technological improvements are contributing to increased market maturity.

Looking ahead, market participants will be watching for additional policy announcements and economic data that could influence investment strategies and asset allocation decisions.`,
          category: event.category,
          authorName: "Financial Editorial Team",
          publishedAt: event.publishedAt,
          imageUrl: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop&crop=focalpoint`,
          featured: sampleEvents.indexOf(event) === 0,
          tags: ["finance", "markets", event.category.toLowerCase()],
          relatedSymbols: ["SPY", "QQQ", "BTC"],
          viewCount: Math.floor(Math.random() * 1000) + 100,
          newsEventId: newsEvent.id
        });
      }

      // Add some sample market data
      const sampleMarketData = [
        { symbol: "AAPL", name: "Apple Inc.", price: 175.50, change: 2.30, changePercent: 1.33, type: "stock" },
        { symbol: "GOOGL", name: "Alphabet Inc.", price: 142.80, change: -1.20, changePercent: -0.83, type: "stock" },
        { symbol: "MSFT", name: "Microsoft Corporation", price: 378.20, change: 5.40, changePercent: 1.45, type: "stock" },
        { symbol: "BTC", name: "Bitcoin", price: 42350.00, change: 850.00, changePercent: 2.05, type: "crypto" },
        { symbol: "ETH", name: "Ethereum", price: 2480.50, change: -35.20, changePercent: -1.40, type: "crypto" }
      ];

      for (const data of sampleMarketData) {
        await db.insert(marketData).values({
          symbol: data.symbol,
          name: data.name,
          price: data.price.toString(),
          change: data.change.toString(),
          changePercent: data.changePercent.toString(),
          volume: Math.floor(Math.random() * 10000000) + 1000000,
          marketCap: Math.floor(Math.random() * 1000000000000) + 100000000000,
          type: data.type
        });
      }

      console.log('✅ Initial data seeded successfully');
    } else {
      console.log('📊 Initial data already exists, skipping seed');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return false;
  }
}