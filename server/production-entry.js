import express from "express";
import { createServer } from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { Pool } from 'pg';

// ES module compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

// API Routes and Background Services
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

  // Background article generation for Railway
  async function generateRailwayArticles() {
    if (!process.env.GEMINI_API_KEY) {
      console.log('⚠️  GEMINI_API_KEY not set, skipping article generation');
      return;
    }

    try {
      console.log('🤖 Generating articles for Railway...');
      
      // Topics for article generation
      const topics = [
        'Federal Reserve interest rate decisions and market impact',
        'Major technology companies earnings reports',
        'Cryptocurrency market analysis and trends',
        'Global economic indicators and their implications',
        'Stock market volatility and investor sentiment'
      ];
      
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      // Generate article using Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Write a comprehensive financial news article about: ${randomTopic}. 
              
              Format the response as JSON with these exact fields:
              {
                "title": "Article title (engaging and professional)",
                "content": "Full article content (minimum 800 words, well-structured with multiple paragraphs)",
                "summary": "Brief summary (100-150 words)"
              }
              
              Make it sound like it was written by a professional financial journalist. Include market analysis, expert opinions, and current market context. Do not use placeholder text or generic statements.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Parse JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from Gemini response');
      }
      
      const articleData = JSON.parse(jsonMatch[0]);
      
      // Insert into database
      await pool.query(`
        INSERT INTO articles (title, content, summary, category, author_name, featured, tags, related_symbols)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        articleData.title,
        articleData.content,
        articleData.summary,
        'Markets',
        'Railway AI',
        Math.random() < 0.3, // 30% chance of being featured
        ['ai-generated', 'markets', 'analysis'],
        ['SPY', 'BTC', 'ETH']
      ]);
      
      console.log(`✅ Generated article: ${articleData.title.substring(0, 50)}...`);
    } catch (error) {
      console.error('❌ Error generating articles:', error.message);
    }
  }

  // Start background article generation
  setTimeout(() => {
    generateRailwayArticles();
    // Generate new articles every 45 minutes
    setInterval(generateRailwayArticles, 45 * 60 * 1000);
  }, 5000); // Initial delay of 5 seconds
}

// Static files
function setupStaticFiles() {
  const distPath = join(process.cwd(), "dist", "public");
  
  if (existsSync(distPath)) {
    app.use(express.static(distPath));
    console.log(`✅ Serving static files from: ${distPath}`);
    
    app.use("*", (req, res) => {
      const indexPath = join(distPath, "index.html");
      if (existsSync(indexPath)) {
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
        <head>
          <title>Coin Feedly - Financial News Platform</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
            .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            h1 { color: #333; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
            .status { background: #d4edda; color: #155724; padding: 10px; border-radius: 4px; margin: 10px 0; }
            .api-section { background: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .endpoint { background: #e9ecef; padding: 8px; margin: 5px 0; border-radius: 4px; font-family: monospace; }
            a { color: #007bff; text-decoration: none; }
            a:hover { text-decoration: underline; }
            .article-list { margin: 20px 0; }
            .article-item { background: #f8f9fa; padding: 10px; margin: 10px 0; border-radius: 4px; border-left: 4px solid #007bff; }
            .loading { text-align: center; padding: 20px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 Coin Feedly - Financial News Platform</h1>
            
            <div class="status">
              ✅ Railway deployment successful! Backend API is fully operational.
            </div>
            
            <div class="api-section">
              <h2>📡 API Endpoints</h2>
              <div class="endpoint">
                <strong>Health Check:</strong> <a href="/api/health">/api/health</a>
              </div>
              <div class="endpoint">
                <strong>Articles:</strong> <a href="/api/articles">/api/articles</a>
              </div>
              <div class="endpoint">
                <strong>Market Gainers:</strong> <a href="/api/market-data/gainers">/api/market-data/gainers</a>
              </div>
            </div>
            
            <div class="article-list">
              <h2>📰 Latest Articles</h2>
              <div id="articles-container" class="loading">Loading articles...</div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center; color: #666;">
              <p>Full React frontend will be available after complete deployment.</p>
              <p>This is a functional backend API interface for Railway deployment testing.</p>
            </div>
          </div>
          
          <script>
            // Load articles via API
            console.log('Loading articles from API...');
            fetch('/api/articles')
              .then(response => {
                console.log('API response status:', response.status);
                if (!response.ok) {
                  throw new Error('Failed to fetch articles');
                }
                return response.json();
              })
              .then(articles => {
                console.log('Articles loaded:', articles.length);
                const container = document.getElementById('articles-container');
                if (articles && articles.length > 0) {
                  // Show real articles from database
                  container.innerHTML = articles.slice(0, 10).map(article => 
                    '<div class="article-item">' +
                    '<h3>' + (article.title || 'No title') + '</h3>' +
                    '<p>' + (article.summary || 'No summary available') + '</p>' +
                    '<small>By ' + (article.author_name || 'Unknown') + ' • ' + (article.category || 'General') + '</small>' +
                    '</div>'
                  ).join('');
                } else {
                  container.innerHTML = '<p>No articles available yet. Database might be initializing...</p>';
                }
              })
              .catch(error => {
                console.error('Error fetching articles:', error);
                document.getElementById('articles-container').innerHTML = 
                  '<p>Error loading articles: ' + error.message + '</p><p>Please check the API endpoint or try refreshing the page.</p>';
              });
          </script>
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