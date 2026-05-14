import { useState } from "react";
import { apiPut } from "../lib/api";

export function UpdatePayment() {
  const [f, setF] = useState({ demandId:"", chequeNumber:"", orderId:"", paymentMode:"" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const u = (k:string,v:string) => setF(p=>({...p,[k]:v}));
  const inp = { width:"100%",padding:"12px 14px",borderRadius:10,border:"none",background:"#f5f5f7",fontSize:15,outline:"none",boxSizing:"border-box" as const,marginBottom:12 };

  const submit = async () => {
    if (!f.demandId||!f.paymentMode) { setMsg("Fill required fields"); return; }
    setLoading(true);
    const res = await apiPut("/payments", f);
    setMsg(res.success ? "Payment updated!" : (res.error||"Failed"));
    if (res.success) setF({ demandId:"",chequeNumber:"",orderId:"",paymentMode:"" });
    setLoading(false);
  };

  return (
    <div style={{ maxWidth:500, margin:"0 auto" }}>
      <h1 style={{ fontSize:28, fontWeight:600, marginBottom:24 }}>Update Payment</h1>
      <div style={{ background:"rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", borderRadius:16, padding:28, border:"1px solid rgba(255,255,255,0.4)" }}>
        {msg && <div style={{ padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16, background:msg.includes("updated")?"#d4edda":"#fef2f2", color:msg.includes("updated")?"#155724":"#dc2626" }}>{msg}</div>}
        <label style={{ fontSize:12, fontWeight:500, color:"#7c7570" }}>Demand ID *</label>
        <input value={f.demandId} onChange={e=>u("demandId",e.target.value)} placeholder="DEM-000001" style={inp} />
        <label style={{ fontSize:12, fontWeight:500, color:"#7c7570" }}>Cheque/DD Number</label>
        <input value={f.chequeNumber} onChange={e=>u("chequeNumber",e.target.value)} style={inp} />
        <label style={{ fontSize:12, fontWeight:500, color:"#7c7570" }}>Order ID</label>
        <input value={f.orderId} onChange={e=>u("orderId",e.target.value)} style={inp} />
        <label style={{ fontSize:12, fontWeight:500, color:"#7c7570" }}>Payment Mode *</label>
        <select value={f.paymentMode} onChange={e=>u("paymentMode",e.target.value)} style={{...inp,appearance:"auto"}}>
          <option value="">Select</option><option value="CASH">Cash</option><option value="CHEQUE">Cheque</option><option value="DD">DD</option><option value="NEFT">NEFT</option><option value="ONLINE">Online</option>
        </select>
        <button onClick={submit} disabled={loading} style={{ width:"100%", padding:"12px", borderRadius:10, border:"none", background:loading?"#999":"#e05d36", color:"#fff", fontSize:15, fontWeight:500, cursor:"pointer", marginTop:8 }}>{loading?"Updating...":"Update Payment"}</button>
      </div>
    </div>
  );
}
