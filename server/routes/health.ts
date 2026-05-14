import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { config } from "../lib/config.js";

export const healthRoutes = Router();

healthRoutes.get("/health", async (req, res) => {
  const start = Date.now();
  let dbStatus = "ok";
  let dbLatency = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatency = Date.now() - dbStart;
  } catch (err) {
    dbStatus = "error";
  }

  const uptime = process.uptime();
  const memUsage = process.memoryUsage();

  res.json({
    status: dbStatus === "ok" ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    environment: config.nodeEnv,
    uptime: `${Math.floor(uptime / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    database: { status: dbStatus, latency: `${dbLatency}ms` },
    memory: {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heap: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB/${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
    },
    responseTime: `${Date.now() - start}ms`,
  });
});
