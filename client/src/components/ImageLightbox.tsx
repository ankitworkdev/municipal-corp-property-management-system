import { useEffect } from "react";

export function ImageLightbox({ url, alt, onClose }: { url: string; alt?: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="lightbox-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Image preview">
      <button type="button" className="lightbox-close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <img
        src={url}
        alt={alt || "Preview"}
        className="lightbox-image"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
