import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { initializeRailwayDatabase } from "./railway-init";
import { registerRoutes } from "./routes";

// Railway-compatible server with complete self-initialization
export class RailwayServer {
  private app: express.Application;
  private server: any;
  private db: any;
  private pool: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
  }

  private setupMiddleware() {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: false }));

    // Request logging
    this.app.use((req, res, next) => {
      const start = Date.now();
      const path = req.path;
      let capturedJsonResponse: Record<string, any> | undefined = undefined;

      const originalResJson = res.json;
      res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
      };

      res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
          let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
          if (capturedJsonResponse) {
            logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
          }
          if (logLine.length > 80) {
            logLine = logLine.slice(0, 79) + "…";
          }
          this.log(logLine);
        }
      });

      next();
    });

    // Error handler
    this.app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error('Server error:', err);
    });
  }

  private log(message: string, source = "express") {
    const formattedTime = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
    console.log(`${formattedTime} [${source}] ${message}`);
  }

  private setupStaticFiles() {
    // Railway production static file serving
    const distPath = join(process.cwd(), "dist", "public");
    
    if (existsSync(distPath)) {
      this.app.use(express.static(distPath));
      this.log(`Serving static files from: ${distPath}`);
      
      // Fallback to index.html for SPA routing
      this.app.use("*", (_req, res) => {
        const indexPath = join(distPath, "index.html");
        if (existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("Application not found");
        }
      });
    } else {
      // Development fallback
      this.app.get("*", (_req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>Coin Feedly</title></head>
          <body>
            <h1>Coin Feedly</h1>
            <p>Railway deployment in progress...</p>
            <p>Static files not found at: ${distPath}</p>
          </body>
          </html>
        `);
      });
    }
  }

  async initialize(): Promise<void> {
    console.log('🚀 Railway Server - Starting initialization...');
    
    try {
      // Initialize database
      const dbResult = await initializeRailwayDatabase();
      
      if (!dbResult.success) {
        console.error('❌ Database initialization failed - starting in limited mode');
        // Continue with limited functionality
      } else {
        this.db = dbResult.db;
        this.pool = dbResult.pool;
        console.log('✅ Database initialization completed');
      }

      // Create HTTP server
      this.server = createServer(this.app);

      // Register API routes
      await registerRoutes(this.app);

      // Setup static file serving
      this.setupStaticFiles();

      // Start background article generation for Railway
      if (process.env.GEMINI_API_KEY) {
        console.log('🤖 Starting background article generation for Railway...');
        
        // Import the article generation service
        const { realTimeNewsService } = await import('./services/real-time-news');
        
        // Generate articles immediately and then every 45 minutes
        setTimeout(async () => {
          try {
            console.log('🤖 Generating initial articles for Railway...');
            await realTimeNewsService.generateRealTimeArticles();
            console.log('✅ Initial articles generated');
          } catch (error) {
            console.error('❌ Error generating initial articles:', error);
          }
        }, 10000); // Initial delay of 10 seconds
        
        // Set up periodic generation
        setInterval(async () => {
          try {
            console.log('🤖 Generating periodic articles for Railway...');
            await realTimeNewsService.generateRealTimeArticles();
            console.log('✅ Periodic articles generated');
          } catch (error) {
            console.error('❌ Error generating periodic articles:', error);
          }
        }, 45 * 60 * 1000); // Every 45 minutes
      } else {
        console.log('⚠️  GEMINI_API_KEY not set, background article generation disabled');
      }

      console.log('✅ Railway server initialization completed');

    } catch (error) {
      console.error('❌ Railway server initialization failed:', error);
      throw error;
    }
  }

  async start(): Promise<void> {
    const port = process.env.PORT || 5000;
    
    this.server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Railway server listening on port ${port}`);
      console.log(`📡 Health check: http://localhost:${port}/api/health`);
      console.log('✅ Coin Feedly is ready for Railway deployment!');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 Received SIGTERM, shutting down gracefully...');
      this.server.close(() => {
        console.log('✅ Server closed');
        if (this.pool) {
          this.pool.end(() => {
            console.log('✅ Database connections closed');
            process.exit(0);
          });
        } else {
          process.exit(0);
        }
      });
    });
  }
}

// Start the server
async function startRailwayServer() {
  try {
    const server = new RailwayServer();
    await server.initialize();
    await server.start();
  } catch (error) {
    console.error('💥 Failed to start Railway server:', error);
    process.exit(1);
  }
}

// Only run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  startRailwayServer();
}

export default RailwayServer;