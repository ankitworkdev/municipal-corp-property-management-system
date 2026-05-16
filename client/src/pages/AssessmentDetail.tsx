import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { MediaGallery } from "../components/MediaGallery";

export function AssessmentDetail() {
  const { id } = useParams();
  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api(`/assessments/${id}`)
      .then((d) => setAssessment(d.data))
      .finally(() => setLoading(false));
  }, [id]);

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", padding: 24, marginBottom: 16 };
  const label = { fontSize: 11, fontWeight: 600, color: "#7c7570", textTransform: "uppercase" as const };
  const value = { fontSize: 15, fontWeight: 500, marginBottom: 12 };

  if (loading) return <p style={{ color: "#7c7570" }}>Loading…</p>;
  if (!assessment) return <p>Assessment not found. <Link to="/eo/manage-form">Back</Link></p>;

  const prop = assessment.property;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <motionAssessmentDetailHeader assessment={assessment} prop={prop} />
        <Link to="/eo/manage-form" style={{ fontSize: 13, color: "#e05d36" }}>← Back</Link>
      </div>

      <div style={glass}>
        <p style={label}>Property</p>
        <p style={value}>{prop ? <Link to={`/eo/properties/${prop.id}`}>{prop.propertyId}</Link> : "—"}</p>
        <p style={label}>Ward</p>
        <p style={value}>{prop?.ward?.name || "—"}</p>
        <p style={label}>Total demand</p>
        <p style={value}>₹{(assessment.totalDemand || 0).toLocaleString("en-IN")}</p>
        <p style={label}>Status</p>
        <p style={value}>{assessment.formStatus}</p>
      </div>

      <MediaGallery
        title={assessment.formStatus === "DRAFT" ? "Draft documents (up to 5)" : "Assessment documents (up to 5)"}
        entityType="ASSESSMENT"
        entityId={assessment.id}
        folder="assessments"
      />
    </div>
  );
}

function motionAssessmentDetailHeader({ assessment, prop }: { assessment: any; prop: any }) {
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Assessment {assessment.assessmentYear?.year}</h1>
      <p style={{ fontSize: 13, color: "#7c7570" }}>
        {prop?.propertyId} · {assessment.formStatus}
      </p>
    </div>
  );
}
