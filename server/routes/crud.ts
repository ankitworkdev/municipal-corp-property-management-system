import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth, requireRole } from "../lib/auth.js";
import { logAudit } from "../lib/audit.js";

export const crudRoutes = Router();

function paginate(req: Request) {
  const page = Math.max(1, parseInt(req.query.page as string || "1"));
  const take = Math.min(100, parseInt(req.query.pageSize as string || "25"));
  return { page, take, skip: (page - 1) * take };
}

function crud(path: string, model: any, opts?: { orderBy?: any; include?: any; where?: (req: Request) => any; searchFields?: string[] }) {
  crudRoutes.get(path, requireAuth, async (req: Request, res: Response) => {
    const { page, take, skip } = paginate(req);
    const baseWhere = opts?.where?.(req) || {};
    const search = req.query.search as string;
    let where = { ...baseWhere };
    if (search && opts?.searchFields?.length) {
      where = { ...baseWhere, OR: opts.searchFields.map(f => ({ [f]: { contains: search, mode: "insensitive" } })) };
    }
    const [data, total] = await Promise.all([
      model.findMany({ where, skip, take, orderBy: opts?.orderBy, include: opts?.include }),
      model.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { total, page, pageSize: take, totalPages: Math.ceil(total / take) } });
  });

  crudRoutes.post(path, requireAuth, async (req: Request, res: Response) => {
    const record = await model.create({ data: req.body });
    const u = (req as any).user;
    await logAudit(req, { userId: u?.id, userName: u?.name, userRole: u?.role, action: "CREATE", entity: path, entityId: record.id, details: `Created ${path} record` });
    res.status(201).json({ success: true, data: record });
  });

  crudRoutes.put(path, requireAuth, async (req: Request, res: Response) => {
    const { id, ...data } = req.body;
    if (!id) return res.status(400).json({ error: "ID required" });
    const record = await model.update({ where: { id }, data });
    const u = (req as any).user;
    await logAudit(req, { userId: u?.id, userName: u?.name, userRole: u?.role, action: "UPDATE", entity: path, entityId: id, details: `Updated ${path} record` });
    res.json({ success: true, data: record });
  });

  crudRoutes.delete(path, requireAuth, async (req: Request, res: Response) => {
    const id = req.query.id as string;
    if (!id) return res.status(400).json({ error: "ID required" });
    await model.delete({ where: { id } });
    const u = (req as any).user;
    await logAudit(req, { userId: u?.id, userName: u?.name, userRole: u?.role, action: "DELETE", entity: path, entityId: id, details: `Deleted ${path} record` });
    res.json({ success: true });
  });
}

// Masterdata
crud("/wards", prisma.ward, { orderBy: { name: "asc" }, searchFields: ["name", "description"] });
crud("/roads", prisma.road, { orderBy: { name: "asc" }, searchFields: ["name", "description"] });
crud("/arv-rates", prisma.arvRate);
crud("/property-tax-rate", prisma.propertyTaxRate);
crud("/occupancy-types", prisma.occupancyTypeConfig);
crud("/usage-types", prisma.usageTypeConfig);
crud("/usage-factors", prisma.usageFactorConfig, { orderBy: { factorName: "asc" } });
crud("/discount-types", prisma.discountTypeConfig);
crud("/interest-rate", prisma.interestRateConfig);
crud("/solid-waste-charges", prisma.solidWasteCharge, { orderBy: { sortOrder: "asc" } });
crud("/vacant-land-tax-rates", prisma.vacantLandTaxRate);
crud("/vacant-land-threshold", prisma.vacantLandThreshold);
crud("/settings", prisma.systemSetting, { orderBy: { settingName: "asc" } });
crud("/assessment-years", prisma.assessmentYear, { orderBy: { year: "desc" } });

// Users
crud("/users/citizens", prisma.user, { orderBy: { createdAt: "desc" }, where: () => ({ role: "USER" }), searchFields: ["firstName", "lastName", "mobile"] });
crud("/users/officials", prisma.user, { orderBy: { createdAt: "desc" }, where: () => ({ role: { not: "USER" } }), searchFields: ["firstName", "lastName", "email"] });

// Staff
crudRoutes.get("/staffs", requireAuth, async (req, res) => {
  const { page, take, skip } = paginate(req);
  const [data, total] = await Promise.all([
    prisma.staff.findMany({ skip, take, include: { user: { select: { firstName: true, lastName: true, email: true, role: true, profilePhotoUrl: true, profilePhotoThumbUrl: true } }, assignedWards: { include: { ward: { select: { name: true } } } } }, orderBy: { createdAt: "desc" } }),
    prisma.staff.count(),
  ]);
  const formatted = data.map((s: any) => ({
    id: s.id,
    userId: s.userId,
    name: `${s.user.firstName} ${s.user.lastName}`,
    email: s.user.email,
    role: s.user.role,
    profilePhotoUrl: s.user.profilePhotoUrl,
    profilePhotoThumbUrl: s.user.profilePhotoThumbUrl,
    assignedWards: s.assignedWards.map((a: any) => a.ward.name).join(", "),
  }));
  res.json({ success: true, data: formatted, pagination: { total, page, pageSize: take, totalPages: Math.ceil(total / take) } });
});

