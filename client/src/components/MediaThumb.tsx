import { useEffect, useRef, useState } from "react";
import { isImageUrl, isPdfUrl, previewUrl } from "../lib/upload";
import { dataUrlToFile } from "../lib/thumbnail-generate";
import { persistAttachmentThumbnail } from "../lib/storage-cleanup";

type Props = {
  url: string;
  thumbnailUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  attachmentId?: string;
  onImageClick?: (url: string) => void;
  onThumbnailSaved?: () => void;
};

export function MediaThumb({
  url,
  thumbnailUrl,
  fileName,
  mimeType,
  attachmentId,
  onImageClick,
  onThumbnailSaved,
}: Props) {
  const pdf = isPdfUrl(url, mimeType);
  const image = !pdf && isImageUrl(url, mimeType);
  const displaySrc = previewUrl(url, thumbnailUrl, mimeType);

  if (image || (pdf && thumbnailUrl)) {
    return (
      <button
        type="button"
        className={`media-thumb-btn${pdf ? " media-thumb-pdf" : ""}`}
        onClick={() => {
          if (pdf) window.open(url, "_blank", "noopener,noreferrer");
          else if (onImageClick) onImageClick(url);
        }}
        aria-label={pdf ? `Open PDF ${fileName || ""}` : "View full size"}
      >
        <img src={displaySrc} alt={fileName || ""} loading="lazy" />
        {pdf && <span className="media-pdf-badge">PDF</span>}
      </button>
    );
  }

  if (pdf) {
    return (
      <PdfThumb
        url={url}
        fileName={fileName}
        attachmentId={attachmentId}
        onThumbnailSaved={onThumbnailSaved}
      />
    );
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="media-doc-link">
      File
    </a>
  );
}

function PdfThumb({
  url,
  fileName,
  attachmentId,
  onThumbnailSaved,
}: {
  url: string;
  fileName?: string | null;
  attachmentId?: string;
  onThumbnailSaved?: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const onSavedRef = useRef(onThumbnailSaved);
  onSavedRef.current = onThumbnailSaved;

  useEffect(() => {
    let active = true;
    setPreview(null);
    setFailed(false);

    (async () => {
      try {
        const res = await fetch(`/api/uploads/blob?url=${encodeURIComponent(url)}`, { credentials: "include" });
        if (!res.ok) throw new Error("fetch failed");
        const buf = await res.arrayBuffer();
        const { renderPdfThumbnailFromData } = await import("../lib/pdf-thumbnail");
        const dataUrl = await renderPdfThumbnailFromData(buf, 240);
        if (!active) return;
        setPreview(dataUrl);

        if (attachmentId) {
          try {
            const thumbFile = dataUrlToFile(dataUrl, `${(fileName || "doc").replace(/\.pdf$/i, "")}-thumb.jpg`);
            await persistAttachmentThumbnail(attachmentId, thumbFile);
            onSavedRef.current?.();
          } catch {
            /* preview still shown even if persist fails */
          }
        }
      } catch {
        if (active) setFailed(true);
      }
    })();

    return () => {
      active = false;
    };
  }, [url, attachmentId, fileName]);

  if (preview) {
    return (
      <button
        type="button"
        className="media-thumb-btn media-thumb-pdf"
        onClick={() => window.open(url, "_blank", "noopener,noreferrer")}
        aria-label={`Open PDF ${fileName || ""}`}
      >
        <img src={preview} alt={fileName || "PDF preview"} />
        <span className="media-pdf-badge">PDF</span>
      </button>
    );
  }

  if (failed) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="media-doc-link media-pdf-fallback">
        <span className="media-pdf-icon">PDF</span>
        <span className="media-pdf-label">Open</span>
      </a>
    );
  }

  return <div className="media-thumb-loading" aria-busy="true" />;
}
