import { useState } from "react";
import { Link } from "react-router-dom";

export function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #faf9f7 0%, #fef0e7 50%, #fce4d8 100%)" }}>
      <div style={{ width: "100%", maxWidth: 400, padding: "0 20px" }}>
        <h1 style={{ textAlign: "center", fontSize: 26, fontWeight: 600, marginBottom: 4 }}>Reset Password</h1>
        <p style={{ textAlign: "center", fontSize: 14, color: "#7c7570", marginBottom: 28 }}>Contact your administrator</p>

        <div style={{ background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: 20, border: "1px solid rgba(255,255,255,0.5)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: 28 }}>
          {!submitted ? (
            <div>
              <p style={{ fontSize: 14, color: "#7c7570", lineHeight: 1.6, marginBottom: 16 }}>
                To reset your password, please contact the municipal office administrator. They can reset your password through the admin panel.
              </p>
              <div style={{ background: "rgba(224,93,54,0.06)", padding: 16, borderRadius: 12, marginBottom: 16 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#e05d36", marginBottom: 4 }}>Municipal Office Helpline</p>
                <p style={{ fontSize: 15, color: "#1a1614" }}>+91-6274-123456</p>
              </div>
              <div style={{ background: "rgba(0,0,0,0.02)", padding: 16, borderRadius: 12 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#7c7570", marginBottom: 4 }}>Tax Department</p>
                <p style={{ fontSize: 15, color: "#1a1614" }}>+91-6274-123457</p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 20 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✉️</div>
              <p style={{ fontSize: 15, color: "#1a1614", fontWeight: 500 }}>Request submitted</p>
              <p style={{ fontSize: 13, color: "#7c7570", marginTop: 4 }}>The administrator will reset your password.</p>
            </div>
          )}
        </div>

        <p style={{ textAlign: "center", fontSize: 13, color: "#7c7570", marginTop: 20 }}>
          Remember your password? <Link to="/login" style={{ color: "#e05d36", fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
