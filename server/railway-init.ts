import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Railway Database Initialization - Complete Self-Contained System
export class RailwayDatabaseInitializer {
  private pool: Pool;
  private db: any;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL environment variable is required for Railway deployment');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 15000,
    });

    this.db = drizzle(this.pool, { schema });
  }

  async initialize(): Promise<{ success: boolean; db: any; pool: Pool }> {
    console.log('🚀 Railway Database Initializer - Starting...');
    
    let retryCount = 0;
    const maxRetries = 5;

    while (retryCount < maxRetries) {
      try {
        console.log(`🔄 Database initialization attempt ${retryCount + 1}/${maxRetries}`);
        
        // Test connection
        await this.pool.query('SELECT NOW() as current_time');
        console.log('✅ Railway PostgreSQL connection established');

        // Create all tables
        await this.createTables();
        
        // Create indexes
        await this.createIndexes();
        
        // Verify setup
        await this.verifySetup();
        
        // Seed initial data if needed
        await this.seedInitialData();

        console.log('✅ Railway database initialization completed successfully');
        return { success: true, db: this.db, pool: this.pool };

      } catch (error) {
        retryCount++;
        console.error(`❌ Database initialization attempt ${retryCount} failed:`, error.message);
        
        if (retryCount < maxRetries) {
          const waitTime = Math.min(retryCount * 2000, 8000);
          console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        } else {
          console.error('❌ Database initialization failed after all attempts');
          return { success: false, db: null, pool: null };
        }
      }
    }

    return { success: false, db: null, pool: null };
  }

  private async createTables(): Promise<void> {
    console.log('🔄 Creating database tables...');

    // Users table
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

    // News events table
    await this.pool.query(`
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

    // Articles table
    await this.pool.query(`
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

    // Market data table
    await this.pool.query(`
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

    console.log('✅ Database tables created successfully');
  }

  private async createIndexes(): Promise<void> {
    console.log('🔄 Creating database indexes...');

    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category)',
      'CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured)',
      'CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC)',
      'CREATE INDEX IF NOT EXISTS idx_news_events_processed ON news_events(processed)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_type ON market_data(type)',
      'CREATE INDEX IF NOT EXISTS idx_market_data_last_updated ON market_data(last_updated DESC)'
    ];

    for (const indexQuery of indexes) {
      await this.pool.query(indexQuery);
    }

    console.log('✅ Database indexes created successfully');
  }

  private async verifySetup(): Promise<void> {
    console.log('🔄 Verifying database setup...');

    const tableCheck = await this.pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'articles', 'market_data', 'news_events')
      ORDER BY table_name
    `);

    const tables = tableCheck.rows.map(row => row.table_name);
    console.log('✅ Verified tables:', tables);

    if (tables.length !== 4) {
      throw new Error(`Database verification failed. Expected 4 tables, found ${tables.length}`);
    }

    console.log('✅ Database verification completed successfully');
  }

  private async seedInitialData(): Promise<void> {
    console.log('🌱 Seeding initial data...');

    try {
      // Check if articles already exist
      const existingArticles = await this.pool.query('SELECT COUNT(*) FROM articles');
      const articleCount = parseInt(existingArticles.rows[0].count);

      if (articleCount > 0) {
        console.log('📊 Articles already exist, skipping initial seed');
        return;
      }

      // Seed market data
      const marketData = [
        { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change: 1245.50, change_percent: 2.97, type: 'crypto' },
        { symbol: 'ETH', name: 'Ethereum', price: 2650.00, change: -45.20, change_percent: -1.68, type: 'crypto' },
        { symbol: 'AAPL', name: 'Apple Inc.', price: 185.50, change: 2.35, change_percent: 1.28, type: 'stock' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.80, change: -1.20, change_percent: -0.83, type: 'stock' }
      ];

      for (const stock of marketData) {
        await this.pool.query(`
          INSERT INTO market_data (symbol, name, price, change, change_percent, type, last_updated)
          VALUES ($1, $2, $3, $4, $5, $6, NOW())
          ON CONFLICT (symbol, type) DO UPDATE SET
            price = EXCLUDED.price,
            change = EXCLUDED.change,
            change_percent = EXCLUDED.change_percent,
            last_updated = NOW()
        `, [stock.symbol, stock.name, stock.price, stock.change, stock.change_percent, stock.type]);
      }

      // Seed articles
      const articles = [
        {
          title: 'Federal Reserve Signals Potential Rate Cuts Amid Economic Uncertainty',
          content: 'The Federal Reserve has indicated a potential shift in monetary policy, with officials suggesting that interest rate cuts may be on the horizon as economic indicators show mixed signals. This development has significant implications for both equity and cryptocurrency markets.',
          summary: 'Fed officials hint at possible rate cuts as economic data presents mixed signals.',
          category: 'Markets',
          author_name: 'Financial News Team',
          featured: true,
          tags: ['federal-reserve', 'interest-rates', 'monetary-policy'],
          related_symbols: ['SPY', 'QQQ', 'BTC']
        },
        {
          title: 'Bitcoin Surges Past $43,000 as Institutional Adoption Continues',
          content: 'Bitcoin has broken through the $43,000 resistance level, driven by continued institutional adoption and growing acceptance of cryptocurrency as a legitimate asset class. Major corporations continue to add Bitcoin to their treasury holdings.',
          summary: 'Bitcoin crosses $43,000 threshold with strong institutional support.',
          category: 'Crypto',
          author_name: 'Crypto Analyst',
          featured: true,
          tags: ['bitcoin', 'cryptocurrency', 'institutional-adoption'],
          related_symbols: ['BTC', 'ETH']
        }
      ];

      for (const article of articles) {
        await this.pool.query(`
          INSERT INTO articles (title, content, summary, category, author_name, featured, tags, related_symbols, published_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        `, [
          article.title, article.content, article.summary, article.category, 
          article.author_name, article.featured, article.tags, article.related_symbols
        ]);
      }

      console.log('✅ Initial data seeding completed');

    } catch (error) {
      console.error('❌ Error seeding initial data:', error.message);
      // Don't throw - seeding failure shouldn't prevent app startup
    }
  }

  async getDatabase() {
    return this.db;
  }

  async getPool() {
    return this.pool;
  }
}

// Global database instance
let dbInstance: any = null;
let poolInstance: Pool | null = null;

export async function initializeRailwayDatabase(): Promise<{ db: any; pool: Pool; success: boolean }> {
  if (dbInstance && poolInstance) {
    return { db: dbInstance, pool: poolInstance, success: true };
  }

  const initializer = new RailwayDatabaseInitializer();
  const { success, db, pool } = await initializer.initialize();

  if (success) {
    dbInstance = db;
    poolInstance = pool;
  }

  return { db, pool, success };
}