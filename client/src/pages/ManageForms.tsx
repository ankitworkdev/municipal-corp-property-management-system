import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiPut } from "../lib/api";

const Badge = ({ s }: { s: string }) => {
  const c: Record<string,[string,string]> = { DRAFT:["#fff3cd","#856404"], SUBMITTED:["#cce5ff","#004085"], APPROVED:["#d4edda","#155724"], REJECTED:["#f8d7da","#721c24"] };
  const [bg,fg] = c[s]||["#e2e3e5","#383d41"];
  return <span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:bg, color:fg }}>{s}</span>;
};

export function ManageForms() {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = () => { setLoading(true); api("/assessments?pageSize=25").then(d => { setData(d.data||[]); setTotal(d.pagination?.total||0); setLoading(false); }); };
  useEffect(load, []);

  const action = async (id: string, act: string) => {
    if (!confirm(`${act} this assessment?`)) return;
    await apiPut("/assessments", { id, action: act });
    load();
  };

  const glass = { background:"rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", borderRadius:16, border:"1px solid rgba(255,255,255,0.4)", boxShadow:"0 2px 12px rgba(0,0,0,0.04)" };
  const th = { padding:"11px 16px", textAlign:"left" as const, fontSize:11, fontWeight:600, color:"#7c7570", textTransform:"uppercase" as const, letterSpacing:"0.04em" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:20 }}>
        <div><h1 style={{ fontSize:28, fontWeight:600, margin:0 }}>Manage Forms</h1><p style={{ fontSize:13, color:"#7c7570", marginTop:3 }}>{total} assessments — Draft → Submit → Approve</p></div>
        <Link to="/eo/new-assessment" style={{ padding:"7px 16px", borderRadius:8, background:"#e05d36", color:"#fff", fontSize:13, fontWeight:500, textDecoration:"none" }}>+ New</Link>
      </div>
      <div style={glass}><div style={{ overflowX:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
          <thead><tr style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}><th style={th}>Year</th><th style={th}>Property</th><th style={th}>Ward</th><th style={th}>Owner</th><th style={th}>Status</th><th style={th}>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} style={{ padding:48, textAlign:"center", color:"#7c7570" }}>Loading...</td></tr>
            : data.length===0 ? <tr><td colSpan={6} style={{ padding:48, textAlign:"center", color:"#7c7570" }}>📋 No assessments — <Link to="/eo/new-assessment" style={{ color:"#e05d36" }}>create first</Link></td></tr>
            : data.map((r:any) => (
              <tr key={r.id} style={{ borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
                <td style={{ padding:"10px 16px" }}>{r.assessmentYear?.year||"—"}</td>
                <td style={{ padding:"10px 16px", fontWeight:500 }}>
                  {r.property?.propertyId ? <Link to={`/eo/assessments/${r.id}`} style={{ color:"#e05d36", textDecoration:"none" }}>{r.property.propertyId}</Link> : "—"}
                </td>
                <td style={{ padding:"10px 16px" }}>{r.property?.ward?.name||"—"}</td>
                <td style={{ padding:"10px 16px" }}>{r.property?.ownerName||"—"}</td>
                <td style={{ padding:"10px 16px" }}><Badge s={r.formStatus} /></td>
                <td style={{ padding:"10px 16px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    {r.formStatus==="DRAFT" && <button onClick={()=>action(r.id,"submit")} style={{ padding:"3px 10px", borderRadius:6, border:"1px solid #3498db", background:"rgba(52,152,219,0.08)", color:"#3498db", fontSize:12, cursor:"pointer" }}>Submit</button>}
                    {r.formStatus==="SUBMITTED" && <>
                      <button onClick={()=>action(r.id,"approve")} style={{ padding:"3px 10px", borderRadius:6, border:"1px solid #2ecc71", background:"rgba(46,204,113,0.08)", color:"#2ecc71", fontSize:12, cursor:"pointer" }}>Approve</button>
                      <button onClick={()=>action(r.id,"reject")} style={{ padding:"3px 10px", borderRadius:6, border:"1px solid #e74c3c", background:"rgba(231,76,60,0.08)", color:"#e74c3c", fontSize:12, cursor:"pointer" }}>Reject</button>
                    </>}
                    {r.formStatus==="APPROVED" && <span style={{ fontSize:12, color:"#2ecc71" }}>✓ Done</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div></div>
    </div>
  );
}
