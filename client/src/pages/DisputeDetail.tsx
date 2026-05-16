import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { MediaGallery } from "../components/MediaGallery";

export function DisputeDetail() {
  const { id } = useParams();
  const [dispute, setDispute] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api(`/disputes/${id}`)
      .then((d) => setDispute(d.data))
      .finally(() => setLoading(false));
  }, [id]);

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", padding: 24, marginBottom: 16 };
  const label = { fontSize: 11, fontWeight: 600, color: "#7c7570", textTransform: "uppercase" as const };
  const value = { fontSize: 15, fontWeight: 500, marginBottom: 12 };

  if (loading) return <p style={{ color: "#7c7570" }}>Loading…</p>;
  if (!dispute) return <p>Dispute not found. <Link to="/eo/manage-dispute">Back</Link></p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Dispute</h1>
          <p style={{ fontSize: 13, color: "#7c7570" }}>{dispute.subject}</p>
        </div>
        <Link to="/eo/manage-dispute" style={{ fontSize: 13, color: "#e05d36" }}>← Back</Link>
      </div>

      <div style={glass}>
        <p style={label}>Property</p>
        <p style={value}>
          {dispute.property ? <Link to={`/eo/properties/${dispute.property.id}`}>{dispute.property.propertyId}</Link> : "—"}
        </p>
        <p style={label}>Subject</p>
        <p style={value}>{dispute.subject}</p>
        <p style={label}>Description</p>
        <p style={value}>{dispute.description || "—"}</p>
        <p style={label}>Status</p>
        <p style={value}>{dispute.status}</p>
      </div>

      <MediaGallery title="Supporting documents (up to 3)" entityType="DISPUTE" entityId={dispute.id} folder="disputes" />
    </div>
  );
}
