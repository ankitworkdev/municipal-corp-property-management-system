import { getSupabase, getPublicObjectUrl, isStorageEnabled } from "./supabase.js";
import { config } from "./config.js";

/** Extract storage object path from a public Supabase URL for this bucket. */
export function storagePathFromPublicUrl(url: string): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${config.supabase.bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0] || "");
}

export async function deleteStorageByUrl(url: string | null | undefined): Promise<void> {
  const path = url ? storagePathFromPublicUrl(url) : null;
  if (!path) return;
  await deleteStoragePath(path);
}

export async function deleteStoragePath(path: string): Promise<void> {
  if (!isStorageEnabled()) return;
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.storage.from(config.supabase.bucket).remove([path]);
  if (error) {
    console.warn("[storage] delete failed:", path, error.message);
  }
}

export async function fetchStorageBytes(url: string): Promise<Buffer> {
  const path = storagePathFromPublicUrl(url);
  if (!path) throw new Error("Invalid storage URL");
  const supabase = getSupabase();
  if (!supabase) throw new Error("Storage not configured");
  const { data, error } = await supabase.storage.from(config.supabase.bucket).download(path);
  if (error || !data) throw new Error(error?.message || "Download failed");
  const ab = await data.arrayBuffer();
  return Buffer.from(ab);
}

export async function uploadStorageBuffer(
  path: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const supabase = getSupabase();
  if (!supabase) throw new Error("Storage not configured");
  const { error } = await supabase.storage.from(config.supabase.bucket).upload(path, buffer, {
    contentType,
    upsert: true,
  });
  if (error) throw new Error(error.message);
  return getPublicObjectUrl(path);
}
