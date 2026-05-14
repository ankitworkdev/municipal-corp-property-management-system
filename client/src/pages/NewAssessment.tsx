import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiPost } from "../lib/api";

export function NewAssessment() {
  const [wards, setWards] = useState<any[]>([]);
  const [roads, setRoads] = useState<any[]>([]);
  const [form, setForm] = useState({ wardId:"", roadId:"", ownerName:"", guardianName:"", mobile:"", email:"", propertyType:"LAND_AND_BUILDING", constructionType:"RCC_ROOF", occupancyType:"SELF_OCCUPIED", usageCategory:"RESIDENTIAL", ownershipType:"SINGLE_OWNER", plotArea:"", builtUpArea:"", propertyAddress:"" });
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    api("/wards?pageSize=50").then(d => setWards(d.data||[]));
    api("/roads?pageSize=50").then(d => setRoads(d.data||[]));
  }, []);

  const u = (k:string,v:string) => setForm(p => ({...p,[k]:v}));
  const inp = { width:"100%",padding:"10px 12px",borderRadius:8,border:"1px solid rgba(0,0,0,0.08)",background:"#faf9f7",fontSize:14,outline:"none",boxSizing:"border-box" as const,marginBottom:12 };
  const lbl = { display:"block",fontSize:11,fontWeight:500,color:"#7c7570",marginBottom:4 };

  const save = async () => {
    if (!form.wardId||!form.ownerName||!form.mobile) { setMsg("Fill required fields"); return; }
    const prop = await apiPost("/properties", form);
    if (!prop.success) { setMsg(prop.error||"Failed"); return; }
    const yr = await api("/assessment-years?pageSize=1");
    await apiPost("/assessments", { assessmentYearId: yr.data?.[0]?.id, propertyId: prop.data.id });
    setMsg("Saved!"); setTimeout(() => navigate("/eo/manage-form"), 1000);
  };

  const sections = [
    { title:"Basic Details", fields:[
      {l:"Ward *",k:"wardId",type:"select",opts:wards.map(w=>({v:w.id,l:w.name}))},
      {l:"Road",k:"roadId",type:"select",opts:roads.map(r=>({v:r.id,l:r.name}))},
      {l:"Property Type",k:"propertyType",type:"select",opts:[{v:"LAND_AND_BUILDING",l:"Land & Building"},{v:"VACANT_LAND",l:"Vacant Land"}]},
      {l:"Ownership",k:"ownershipType",type:"select",opts:[{v:"SINGLE_OWNER",l:"Single"},{v:"JOINT_OWNER",l:"Joint"},{v:"INSTITUTIONAL",l:"Institutional"},{v:"GOVERNMENT",l:"Government"}]},
    ]},
    { title:"Owner", fields:[{l:"Owner Name *",k:"ownerName"},{l:"Guardian Name",k:"guardianName"}] },
    { title:"Contact", fields:[{l:"Mobile *",k:"mobile"},{l:"Email",k:"email"}] },
    { title:"Property", fields:[
      {l:"Construction",k:"constructionType",type:"select",opts:[{v:"RCC_ROOF",l:"RCC"},{v:"ASBESTOS_ROOF",l:"Asbestos"},{v:"OTHER",l:"Other"}]},
      {l:"Occupancy",k:"occupancyType",type:"select",opts:[{v:"SELF_OCCUPIED",l:"Self"},{v:"TENANT",l:"Tenant"}]},
      {l:"Usage",k:"usageCategory",type:"select",opts:[{v:"RESIDENTIAL",l:"Residential"},{v:"COMMERCIAL",l:"Commercial"},{v:"OTHER",l:"Other"}]},
      {l:"Plot Area (Sq.Ft)",k:"plotArea"},{l:"Built-Up Area (Sq.Ft)",k:"builtUpArea"},{l:"Address",k:"propertyAddress"},
    ]},
  ];

  return (
    <div style={{ maxWidth:700, margin:"0 auto" }}>
      <h1 style={{ fontSize:28, fontWeight:600, marginBottom:24 }}>New Assessment</h1>
      {msg && <div style={{ padding:"10px 14px", borderRadius:10, fontSize:13, marginBottom:16, background:msg.includes("Saved")?"#d4edda":"#fef2f2", color:msg.includes("Saved")?"#155724":"#dc2626" }}>{msg}</div>}
      {sections.map(s => (
        <div key={s.title} style={{ background:"rgba(255,255,255,0.72)", backdropFilter:"blur(20px)", borderRadius:12, padding:20, marginBottom:12, border:"1px solid rgba(255,255,255,0.4)" }}>
          <h2 style={{ fontSize:16, fontWeight:600, marginBottom:16 }}>{s.title}</h2>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {s.fields.map(f => (
              <div key={f.k}>
                <label style={lbl}>{f.l}</label>
                {f.type==="select" ? <select value={(form as any)[f.k]} onChange={e=>u(f.k,e.target.value)} style={{...inp,appearance:"auto"}}><option value="">Select</option>{f.opts?.map((o:any)=><option key={o.v} value={o.v}>{o.l}</option>)}</select>
                : <input value={(form as any)[f.k]} onChange={e=>u(f.k,e.target.value)} style={inp} />}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:16 }}>
        <button onClick={()=>navigate(-1)} style={{ padding:"10px 24px", borderRadius:8, border:"1px solid rgba(0,0,0,0.1)", background:"#fff", fontSize:14, cursor:"pointer" }}>Cancel</button>
        <button onClick={save} style={{ padding:"10px 24px", borderRadius:8, border:"none", background:"#e05d36", color:"#fff", fontSize:14, fontWeight:500, cursor:"pointer" }}>Save Draft</button>
      </div>
    </div>
  );
}
