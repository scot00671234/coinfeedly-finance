import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { initializeDatabase } from "./database";

const app = express();
const port = parseInt(process.env.PORT ?? "5000");

// Simple error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  console.error(`❌ Error ${status}: ${message}`);
  res.status(status).json({ error: message });
});

async function startServer() {
  try {
    console.log("🚀 Starting Coin Feedly...");

    // Set DATABASE_URL if not provided
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = "postgresql://runner@127.0.0.1:5432/coinfeedly";
    }

    // Setup server routes and middleware first
    const server = await registerRoutes(app);

    // Setup development or production assets
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server
    server.listen(port, "0.0.0.0", async () => {
      console.log(`✅ Server running on http://0.0.0.0:${port}`);
      
      // Try to initialize database after server is running
      try {
        console.log("🔄 Attempting database initialization...");
        const dbSuccess = await initializeDatabase();
        if (dbSuccess) {
          console.log("✅ Database connected and initialized");
        } else {
          console.log("⚠️ Database initialization failed, but server is running");
          console.log("💡 To connect database: Set DATABASE_URL environment variable");
          console.log("💡 RSS feeds are processing and will be available once database is connected");
        }
      } catch (error) {
        console.log("⚠️ Database not available, running without database features");
        console.log("💡 RSS feeds are being fetched but cannot be stored without database");
      }
    });

  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
}

startServer();