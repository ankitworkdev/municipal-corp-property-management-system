import { compressImageFile } from "./image-compress";

/** Small preview for lists (~5–15 KB). */
const LIST_THUMB_EDGE = 160;
const LIST_THUMB_QUALITY = 0.68;

export function dataUrlToFile(dataUrl: string, name: string): File {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)?.[1] || "image/jpeg";
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: mime });
}

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read image"));
    };
    img.src = url;
  });
}

async function imageFileToListThumb(file: File): Promise<File> {
  const img = await loadImageFromFile(file);
  const scale = LIST_THUMB_EDGE / Math.max(img.naturalWidth, img.naturalHeight, 1);
  const w = Math.max(1, Math.round(img.naturalWidth * Math.min(scale, 1)));
  const h = Math.max(1, Math.round(img.naturalHeight * Math.min(scale, 1)));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  if (file.type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", LIST_THUMB_QUALITY));
  if (!blob) return file;
  const base = file.name.replace(/\.[^.]+$/, "") || "thumb";
  return new File([blob], `${base}-thumb.jpg`, { type: "image/jpeg" });
}

async function pdfFileToListThumb(file: File): Promise<File | null> {
  const buf = await file.arrayBuffer();
  const { renderPdfThumbnailFromData } = await import("./pdf-thumbnail");
  const dataUrl = await renderPdfThumbnailFromData(buf, LIST_THUMB_EDGE);
  return dataUrlToFile(dataUrl, `${file.name.replace(/\.pdf$/i, "") || "doc"}-thumb.jpg`);
}

/** Build a small JPEG thumbnail file for storage (images + PDF first page). */
export async function createListThumbnailFile(file: File): Promise<File | null> {
  if (file.type === "application/pdf") {
    try {
      return await pdfFileToListThumb(file);
    } catch {
      return null;
    }
  }
  if (file.type.startsWith("image/") && file.type !== "image/gif") {
    try {
      const compressed = await compressImageFile(file);
      return imageFileToListThumb(compressed);
    } catch {
      return null;
    }
  }
  return null;
}
