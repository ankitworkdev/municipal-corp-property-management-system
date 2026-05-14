import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { logAudit } from "../lib/audit.js";

export const assessmentRoutes = Router();

assessmentRoutes.get("/assessments", requireAuth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string || "1"));
  const take = Math.min(100, parseInt(req.query.pageSize as string || "25"));
  const skip = (page - 1) * take;
  const where: any = {};
  if ((req as any).user.role === "USER") where.property = { ownerId: (req as any).user.id };

  const [data, total] = await Promise.all([
    prisma.assessment.findMany({ where, skip, take, include: {
      property: { include: { ward: { select: { name: true } }, road: { select: { name: true } } } },
      assessmentYear: { select: { year: true } },
      createdBy: { select: { firstName: true, lastName: true } },
      submittedBy: { select: { firstName: true, lastName: true } },
      approvedBy: { select: { firstName: true, lastName: true } },
    }, orderBy: { createdAt: "desc" } }),
    prisma.assessment.count({ where }),
  ]);
  res.json({ success: true, data, pagination: { total, page, pageSize: take, totalPages: Math.ceil(total / take) } });
});

assessmentRoutes.post("/assessments", requireAuth, async (req, res) => {
  const u = (req as any).user;
  const a = await prisma.assessment.create({ data: { ...req.body, formStatus: "DRAFT", createdById: u.id, lastModifiedById: u.id } });
  await logAudit(req, { userId: u.id, userName: u.name, userRole: u.role, action: "CREATE_ASSESSMENT", entity: "Assessment", entityId: a.id, details: "Created new assessment (DRAFT)" });
  res.status(201).json({ success: true, data: a });
});

assessmentRoutes.put("/assessments", requireAuth, async (req, res) => {
  const { id, action, ...data } = req.body;
  if (!id) return res.status(400).json({ error: "ID required" });
  const uid = (req as any).user.id;

  if (action === "submit") {
    const updated = await prisma.assessment.update({ where: { id }, data: { formStatus: "SUBMITTED", submittedById: uid, submittedAt: new Date(), lastModifiedById: uid } });
    const usr = (req as any).user;
    await logAudit(req, { userId: usr.id, userName: usr.name, userRole: usr.role, action: "SUBMIT_ASSESSMENT", entity: "Assessment", entityId: id, details: "Assessment submitted for approval" });
    return res.json({ success: true, data: updated });
  }
  if (action === "approve") {
    const updated = await prisma.$transaction(async (tx) => {
      const a = await tx.assessment.update({ where: { id }, data: { formStatus: "APPROVED", approvedById: uid, approvedAt: new Date(), lastModifiedById: uid } });
      if (a.totalDemand && a.totalDemand > 0) {
        const cnt = await tx.demand.count();
        await tx.demand.create({ data: { demandId: `DEM-${(cnt+1).toString().padStart(6,"0")}`, assessmentId: id, amount: a.totalDemand, balanceAmount: a.totalDemand } });
      }
      return a;
    });
    const usr2 = (req as any).user;
    await logAudit(req, { userId: usr2.id, userName: usr2.name, userRole: usr2.role, action: "APPROVE_ASSESSMENT", entity: "Assessment", entityId: id, details: "Assessment approved, demand generated" });
    return res.json({ success: true, data: updated });
  }
  if (action === "reject") {
    const u = await prisma.assessment.update({ where: { id }, data: { formStatus: "REJECTED", lastModifiedById: uid } });
    return res.json({ success: true, data: u });
  }
  const u = await prisma.assessment.update({ where: { id }, data: { ...data, lastModifiedById: uid } });
  res.json({ success: true, data: u });
});
