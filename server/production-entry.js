import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";
import { Pool } from 'pg';

// Railway Production Entry Point - JavaScript for simplicity
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple logging
app.use((req, res, next) => {
  const start = Date.now();
  const requestPath = req.path;
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (requestPath.startsWith("/api")) {
      console.log(`${req.method} ${requestPath} ${res.statusCode} in ${duration}ms`);
    }
  });
  
  next();
});

// Database initialization
async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is required');
  }

  console.log('🚀 Initializing Railway database...');
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 15000,
  });

  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `);

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

    // Create indexes
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

    console.log('✅ Database tables and indexes created');
    
    // Seed sample data
    const existingArticles = await pool.query('SELECT COUNT(*) FROM articles');
    if (parseInt(existingArticles.rows[0].count) === 0) {
      console.log('🌱 Seeding sample data...');
      
      await pool.query(`
        INSERT INTO articles (title, content, summary, category, author_name, featured, tags, related_symbols)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'Welcome to Coin Feedly',
        'Your financial news platform is now running on Railway. This is a sample article to demonstrate the system is working correctly.',
        'Sample article confirming Railway deployment success.',
        'Markets',
        'Railway Team',
        true,
        ['railway', 'deployment', 'demo'],
        ['BTC', 'ETH']
      ]);

      await pool.query(`
        INSERT INTO market_data (symbol, name, price, change, change_percent, type)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, ['BTC', 'Bitcoin', 43250.00, 1245.50, 2.97, 'crypto']);

      console.log('✅ Sample data seeded');
    }

    return pool;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// API Routes
function setupRoutes(pool) {
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  });

  // Articles
  app.get('/api/articles', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM articles ORDER BY published_at DESC LIMIT 20');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Market data
  app.get('/api/market-data/gainers', async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM market_data WHERE change_percent > 0 ORDER BY change_percent DESC LIMIT 10');
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: 'Database error' });
    }
  });
}

// Static files
function setupStaticFiles() {
  const distPath = path.join(process.cwd(), "dist", "public");
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log(`✅ Serving static files from: ${distPath}`);
    
    app.use("*", (req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send("Application not found");
      }
    });
  } else {
    console.warn(`⚠️  Static files not found at: ${distPath}`);
    app.get("*", (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head><title>Coin Feedly</title></head>
        <body>
          <h1>Coin Feedly</h1>
          <p>Railway deployment successful!</p>
          <p>API available at: <a href="/api/health">/api/health</a></p>
        </body>
        </html>
      `);
    });
  }
}

// Start server
async function startServer() {
  try {
    console.log('🚀 Starting Coin Feedly on Railway...');
    
    // Initialize database
    const pool = await initializeDatabase();
    
    // Setup routes
    setupRoutes(pool);
    
    // Setup static files
    setupStaticFiles();
    
    // Error handler
    app.use((err, req, res, next) => {
      console.error('Server error:', err);
      res.status(500).json({ error: 'Internal server error' });
    });
    
    // Start server
    const server = createServer(app);
    const port = process.env.PORT || 5000;
    
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Railway server listening on port ${port}`);
      console.log(`📡 Health check: http://localhost:${port}/api/health`);
      console.log('✅ Coin Feedly is ready!');
    });
    
    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 Shutting down gracefully...');
      server.close(() => {
        pool.end(() => {
          console.log('✅ Server closed');
          process.exit(0);
        });
      });
    });
    
  } catch (error) {
    console.error('💥 Failed to start server:', error);
    process.exit(1);
  }
}

startServer();