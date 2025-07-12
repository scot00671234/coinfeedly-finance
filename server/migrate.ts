import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Simple database migration system
export async function runMigrations() {
  console.log('🔄 Running database migrations...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Create tables
    await createTables(pool);
    
    // Add slug column migration
    await addSlugColumn(pool);
    
    console.log('✅ Database migrations completed');
    return { pool, success: true };
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { pool: null, success: false };
  }
}

async function createTables(pool: Pool) {
  // Users table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // Articles table with slug column
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
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
    )
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
      last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      metadata JSONB,
      UNIQUE(symbol, type)
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
      article_id INTEGER
    )
  `);
}

async function addSlugColumn(pool: Pool) {
  try {
    // Check if slug column exists
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'articles' AND column_name = 'slug'
    `);

    if (result.rows.length === 0) {
      // Add slug column
      await pool.query('ALTER TABLE articles ADD COLUMN slug TEXT');
      
      // Generate slugs for existing articles
      await pool.query(`
        UPDATE articles 
        SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9\\s]', '', 'g'), '\\s+', '-', 'g')) || '-' || id
        WHERE slug IS NULL
      `);
      
      // Add unique constraint
      await pool.query('ALTER TABLE articles ADD CONSTRAINT articles_slug_unique UNIQUE (slug)');
    }
  } catch (error) {
    console.log('⚠️ Slug column migration skipped (already exists)');
  }
}

// Simple data seeding
export async function seedInitialData() {
  console.log('🌱 Seeding initial data...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  try {
    // Check if articles exist
    const existingArticles = await pool.query('SELECT COUNT(*) FROM articles');
    if (parseInt(existingArticles.rows[0].count) > 0) {
      console.log('📊 Data already exists, skipping seed');
      return;
    }

    // Add sample article
    await pool.query(`
      INSERT INTO articles (title, slug, content, summary, category, author_name, featured)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `, [
      'Market Analysis: Technology Sector Shows Strong Performance',
      'market-analysis-technology-sector',
      'The technology sector continues to demonstrate resilience and growth potential in the current market environment. Major tech companies are reporting solid earnings and forward guidance.',
      'Technology stocks show strong performance with positive earnings reports.',
      'Markets',
      'Financial News Team',
      true
    ]);

    console.log('✅ Initial data seeded');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await pool.end();
  }
}