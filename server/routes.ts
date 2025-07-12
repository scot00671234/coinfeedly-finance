import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertArticleSchema, insertMarketDataSchema, insertNewsEventSchema } from "@shared/schema";
import { articleService } from "./services/article-service";
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

  app.get('/api/articles/:identifier', async (req, res) => {
    try {
      const identifier = req.params.identifier;
      let article;
      
      // Check if identifier is a number (ID) or string (slug)
      if (/^\d+$/.test(identifier)) {
        const id = parseInt(identifier);
        article = await storage.getArticle(id);
        if (article) {
          await storage.updateArticleViews(id);
        }
      } else {
        // It's a slug
        article = await storage.getArticleBySlug(identifier);
        if (article) {
          await storage.updateArticleViewsBySlug(identifier);
        }
      }
      
      if (!article) {
        return res.status(404).json({ error: 'Article not found' });
      }
      
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

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // Start simple article generation service
  articleService.startPeriodicGeneration();

  return httpServer;
}