// Properties — custom handlers for proper field mapping
crudRoutes.get("/properties", requireAuth, async (req: Request, res: Response) => {
  const { page, take, skip } = paginate(req);
  const where: any = (req as any).user?.role === "USER" ? { ownerId: (req as any).user.id } : {};
  const search = req.query.search as string;
  if (search) where.OR = [{ propertyId: { contains: search } }, { ownerName: { contains: search, mode: "insensitive" } }, { mobile: { contains: search } }];
  const [data, total] = await Promise.all([
    prisma.property.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        ward: { select: { name: true } },
        road: { select: { name: true } },
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePhotoUrl: true,
            profilePhotoThumbUrl: true,
          },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);
  res.json({ success: true, data, pagination: { total, page, pageSize: take, totalPages: Math.ceil(total / take) } });
});

crudRoutes.post("/properties", requireAuth, async (req: Request, res: Response) => {
  try {
    const body = req.body;
    const user = (req as any).user;
    const propCount = await prisma.property.count();
    const propertyId = (propCount + 1).toString().padStart(8, "0");

    const property = await prisma.property.create({
      data: {
        propertyId,
        propertyType: body.propertyType || "LAND_AND_BUILDING",
        ownershipType: body.ownershipType || "SINGLE_OWNER",
        wardId: body.wardId,
        roadId: body.roadId || undefined,
        ownerId: body.ownerId || user.id,
        ownerName: body.ownerName || "",
        guardianName: body.guardianName || undefined,
        mobile: body.mobile || user.mobile,
        email: body.email || undefined,
        propertyAddress: body.propertyAddress || undefined,
        propertyCity: body.propertyCity || undefined,
        propertyState: body.propertyState || undefined,
        constructionType: body.constructionType || undefined,
        occupancyType: body.occupancyType || undefined,
        usageCategory: body.usageCategory || undefined,
        plotAreaSqFt: body.plotArea ? parseFloat(body.plotArea) : (body.plotAreaSqFt ? parseFloat(body.plotAreaSqFt) : undefined),
        builtUpAreaSqFt: body.builtUpArea ? parseFloat(body.builtUpArea) : (body.builtUpAreaSqFt ? parseFloat(body.builtUpAreaSqFt) : undefined),
        numberOfFloors: body.numberOfFloors ? parseInt(body.numberOfFloors) : undefined,
      },
    });
    await logAudit(req, { userId: user.id, userName: user.name, userRole: user.role, action: "CREATE", entity: "Property", entityId: property.id, details: `Created property ${propertyId}` });
    res.status(201).json({ success: true, data: property });
  } catch (err: any) {
    console.error("Create property error:", err.message);
    res.status(500).json({ error: err.message || "Failed to create property" });
  }
});

crud("/demands", prisma.demand, {
  orderBy: { createdAt: "desc" },
  searchFields: ["demandId", "status"],
  include: {
    assessment: {
      include: {
        property: { select: { id: true, propertyId: true, ownerName: true } },
        assessmentYear: { select: { year: true } },
      },
    },
  },
});

// Disputes & Grievances
crud("/disputes", prisma.dispute, { orderBy: { createdAt: "desc" }, include: { property: { select: { propertyId: true, ownerName: true } }, createdBy: { select: { firstName: true, lastName: true } } } });
crud("/grievances", prisma.grievance, { orderBy: { createdAt: "desc" }, include: { user: { select: { firstName: true, lastName: true, mobile: true } } } });

// Audit logs
crudRoutes.get("/audit-logs", requireAuth, async (req, res) => {
  const { page, take, skip } = paginate(req);
  const [data, total] = await Promise.all([
    prisma.auditLog.findMany({ skip, take, orderBy: { createdAt: "desc" } }),
    prisma.auditLog.count(),
  ]);
  res.json({ success: true, data, pagination: { total, page, pageSize: take, totalPages: Math.ceil(total / take) } });
});

// Website content
crud("/website-content/contents", prisma.websiteContent, { orderBy: { sortOrder: "asc" } });
crud("/website-content/helpline-numbers", prisma.helplineNumber);
crud("/website-content/links", prisma.usefulLink);
crud("/website-content/officers-profile", prisma.officerProfile);
crud("/website-content/services", prisma.websiteService);

// Export CSV
crudRoutes.get("/export", requireAuth, async (req: Request, res: Response) => {
  const type = req.query.type as string;
  const models: Record<string, any> = {
    wards: prisma.ward, roads: prisma.road, properties: prisma.property,
    assessments: prisma.assessment, payments: prisma.payment,
    citizens: prisma.user, officials: prisma.user,
  };
  const model = models[type];
  if (!model) return res.status(400).json({ error: "Invalid type" });
  const where = type === "citizens" ? { role: "USER" } : type === "officials" ? { role: { not: "USER" } } : {};
  const rows = await model.findMany({ where, take: 1000 });
  if (rows.length === 0) return res.status(404).json({ error: "No data" });
  const keys = Object.keys(rows[0]).filter((k: string) => k !== "passwordHash");
  const csv = [keys.join(","), ...rows.map((r: any) => keys.map(k => { const v = r[k]; if (v == null) return ""; const s = String(v); return s.includes(",") ? `"${s.replace(/"/g, '""')}"` : s; }).join(","))].join("\n");
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${type}-${new Date().toISOString().split("T")[0]}.csv"`);
  res.send(csv);
});
