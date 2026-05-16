const MAX_EDGE = 1920;
const JPEG_QUALITY = 0.82;
const WEBP_QUALITY = 0.82;
/** Skip re-encoding when already small enough (bytes). */
const SKIP_BELOW_BYTES = 350_000;

function loadImage(file: File): Promise<HTMLImageElement> {
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

function canvasToFile(canvas: HTMLCanvasElement, name: string, type: string, quality?: number): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image compression failed"));
          return;
        }
        resolve(new File([blob], name, { type, lastModified: Date.now() }));
      },
      type,
      quality,
    );
  });
}

/**
 * Resize and re-encode photos before upload to save storage while keeping them sharp on screen.
 * GIFs and PDFs are left unchanged.
 */
export async function compressImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") {
    return file;
  }

  const img = await loadImage(file);
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  const scale = Math.min(1, MAX_EDGE / Math.max(w, h));
  const targetW = Math.max(1, Math.round(w * scale));
  const targetH = Math.max(1, Math.round(h * scale));

  if (scale >= 1 && file.size <= SKIP_BELOW_BYTES) {
    return file;
  }

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  if (file.type === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, targetW, targetH);
  }
  ctx.drawImage(img, 0, 0, targetW, targetH);

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  const useWebp = file.type === "image/png" || file.type === "image/webp";
  if (useWebp && typeof canvas.toBlob === "function") {
    try {
      return await canvasToFile(canvas, `${base}.webp`, "image/webp", WEBP_QUALITY);
    } catch {
      /* fall through to jpeg */
    }
  }

  return canvasToFile(canvas, `${base}.jpg`, "image/jpeg", JPEG_QUALITY);
}

export async function compressImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => compressImageFile(f)));
}
