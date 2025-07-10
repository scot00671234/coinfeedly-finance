import express, { type Request, Response, NextFunction } from "express";
import { createServer } from "http";
import { join } from "path";
import { existsSync } from "fs";
import { initializeRailwayDatabase } from "./railway-init";

// Production server with database auto-initialization
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging
app.use((req, res, next) => {
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
      console.log(`${new Date().toLocaleTimeString()} [express] ${logLine}`);
    }
  });

  next();
});

// Initialize everything
(async () => {
  console.log('🚀 Starting Coin Feedly for Railway deployment...');
  
  try {
    // Initialize database
    const dbResult = await initializeRailwayDatabase();
    
    if (!dbResult.success) {
      console.error('❌ Database initialization failed - starting in limited mode');
    } else {
      console.log('✅ Database initialization completed');
    }

    // Import and register routes dynamically
    const { registerRoutes } = await import('./routes');
    const server = await registerRoutes(app);

    // Static file serving for production
    const distPath = join(process.cwd(), "dist", "public");
    
    if (existsSync(distPath)) {
      app.use(express.static(distPath));
      console.log(`✅ Serving static files from: ${distPath}`);
      
      // SPA fallback
      app.use("*", (_req, res) => {
        const indexPath = join(distPath, "index.html");
        if (existsSync(indexPath)) {
          res.sendFile(indexPath);
        } else {
          res.status(404).send("Application not found");
        }
      });
    } else {
      console.warn(`⚠️  Static files not found at: ${distPath}`);
      app.get("*", (_req, res) => {
        res.send(`
          <!DOCTYPE html>
          <html>
          <head><title>Coin Feedly</title></head>
          <body>
            <h1>Coin Feedly</h1>
            <p>Railway deployment in progress...</p>
          </body>
          </html>
        `);
      });
    }

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error('Server error:', err);
    });

    // Start server
    const port = process.env.PORT || 5000;
    server.listen(port, '0.0.0.0', () => {
      console.log(`🚀 Railway server listening on port ${port}`);
      console.log('✅ Coin Feedly is ready for Railway deployment!');
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('🔄 Received SIGTERM, shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('💥 Failed to start Railway server:', error);
    process.exit(1);
  }
})();