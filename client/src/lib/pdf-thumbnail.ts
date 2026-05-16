import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const cache = new Map<string, string>();

/**
 * Renders the first page of a PDF to a JPEG data URL for gallery thumbnails.
 */
export async function renderPdfThumbnail(url: string, maxWidth = 240): Promise<string> {
  const cached = cache.get(url);
  if (cached) return cached;

  const task = pdfjs.getDocument({ url });
  const pdf = await task.promise;
  const page = await pdf.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / baseViewport.width;
  const viewport = page.getViewport({ scale: Math.min(scale, 2) });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  await page.render({ canvasContext: ctx, viewport }).promise;
  const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
  cache.set(url, dataUrl);
  return dataUrl;
}
