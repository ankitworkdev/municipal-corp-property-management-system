import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

export function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", mobile: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgType, setMsgType] = useState<"success" | "error">("error");
  const navigate = useNavigate();
  const u = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

  const submit = async () => {
    setMsg("");
    if (!form.firstName || !form.lastName || !form.mobile || !form.password) { setMsg("Fill all fields"); setMsgType("error"); return; }
    if (!/^[6-9]\d{9}$/.test(form.mobile)) { setMsg("Enter valid 10-digit mobile number"); setMsgType("error"); return; }
    if (form.password.length < 6) { setMsg("Password must be at least 6 characters"); setMsgType("error"); return; }
    if (form.password !== form.confirmPassword) { setMsg("Passwords do not match"); setMsgType("error"); return; }

    setLoading(true);
    const res = await apiPost("/register-simple", { firstName: form.firstName, lastName: form.lastName, mobile: form.mobile, password: form.password });
    if (res.success) {
      setMsg("Registration successful! Redirecting to login...");
      setMsgType("success");
      setTimeout(() => navigate("/login"), 2000);
    } else {
      setMsg(res.error || "Registration failed");
      setMsgType("error");
    }
    setLoading(false);
  };

  const inp = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.6)", fontSize: 15, outline: "none", boxSizing: "border-box" as const, marginBottom: 14 };
  const lbl = { fontSize: 12, fontWeight: 500 as const, color: "#7c7570", marginBottom: 4, display: "block" as const };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #faf9f7 0%, #fef0e7 50%, #fce4d8 100%)" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>
        <h1 style={{ textAlign: "center", fontSize: 26, fontWeight: 600, marginBottom: 4 }}>Create Account</h1>
        <p style={{ textAlign: "center", fontSize: 14, color: "#7c7570", marginBottom: 28 }}>Register as a property owner</p>

        <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: 28 }}>
          {msg && <div style={{ padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16, background: msgType === "success" ? "#d4edda" : "rgba(220,38,38,0.08)", color: msgType === "success" ? "#155724" : "#dc2626" }}>{msg}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 2 }}>
            <div>
              <label style={lbl}>First Name</label>
              <input value={form.firstName} onChange={e => u("firstName", e.target.value)} placeholder="Ramesh" style={inp} />
            </div>
            <div>
              <label style={lbl}>Last Name</label>
              <input value={form.lastName} onChange={e => u("lastName", e.target.value)} placeholder="Prasad" style={inp} />
            </div>
          </div>

          <label style={lbl}>Mobile Number</label>
          <input type="tel" value={form.mobile} onChange={e => u("mobile", e.target.value)} placeholder="10-digit mobile number" maxLength={10} style={inp} />

          <label style={lbl}>Password</label>
          <input type="password" value={form.password} onChange={e => u("password", e.target.value)} placeholder="Minimum 6 characters" style={inp} />

          <label style={lbl}>Confirm Password</label>
          <input type="password" value={form.confirmPassword} onChange={e => u("confirmPassword", e.target.value)} placeholder="Re-enter password"
            onKeyDown={e => e.key === "Enter" && submit()} style={inp} />

          <button onClick={submit} disabled={loading}
            style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: loading ? "#c4a090" : "linear-gradient(135deg, #e05d36, #d4532e)", color: "#fff", fontSize: 15, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#7c7570", marginTop: 20 }}>
          Already have an account? <Link to="/login" style={{ color: "#e05d36", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
