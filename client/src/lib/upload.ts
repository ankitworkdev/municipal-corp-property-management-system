export type UploadFolder = "general" | "website" | "officers" | "services" | "disputes" | "properties";

export async function uploadFile(file: File, folder: UploadFolder = "general"): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("folder", folder);

  const res = await fetch("/api/uploads", {
    method: "POST",
    credentials: "include",
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Upload failed");
  return data.url as string;
}

export function isImageUrl(url: string): boolean {
  return /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || url.includes("image/");
}
