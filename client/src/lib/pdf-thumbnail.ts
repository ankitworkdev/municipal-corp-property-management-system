import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const cache = new Map<string, string>();

async function renderPageToDataUrl(pdf: pdfjs.PDFDocumentProxy, maxWidth: number): Promise<string> {
  const page = await pdf.getPage(1);
  const baseViewport = page.getViewport({ scale: 1 });
  const scale = maxWidth / Math.max(baseViewport.width, 1);
  const viewport = page.getViewport({ scale: Math.min(scale, 2.5) });

  const canvas = document.createElement("canvas");
  canvas.width = Math.floor(viewport.width);
  canvas.height = Math.floor(viewport.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/jpeg", 0.75);
}

/** From local file bytes (upload) — avoids CORS. */
export async function renderPdfThumbnailFromData(data: ArrayBuffer, maxWidth = 240): Promise<string> {
  const task = pdfjs.getDocument({ data });
  const pdf = await task.promise;
  return renderPageToDataUrl(pdf, maxWidth);
}

/** From remote URL — legacy attachments; may fail if CORS blocks. */
export async function renderPdfThumbnail(url: string, maxWidth = 240): Promise<string> {
  const cached = cache.get(url);
  if (cached) return cached;

  const task = pdfjs.getDocument({ url, withCredentials: false });
  const pdf = await task.promise;
  const dataUrl = await renderPageToDataUrl(pdf, maxWidth);
  cache.set(url, dataUrl);
  return dataUrl;
}
