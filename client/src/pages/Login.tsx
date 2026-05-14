import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { APP_NAME } from "../lib/branding";

export function LoginPage() {
  const [tab, setTab] = useState<"officer" | "citizen">("officer");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleOfficerLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    const result = await login(email, password);
    if (result.success) {
      // Use window.location for a clean navigation that respects new cookie
      window.location.href = "/eo";
      return;
    }
    setError(result.error || "Login failed");
    setLoading(false);
  };

  const handleCitizenLogin = async () => {
    setError("");
    if (!mobile || !password) { setError("Please fill all fields"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/citizen-login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile, password }), credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = "/eo";
      } else {
        setError(data.error || "Login failed");
      }
    } catch { setError("Network error"); }
    setLoading(false);
  };

  const inp = { width: "100%", padding: "11px 14px", borderRadius: 10, border: "1px solid rgba(0,0,0,0.06)", background: "rgba(255,255,255,0.6)", fontSize: 15, outline: "none", boxSizing: "border-box" as const };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #faf9f7 0%, #fef0e7 50%, #fce4d8 100%)" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>
        <h1 style={{ textAlign: "center", fontSize: 26, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 4 }}>Welcome back</h1>
        <p style={{ textAlign: "center", fontSize: 14, color: "#7c7570", marginBottom: 28 }}>Sign in to {APP_NAME}</p>

        <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: 28 }}>

          {/* Tab Switcher */}
          <div style={{ display: "flex", background: "rgba(0,0,0,0.04)", borderRadius: 10, padding: 3, marginBottom: 20 }}>
            {(["officer", "citizen"] as const).map(t => (
              <button key={t} onClick={() => { setTab(t); setError(""); }} style={{
                flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer",
                background: tab === t ? "#fff" : "transparent", color: tab === t ? "#1a1614" : "#7c7570",
                boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.2s",
              }}>
                {t === "officer" ? "Officer Login" : "Citizen Login"}
              </button>
            ))}
          </div>

          {error && <div style={{ background: "rgba(220,38,38,0.08)", color: "#dc2626", padding: "10px 14px", borderRadius: 10, fontSize: 13, marginBottom: 16 }}>{error}</div>}

          {tab === "officer" ? (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#7c7570", marginBottom: 6 }}>Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@municipality.gov" style={inp} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#7c7570", marginBottom: 6 }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
                  onKeyDown={e => e.key === "Enter" && handleOfficerLogin()} style={inp} />
              </div>
              <button onClick={handleOfficerLogin} disabled={loading}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: loading ? "#c4a090" : "linear-gradient(135deg, #e05d36, #d4532e)", color: "#fff", fontSize: 15, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <p style={{ textAlign: "center", fontSize: 12, color: "#a09890", marginTop: 14 }}>
                Admin: admin@demo.com / Admin@123<br />
                Officers: rajesh@municipality.gov / Officer@123
              </p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#7c7570", marginBottom: 6 }}>Mobile Number</label>
                <input type="tel" value={mobile} onChange={e => setMobile(e.target.value)} placeholder="10-digit mobile" maxLength={10} style={inp} />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 500, color: "#7c7570", marginBottom: 6 }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password"
                  onKeyDown={e => e.key === "Enter" && handleCitizenLogin()} style={inp} />
              </div>
              <button onClick={handleCitizenLogin} disabled={loading}
                style={{ width: "100%", padding: "12px", borderRadius: 10, border: "none", background: loading ? "#c4a090" : "linear-gradient(135deg, #e05d36, #d4532e)", color: "#fff", fontSize: 15, fontWeight: 500, cursor: loading ? "not-allowed" : "pointer" }}>
                {loading ? "Signing in..." : "Sign In"}
              </button>
              <p style={{ textAlign: "center", fontSize: 13, color: "#7c7570", marginTop: 14 }}>
                No account? <Link to="/register" style={{ color: "#e05d36", fontWeight: 500, textDecoration: "none" }}>Register here</Link>
              </p>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#7c7570", marginTop: 20 }}>
          {tab === "officer"
            ? <>Property owner? <button onClick={() => setTab("citizen")} style={{ color: "#e05d36", fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Citizen login</button></>
            : <>Municipal officer? <button onClick={() => setTab("officer")} style={{ color: "#e05d36", fontWeight: 500, background: "none", border: "none", cursor: "pointer", fontSize: 13 }}>Officer login</button></>
          }
        </p>
      </div>
    </div>
  );
}
