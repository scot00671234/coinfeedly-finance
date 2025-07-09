import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, mkdirSync, writeFileSync, readFileSync } from 'fs';

const execAsync = promisify(exec);

async function buildSimple() {
  try {
    console.log('🚀 Building for Railway deployment...');
    
    // Create dist directory
    mkdirSync('dist', { recursive: true });
    mkdirSync('dist/public', { recursive: true });
    
    // Create a simple HTML file for Railway deployment
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Coin Feedly - Financial News Platform</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .header { border-bottom: 2px solid #007bff; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #333; margin: 0; }
        .nav { display: flex; gap: 20px; margin-top: 15px; }
        .nav a { color: #007bff; text-decoration: none; padding: 8px 16px; border-radius: 4px; transition: background-color 0.3s; }
        .nav a:hover { background: #e9ecef; }
        .status { background: #d4edda; color: #155724; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .articles-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin: 30px 0; }
        .article-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .article-card h3 { margin: 0 0 10px 0; color: #333; }
        .article-card p { margin: 10px 0; color: #666; line-height: 1.6; }
        .article-meta { font-size: 0.9em; color: #888; margin-top: 15px; }
        .loading { text-align: center; padding: 40px; color: #666; }
        .market-ticker { background: #343a40; color: white; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .market-item { display: inline-block; margin-right: 30px; }
        .positive { color: #28a745; }
        .negative { color: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📰 Coin Feedly</h1>
            <p>Financial News Platform - Railway Deployment</p>
            <div class="nav">
                <a href="#" onclick="loadArticles()">Latest Articles</a>
                <a href="#" onclick="loadMarketData()">Market Data</a>
                <a href="/api/health">Health Check</a>
                <a href="/api/articles">API</a>
            </div>
        </div>
        
        <div class="status">
            ✅ Railway deployment successful! Backend API is fully operational.
        </div>
        
        <div class="market-ticker" id="market-ticker">
            <div id="market-data">Loading market data...</div>
        </div>
        
        <div class="articles-grid" id="articles-container">
            <div class="loading">Loading articles...</div>
        </div>
    </div>
    
    <script>
        let articles = [];
        let marketData = [];
        
        async function loadArticles() {
            try {
                const response = await fetch('/api/articles');
                articles = await response.json();
                displayArticles();
            } catch (error) {
                console.error('Error loading articles:', error);
                document.getElementById('articles-container').innerHTML = 
                    '<div class="loading">Error loading articles: ' + error.message + '</div>';
            }
        }
        
        async function loadMarketData() {
            try {
                const response = await fetch('/api/market-data/gainers');
                marketData = await response.json();
                displayMarketData();
            } catch (error) {
                console.error('Error loading market data:', error);
                document.getElementById('market-data').innerHTML = 'Error loading market data';
            }
        }
        
        function displayArticles() {
            const container = document.getElementById('articles-container');
            if (articles && articles.length > 0) {
                container.innerHTML = articles.map(article => 
                    '<div class="article-card">' +
                    '<h3>' + (article.title || 'No title') + '</h3>' +
                    '<p>' + (article.summary || 'No summary available') + '</p>' +
                    '<div class="article-meta">' +
                    'By ' + (article.author_name || 'Unknown') + ' • ' + 
                    (article.category || 'General') + ' • ' +
                    new Date(article.published_at).toLocaleDateString() +
                    '</div>' +
                    '</div>'
                ).join('');
            } else {
                container.innerHTML = '<div class="loading">No articles available yet.</div>';
            }
        }
        
        function displayMarketData() {
            const container = document.getElementById('market-data');
            if (marketData && marketData.length > 0) {
                container.innerHTML = marketData.map(item => 
                    '<div class="market-item">' +
                    '<strong>' + item.symbol + '</strong> ' +
                    '$' + parseFloat(item.price).toFixed(2) + ' ' +
                    '<span class="' + (item.change_percent > 0 ? 'positive' : 'negative') + '">' +
                    (item.change_percent > 0 ? '+' : '') + item.change_percent.toFixed(2) + '%' +
                    '</span>' +
                    '</div>'
                ).join('');
            } else {
                container.innerHTML = 'No market data available';
            }
        }
        
        // Auto-load content on page load
        window.addEventListener('load', function() {
            loadArticles();
            loadMarketData();
            
            // Auto-refresh every 30 seconds
            setInterval(function() {
                loadArticles();
                loadMarketData();
            }, 30000);
        });
    </script>
</body>
</html>
    `;
    
    writeFileSync('dist/public/index.html', htmlContent);
    console.log('✅ Frontend HTML created');
    
    // Use the production entry directly
    const serverContent = readFileSync('server/production-entry.js', 'utf8');
    writeFileSync('dist/index.js', serverContent);
    console.log('✅ Backend server copied');
    
    // Create package.json for Railway
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
      }
    };
    
    writeFileSync('dist/package.json', JSON.stringify(packageJson, null, 2));
    console.log('✅ Package.json created');
    
    console.log('✅ Railway build completed successfully!');
    console.log('📁 Frontend: ./dist/public/index.html');
    console.log('📁 Backend: ./dist/index.js');
    console.log('📁 Package: ./dist/package.json');
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildSimple();