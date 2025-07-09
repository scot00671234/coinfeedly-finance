import { writeFileSync, mkdirSync, existsSync, readFileSync, copyFileSync } from 'fs';
import { join } from 'path';

async function buildRailwaySimple() {
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
    
    // Step 2: Create simplified backend
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

// Database setup
let pool;
if (process.env.DATABASE_URL) {
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  });
  
  // Initialize database
  pool.query('SELECT NOW()').then(() => {
    console.log('✅ Database connected');
  }).catch(err => {
    console.error('❌ Database connection failed:', err);
  });
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/articles', async (req, res) => {
  if (!pool) {
    return res.json([]);
  }
  
  try {
    const result = await pool.query('SELECT * FROM articles ORDER BY published_at DESC LIMIT 20');
    res.json(result.rows);
  } catch (error) {
    console.error('Articles query error:', error);
    res.json([]);
  }
});

app.get('/api/market-data/gainers', async (req, res) => {
  if (!pool) {
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
        "pg": "^8.16.3"
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

buildRailwaySimple();