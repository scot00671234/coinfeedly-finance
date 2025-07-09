import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { setupRailwayDatabase, seedRailwayData } from "./railway-setup";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
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

      log(logLine);
    }
  });

  next();
});

// Railway deployment initialization
(async () => {
  console.log('🚀 Starting Coin Feedly server for Railway deployment...');
  
  // Setup Railway database with enhanced error handling
  const { pool, success } = await setupRailwayDatabase();
  
  if (!success) {
    console.error('❌ Railway database setup failed - server starting in limited mode');
    console.error('Database-dependent features will be unavailable');
    console.error('Check your DATABASE_URL configuration in Railway');
  } else {
    console.log('✅ Railway database initialized successfully');
    
    // Seed initial data
    try {
      await seedRailwayData(pool);
      console.log('✅ Railway deployment fully initialized with sample data');
    } catch (seedError) {
      console.error('❌ Data seeding failed:', seedError.message);
      console.log('✅ Server will continue with empty database');
    }
  }
  
  // Initialize routes and WebSocket server
  const server = await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Development vs Production setup
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server on Railway-compatible port
  const port = process.env.PORT || 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Railway deployment serving on port ${port}`);
    console.log('🚀 Coin Feedly is ready for Railway deployment!');
  });
})();
