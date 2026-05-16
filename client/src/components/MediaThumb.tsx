import { useEffect, useState } from "react";
import { isImageUrl, isPdfUrl } from "../lib/upload";

type Props = {
  url: string;
  fileName?: string | null;
  mimeType?: string | null;
  onImageClick?: (url: string) => void;
};

export function MediaThumb({ url, fileName, mimeType, onImageClick }: Props) {
  const pdf = isPdfUrl(url, mimeType);
  const image = !pdf && isImageUrl(url, mimeType);

  if (image) {
    return (
      <button type="button" className="media-thumb-btn" onClick={() => onImageClick?.(url)} aria-label="View full size">
        <img src={url} alt={fileName || ""} loading="lazy" />
      </button>
    );
  }

  if (pdf) {
    return <PdfThumb url={url} fileName={fileName} />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer" className="media-doc-link">
      File
    </a>
  );
}

function PdfThumb({ url, fileName }: { url: string; fileName?: string | null }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    setPreview(null);
    setFailed(false);
    import("../lib/pdf-thumbnail")
      .then(({ renderPdfThumbnail }) => renderPdfThumbnail(url))
      .then((dataUrl) => {
        if (active) setPreview(dataUrl);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [url]);

  if (preview) {
    return (
      <a href={url} target="_blank" rel="noreferrer" className="media-thumb-btn media-thumb-pdf" aria-label={`Open PDF ${fileName || ""}`}>
        <img src={preview} alt={fileName || "PDF preview"} />
        <span className="media-pdf-badge">PDF</span>
      </a>
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
