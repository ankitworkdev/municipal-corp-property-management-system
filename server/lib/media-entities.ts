export const MEDIA_ENTITY_TYPES = new Set([
  "USER",
  "PROPERTY",
  "DEMAND",
  "PAYMENT",
  "ASSESSMENT",
  "DISPUTE",
]);

export type MediaEntityType = "USER" | "PROPERTY" | "DEMAND" | "PAYMENT" | "ASSESSMENT" | "DISPUTE";

/** Max attachments per entity (profile photo uses User.profilePhotoUrl, not USER attachments). */
export const MEDIA_LIMITS: Record<MediaEntityType, number> = {
  USER: 0,
  PROPERTY: 5,
  DEMAND: 2,
  PAYMENT: 3,
  ASSESSMENT: 5,
  DISPUTE: 3,
};

export const UPLOAD_FOLDERS = new Set([
  "general",
  "website",
  "officers",
  "services",
  "disputes",
  "properties",
  "demands",
  "payments",
  "users",
  "receipts",
  "assessments",
]);

export function getMediaLimit(entityType: string): number {
  return MEDIA_LIMITS[entityType as MediaEntityType] ?? 5;
}

export function buildStoragePath(folder: string, originalName: string, entityId?: string): string {
  const safe = originalName.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120) || "file";
  const name = `${Date.now()}-${safe}`;
  if (entityId) return `${folder}/${entityId}/${name}`;
  return `${folder}/${name}`;
}
