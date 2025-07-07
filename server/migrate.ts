import { migrate } from 'drizzle-orm/neon-serverless/migrator';
import { db } from './db';
import { users, articles, marketData, newsEvents } from '@shared/schema';
import { sql } from 'drizzle-orm';

export async function runMigrations() {
  try {
    console.log('🔄 Running database migrations...');
    
    // Create tables if they don't exist
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS news_events (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        description TEXT,
        category VARCHAR(100) NOT NULL,
        source VARCHAR(255),
        url VARCHAR(500),
        published_at TIMESTAMP WITH TIME ZONE NOT NULL,
        processed BOOLEAN DEFAULT FALSE,
        article_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(500) NOT NULL,
        summary TEXT NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        author_name VARCHAR(255) NOT NULL,
        published_at TIMESTAMP WITH TIME ZONE NOT NULL,
        image_url VARCHAR(500),
        featured BOOLEAN DEFAULT FALSE,
        tags TEXT[],
        related_symbols TEXT[],
        view_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0,
        news_event_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS market_data (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(20) NOT NULL,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(15,4) NOT NULL,
        change_amount DECIMAL(15,4) NOT NULL,
        change_percent DECIMAL(8,4) NOT NULL,
        volume BIGINT,
        market_cap BIGINT,
        type VARCHAR(50) NOT NULL,
        exchange VARCHAR(100),
        currency VARCHAR(10) DEFAULT 'USD',
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(symbol, type)
      )
    `);

    // Add indexes for better performance
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_news_events_processed ON news_events(processed);
    `);
    
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
    `);

    console.log('✅ Database migrations completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return false;
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
          price: data.price,
          changeAmount: data.change,
          changePercent: data.changePercent,
          volume: BigInt(Math.floor(Math.random() * 10000000) + 1000000),
          marketCap: BigInt(Math.floor(Math.random() * 1000000000000) + 100000000000),
          type: data.type,
          exchange: data.type === "crypto" ? "Coinbase" : "NASDAQ",
          currency: "USD"
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