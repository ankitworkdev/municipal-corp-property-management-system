import { useEffect, useState } from "react";
import { api, apiPut } from "../lib/api";

const Badge = ({ s }: { s: string }) => {
  const c: Record<string, [string, string]> = { OPEN: ["#cce5ff", "#004085"], IN_PROGRESS: ["#fff3cd", "#856404"], RESOLVED: ["#d4edda", "#155724"], CLOSED: ["#e2e3e5", "#383d41"] };
  const [bg, fg] = c[s] || ["#e2e3e5", "#383d41"];
  return <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color: fg }}>{s}</span>;
};

export function GrievancesPage() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api("/grievances?pageSize=25").then(d => { setData(d.data || []); setTotal(d.pagination?.total || 0); setLoading(false); });
  };
  useEffect(load, []);

  const updateStatus = async (id: string, status: string) => {
    if (!confirm(`Change status to ${status}?`)) return;
    await apiPut("/grievances", { id, status });
    load();
  };

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };
  const th = { padding: "11px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 600, color: "#7c7570", textTransform: "uppercase" as const, letterSpacing: "0.04em" };

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Manage Grievances</h1>
        <p style={{ fontSize: 13, color: "#7c7570", marginTop: 3 }}>{total} grievances</p>
      </div>
      <div style={glass}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <th style={th}>Subject</th><th style={th}>Filed By</th><th style={th}>Mobile</th><th style={th}>Status</th><th style={th}>Actions</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "#7c7570" }}>Loading...</td></tr>
              : data.length === 0 ? <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "#7c7570" }}>No grievances</td></tr>
              : data.map((g: any) => (
                <tr key={g.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
                  <td style={{ padding: "10px 16px", fontWeight: 500 }}>{g.subject}</td>
                  <td style={{ padding: "10px 16px" }}>{g.user?.firstName} {g.user?.lastName}</td>
                  <td style={{ padding: "10px 16px" }}>{g.user?.mobile}</td>
                  <td style={{ padding: "10px 16px" }}><Badge s={g.status} /></td>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", gap: 4 }}>
                      {g.status === "OPEN" && <button onClick={() => updateStatus(g.id, "IN_PROGRESS")} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid #f39c12", background: "rgba(243,156,18,0.08)", color: "#f39c12", fontSize: 11, cursor: "pointer" }}>In Progress</button>}
                      {(g.status === "OPEN" || g.status === "IN_PROGRESS") && (
                        <>
                          <button onClick={() => updateStatus(g.id, "RESOLVED")} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid #2ecc71", background: "rgba(46,204,113,0.08)", color: "#2ecc71", fontSize: 11, cursor: "pointer" }}>Resolve</button>
                          <button onClick={() => updateStatus(g.id, "CLOSED")} style={{ padding: "3px 8px", borderRadius: 6, border: "1px solid #6c757d", background: "rgba(108,117,125,0.08)", color: "#6c757d", fontSize: 11, cursor: "pointer" }}>Close</button>
                        </>
                      )}
                      {g.status === "RESOLVED" && <span style={{ fontSize: 11, color: "#2ecc71" }}>✓ Resolved</span>}
                      {g.status === "CLOSED" && <span style={{ fontSize: 11, color: "#6c757d" }}>Closed</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
