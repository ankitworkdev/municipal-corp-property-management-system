import { Link } from "react-router-dom";
import { APP_NAME, APP_NAME_SHORT } from "../lib/branding";

export function HomePage() {
  const features = [
    { icon: "📋", title: "Property Assessment", desc: "Register properties, calculate taxes using ARV methodology, and manage assessment workflows." },
    { icon: "💰", title: "Tax Collection", desc: "Collect payments online and offline with full audit trail and receipt generation." },
    { icon: "⚖️", title: "Dispute & Grievance", desc: "Citizens can file disputes and grievances with transparent resolution tracking." },
    { icon: "📊", title: "Reports & Analytics", desc: "Comprehensive reporting for demand, collection, and pending assessments." },
  ];

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", borderRadius: 16, border: "1px solid rgba(0,0,0,0.04)", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" };

  return (
    <div style={{ minHeight: "100vh", background: "#faf9f7" }}>
      <nav style={{ padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
        <span style={{ fontSize: 16, fontWeight: 600 }}>{APP_NAME_SHORT}</span>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login" style={{ padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#fff", textDecoration: "none", background: "#e05d36" }}>Sign In</Link>
          <Link to="/register" style={{ padding: "7px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#1a1614", textDecoration: "none", border: "1px solid rgba(0,0,0,0.1)" }}>Register</Link>
        </div>
      </nav>
      <section style={{ padding: "80px 24px 60px", textAlign: "center", background: "linear-gradient(180deg, #faf9f7 0%, #fef0e7 100%)" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ display: "inline-block", padding: "6px 14px", borderRadius: 20, background: "rgba(224,93,54,0.1)", fontSize: 12, fontWeight: 500, color: "#e05d36", marginBottom: 20 }}>Municipal Property Tax Management</div>
          <h1 style={{ fontSize: 48, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 16 }}>Modern tax management, <span style={{ color: "#e05d36" }}>simplified.</span></h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: "#7c7570", marginBottom: 32 }}>A complete property tax management system for municipal corporations.</p>
          <Link to="/login" style={{ padding: "12px 28px", borderRadius: 10, background: "#e05d36", color: "#fff", fontSize: 15, fontWeight: 500, textDecoration: "none" }}>Get Started →</Link>
        </div>
      </section>
      <section style={{ padding: "60px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          {features.map(f => (
            <div key={f.title} style={glass}>
              <div style={{ padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.5, color: "#7c7570" }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
      <footer style={{ padding: 24, textAlign: "center", fontSize: 12, color: "#7c7570", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
        © {new Date().getFullYear()} {APP_NAME}
      </footer>
    </div>
  );
}
