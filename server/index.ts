import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "./lib/config.js";
import { logger, requestLogger } from "./lib/logger.js";
import { notFoundHandler, errorHandler } from "./lib/errors.js";
import { authRoutes } from "./routes/auth.js";
import { crudRoutes } from "./routes/crud.js";
import { dashboardRoutes } from "./routes/dashboard.js";
import { assessmentRoutes } from "./routes/assessments.js";
import { paymentRoutes } from "./routes/payments.js";
import { healthRoutes } from "./routes/health.js";
import { apiRateLimit, authRateLimit } from "./lib/rate-limit.js";

const app = express();
app.set("trust proxy", 1);

// Core middleware
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(requestLogger);
app.use("/api", apiRateLimit);
app.use("/api/login", authRateLimit);
app.use("/api/citizen-login", authRateLimit);
app.use("/api/register-simple", authRateLimit);

// Health check (no auth required)
app.use("/api", healthRoutes);

// API routes
app.use("/api", authRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", assessmentRoutes);
app.use("/api", paymentRoutes);
app.use("/api", crudRoutes);

// Error handling for API routes
app.use("/api/*", notFoundHandler);
app.use(errorHandler);

// Production: serve static frontend
import path from "path";
import { fileURLToPath } from "url";
if (!config.isDev) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  // Compiled server lives in dist/server; Vite output is dist/client (not dist/dist/client)
  const clientDist = path.join(__dirname, "../client");
  app.use(express.static(clientDist));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) return next();
    res.sendFile(path.join(clientDist, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

// Start server
app.listen(config.port, "0.0.0.0", () => {
  logger.info({
    port: config.port,
    env: config.nodeEnv,
    pid: process.pid,
  }, `Server running on http://localhost:${config.port}`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, shutting down...");
  process.exit(0);
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  logger.fatal({ reason }, "Unhandled rejection");
  process.exit(1);
});
