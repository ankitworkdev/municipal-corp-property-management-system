export type UploadFolder =
  | "general"
  | "website"
  | "officers"
  | "services"
  | "disputes"
  | "properties"
  | "demands"
  | "payments"
  | "users"
  | "receipts"
  | "assessments";

export type MediaEntityType = "USER" | "PROPERTY" | "DEMAND" | "PAYMENT" | "ASSESSMENT" | "DISPUTE";

export interface UploadOptions {
  entityType?: MediaEntityType;
  entityId?: string;
  /** Organize file under folder/{pathEntityId}/ without creating a media attachment. */
  pathEntityId?: string;
}

export async function uploadFile(
  file: File,
  folder: UploadFolder = "general",
  opts?: UploadOptions,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);
  if (opts?.entityType) form.append("entityType", opts.entityType);
  if (opts?.entityId) form.append("entityId", opts.entityId);
  if (opts?.pathEntityId) form.append("pathEntityId", opts.pathEntityId);

  const res = await fetch("/api/uploads", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export async function uploadFiles(
  files: File[],
  folder: UploadFolder = "general",
  opts?: UploadOptions,
): Promise<string[]> {
  const form = new FormData();
  files.forEach((f) => form.append("files", f));
  form.append("folder", folder);
  if (opts?.entityType) form.append("entityType", opts.entityType);
  if (opts?.entityId) form.append("entityId", opts.entityId);
  if (opts?.pathEntityId) form.append("pathEntityId", opts.pathEntityId);

  const res = await fetch("/api/uploads/multi", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return (data.files as { url: string }[]).map((f) => f.url);
}

export async function fetchUploadStatus(): Promise<{ enabled: boolean }> {
  const res = await fetch("/api/uploads/status", { credentials: "include" });
  const data = await res.json();
  return { enabled: !!data.enabled };
}

export function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || url.includes("image/");
}
