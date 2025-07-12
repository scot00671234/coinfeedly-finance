import { Pool } from 'pg';

// Super simple migration system
export async function setupDatabase() {
  console.log('🔄 Setting up database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Create all tables in one go
    await pool.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

      -- Articles table with proper slug handling
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT UNIQUE,
        content TEXT NOT NULL,
        summary TEXT NOT NULL,
        category TEXT NOT NULL,
        author_name TEXT NOT NULL,
        published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        image_url TEXT,
        featured BOOLEAN DEFAULT FALSE,
        tags TEXT[] DEFAULT '{}',
        related_symbols TEXT[] DEFAULT '{}',
        view_count INTEGER DEFAULT 0,
        share_count INTEGER DEFAULT 0
      );

      -- Market data table
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
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        metadata JSONB,
        UNIQUE(symbol, type)
      );

      -- News events table
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
      );
    `);

    // Fix any existing articles without slugs
    await pool.query(`
      UPDATE articles 
      SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s]', '', 'g'), '\\s+', '-', 'g')) || '-' || id
      WHERE slug IS NULL OR slug = '';
    `);

    // Add sample data if none exists
    const result = await pool.query('SELECT COUNT(*) FROM articles');
    if (parseInt(result.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO articles (title, slug, content, summary, category, author_name, featured)
        VALUES 
          ('Welcome to Coin Feedly', 'welcome-to-coin-feedly-1', 'Welcome to your financial news platform. This is a sample article to get you started.', 'Welcome article for the platform.', 'Markets', 'Editorial Team', true),
          ('Market Overview', 'market-overview-2', 'Current market conditions show mixed signals across various sectors.', 'Mixed market signals observed.', 'Markets', 'Market Analyst', false);
      `);
      console.log('✅ Sample data added');
    }

    console.log('✅ Database setup completed');
    return { pool, success: true };

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return { pool: null, success: false };
  }
}