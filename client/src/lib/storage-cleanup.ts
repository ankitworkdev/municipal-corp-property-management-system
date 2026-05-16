/** Remove files from Supabase when replaced or cleared in the UI. */
export async function deleteStoredUrls(url?: string | null, thumbnailUrl?: string | null): Promise<void> {
  if (!url && !thumbnailUrl) return;
  await fetch("/api/uploads/delete-url", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: url || undefined, thumbnailUrl: thumbnailUrl || undefined }),
  });
}

export async function persistAttachmentThumbnail(attachmentId: string, thumbFile: File): Promise<string | undefined> {
  const form = new FormData();
  form.append("thumb", thumbFile);
  const res = await fetch(`/api/media/${encodeURIComponent(attachmentId)}/thumbnail`, {
    method: "POST",
    credentials: "include",
    body: form,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Could not save thumbnail");
  return data.thumbnailUrl as string | undefined;
}
