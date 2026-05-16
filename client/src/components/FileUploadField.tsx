import { useState } from "react";
import { uploadFile, type UploadFolder, isImageUrl, isPdfUrl } from "../lib/upload";
import { MediaThumb } from "./MediaThumb";

type Props = {
  label: string;
  value: string;
  onChange: (url: string, thumbnailUrl?: string) => void;
  folder: UploadFolder;
  accept?: string;
  pathEntityId?: string;
};

export function FileUploadField({ label, value, onChange, folder, accept = "image/*,application/pdf", pathEntityId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const result = await uploadFile(file, folder, pathEntityId ? { pathEntityId } : undefined);
      onChange(result.url, result.thumbnailUrl);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#7c7570", marginBottom: 4 }}>{label}</label>
      <input
        type="file"
        accept={accept}
        disabled={uploading}
        onChange={(e) => handleFile(e.target.files?.[0])}
        style={{ fontSize: 13, width: "100%" }}
      />
      {uploading && <p style={{ fontSize: 12, color: "#7c7570", marginTop: 4 }}>Optimizing & uploading…</p>}
      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{error}</p>}
      {value && (
        <div style={{ marginTop: 8, maxWidth: 200 }}>
          {isImageUrl(value) || isPdfUrl(value) ? (
            <div className="media-thumb-card media-thumb-card--form">
              <MediaThumb url={value} />
            </div>
          ) : (
            <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: "#e05d36" }}>
              View uploaded file
            </a>
          )}
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ display: "block", marginTop: 6, fontSize: 11, color: "#7c7570", background: "none", border: "none", cursor: "pointer", padding: 0 }}
          >
            Remove file
          </button>
        </div>
      )}
    </div>
  );
}
