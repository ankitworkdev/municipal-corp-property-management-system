import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";

export const paymentRoutes = Router();

paymentRoutes.get("/payments", requireAuth, async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page as string || "1"));
  const take = Math.min(100, parseInt(req.query.pageSize as string || "25"));
  const skip = (page - 1) * take;
  const [data, total] = await Promise.all([
    prisma.payment.findMany({ skip, take, include: { demand: { include: { assessment: { include: { property: { include: { ward: true } }, assessmentYear: true } } } }, paidBy: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" } }),
    prisma.payment.count(),
  ]);
  res.json({ success: true, data, pagination: { total, page, pageSize: take, totalPages: Math.ceil(total / take) } });
});

paymentRoutes.put("/payments", requireAuth, async (req, res) => {
  const { demandId, orderId, paymentMode, chequeNumber } = req.body;
  if (!demandId || !paymentMode) return res.status(400).json({ error: "Demand ID and mode required" });
  const demand = await prisma.demand.findUnique({ where: { demandId } });
  if (!demand) return res.status(404).json({ error: "Demand not found" });
  const uid = (req as any).user.id;
  const payment = await prisma.$transaction(async (tx) => {
    const p = await tx.payment.create({ data: { demandId: demand.id, amount: demand.balanceAmount, paymentMode, paymentStatus: "SUCCESS", orderId, chequeNumber, paymentDate: new Date(), paidById: uid, orderCreatedById: uid, paymentId: `PAY-${Date.now()}` } });
    await tx.demand.update({ where: { id: demand.id }, data: { balanceAmount: 0, status: "PAID" } });
    return p;
  });
  res.json({ success: true, data: payment });
});
