import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertArticleSchema, insertMarketDataSchema, insertNewsEventSchema } from "@shared/schema";
import { realNewsGenerator } from "./services/real-news-generator";
import { realTimeNewsService } from "./services/real-time-news";
import { yahooFinanceService } from "./services/yahoo-finance";
import { coinGeckoService } from "./services/coingecko";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time updates (optional for Railway)
  let wss: WebSocketServer | null = null;
  const activeConnections = new Set<WebSocket>();
  
  try {
    wss = new WebSocketServer({ server: httpServer, path: '/ws' });
    
    wss.on('connection', (ws) => {
      activeConnections.add(ws);
      console.log('WebSocket client connected');
      
      ws.on('close', () => {
        activeConnections.delete(ws);
        console.log('WebSocket client disconnected');
      });
    });
    
    console.log('✅ WebSocket server initialized');
  } catch (error) {
    console.log('⚠️ WebSocket server not available (Railway deployment)');
    wss = null;
  }

  // Broadcast to all connected clients (if WebSocket is available)
  function broadcast(data: any) {
    if (wss && activeConnections.size > 0) {
      const message = JSON.stringify(data);
      activeConnections.forEach((ws) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(message);
        }
      });
    }
  }

  // Articles API
  app.get('/api/articles', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const category = req.query.category as string;
      const featured = req.query.featured === 'true';
      const search = req.query.search as string;

      let articles;
      if (search) {
        articles = await storage.searchArticles(search, limit);
      } else if (featured) {
        articles = await storage.getFeaturedArticles(limit);
      } else if (category) {
        articles = await storage.getArticlesByCategory(category, limit);
      } else {
        articles = await storage.getArticles(limit, offset);
      }

      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch articles' });
    }
  });

  app.get('/api/articles/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const article = await storage.getArticle(id);
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }

      // Update view count
      await storage.updateArticleViews(id);
      
      res.json(article);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch article' });
    }
  });

  app.post('/api/articles/:id/share', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.updateArticleShares(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update share count' });
    }
  });

  // Market Data API
  app.get('/api/market-data', async (req, res) => {
    try {
      const symbols = req.query.symbols ? (req.query.symbols as string).split(',') : undefined;
      const type = req.query.type as string;
      
      let marketData;
      if (type) {
        marketData = await storage.getMarketDataByType(type);
      } else {
        marketData = await storage.getMarketData(symbols);
      }
      
      res.json(marketData);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch market data' });
    }
  });

  app.get('/api/market-data/gainers', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const gainers = await storage.getTopGainers(limit);
      res.json(gainers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch top gainers' });
    }
  });

  app.get('/api/market-data/losers', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const losers = await storage.getTopLosers(limit);
      res.json(losers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch top losers' });
    }
  });

  // News Events API
  app.get('/api/news-events', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const events = await storage.getRecentNewsEvents(limit);
      res.json(events);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch news events' });
    }
  });

  // Real-time data fetching and article generation
  async function fetchAndUpdateMarketData() {
    try {
      // Fetch stock data
      const stockSymbols = ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN', 'META', 'AMD'];
      const stockData = await yahooFinanceService.getQuotes(stockSymbols);
      
      // Fetch crypto data
      const cryptoData = await coinGeckoService.getTopCoins(10);
      
      // Update market data and broadcast changes
      const updatedData = [];
      
      for (const stock of stockData) {
        const updated = await storage.upsertMarketData({
          symbol: stock.symbol,
          name: stock.name,
          price: stock.price.toString(),
          change: stock.change.toString(),
          changePercent: stock.changePercent.toString(),
          volume: stock.volume?.toString(),
          type: 'stock',
          metadata: { 
            currency: stock.currency,
            exchange: stock.exchange 
          }
        });
        updatedData.push(updated);
      }
      
      for (const crypto of cryptoData) {
        const updated = await storage.upsertMarketData({
          symbol: crypto.symbol.toUpperCase(),
          name: crypto.name,
          price: crypto.price.toString(),
          change: crypto.change.toString(),
          changePercent: crypto.changePercent.toString(),
          marketCap: crypto.marketCap?.toString(),
          type: 'crypto',
          metadata: { 
            rank: crypto.rank,
            circulatingSupply: crypto.circulatingSupply 
          }
        });
        updatedData.push(updated);
      }
      
      // Broadcast updates to WebSocket clients
      broadcast({
        type: 'market-data-update',
        data: updatedData
      });
      
      console.log(`Updated ${updatedData.length} market data entries`);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  }

  async function processNewsEvents() {
    try {
      // Generate market-based articles using real-time news service
      console.log('Generating market analysis articles...');
      await realTimeNewsService.generateRealTimeArticles();
      console.log('Market analysis articles completed');
    } catch (error) {
      console.error('Error generating market articles:', error);
    }
  }

  // Generate real-time news with web grounding
  async function generateRealTimeNews() {
    try {
      console.log('Generating real-time news with web grounding...');
      await realTimeNewsService.generateRealTimeArticles();
      console.log('Real-time news generation completed');
    } catch (error) {
      console.error('Error generating real-time news:', error);
    }
  }

  // Test route to trigger article generation
  app.post("/api/test-articles", async (req, res) => {
    try {
      await realTimeNewsService.generateRealTimeArticles();
      res.json({ message: "Articles generated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate articles" });
    }
  });

  // Initial market data fetch
  fetchAndUpdateMarketData().catch(console.error);
  
  // Update market data every 15 minutes
  setInterval(fetchAndUpdateMarketData, 15 * 60 * 1000);
  
  // Initial article generation (async, don't block server startup)
  processNewsEvents().catch(console.error);

  // Generate market analysis articles every 45 minutes  
  // Wait 60 seconds before starting to ensure previous processes are ready
  setTimeout(() => {
    setInterval(processNewsEvents, 45 * 60 * 1000);
  }, 60000);

  // Generate real-time news with web grounding every 30 minutes (increased from 20 to reduce rate limit hits)
  // Wait 30 seconds before starting to ensure database is ready
  setTimeout(() => {
    generateRealTimeNews().catch(console.error);
    setInterval(generateRealTimeNews, 30 * 60 * 1000);
  }, 30000);

  return httpServer;
}
