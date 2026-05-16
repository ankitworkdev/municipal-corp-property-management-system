import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { MediaGallery } from "../components/MediaGallery";

export function DemandDetail() {
  const { id } = useParams();
  const [demand, setDemand] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api(`/demands/${id}`)
      .then((d) => setDemand(d.data))
      .finally(() => setLoading(false));
  }, [id]);

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", padding: 24, marginBottom: 16 };
  const label = { fontSize: 11, fontWeight: 600, color: "#7c7570", textTransform: "uppercase" as const };
  const value = { fontSize: 15, fontWeight: 500, marginBottom: 12 };

  if (loading) return <p style={{ color: "#7c7570" }}>Loading…</p>;
  if (!demand) return <p>Demand not found. <Link to="/eo/demands">Back</Link></p>;

  const prop = demand.assessment?.property;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Demand {demand.demandId}</h1>
          <p style={{ fontSize: 13, color: "#7c7570" }}>₹{demand.amount?.toLocaleString("en-IN")} · {demand.status}</p>
        </div>
        <Link to="/eo/demands" style={{ fontSize: 13, color: "#e05d36" }}>← Back</Link>
      </div>

      <div style={glass}>
        <p style={label}>Amount</p><p style={value}>₹{demand.amount?.toLocaleString("en-IN")}</p>
        <p style={label}>Balance</p><p style={value}>₹{demand.balanceAmount?.toLocaleString("en-IN")}</p>
        <p style={label}>Property</p>
        <p style={value}>{prop ? <Link to={`/eo/properties/${prop.id}`}>{prop.propertyId}</Link> : "—"}</p>
        <p style={label}>Assessment year</p><p style={value}>{demand.assessment?.assessmentYear?.year || "—"}</p>
      </div>

      <MediaGallery title="Demand draft images (up to 2)" entityType="DEMAND" entityId={demand.id} folder="demands" />
    </div>
  );
}
