import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Railway Database Setup with Enhanced Error Handling
export async function setupRailwayDatabase() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for Railway deployment');
  }

  console.log('🚀 Initializing Railway PostgreSQL database...');

  // Create connection pool with Railway-optimized settings
  const pool = new Pool({
    connectionString: DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
    ssl: DATABASE_URL.includes('railway') ? { rejectUnauthorized: false } : false
  });

  let retryCount = 0;
  const maxRetries = 5;

  while (retryCount < maxRetries) {
    try {
      console.log(`🔄 Database connection attempt ${retryCount + 1}/${maxRetries}`);
      
      // Test connection
      const testResult = await pool.query('SELECT NOW() as current_time');
      console.log('✅ Railway PostgreSQL connection established');

      // Create all tables with proper error handling
      await createDatabaseTables(pool);
      await createDatabaseIndexes(pool);
      await verifyDatabaseSetup(pool);

      console.log('✅ Railway database setup completed successfully');
      return { pool, success: true };

    } catch (error) {
      retryCount++;
      console.error(`❌ Database setup attempt ${retryCount} failed:`, error.message);
      
      if (retryCount < maxRetries) {
        const waitTime = Math.min(retryCount * 2000, 8000);
        console.log(`⏳ Retrying in ${waitTime/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('❌ Database setup failed after all attempts');
        return { pool: null, success: false };
      }
    }
  }

  return { pool: null, success: false };
}

async function createDatabaseTables(pool: Pool) {
  console.log('🔄 Creating database tables...');

  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `);

  // News events table
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

  // Articles table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE,
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

  // Add slug column if it doesn't exist (for existing tables)
  await pool.query(`
    ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug TEXT;
  `);

  // Update existing articles to have slugs with proper URL formatting
  await pool.query(`
    UPDATE articles 
    SET slug = LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(
          REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s-]', '', 'g'),
          '\\s+', '-', 'g'
        ),
        '-+', '-', 'g'
      )
    )
    WHERE slug IS NULL OR slug = '';
  `);

  // Make sure all slugs are unique by adding ID suffix if needed
  await pool.query(`
    UPDATE articles 
    SET slug = slug || '-' || id 
    WHERE id IN (
      SELECT id FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY slug ORDER BY id) as rn 
        FROM articles 
        WHERE slug IS NOT NULL
      ) t WHERE rn > 1
    );
  `);

  // Add unique constraint on slug if it doesn't exist
  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE articles ADD CONSTRAINT articles_slug_unique UNIQUE (slug);
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;
  `);

  // Market data table
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

  console.log('✅ Database tables created successfully');
}

async function createDatabaseIndexes(pool: Pool) {
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
    await pool.query(indexQuery);
  }

  console.log('✅ Database indexes created successfully');
}

async function verifyDatabaseSetup(pool: Pool) {
  console.log('🔄 Verifying database setup...');

  const tableCheck = await pool.query(`
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

// Seed initial data for Railway deployment
export async function seedRailwayData(pool: Pool) {
  try {
    console.log('🌱 Seeding initial data for Railway deployment...');

    // Check if articles already exist
    const existingArticles = await pool.query('SELECT COUNT(*) FROM articles');
    const articleCount = parseInt(existingArticles.rows[0].count);

    if (articleCount > 0) {
      console.log('📊 Articles already exist, skipping initial seed');
      return;
    }

    // Seed sample market data
    const sampleMarketData = [
      { symbol: 'BTC', name: 'Bitcoin', price: 43250.00, change: 1245.50, change_percent: 2.97, type: 'crypto' },
      { symbol: 'ETH', name: 'Ethereum', price: 2650.00, change: -45.20, change_percent: -1.68, type: 'crypto' },
      { symbol: 'AAPL', name: 'Apple Inc.', price: 185.50, change: 2.35, change_percent: 1.28, type: 'stock' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.80, change: -1.20, change_percent: -0.83, type: 'stock' }
    ];

    for (const stock of sampleMarketData) {
      await pool.query(`
        INSERT INTO market_data (symbol, name, price, change, change_percent, type, last_updated)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (symbol, type) DO UPDATE SET
          price = EXCLUDED.price,
          change = EXCLUDED.change,
          change_percent = EXCLUDED.change_percent,
          last_updated = NOW()
      `, [stock.symbol, stock.name, stock.price, stock.change, stock.change_percent, stock.type]);
    }

    // Seed sample articles
    const sampleArticles = [
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

    for (const article of sampleArticles) {
      await pool.query(`
        INSERT INTO articles (title, content, summary, category, author_name, featured, tags, related_symbols, published_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
      `, [
        article.title, article.content, article.summary, article.category, 
        article.author_name, article.featured, article.tags, article.related_symbols
      ]);
    }

    console.log('✅ Initial data seeding completed for Railway deployment');

  } catch (error) {
    console.error('❌ Error seeding Railway data:', error.message);
    throw error;
  }
}