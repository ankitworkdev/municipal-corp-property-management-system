export const config = {
  port: parseInt(process.env.PORT || "3001"),
  nodeEnv: process.env.NODE_ENV || "development",
  isDev: (process.env.NODE_ENV || "development") !== "production",

  db: {
    url: process.env.DATABASE_URL || "postgresql://demo_user:demo_secret_2026@localhost:5433/demo_docker_learning",
  },

  auth: {
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "municipal-pms-dev-secret-change-in-production-min-32chars",
    tokenExpiry: process.env.TOKEN_EXPIRY || "24h",
    cookieName: "auth-token",
    cookieMaxAge: 86400000, // 24 hours
    /** HTTPS hosts (e.g. Render) require Secure cookies */
    cookieSecure: process.env.NODE_ENV === "production",
  },

  cors: {
    origin: process.env.CORS_ORIGIN || true,
  },

  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX || "100"),
  },
} as const;
