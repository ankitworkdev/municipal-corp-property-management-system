import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config.js";

let client: SupabaseClient | null = null;

export function isStorageEnabled(): boolean {
  return Boolean(config.supabase.url && config.supabase.serviceRoleKey);
}

export function getSupabase(): SupabaseClient | null {
  if (!isStorageEnabled()) return null;
  if (!client) {
    client = createClient(config.supabase.url, config.supabase.serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export function getPublicObjectUrl(storagePath: string): string {
  const base = config.supabase.url.replace(/\/$/, "");
  return `${base}/storage/v1/object/public/${config.supabase.bucket}/${storagePath}`;
}
