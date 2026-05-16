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

import { compressImageFiles } from "./image-compress";

export interface UploadOptions {
  entityType?: MediaEntityType;
  entityId?: string;
  /** Organize file under folder/{pathEntityId}/ without creating a media attachment. */
  pathEntityId?: string;
}

export async function prepareFilesForUpload(files: File[]): Promise<File[]> {
  return compressImageFiles(files);
}

export async function uploadFile(
  file: File,
  folder: UploadFolder = "general",
  opts?: UploadOptions,
): Promise<string> {
  const [prepared] = await prepareFilesForUpload([file]);
  const form = new FormData();
  form.append("file", prepared);
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
  const prepared = await prepareFilesForUpload(files);
  const form = new FormData();
  prepared.forEach((f) => form.append("files", f));
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

export function isImageUrl(url: string, mimeType?: string | null): boolean {
  if (mimeType?.startsWith("image/") && mimeType !== "image/svg+xml") return true;
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || url.includes("image/");
}

export function isPdfUrl(url: string, mimeType?: string | null): boolean {
  if (mimeType === "application/pdf") return true;
  return /\.pdf(\?|$)/i.test(url) || url.toLowerCase().includes("application/pdf");
}
