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
  | "assessments"
  | "thumbnails";

export type MediaEntityType = "USER" | "PROPERTY" | "DEMAND" | "PAYMENT" | "ASSESSMENT" | "DISPUTE";

import { compressImageFile } from "./image-compress";
import { createListThumbnailFile } from "./thumbnail-generate";

export interface UploadOptions {
  entityType?: MediaEntityType;
  entityId?: string;
  pathEntityId?: string;
}

export type UploadResult = {
  url: string;
  thumbnailUrl?: string;
};

export async function prepareFilesForUpload(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => compressImageFile(f)));
}

async function postUpload(form: FormData): Promise<UploadResult> {
  const res = await fetch("/api/uploads", {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return { url: data.url as string, thumbnailUrl: data.thumbnailUrl as string | undefined };
}

export async function uploadFile(
  file: File,
  folder: UploadFolder = "general",
  opts?: UploadOptions,
): Promise<UploadResult> {
  const prepared = await compressImageFile(file);
  const thumb = await createListThumbnailFile(prepared);

  const form = new FormData();
  form.append("file", prepared);
  if (thumb) form.append("thumb", thumb);
  form.append("folder", folder);
  if (opts?.entityType) form.append("entityType", opts.entityType);
  if (opts?.entityId) form.append("entityId", opts.entityId);
  if (opts?.pathEntityId) form.append("pathEntityId", opts.pathEntityId);

  return postUpload(form);
}

export async function uploadFiles(
  files: File[],
  folder: UploadFolder = "general",
  opts?: UploadOptions,
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const result = await uploadFile(file, folder, opts);
    urls.push(result.url);
  }
  return urls;
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

export function previewUrl(url: string, thumbnailUrl?: string | null, mimeType?: string | null): string {
  if (thumbnailUrl) return thumbnailUrl;
  if (isImageUrl(url, mimeType)) return url;
  return url;
}
