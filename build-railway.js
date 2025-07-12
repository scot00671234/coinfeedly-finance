import { writeFileSync, mkdirSync, existsSync, readFileSync, copyFileSync } from 'fs';
import { join } from 'path';

async function buildRailway() {
  try {
    console.log('🚀 Building Coin Feedly for Railway deployment (simplified)...');
    
    // Create dist directory
    mkdirSync('dist', { recursive: true });
    mkdirSync('dist/public', { recursive: true });
    
    // Step 1: Build React frontend with Vite
    console.log('📦 Building React frontend with Vite...');
    const { build } = await import('vite');
    
    await build({
      configFile: './vite.config.ts',
      build: {
        outDir: './dist/public',
        emptyOutDir: true,
        rollupOptions: {
          external: []
        }
      }
    });
    
    console.log('✅ React frontend built successfully');
    
    // Step 1b: Fallback HTML for direct access
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coin Feedly - Financial News Platform</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; background: #f8f9fa; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        header { background: #fff; border-bottom: 1px solid #e9ecef; padding: 1rem 0; }
        .logo { font-size: 1.5rem; font-weight: bold; color: #007bff; }
        nav { display: flex; gap: 2rem; margin-top: 1rem; }
        nav a { color: #495057; text-decoration: none; padding: 0.5rem 1rem; border-radius: 4px; transition: background 0.3s; }
        nav a:hover, nav a.active { background: #e9ecef; }
        main { padding: 2rem 0; }
        .hero { background: #fff; padding: 2rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .status { background: #d1ecf1; color: #0c5460; padding: 1rem; border-radius: 4px; margin-bottom: 2rem; }
        .articles-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .article-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); transition: transform 0.3s, box-shadow 0.3s; }
        .article-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
        .article-card h3 { color: #343a40; margin-bottom: 0.5rem; }
        .article-card p { color: #6c757d; margin-bottom: 1rem; }
        .article-meta { font-size: 0.9rem; color: #868e96; }
        .market-ticker { background: #343a40; color: #fff; padding: 1rem; border-radius: 4px; margin-bottom: 2rem; overflow: hidden; }
        .market-scroll { display: flex; gap: 2rem; animation: scroll 30s linear infinite; white-space: nowrap; }
        .market-item { white-space: nowrap; font-size: 0.9rem; display: inline-block; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
        .loading { text-align: center; padding: 3rem; color: #6c757d; }
        @keyframes scroll { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
        @media (max-width: 768px) { 
            nav { flex-direction: column; gap: 0.5rem; }
            .articles-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <header>
        <div class="container">
            <div class="logo">📰 Coin Feedly</div>
            <nav>
                <a href="#" class="active" onclick="showSection('home')">Home</a>
                <a href="#" onclick="showSection('articles')">Articles</a>
                <a href="#" onclick="showSection('markets')">Markets</a>
                <a href="/api/health">Health</a>
            </nav>
        </div>
    </header>
    
    <main>
        <div class="container">
            <div class="hero">
                <h1>Financial News Platform</h1>
                <p>Real-time market insights and AI-powered financial analysis</p>
            </div>
            
            <div class="status">
                ✅ Railway deployment successful! Backend API is fully operational with real-time data feeds.
                <br>📊 <span id="data-status">Loading real-time data...</span>
            </div>
            
            <div class="market-ticker">
                <div class="market-scroll" id="market-scroll">
                    <div class="market-item">Loading market data...</div>
                </div>
            </div>
            
            <div class="articles-grid" id="articles-container">
                <div class="loading">Loading articles...</div>
            </div>
        </div>
    </main>
    
    <script>
        let articles = [];
        let marketData = [];
        let currentSection = 'home';
        
        async function loadData() {
            try {
                console.log('Loading data...');
                const [articlesRes, marketRes] = await Promise.all([
                    fetch('/api/articles').catch(err => {
                        console.error('Articles fetch error:', err);
                        return { ok: false };
                    }),
                    fetch('/api/market-data/gainers').catch(err => {
                        console.error('Market data fetch error:', err);
                        return { ok: false };
                    })
                ]);
                
                if (articlesRes.ok) {
                    articles = await articlesRes.json();
                    console.log('Articles loaded:', articles.length);
                    displayArticles();
                } else {
                    console.warn('Articles request failed');
                }
                
                if (marketRes.ok) {
                    marketData = await marketRes.json();
                    console.log('Market data loaded:', marketData.length);
                    displayMarketData();
                } else {
                    console.warn('Market data request failed');
                }
                
                // Update status
                const statusEl = document.getElementById('data-status');
                if (statusEl) {
                    statusEl.textContent = 'Articles: ' + (articles.length || 0) + ' | Market Data: ' + (marketData.length || 0) + ' items';
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }
        
        function displayArticles() {
            const container = document.getElementById('articles-container');
            if (articles && articles.length > 0) {
                container.innerHTML = articles.slice(0, 12).map(article => {
                    const publishedDate = article.published_at ? new Date(article.published_at).toLocaleDateString() : 'Unknown date';
                    return '<div class="article-card">' +
                    '<h3>' + escapeHtml(article.title || 'Untitled') + '</h3>' +
                    '<p>' + escapeHtml(article.summary || 'No summary available') + '</p>' +
                    '<div class="article-meta">' +
                    'By ' + escapeHtml(article.author_name || 'Unknown') + ' • ' + 
                    escapeHtml(article.category || 'General') + ' • ' +
                    publishedDate +
                    (article.featured ? ' • Featured' : '') +
                    '</div>' +
                    '</div>';
                }).join('');
            } else {
                container.innerHTML = '<div class="loading">No articles available. Database may be initializing...</div>';
            }
        }
        
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
        
        function displayMarketData() {
            const container = document.getElementById('market-scroll');
            if (marketData && marketData.length > 0) {
                container.innerHTML = marketData.map(item => {
                    const price = parseFloat(item.price || 0);
                    const changePercent = parseFloat(item.change_percent || 0);
                    return '<div class="market-item">' +
                    '<strong>' + (item.symbol || 'N/A') + '</strong> ' +
                    '$' + price.toFixed(2) + ' ' +
                    '<span class="' + (changePercent > 0 ? 'positive' : 'negative') + '">' +
                    (changePercent > 0 ? '+' : '') + changePercent.toFixed(2) + '%' +
                    '</span>' +
                    '</div>';
                }).join('');
            } else {
                container.innerHTML = '<div class="market-item">Market data loading...</div>';
            }
        }
        
        function showSection(section) {
            currentSection = section;
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            event.target.classList.add('active');
            
            if (section === 'articles') {
                displayArticles();
            } else if (section === 'markets') {
                displayMarketData();
            }
        }
        
        // Auto-load and refresh
        window.addEventListener('load', loadData);
        setInterval(loadData, 30000); // Refresh every 30 seconds
    </script>
</body>
</html>`;
    
    // Only write fallback HTML if Vite build failed
    if (!existsSync('dist/public/index.html')) {
      writeFileSync('dist/public/index.html', htmlContent);
      console.log('✅ Fallback HTML created');
    } else {
      console.log('✅ Using Vite-built React frontend');
    }
    
    // Step 2: Copy server files first
    console.log('📁 Copying server files...');
    
    // Create server directory structure in dist
    mkdirSync('dist/server', { recursive: true });
    mkdirSync('dist/server/services', { recursive: true });
    mkdirSync('dist/shared', { recursive: true });
    
    // Copy essential server files
    const serverFiles = [
      'server/railway-init.ts',
      'server/routes.ts', 
      'server/storage.ts',
      'server/db.ts',
      'server/services/gemini.ts',
      'server/services/coingecko.ts',
      'server/services/yahoo-finance.ts',
      'server/services/real-time-news.ts',
      'shared/schema.ts'
    ];
    
    for (const file of serverFiles) {
      if (existsSync(file)) {
        copyFileSync(file, file.replace(/^(server|shared)/, 'dist/$1'));
        console.log('  Copied:', file);
      }
    }
    
    // Step 3: Create simplified backend
    console.log('🔧 Creating backend...');
    const backendCode = `import express from "express";
import { createServer } from "http";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { existsSync } from "fs";
import { Pool } from 'pg';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Database connection
let pool;
let dbInitialized = false;

async function initializeDatabase() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not found');
    return false;
  }
  
  try {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 5,                     // Reduced pool size for Railway
      min: 1,                     // Minimum connections
      idleTimeoutMillis: 60000,   // 1 minute idle timeout
      connectionTimeoutMillis: 15000,  // 15 second connection timeout
      acquireTimeoutMillis: 15000,     // 15 second acquire timeout
      statement_timeout: 30000,        // 30 second statement timeout
      query_timeout: 30000,           // 30 second query timeout
    });
    
    // Test connection with retry logic
    let retries = 3;
    while (retries > 0) {
      try {
        const client = await pool.connect();
        await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connected');
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        console.log(\`⚠️  Database connection failed, retrying... (\${retries} attempts left)\`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Create tables if they don't exist
    await createTables();
    
    dbInitialized = true;
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    return false;
  }
}

async function createTables() {
  const tables = [
    \`CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )\`,
    \`CREATE TABLE IF NOT EXISTS news_events (
      id SERIAL PRIMARY KEY,
      headline VARCHAR(500) NOT NULL,
      summary TEXT,
      source VARCHAR(100),
      symbols TEXT[],
      published_at TIMESTAMP DEFAULT NOW(),
      processed BOOLEAN DEFAULT FALSE,
      article_id INTEGER
    )\`,
    \`CREATE TABLE IF NOT EXISTS articles (
      id SERIAL PRIMARY KEY,
      title VARCHAR(500) NOT NULL,
      content TEXT NOT NULL,
      summary TEXT,
      category VARCHAR(50),
      author_name VARCHAR(100),
      published_at TIMESTAMP DEFAULT NOW(),
      featured BOOLEAN DEFAULT FALSE,
      tags TEXT[],
      related_symbols TEXT[],
      views INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      image_url VARCHAR(500),
      slug VARCHAR(600) UNIQUE
    )\`,
    \`CREATE TABLE IF NOT EXISTS market_data (
      id SERIAL PRIMARY KEY,
      symbol VARCHAR(20) NOT NULL,
      name VARCHAR(100),
      price DECIMAL(15,8),
      change_amount DECIMAL(15,8),
      change_percent DECIMAL(10,4),
      market_cap BIGINT,
      volume BIGINT,
      data_type VARCHAR(20) DEFAULT 'stock',
      updated_at TIMESTAMP DEFAULT NOW()
    )\`
  ];
  
  for (const tableSQL of tables) {
    try {
      await pool.query(tableSQL);
    } catch (error) {
      console.error('Error creating table:', error);
    }
  }
  
  console.log('✅ Database tables ready');
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/articles', async (req, res) => {
  if (!pool || !dbInitialized) {
    return res.json([]);
  }
  
  try {
    const limit = parseInt(req.query.limit) || 20;
    const category = req.query.category;
    const featured = req.query.featured === 'true';
    
    let query = 'SELECT * FROM articles';
    let params = [];
    
    if (category) {
      query += ' WHERE UPPER(category) = UPPER($1)';
      params.push(category);
    } else if (featured) {
      query += ' WHERE featured = true';
    }
    
    query += ' ORDER BY published_at DESC LIMIT $' + (params.length + 1);
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Articles query error:', error);
    res.json([]);
  }
});

// Add article by ID or slug endpoint
app.get('/api/articles/:identifier', async (req, res) => {
  if (!pool || !dbInitialized) {
    return res.json({ error: 'Database not ready' });
  }
  
  try {
    const identifier = req.params.identifier;
    let query, params;
    
    // Check if identifier is numeric (ID) or string (slug)
    if (/^\d+$/.test(identifier)) {
      query = 'SELECT * FROM articles WHERE id = $1';
      params = [parseInt(identifier)];
    } else {
      query = 'SELECT * FROM articles WHERE slug = $1';
      params = [identifier];
    }
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Article not found' });
    }
    
    // Update view count
    if (/^\d+$/.test(identifier)) {
      await pool.query('UPDATE articles SET views = views + 1 WHERE id = $1', [parseInt(identifier)]);
    } else {
      await pool.query('UPDATE articles SET views = views + 1 WHERE slug = $1', [identifier]);
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Article fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/market-data/gainers', async (req, res) => {
  if (!pool || !dbInitialized) {
    return res.json([]);
  }
  
  try {
    const result = await pool.query('SELECT * FROM market_data WHERE change_percent > 0 ORDER BY change_percent DESC LIMIT 10');
    const marketData = result.rows.map(row => ({
      ...row,
      price: parseFloat(row.price || 0),
      change_percent: parseFloat(row.change_percent || 0),
      change: parseFloat(row.change || 0)
    }));
    res.json(marketData);
  } catch (error) {
    console.error('Market data query error:', error);
    res.json([]);
  }
});

// Manual article generation trigger for testing
app.post('/api/generate-article', async (req, res) => {
  if (!pool || !dbInitialized) {
    return res.json({ error: 'Database not initialized' });
  }
  
  try {
    console.log('🔧 Manual article generation triggered');
    await generateArticle();
    res.json({ success: true, message: 'Article generation completed' });
  } catch (error) {
    console.error('Manual article generation error:', error);
    res.json({ error: error.message });
  }
});

// Debug endpoint to check environment
app.get('/api/debug', (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    dbInitialized: dbInitialized,
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// RSS feed sources for authentic news
const RSS_SOURCES = [
  {
    url: 'https://cointelegraph.com/rss',
    category: 'Crypto',
    name: 'CoinTelegraph'
  },
  {
    url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',
    category: 'Crypto', 
    name: 'CoinDesk'
  },
  {
    url: 'https://feeds.bloomberg.com/markets/news.rss',
    category: 'Markets',
    name: 'Bloomberg'
  },
  {
    url: 'https://feeds.feedburner.com/techcrunch',
    category: 'Tech',
    name: 'TechCrunch'
  }
];

// RSS parsing function
async function fetchRSSFeed(url) {
  try {
    console.log(\`📡 Fetching RSS from \${url}\`);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(\`HTTP \${response.status}\`);
    }

    const text = await response.text();
    const items = [];

    // Extract items using regex (simple approach)
    const itemMatches = text.match(/<item[^>]*>(.*?)<\\/item>/gs) || [];
    
    for (const itemMatch of itemMatches.slice(0, 10)) { // Limit to 10 items
      const titleMatch = itemMatch.match(/<title[^>]*>(.*?)<\\/title>/s);
      const descMatch = itemMatch.match(/<description[^>]*>(.*?)<\\/description>/s);
      const linkMatch = itemMatch.match(/<link[^>]*>(.*?)<\\/link>/s);
      const pubDateMatch = itemMatch.match(/<pubDate[^>]*>(.*?)<\\/pubDate>/s);

      if (titleMatch && descMatch) {
        const title = titleMatch[1].replace(/<[^>]*>/g, '').trim();
        const description = descMatch[1].replace(/<[^>]*>/g, '').trim();
        const link = linkMatch ? linkMatch[1].trim() : '';
        const pubDate = pubDateMatch ? pubDateMatch[1].trim() : new Date().toISOString();

        if (title && description && title.length > 10) {
          items.push({
            title,
            description,
            link,
            pubDate: new Date(pubDate).toISOString()
          });
        }
      }
    }

    return items;
  } catch (error) {
    console.error(\`❌ RSS fetch failed for \${url}:\`, error.message);
    return [];
  }
}

// Process RSS feeds and save to database
async function processRSSFeeds() {
  if (!pool || !dbInitialized) {
    console.log('⚠️  RSS processing skipped (database not ready)');
    return;
  }

  console.log('🔄 Processing RSS feeds...');
  
  for (const source of RSS_SOURCES) {
    try {
      const items = await fetchRSSFeed(source.url);
      
      for (const item of items) {
        try {
          // Check if article already exists
          const existingCheck = await pool.query(
            'SELECT id FROM articles WHERE title = $1', 
            [item.title]
          );
          
          if (existingCheck.rows.length > 0) {
            continue; // Skip if already exists
          }
          
          // Create slug from title
          const slug = item.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100);
          
          // Insert article
          await pool.query(\`
            INSERT INTO articles (title, content, summary, category, author_name, featured, slug, published_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          \`, [
            item.title,
            item.description + '\\n\\n' + (item.link ? \`Read more at: \${item.link}\` : ''),
            item.description.substring(0, 200) + '...',
            source.category,
            source.name,
            Math.random() < 0.2,
            slug,
            item.pubDate
          ]);
          
          console.log(\`✅ Saved RSS article: \${item.title.substring(0, 50)}...\`);
          
        } catch (insertError) {
          console.error(\`❌ Failed to save article from \${source.name}:\`, insertError.message);
        }
      }
      
    } catch (error) {
      console.error(\`❌ Failed to process RSS from \${source.name}:\`, error.message);
    }
  }
  
  console.log('✅ RSS processing complete');
}

// Start database initialization
initializeDatabase().then(success => {
  if (success) {
    console.log('✅ Railway database ready');
    
    // Process RSS feeds immediately
    console.log('📡 Starting immediate RSS processing...');
    processRSSFeeds().then(() => {
      console.log('✅ Initial RSS processing completed');
    }).catch(error => {
      console.error('❌ Initial RSS processing failed:', error);
    });
    
    // Start RSS processing after database is ready
    setTimeout(() => {
      console.log('📡 Starting periodic RSS processing...');
      processRSSFeeds();
      // Process RSS feeds every 30 minutes
      setInterval(() => {
        console.log('📡 Periodic RSS processing triggered');
        processRSSFeeds();
      }, 30 * 60 * 1000);
    }, 10000); // 10 seconds delay
  } else {
    console.warn('⚠️  Starting without database functionality');
  }
});

// Static files
const publicPath = join(__dirname, 'public');
if (existsSync(publicPath)) {
  app.use(express.static(publicPath));
  console.log('✅ Serving static files from:', publicPath);
} else {
  console.warn('⚠️  Static files not found at:', publicPath);
}

// Catch-all route
app.get('*', (req, res) => {
  const indexPath = join(publicPath, 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found');
  }
});

// Start server
const port = process.env.PORT || 5000;
const server = createServer(app);

server.listen(port, '0.0.0.0', () => {
  console.log('🚀 Server running on port', port);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🔄 Shutting down...');
  server.close(() => {
    if (pool) pool.end();
    process.exit(0);
  });
});`;
    
    writeFileSync('dist/index.js', backendCode);
    console.log('✅ Backend created');
    
    // Step 3: Create package.json
    console.log('📦 Creating package.json...');
    const packageJson = {
      "name": "coin-feedly",
      "version": "1.0.0",
      "type": "module",
      "main": "index.js",
      "scripts": {
        "start": "node index.js"
      },
      "dependencies": {
        "express": "^4.21.2",
        "pg": "^8.16.3",
        "@google/genai": "^1.8.0"
      },
      "engines": {
        "node": ">=18.0.0"
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Package.json created');
    
    // Verify
    const files = ['dist/index.js', 'dist/package.json', 'dist/public/index.html'];
    const missing = files.filter(f => !existsSync(f));
    
    if (missing.length === 0) {
      console.log('✅ Railway build completed successfully!');
      console.log('📁 Files created:');
      files.forEach(f => console.log('  -', f));
    } else {
      throw new Error('Missing files: ' + missing.join(', '));
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildRailway();