import express, { type Request, type Response, type NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic } from "./vite";
import { runMigrations, seedInitialData } from "./migrate";

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
    console.log("🚀 Starting Coin Feedly server...");

    // Run database migrations
    const migrationResult = await runMigrations();
    if (!migrationResult.success) {
      throw new Error("Database migration failed");
    }

    // Seed initial data
    await seedInitialData();

    // Setup server routes and middleware
    const server = await registerRoutes(app);

    // Setup development or production assets
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Start the server
    server.listen(port, "0.0.0.0", () => {
      console.log(`✅ Server running on http://0.0.0.0:${port}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();