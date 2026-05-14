import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../lib/api";

export function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // Fetch property from the list (since we don't have a single-get endpoint)
    api("/properties?pageSize=100").then(d => {
      const prop = d.data?.find((p: any) => p.id === id || p.propertyId === id);
      setProperty(prop);
      setLoading(false);
    });
    api("/assessments?pageSize=100").then(d => {
      const related = d.data?.filter((a: any) => a.property?.propertyId === id || a.propertyId === id) || [];
      setAssessments(related);
    });
  }, [id]);

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", padding: 24, marginBottom: 16 };
  const label = { fontSize: 11, fontWeight: 600, color: "#7c7570", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 };
  const value = { fontSize: 15, fontWeight: 500, color: "#1a1614", marginBottom: 12 };

  if (loading) return <p style={{ color: "#7c7570" }}>Loading...</p>;
  if (!property) return <p>Property not found. <Link to="/eo/properties" style={{ color: "#e05d36" }}>Back to list</Link></p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Property {property.propertyId}</h1>
          <p style={{ fontSize: 13, color: "#7c7570", marginTop: 3 }}>{property.propertyType?.replace(/_/g, " ")} · {property.ward?.name}</p>
        </div>
        <Link to="/eo/properties" style={{ padding: "7px 16px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", fontSize: 13, textDecoration: "none", color: "#1a1614" }}>← Back</Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {/* Owner Info */}
        <div style={glass}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#e05d36" }}>Owner Details</h3>
          <p style={label}>Owner Name</p><p style={value}>{property.ownerName || "—"}</p>
          <p style={label}>Guardian Name</p><p style={value}>{property.guardianName || "—"}</p>
          <p style={label}>Mobile</p><p style={value}>{property.mobile || "—"}</p>
          <p style={label}>Email</p><p style={value}>{property.email || "—"}</p>
        </div>

        {/* Property Info */}
        <div style={glass}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#e05d36" }}>Property Details</h3>
          <p style={label}>Type</p><p style={value}>{property.propertyType?.replace(/_/g, " ")}</p>
          <p style={label}>Construction</p><p style={value}>{property.constructionType?.replace(/_/g, " ") || "—"}</p>
          <p style={label}>Occupancy</p><p style={value}>{property.occupancyType?.replace(/_/g, " ") || "—"}</p>
          <p style={label}>Usage</p><p style={value}>{property.usageCategory || "—"}</p>
          <p style={label}>Plot Area</p><p style={value}>{property.plotAreaSqFt ? `${property.plotAreaSqFt} Sq.Ft` : "—"}</p>
          <p style={label}>Built-Up Area</p><p style={value}>{property.builtUpAreaSqFt ? `${property.builtUpAreaSqFt} Sq.Ft` : "—"}</p>
        </div>

        {/* Location */}
        <div style={glass}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#e05d36" }}>Location</h3>
          <p style={label}>Ward</p><p style={value}>{property.ward?.name || "—"}</p>
          <p style={label}>Road</p><p style={value}>{property.road?.name || "—"}</p>
          <p style={label}>Address</p><p style={value}>{property.propertyAddress || "—"}</p>
          <p style={label}>City</p><p style={value}>{property.propertyCity || "—"}, {property.propertyState || ""}</p>
          <p style={label}>Verification</p>
          <span style={{ padding: "3px 12px", borderRadius: 12, fontSize: 12, fontWeight: 500, background: property.verificationStatus === "VERIFIED" ? "#d4edda" : "#fff3cd", color: property.verificationStatus === "VERIFIED" ? "#155724" : "#856404" }}>
            {property.verificationStatus}
          </span>
        </div>

        {/* Assessment History */}
        <div style={glass}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: "#e05d36" }}>Assessment History</h3>
          {assessments.length === 0 ? <p style={{ fontSize: 13, color: "#7c7570" }}>No assessments filed</p> : (
            assessments.map((a: any) => (
              <div key={a.id} style={{ padding: "8px 0", borderBottom: "1px solid rgba(0,0,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 500 }}>{a.assessmentYear?.year}</p>
                  <p style={{ fontSize: 11, color: "#7c7570" }}>Demand: ₹{(a.totalDemand || 0).toLocaleString("en-IN")}</p>
                </div>
                <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontWeight: 500, background: a.formStatus === "APPROVED" ? "#d4edda" : a.formStatus === "SUBMITTED" ? "#cce5ff" : "#fff3cd", color: a.formStatus === "APPROVED" ? "#155724" : a.formStatus === "SUBMITTED" ? "#004085" : "#856404" }}>
                  {a.formStatus}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
