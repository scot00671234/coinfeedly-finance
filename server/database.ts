import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@shared/schema';

// Database connection and setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export const db = drizzle(pool, { schema });
export { pool };

// Simple database initialization
export async function initializeDatabase() {
  console.log('🔄 Initializing database...');
  
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
      );

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

    // Fix slug column for existing articles
    await pool.query(`
      UPDATE articles 
      SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', '')) || '-' || id
      WHERE slug IS NULL;
    `);

    // Database ready - RSS service will populate with real articles

    console.log('✅ Database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}