import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentAssessments, setRecentAssessments] = useState<any[]>([]);

  useEffect(() => {
    api("/dashboard/stats").then(d => { if (d.success) setStats(d.data); });
    api("/assessments?pageSize=5").then(d => { if (d.data) setRecentAssessments(d.data); });
  }, []);

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };

  const cards = [
    { label: "Total Demand", value: stats?.totalDemand, prefix: "₹", color: "#e05d36", bg: "rgba(224,93,54,0.08)" },
    { label: "Collection", value: stats?.totalCollection, prefix: "₹", color: "#2ecc71", bg: "rgba(46,204,113,0.08)" },
    { label: "Balance", value: stats?.totalBalanceDemand, prefix: "₹", color: "#f39c12", bg: "rgba(243,156,18,0.08)" },
    { label: "Assessments", value: stats?.totalAssessment, color: "#9b59b6", bg: "rgba(155,89,182,0.08)" },
    { label: "Pending", value: stats?.totalPendingApplication, color: "#3498db", bg: "rgba(52,152,219,0.08)" },
  ];

  // Collection rate bar
  const collectionRate = stats ? Math.round((stats.totalCollection / (stats.totalDemand || 1)) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em" }}>Welcome back{user ? `, ${user.name.split(" ")[0]}` : ""} 👋</h1>
        <p style={{ fontSize: 14, color: "#7c7570", marginTop: 4 }}>Property tax management overview</p>
      </div>

      {!stats ? <p style={{ color: "#7c7570" }}>Loading...</p> : (
        <>
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 14, marginBottom: 24 }}>
            {cards.map(c => (
              <div key={c.label} style={{ ...glass, padding: 20, background: c.bg }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: "#7c7570", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>{c.label}</p>
                <p style={{ fontSize: 26, fontWeight: 600, color: c.color }}>{c.prefix || ""}{typeof c.value === "number" ? c.value.toLocaleString("en-IN") : "0"}</p>
              </div>
            ))}
          </div>

          {/* Collection Rate Bar + Recent Assessments */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
            {/* Collection Rate */}
            <div style={{ ...glass, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Collection Rate</h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ background: "rgba(0,0,0,0.04)", borderRadius: 8, height: 12, overflow: "hidden" }}>
                    <div style={{ background: collectionRate > 80 ? "#2ecc71" : collectionRate > 50 ? "#f39c12" : "#e74c3c", height: "100%", width: `${collectionRate}%`, borderRadius: 8, transition: "width 1s ease" }} />
                  </div>
                  <p style={{ fontSize: 12, color: "#7c7570", marginTop: 6 }}>₹{stats.totalCollection.toLocaleString("en-IN")} collected of ₹{stats.totalDemand.toLocaleString("en-IN")}</p>
                </div>
                <p style={{ fontSize: 32, fontWeight: 700, color: collectionRate > 80 ? "#2ecc71" : "#f39c12", lineHeight: 1 }}>{collectionRate}%</p>
              </div>

              {/* Mini bar chart */}
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginTop: 20, height: 80 }}>
                {[
                  { label: "Demand", value: stats.totalDemand, color: "#e05d36" },
                  { label: "Collected", value: stats.totalCollection, color: "#2ecc71" },
                  { label: "Balance", value: stats.totalBalanceDemand, color: "#f39c12" },
                ].map(bar => {
                  const maxVal = Math.max(stats.totalDemand, 1);
                  const height = Math.max(8, (bar.value / maxVal) * 70);
                  return (
                    <div key={bar.label} style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ background: bar.color, height, borderRadius: "4px 4px 0 0", margin: "0 auto", width: "60%", opacity: 0.8 }} />
                      <p style={{ fontSize: 10, color: "#7c7570", marginTop: 4 }}>{bar.label}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Assessments */}
            <div style={{ ...glass, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Recent Assessments</h3>
              {recentAssessments.length === 0 ? <p style={{ color: "#7c7570", fontSize: 13 }}>No assessments yet</p> : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {recentAssessments.slice(0, 5).map((a: any) => (
                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500 }}>{a.property?.ownerName || "—"}</p>
                        <p style={{ fontSize: 11, color: "#7c7570" }}>{a.property?.propertyId} · {a.property?.ward?.name}</p>
                      </div>
                      <span style={{
                        padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 500,
                        background: a.formStatus === "APPROVED" ? "#d4edda" : a.formStatus === "SUBMITTED" ? "#cce5ff" : "#fff3cd",
                        color: a.formStatus === "APPROVED" ? "#155724" : a.formStatus === "SUBMITTED" ? "#004085" : "#856404",
                      }}>{a.formStatus}</span>
                    </div>
                  ))}
                </div>
              )}
              <Link to="/eo/manage-form" style={{ display: "block", fontSize: 12, color: "#e05d36", fontWeight: 500, textDecoration: "none", marginTop: 12 }}>View all →</Link>
            </div>
          </div>
        </>
      )}

      {/* Quick Actions */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Quick Actions</h2>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          {[
            { label: "New Assessment", to: "/eo/new-assessment", icon: "➕" },
            { label: "Update Payment", to: "/eo/update-payment", icon: "💳" },
            { label: "Reports", to: "/eo/reporting", icon: "📊" },
            { label: "Properties", to: "/eo/properties", icon: "🏠" },
            { label: "Disputes", to: "/eo/manage-dispute", icon: "⚠️" },
            { label: "Audit Logs", to: "/eo/audit-logs", icon: "📜" },
          ].map(a => (
            <Link key={a.to} to={a.to} style={{ ...glass, padding: "12px 18px", display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 500, color: "#1a1614", textDecoration: "none" }}>{a.icon} {a.label}</Link>
          ))}
        </div>
      </div>
    </div>
  );
}
