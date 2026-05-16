import { Router } from "express";
import multer from "multer";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../lib/auth.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { logAudit } from "../lib/audit.js";
import {
  MEDIA_ENTITY_TYPES,
  buildThumbnailPath,
  getMediaLimit,
} from "../lib/media-entities.js";
import { deleteStorageByUrl, uploadStorageBuffer } from "../lib/storage.js";
import { isStorageEnabled } from "../lib/supabase.js";

export const mediaRoutes = Router();

const thumbUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 512 * 1024 },
});

mediaRoutes.get(
  "/media/previews",
  requireAuth,
  asyncHandler(async (req, res) => {
    const entityType = String(req.query.entityType || "");
    const ids = String(req.query.entityIds || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!MEDIA_ENTITY_TYPES.has(entityType) || !ids.length) {
      throw new AppError(400, "entityType and entityIds are required");
    }
    const rows = await prisma.mediaAttachment.findMany({
      where: { entityType, entityId: { in: ids } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { entityId: true, url: true, thumbnailUrl: true, mimeType: true },
    });
    const data: Record<string, string | null> = {};
    for (const row of rows) {
      if (data[row.entityId] !== undefined) continue;
      const preview =
        row.thumbnailUrl ||
        (row.mimeType?.startsWith("image/") ? row.url : null);
      data[row.entityId] = preview;
    }
    res.json({ success: true, data });
  }),
);

mediaRoutes.get(
  "/media/previews",
  requireAuth,
  asyncHandler(async (req, res) => {
    const entityType = String(req.query.entityType || "");
    const ids = String(req.query.entityIds || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!MEDIA_ENTITY_TYPES.has(entityType) || !ids.length) {
      throw new AppError(400, "entityType and entityIds are required");
    }
    const rows = await prisma.mediaAttachment.findMany({
      where: { entityType, entityId: { in: ids } },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      select: { entityId: true, url: true, thumbnailUrl: true, mimeType: true },
    });
    const data: Record<string, string | null> = {};
    for (const row of rows) {
      if (data[row.entityId] !== undefined) continue;
      const preview =
        row.thumbnailUrl ||
        (row.mimeType?.startsWith("image/") ? row.url : null);
      data[row.entityId] = preview;
    }
    res.json({ success: true, data });
  }),
);

mediaRoutes.get(
  "/media",
  requireAuth,
  asyncHandler(async (req, res) => {
    const entityType = String(req.query.entityType || "");
    const entityId = String(req.query.entityId || "");
    if (!MEDIA_ENTITY_TYPES.has(entityType) || !entityId) {
      throw new AppError(400, "entityType and entityId are required");
    }
    const data = await prisma.mediaAttachment.findMany({
      where: { entityType, entityId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    res.json({ success: true, data });
  }),
);

mediaRoutes.post(
  "/media/:id/thumbnail",
  requireAuth,
  thumbUpload.single("thumb"),
  asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0]! : req.params.id;
    const file = req.file;
    if (!file) throw new AppError(400, "thumb file required");
    const existing = await prisma.mediaAttachment.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Attachment not found");

    if (!isStorageEnabled()) throw new AppError(503, "Storage not configured");

    if (existing.thumbnailUrl) {
      await deleteStorageByUrl(existing.thumbnailUrl);
    }

    const thumbPath = buildThumbnailPath(existing.entityType, existing.entityId, file.originalname || "thumb.jpg");
    const thumbnailUrl = await uploadStorageBuffer(thumbPath, file.buffer, file.mimetype || "image/jpeg");

    const updated = await prisma.mediaAttachment.update({
      where: { id },
      data: { thumbnailUrl },
    });

    res.json({ success: true, data: updated, thumbnailUrl });
  }),
);

mediaRoutes.post(
  "/media",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { entityType, entityId, url, fileName, mimeType, caption } = req.body;
    if (!MEDIA_ENTITY_TYPES.has(entityType) || !entityId || !url) {
      throw new AppError(400, "entityType, entityId, and url are required");
    }
    const user = (req as any).user;
    const count = await prisma.mediaAttachment.count({ where: { entityType, entityId } });
    const limit = getMediaLimit(entityType);
    if (count >= limit) {
      throw new AppError(400, `Maximum ${limit} file(s) allowed for this ${entityType.toLowerCase()}.`);
    }
    const record = await prisma.mediaAttachment.create({
      data: {
        entityType,
        entityId,
        url,
        fileName: fileName || null,
        mimeType: mimeType || null,
        caption: caption || null,
        sortOrder: count,
        uploadedById: user.id,
      },
    });
    await logAudit(req, {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "MEDIA_ATTACH",
      entity: entityType,
      entityId,
      details: record.id,
    });
    res.status(201).json({ success: true, data: record });
  }),
);

mediaRoutes.delete(
  "/media",
  requireAuth,
  asyncHandler(async (req, res) => {
    const id = String(req.query.id || "");
    if (!id) throw new AppError(400, "id query parameter required");
    const existing = await prisma.mediaAttachment.findUnique({ where: { id } });
    if (!existing) throw new AppError(404, "Attachment not found");

    await deleteStorageByUrl(existing.url);
    await deleteStorageByUrl(existing.thumbnailUrl);
    await prisma.mediaAttachment.delete({ where: { id } });

    const user = (req as any).user;
    await logAudit(req, {
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      action: "MEDIA_DELETE",
      entity: existing.entityType,
      entityId: existing.entityId,
      details: id,
    });
    res.json({ success: true });
  }),
);
