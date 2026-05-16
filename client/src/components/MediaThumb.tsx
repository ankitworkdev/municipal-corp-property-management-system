import { useEffect, useState } from "react";
import { isImageUrl, isPdfUrl, previewUrl } from "../lib/upload";

type Props = {
  url: string;
  thumbnailUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  onImageClick?: (url: string) => void;
};

export function MediaThumb({ url, thumbnailUrl, fileName, mimeType, onImageClick }: Props) {
  const pdf = isPdfUrl(url, mimeType);
  const image = !pdf && isImageUrl(url, mimeType);
  const displaySrc = previewUrl(url, thumbnailUrl, mimeType);

  if (image || (pdf && thumbnailUrl)) {
    return (
      <button
        type="button"
        className={`media-thumb-btn${pdf ? " media-thumb-pdf" : ""}`}
        onClick={() => (image && onImageClick ? onImageClick(url) : window.open(url, "_blank"))}
        aria-label={pdf ? `Open PDF ${fileName || ""}` : "View full size"}
      >
        <img src={displaySrc} alt={fileName || ""} loading="lazy" />
        {pdf && <span className="media-pdf-badge">PDF</span>}
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
