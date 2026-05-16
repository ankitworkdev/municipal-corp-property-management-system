import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { getMediaLimit } from "../lib/media";
import { fetchUploadStatus, uploadFiles, type MediaEntityType, type UploadFolder } from "../lib/upload";
import { ImageLightbox } from "./ImageLightbox";
import { MediaThumb } from "./MediaThumb";

type Attachment = {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  fileName?: string | null;
  mimeType?: string | null;
  caption?: string | null;
};

type Props = {
  title?: string;
  entityType: MediaEntityType;
  entityId: string;
  folder: UploadFolder;
  canEdit?: boolean;
  maxItems?: number;
};

export function MediaGallery({
  title = "Photos & documents",
  entityType,
  entityId,
  folder,
  canEdit = true,
  maxItems,
}: Props) {
  const limit = maxItems ?? getMediaLimit(entityType);
  const [items, setItems] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [storageOn, setStorageOn] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const atLimit = limit <= 0 || items.length >= limit;
  const remaining = limit > 0 ? Math.max(0, limit - items.length) : 0;

  const load = useCallback(() => {
    if (!entityId || limit <= 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    api(`/media?entityType=${encodeURIComponent(entityType)}&entityId=${encodeURIComponent(entityId)}`)
      .then((d) => setItems(d.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [entityType, entityId, limit]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    fetchUploadStatus().then((s) => setStorageOn(s.enabled)).catch(() => setStorageOn(false));
  }, []);

  const onPickFiles = async (fileList: FileList | null) => {
    if (!fileList?.length || !canEdit || atLimit) return;
    const files = Array.from(fileList);
    if (files.length > remaining) {
      setError(`You can add at most ${remaining} more file(s) (limit ${limit}).`);
      return;
    }
    setError("");
    setUploading(true);
    try {
      await uploadFiles(files, folder, { entityType, entityId });
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this file?")) return;
    await fetch(`/api/media?id=${encodeURIComponent(id)}`, { method: "DELETE", credentials: "include" });
    load();
  };

  if (limit <= 0) return null;

  return (
    <section className="media-gallery glass" style={{ padding: 20, marginBottom: 16 }}>
      <div className="media-gallery-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, gap: 12 }}>
        <h3 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "var(--primary, #e05d36)" }}>{title}</h3>
        <span style={{ fontSize: 12, color: "#7c7570", fontWeight: 500 }}>
          {items.length}/{limit}
        </span>
      </div>

      {canEdit && storageOn && (
        <UploadToolbar uploading={uploading} atLimit={atLimit} entityId={entityId} onPickFiles={onPickFiles} />
      )}

      {!storageOn && (
        <p className="storage-hint">File storage is not configured on the server. Images cannot be uploaded until Supabase env vars are set.</p>
      )}
      {error && <p style={{ fontSize: 12, color: "#dc2626", marginTop: 8 }}>{error}</p>}

      {loading ? (
        <p style={{ fontSize: 13, color: "#7c7570", marginTop: 12 }}>Loading…</p>
      ) : items.length === 0 ? (
        <p style={{ fontSize: 13, color: "#7c7570", marginTop: 12 }}>
          No files yet.{canEdit && storageOn && !atLimit ? " Use “+ Add files” to upload images or PDFs." : ""}
        </p>
      ) : (
        <div className="media-thumb-grid">
          {items.map((item) => (
            <div key={item.id} className="media-thumb-card">
              <MediaThumb
                url={item.url}
                thumbnailUrl={item.thumbnailUrl}
                fileName={item.fileName}
                mimeType={item.mimeType}
                attachmentId={item.id}
                onImageClick={setLightbox}
                onThumbnailSaved={load}
              />
              {canEdit && (
                <button type="button" className="media-thumb-remove" onClick={() => remove(item.id)} aria-label="Remove">
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {lightbox && <ImageLightbox url={lightbox} onClose={() => setLightbox(null)} />}
    </section>
  );
}

function UploadToolbar({
  uploading,
  atLimit,
  entityId,
  onPickFiles,
}: {
  uploading: boolean;
  atLimit: boolean;
  entityId: string;
  onPickFiles: (files: FileList | null) => void;
}) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
      <label
        className="btn btn-sm"
        style={{
          cursor: uploading || atLimit ? "not-allowed" : "pointer",
          margin: 0,
          opacity: atLimit ? 0.5 : 1,
        }}
      >
        {uploading ? "Optimizing & uploading…" : atLimit ? "Limit reached" : "+ Add files"}
        <input
          type="file"
          accept="image/*,application/pdf"
          multiple
          hidden
          disabled={uploading || !entityId || atLimit}
          onChange={(e) => {
            onPickFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
