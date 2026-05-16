import { useState } from "react";
import { uploadFile, type UploadFolder, isImageUrl } from "../lib/upload";

type Props = {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder: UploadFolder;
  accept?: string;
};

export function FileUploadField({ label, value, onChange, folder, accept = "image/*,application/pdf" }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const url = await uploadFile(file, folder);
      onChange(url);
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
      {uploading && <p style={{ fontSize: 12, color: "#7c7570", marginTop: 4 }}>Uploading…</p>}
      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 4 }}>{error}</p>}
      {value && (
        <div style={{ marginTop: 8 }}>
          {isImageUrl(value) ? (
            <img src={value} alt="" style={{ maxWidth: "100%", maxHeight: 120, borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)" }} />
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
