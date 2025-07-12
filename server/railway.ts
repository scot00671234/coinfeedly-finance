// Railway deployment entry point
import express from 'express';
import { Pool } from 'pg';
import { GoogleGenAI } from '@google/genai';

const app = express();
const port = parseInt(process.env.PORT || '8080');

// Database setup for Railway
async function setupRailwayDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Create articles table with proper slug column
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT,
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
    `);

    // Fix slug column for all articles
    await pool.query(`
      UPDATE articles 
      SET slug = LOWER(REPLACE(REPLACE(title, ' ', '-'), '''', '')) || '-' || id
      WHERE slug IS NULL;
    `);

    console.log('✅ Railway database ready');
    return pool;
  } catch (error) {
    console.error('❌ Railway database setup failed:', error);
    throw error;
  }
}

// Simple article routes
app.get('/api/articles', async (req, res) => {
  try {
    const pool = await setupRailwayDatabase();
    const result = await pool.query('SELECT * FROM articles ORDER BY published_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Serve static files
app.use(express.static('dist/public'));

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Railway server running on port ${port}`);
});

// Initialize database on startup
setupRailwayDatabase().catch(console.error);