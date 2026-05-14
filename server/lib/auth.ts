import { SignJWT, jwtVerify } from "jose";
import { Request, Response, NextFunction } from "express";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "municipal-pms-dev-secret-change-in-production-min-32chars",
);
const COOKIE = "auth-token";

export interface AuthUser { id: string; name: string; email: string | null; role: string; mobile: string; }

export async function createToken(user: AuthUser): Promise<string> {
  return new SignJWT({ ...user }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("24h").setIssuedAt().sign(SECRET);
}

export async function verifyToken(token: string): Promise<AuthUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as AuthUser;
  } catch { return null; }
}

export async function getUser(req: Request): Promise<AuthUser | null> {
  const token = req.cookies?.[COOKIE];
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  getUser(req).then(user => {
    if (!user) return res.status(401).json({ error: "Unauthorized" });
    (req as any).user = user;
    next();
  });
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    getUser(req).then(user => {
      if (!user || !roles.includes(user.role)) return res.status(403).json({ error: "Forbidden" });
      (req as any).user = user;
      next();
    });
  };
}
