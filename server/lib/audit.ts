import { prisma } from "./prisma.js";
import { Request } from "express";

export async function logAudit(req: Request, entry: { userId?: string; userEmail?: string | null; userName?: string; userRole?: string; action: string; entity: string; entityId?: string; details?: string }) {
  try {
    await prisma.auditLog.create({
      data: { ...entry, ipAddress: req.ip || "unknown", userAgent: (req.headers["user-agent"] || "unknown").substring(0, 500) },
    });
  } catch (err) { console.error("Audit log error:", err); }
}
