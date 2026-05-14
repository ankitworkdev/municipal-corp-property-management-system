import { useEffect, useState } from "react";
import { api, apiPut } from "../lib/api";

export function Settings() {
  const [settings, setSettings] = useState<any[]>([]);
  const load = () => { api("/settings").then(d => setSettings(d.data||[])); };
  useEffect(load, []);
  const toggle = async (s:any) => { await apiPut("/settings", { id:s.id, enabled:!s.enabled }); load(); };

  return (
    <div>
      <h1 style={{ fontSize:28, fontWeight:600, marginBottom:24 }}>Settings</h1>
      <div style={{ background:"rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", borderRadius:12, border:"1px solid rgba(255,255,255,0.4)", overflow:"hidden" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:14 }}>
          <thead><tr style={{ borderBottom:"1px solid rgba(0,0,0,0.06)" }}>
            <th style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#7c7570", textTransform:"uppercase" }}>Setting</th>
            <th style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#7c7570", textTransform:"uppercase" }}>Enabled</th>
            <th style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#7c7570", textTransform:"uppercase" }}>Description</th>
            <th style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#7c7570", textTransform:"uppercase" }}>Action</th>
          </tr></thead>
          <tbody>{settings.map(s => (
            <tr key={s.id} style={{ borderBottom:"1px solid rgba(0,0,0,0.04)" }}>
              <td style={{ padding:"10px 16px", fontWeight:500 }}>{s.settingName}</td>
              <td style={{ padding:"10px 16px" }}><span style={{ padding:"2px 10px", borderRadius:20, fontSize:11, fontWeight:500, background:s.enabled?"#d4edda":"#f8d7da", color:s.enabled?"#155724":"#721c24" }}>{s.enabled?"Yes":"No"}</span></td>
              <td style={{ padding:"10px 16px", color:"#7c7570" }}>{s.description}</td>
              <td style={{ padding:"10px 16px" }}><button onClick={()=>toggle(s)} style={{ padding:"4px 14px", borderRadius:6, border:"1px solid rgba(0,0,0,0.08)", background:"#fff", cursor:"pointer", fontSize:13 }}>Toggle</button></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}
