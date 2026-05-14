import { useEffect, useState } from "react";
import { api } from "../lib/api";

export function ArvMatrix() {
  const [rates, setRates] = useState<any[]>([]);
  useEffect(() => { api("/arv-rates?pageSize=100").then(d => setRates(d.data||[])); }, []);

  const rts = ["PRINCIPAL_MAIN_ROAD","MAIN_ROAD","OTHER"];
  const cts = ["RCC_ROOF","ASBESTOS_ROOF","OTHER"];
  const uts = ["RESIDENTIAL","COMMERCIAL","OTHER"];
  const get = (r:string,c:string,u:string) => rates.find((x:any)=>x.roadType===r&&x.constructionType===c&&x.usageCategory===u)?.ratePerSqFt ?? "—";

  return (
    <div>
      <h1 style={{ fontSize:28, fontWeight:600, marginBottom:24 }}>Annual Rental Value (ARV)</h1>
      <div style={{ background:"rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", borderRadius:12, border:"1px solid rgba(255,255,255,0.4)", overflow:"auto" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth:700 }}>
          <thead>
            <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
              <th rowSpan={2} style={{ padding:"10px 12px", textAlign:"left", fontSize:11, fontWeight:600, color:"#7c7570", textTransform:"uppercase" }}>Construction</th>
              {rts.map(r=><th key={r} colSpan={3} style={{ padding:"10px 12px", textAlign:"center", fontSize:11, fontWeight:600, color:"#7c7570", textTransform:"uppercase", borderLeft:"1px solid rgba(0,0,0,0.04)" }}>{r.replace(/_/g," ")}</th>)}
            </tr>
            <tr style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
              {rts.map(r=>uts.map(u=><th key={r+u} style={{ padding:"6px 8px", textAlign:"center", fontSize:10, color:"#7c7570", borderLeft:u==="RESIDENTIAL"?"1px solid rgba(0,0,0,0.04)":"none" }}>{u.slice(0,4)}</th>))}
            </tr>
          </thead>
          <tbody>
            {cts.map(c=>(
              <tr key={c} style={{ borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
                <td style={{ padding:"10px 12px", fontWeight:500 }}>{c.replace(/_/g," ")}</td>
                {rts.map(r=>uts.map(u=><td key={r+u} style={{ padding:"10px 8px", textAlign:"center", borderLeft:u==="RESIDENTIAL"?"1px solid rgba(0,0,0,0.04)":"none" }}>{get(r,c,u)}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
