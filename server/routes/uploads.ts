import { Router, type Request } from "express";
import multer from "multer";
import path from "path";
import { requireAuth } from "../lib/auth.js";
import { config } from "../lib/config.js";
import { AppError, asyncHandler } from "../lib/errors.js";
import { logAudit } from "../lib/audit.js";
import { getPublicObjectUrl, getSupabase, isStorageEnabled } from "../lib/supabase.js";

export const uploadRoutes = Router();

const ALLOWED_FOLDERS = new Set([
  "general",
  "website",
  "officers",
  "services",
  "disputes",
  "properties",
]);

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

uploadRoutes.post(
  "/uploads",
  requireAuth,
  upload.single("file"),
  asyncHandler(async (req, res) => {
    if (!isStorageEnabled()) {
      throw new AppError(503, "File storage is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }

    const file = req.file;
    if (!file) throw new AppError(400, "No file uploaded. Use form field name 'file'.");

    const folder = String(req.body?.folder || req.query?.folder || "general");
    if (!ALLOWED_FOLDERS.has(folder)) {
      throw new AppError(400, `Invalid folder. Allowed: ${[...ALLOWED_FOLDERS].join(", ")}`);
    }

    const supabase = getSupabase();
    if (!supabase) throw new AppError(503, "Storage client unavailable");

    const storagePath = `${folder}/${Date.now()}-${safeFilename(file.originalname)}`;
    const { error } = await supabase.storage.from(config.supabase.bucket).upload(storagePath, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

    if (error) throw new AppError(500, `Upload failed: ${error.message}`);

    const url = getPublicObjectUrl(storagePath);
    const user = (req as Request & { user: { id: string; name: string; email: string | null; role: string } }).user;

    await logAudit(req, {
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
      action: "FILE_UPLOAD",
      entity: "Storage",
      details: `${folder}/${storagePath}`,
    });

    res.json({
      success: true,
      url,
      path: storagePath,
      bucket: config.supabase.bucket,
      mimeType: file.mimetype,
      size: file.size,
    });
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
      allowedFolders: [...ALLOWED_FOLDERS],
      allowedMimeTypes: [...ALLOWED_MIME],
    });
  }),
);
