import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";

export const dashboardRoutes = Router();

dashboardRoutes.get("/dashboard/stats", requireAuth, async (req, res) => {
  const [d, c, a, p] = await Promise.all([
    prisma.demand.aggregate({ _sum: { amount: true } }),
    prisma.payment.aggregate({ _sum: { amount: true }, where: { paymentStatus: "SUCCESS" } }),
    prisma.assessment.count(),
    prisma.assessment.count({ where: { formStatus: "SUBMITTED" } }),
  ]);
  res.json({ success: true, data: {
    totalDemand: d._sum.amount || 0, totalCollection: c._sum.amount || 0,
    totalBalanceDemand: (d._sum.amount || 0) - (c._sum.amount || 0),
    totalAssessment: a, totalPendingApplication: p,
  }});
});
