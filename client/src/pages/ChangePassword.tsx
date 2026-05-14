import { useState } from "react";
import { apiPost } from "../lib/api";

export function ChangePassword() {
  const [f, setF] = useState({ currentPassword:"", newPassword:"", confirm:"" });
  const [msg, setMsg] = useState("");
  const inp = { width:"100%",padding:"12px 14px",borderRadius:10,border:"none",background:"#f5f5f7",fontSize:15,outline:"none",boxSizing:"border-box" as const,marginBottom:12 };

  const submit = async () => {
    if (f.newPassword !== f.confirm) { setMsg("Passwords don't match"); return; }
    if (f.newPassword.length < 8) { setMsg("Min 8 characters"); return; }
    const res = await apiPost("/change-password", { currentPassword:f.currentPassword, newPassword:f.newPassword });
    setMsg(res.success ? "Password changed!" : (res.error||"Failed"));
    if (res.success) setF({ currentPassword:"",newPassword:"",confirm:"" });
  };

  return (
    <div style={{ maxWidth:400, margin:"0 auto" }}>
      <h1 style={{ fontSize:28, fontWeight:600, marginBottom:24 }}>Change Password</h1>
      <div style={{ background:"rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", borderRadius:16, padding:28, border:"1px solid rgba(255,255,255,0.4)" }}>
        {msg && <div style={{ padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16, background:msg.includes("changed")?"#d4edda":"#fef2f2", color:msg.includes("changed")?"#155724":"#dc2626" }}>{msg}</div>}
        <input type="password" value={f.currentPassword} onChange={e=>setF(p=>({...p,currentPassword:e.target.value}))} placeholder="Current password" style={inp} />
        <input type="password" value={f.newPassword} onChange={e=>setF(p=>({...p,newPassword:e.target.value}))} placeholder="New password" style={inp} />
        <input type="password" value={f.confirm} onChange={e=>setF(p=>({...p,confirm:e.target.value}))} placeholder="Confirm" style={inp} />
        <button onClick={submit} style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", background:"#e05d36", color:"#fff", fontSize:15, fontWeight:500, cursor:"pointer" }}>Change Password</button>
      </div>
    </div>
  );
}
