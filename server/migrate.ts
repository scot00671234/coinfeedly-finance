import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { db, pool } from './db';
import { users, articles, marketData, newsEvents } from '@shared/schema';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Test database connection first
    await pool.query('SELECT 1');
    console.log('✅ Database connection successful');
    
    // Run Drizzle migrations
    await migrate(db, { migrationsFolder: './drizzle' });
    
    console.log('✅ Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error.message);
    
    // Fallback: Try to create tables manually if migrations fail
    try {
      console.log('🔄 Attempting fallback table creation...');
      
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL
        )
      `);

      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS news_events (
          id SERIAL PRIMARY KEY,
          headline TEXT,
          description TEXT,
          category TEXT,
          source TEXT NOT NULL,
          url TEXT,
          published_at TIMESTAMP WITH TIME ZONE NOT NULL,
          processed BOOLEAN DEFAULT FALSE,
          article_id INTEGER
        )
      `);

      await db.execute(sql`
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
          tags TEXT[],
          related_symbols TEXT[],
          view_count INTEGER DEFAULT 0,
          share_count INTEGER DEFAULT 0
        )
      `);

      await db.execute(sql`
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
          UNIQUE(symbol, type)
        )
      `);

      console.log('✅ Fallback table creation completed');
      return true;
    } catch (fallbackError) {
      console.error('❌ Fallback migration also failed:', fallbackError);
      return false;
    }
  }
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