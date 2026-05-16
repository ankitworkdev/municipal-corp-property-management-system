import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { AppError, asyncHandler } from "../lib/errors.js";

export const recordRoutes = Router();

const propertyInclude = {
  ward: { select: { id: true, name: true } },
  road: { select: { id: true, name: true } },
  owner: { select: { id: true, firstName: true, lastName: true, mobile: true, email: true, profilePhotoUrl: true } },
};

recordRoutes.get(
  "/properties/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id;
    const property = await prisma.property.findFirst({
      where: { OR: [{ id }, { propertyId: id }] },
      include: propertyInclude,
    });
    if (!property) throw new AppError(404, "Property not found");
    res.json({ success: true, data: property });
  }),
);

recordRoutes.get(
  "/payments/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id;
    const payment = await prisma.payment.findFirst({
      where: { OR: [{ id }, { paymentId: id }] },
      include: {
        demand: {
          include: {
            assessment: {
              include: {
                property: { select: { id: true, propertyId: true, ownerName: true, ward: { select: { name: true } } } },
                assessmentYear: { select: { year: true } },
              },
            },
          },
        },
        paidBy: { select: { id: true, firstName: true, lastName: true, mobile: true, profilePhotoUrl: true } },
      },
    });
    if (!payment) throw new AppError(404, "Payment not found");
    res.json({ success: true, data: payment });
  }),
);

recordRoutes.get(
  "/demands/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id;
    const demand = await prisma.demand.findFirst({
      where: { OR: [{ id }, { demandId: id }] },
      include: {
        assessment: {
          include: {
            property: { select: { id: true, propertyId: true, ownerName: true, ward: { select: { name: true } } } },
            assessmentYear: { select: { year: true } },
          },
        },
        payments: { orderBy: { createdAt: "desc" }, take: 20 },
      },
    });
    if (!demand) throw new AppError(404, "Demand not found");
    res.json({ success: true, data: demand });
  }),
);

recordRoutes.get(
  "/disputes/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id;
    const dispute = await prisma.dispute.findUnique({
      where: { id },
      include: {
        property: { select: { id: true, propertyId: true, ownerName: true } },
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!dispute) throw new AppError(404, "Dispute not found");
    res.json({ success: true, data: dispute });
  }),
);

recordRoutes.get(
  "/assessments/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id;
    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        property: { include: { ward: { select: { name: true } } } },
        assessmentYear: { select: { year: true } },
      },
    });
    if (!assessment) throw new AppError(404, "Assessment not found");
    res.json({ success: true, data: assessment });
  }),
);

recordRoutes.get(
  "/users/:id",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id;
    const me = (req as any).user;
    if (me.id !== id && !["ADMIN", "EO"].includes(me.role)) {
      throw new AppError(403, "Not allowed to view this user");
    }
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        mobile: true,
        role: true,
        status: true,
        profilePhotoUrl: true,
        createdAt: true,
      },
    });
    if (!user) throw new AppError(404, "User not found");
    res.json({ success: true, data: user });
  }),
);
