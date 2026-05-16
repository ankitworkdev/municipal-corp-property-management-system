import { Router, type Request } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../lib/auth.js";
import { config } from "../lib/config.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { logAudit } from "../lib/audit.js";
import { getPublicObjectUrl, getSupabase, isStorageEnabled } from "../lib/supabase.js";
import { prisma } from "../lib/prisma.js";
import {
  MEDIA_ENTITY_TYPES,
  UPLOAD_FOLDERS,
  buildStoragePath,
  getMediaLimit,
} from "../lib/media-entities.js";

export const uploadRoutes = Router();

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.supabase.maxUploadBytes },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true);
    else cb(new Error("File type not allowed. Use JPEG, PNG, WebP, GIF, or PDF."));
  },
});

function safeFilename(original: string): string {
  const base = path.basename(original).replace(/[^a-zA-Z0-9._-]/g, "_");
  return base.slice(0, 120) || "file";
}

async function storeFile(
  req: Request,
  file: Express.Multer.File,
  folder: string,
  entityType?: string,
  entityId?: string,
  pathEntityId?: string,
) {
  if (!isStorageEnabled()) {
    throw new AppError(503, "File storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }
  const supabase = getSupabase();
  if (!supabase) throw new AppError(503, "Storage client unavailable");

  let attachmentCount = 0;
  if (entityType && entityId && MEDIA_ENTITY_TYPES.has(entityType)) {
    attachmentCount = await prisma.mediaAttachment.count({ where: { entityType, entityId } });
    const limit = getMediaLimit(entityType);
    if (attachmentCount >= limit) {
      throw new AppError(400, `Maximum ${limit} file(s) allowed for this ${entityType.toLowerCase()}.`);
    }
  }

  const storagePath = buildStoragePath(folder, safeFilename(file.originalname), pathEntityId || entityId);
  const { error } = await supabase.storage.from(config.supabase.bucket).upload(storagePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false,
  });
  if (error) throw new AppError(500, `Upload failed: ${error.message}`);

  const url = getPublicObjectUrl(storagePath);
  const user = (req as Request & { user: { id: string; name: string; email: string | null; role: string } }).user;

  let attachmentId: string | undefined;
  if (entityType && entityId && MEDIA_ENTITY_TYPES.has(entityType)) {
    const att = await prisma.mediaAttachment.create({
      data: {
        entityType,
        entityId,
        url,
        fileName: file.originalname,
        mimeType: file.mimetype,
        sortOrder: attachmentCount,
        uploadedById: user.id,
      },
    });
    attachmentId = att.id;
  }

  await logAudit(req, {
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    userRole: user.role,
    action: "FILE_UPLOAD",
    entity: "Storage",
    details: `${folder}/${storagePath}`,
  });

  return { url, path: storagePath, bucket: config.supabase.bucket, mimeType: file.mimetype, size: file.size, attachmentId };
}

function parseUploadMeta(req: Request) {
  const folder = String(req.body?.folder || req.query?.folder || "general");
  if (!UPLOAD_FOLDERS.has(folder)) {
    throw new AppError(400, `Invalid folder. Allowed: ${[...UPLOAD_FOLDERS].join(", ")}`);
  }
  const entityType = req.body?.entityType ? String(req.body.entityType) : undefined;
  const entityId = req.body?.entityId ? String(req.body.entityId) : undefined;
  const pathEntityId = req.body?.pathEntityId ? String(req.body.pathEntityId) : entityId;
  if (entityType && !MEDIA_ENTITY_TYPES.has(entityType)) {
    throw new AppError(400, `Invalid entityType`);
  }
  return { folder, entityType, entityId, pathEntityId };
}

uploadRoutes.post(
  "/uploads",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    const file = req.file;
    if (!file) throw new AppError(400, "No file uploaded. Use form field name 'file'.");
    const { folder, entityType, entityId, pathEntityId } = parseUploadMeta(req);
    const result = await storeFile(req, file, folder, entityType, entityId, pathEntityId);
    res.json({ success: true, ...result });
  }),
);

uploadRoutes.post(
  "/uploads/multi",
  requireAuth,
  upload.array("files", 12),
  asyncHandler(async (req, res) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files?.length) throw new AppError(400, "No files uploaded. Use form field name 'files'.");
    const { folder, entityType, entityId, pathEntityId } = parseUploadMeta(req);
    const results = [];
    if (entityType && entityId && MEDIA_ENTITY_TYPES.has(entityType)) {
      const limit = getMediaLimit(entityType);
      const existing = await prisma.mediaAttachment.count({ where: { entityType, entityId } });
      if (existing + files.length > limit) {
        throw new AppError(400, `Maximum ${limit} file(s) allowed. You have ${existing}; tried to add ${files.length}.`);
      }
    }
    for (const file of files) {
      results.push(await storeFile(req, file, folder, entityType, entityId, pathEntityId));
    }
    res.json({ success: true, files: results });
  }),
);

uploadRoutes.get(
  "/uploads/status",
  requireAuth,
  asyncHandler(async (_req, res) => {
    res.json({
      enabled: isStorageEnabled(),
      bucket: config.supabase.bucket,
      maxBytes: config.supabase.maxUploadBytes,
      allowedFolders: [...UPLOAD_FOLDERS],
      allowedMimeTypes: [...ALLOWED_MIME],
      entityTypes: [...MEDIA_ENTITY_TYPES],
      mediaLimits: Object.fromEntries([...MEDIA_ENTITY_TYPES].map((t) => [t, getMediaLimit(t)])),
    });
  }),
);
