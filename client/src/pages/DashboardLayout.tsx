import { useEffect, useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { APP_NAME_SHORT } from "../lib/branding";

function getNav(role: string) {
  const p = "/eo"; // All roles use /eo routes (server checks permissions)

  // Full admin nav
  const fullNav = [
    { section: null, items: [{ label: "Dashboard", href: p, icon: "◻" }, { label: "Reporting", href: `${p}/reporting`, icon: "📊" }] },
    { section: "OPERATIONS", items: [
      { label: "Manage Forms", href: `${p}/manage-form`, icon: "📋" }, { label: "New Assessment", href: `${p}/new-assessment`, icon: "➕" },
      { label: "Properties", href: `${p}/properties`, icon: "🏠" }, { label: "Demands", href: `${p}/demands`, icon: "📄" },
      { label: "Payments", href: `${p}/payment-detail`, icon: "💰" },
      { label: "Update Payment", href: `${p}/update-payment`, icon: "💳" }, { label: "Disputes", href: `${p}/manage-dispute`, icon: "⚠" },
      { label: "Grievances", href: `${p}/manage-grievances`, icon: "📩" },
    ]},
    { section: "MASTERDATA", items: [
      { label: "Wards", href: `${p}/wards`, icon: "📍" }, { label: "Roads", href: `${p}/roads`, icon: "🛣" },
      { label: "ARV Rates", href: `${p}/arv`, icon: "📐" }, { label: "Tax Rate", href: `${p}/property-tax-rate`, icon: "%" },
      { label: "Occupancy", href: `${p}/occupancy-types`, icon: "🏢" }, { label: "Usage Types", href: `${p}/usage-types`, icon: "📦" },
      { label: "Usage Factors", href: `${p}/usage-factors`, icon: "⚙" }, { label: "Discounts", href: `${p}/discount-types`, icon: "🏷" },
      { label: "Interest", href: `${p}/interest-rate`, icon: "📈" }, { label: "Solid Waste", href: `${p}/solid-waste-charges`, icon: "♻" },
      { label: "Vacant Land", href: `${p}/vacant-land-tax-rates`, icon: "🌿" }, { label: "Threshold", href: `${p}/vacant-land-threshold`, icon: "📏" },
    ]},
    { section: "USERS", items: [
      { label: "Citizens", href: `${p}/citizen-role`, icon: "👥" }, { label: "Officials", href: `${p}/official-role`, icon: "👔" }, { label: "Staff", href: `${p}/staffs`, icon: "🪪" },
    ]},
    { section: "WEBSITE", items: [
      { label: "Content", href: `${p}/website-content/contents`, icon: "🖼" }, { label: "Helpline", href: `${p}/website-content/helpline-numbers`, icon: "📞" },
      { label: "Links", href: `${p}/website-content/links`, icon: "🔗" }, { label: "Officers", href: `${p}/website-content/officers-profile`, icon: "👤" },
      { label: "Services", href: `${p}/website-content/services`, icon: "🛎" },
    ]},
    { section: "ACCOUNT", items: [
      { label: "My Profile", href: `${p}/my-profile`, icon: "👤" },
      { label: "Settings", href: `${p}/manage-settings`, icon: "⚙" }, { label: "Audit Logs", href: `${p}/audit-logs`, icon: "📜" }, { label: "Password", href: `${p}/change-password`, icon: "🔑" },
    ]},
  ];

  // Role-specific navigation
  if (role === "ADMIN" || role === "EO") return fullNav;

  if (role === "HC") return [
    { section: null, items: [{ label: "Dashboard", href: p, icon: "◻" }, { label: "Reporting", href: `${p}/reporting`, icon: "📊" }] },
    { section: "OPERATIONS", items: [
      { label: "Manage Forms", href: `${p}/manage-form`, icon: "📋" }, { label: "New Assessment", href: `${p}/new-assessment`, icon: "➕" },
      { label: "Properties", href: `${p}/properties`, icon: "🏠" }, { label: "Payments", href: `${p}/payment-detail`, icon: "💰" },
      { label: "Update Payment", href: `${p}/update-payment`, icon: "💳" },
    ]},
    { section: "USERS", items: [{ label: "Citizens", href: `${p}/citizen-role`, icon: "👥" }] },
    { section: "ACCOUNT", items: [{ label: "My Profile", href: `${p}/my-profile`, icon: "👤" }, { label: "Password", href: `${p}/change-password`, icon: "🔑" }] },
  ];

  if (role === "TI") return [
    { section: null, items: [{ label: "Dashboard", href: p, icon: "◻" }, { label: "Reporting", href: `${p}/reporting`, icon: "📊" }] },
    { section: "OPERATIONS", items: [
      { label: "Manage Forms", href: `${p}/manage-form`, icon: "📋" }, { label: "New Assessment", href: `${p}/new-assessment`, icon: "➕" },
      { label: "Properties", href: `${p}/properties`, icon: "🏠" }, { label: "Update Payment", href: `${p}/update-payment`, icon: "💳" },
    ]},
    { section: "ACCOUNT", items: [{ label: "My Profile", href: `${p}/my-profile`, icon: "👤" }, { label: "Password", href: `${p}/change-password`, icon: "🔑" }] },
  ];

  if (role === "GO") return [
    { section: null, items: [{ label: "Dashboard", href: p, icon: "◻" }] },
    { section: "OPERATIONS", items: [{ label: "Grievances", href: `${p}/manage-grievances`, icon: "📩" }] },
    { section: "ACCOUNT", items: [{ label: "My Profile", href: `${p}/my-profile`, icon: "👤" }, { label: "Password", href: `${p}/change-password`, icon: "🔑" }] },
  ];

  // USER (citizen)
  return [
    { section: null, items: [{ label: "Dashboard", href: p, icon: "◻" }] },
    { section: "MY ACCOUNT", items: [
      { label: "My Profile", href: `${p}/my-profile`, icon: "👤" },
      { label: "My Properties", href: `${p}/properties`, icon: "🏠" },
      { label: "New Assessment", href: `${p}/new-assessment`, icon: "➕" },
      { label: "Password", href: `${p}/change-password`, icon: "🔑" },
    ]},
  ];
}

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pending, setPending] = useState(0);
  const [dark, setDark] = useState(false);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.classList.add("app-dashboard");
    return () => document.documentElement.classList.remove("app-dashboard");
  }, []);

  // Fetch pending count
  useState(() => {
    fetch("/api/dashboard/stats", { credentials: "include" }).then(r => r.json()).then(d => {
      if (d.success) setPending(d.data.totalPendingApplication || 0);
    }).catch(() => {});
  });

  // Close mobile sidebar on navigation
  useState(() => { setMobileOpen(false); });

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.style.colorScheme = !dark ? "dark" : "light";
  };

  const sidebarBg = dark ? "linear-gradient(180deg, #0a0a0a 0%, #111 100%)" : "linear-gradient(180deg, #1f1512 0%, #2a1a14 100%)";
  const mainBg = dark ? "#0f0f0f" : "#faf9f7";
  const textColor = dark ? "#e0e0e0" : "#1a1614";

  return (
    <div className="app-shell" style={{ color: textColor }}>
      {/* Mobile overlay */}
      {mobileOpen && <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />}

      {/* Mobile header bar */}
      <div style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, height: 48, background: dark ? "#111" : "#fff", borderBottom: "1px solid rgba(0,0,0,0.06)", zIndex: 30, padding: "0 16px", alignItems: "center", justifyContent: "space-between" }} className="mobile-header">
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", padding: 4 }}>☰</button>
        <span style={{ fontWeight: 600, fontSize: 14 }}>{APP_NAME_SHORT}</span>
        <button onClick={toggleDark} style={{ background: "none", border: "none", fontSize: 16, cursor: "pointer" }}>{dark ? "☀" : "🌙"}</button>
      </div>

      <style>{`@media (max-width: 768px) { .mobile-header { display: flex !important; } .sidebar { position: fixed !important; z-index: 50 !important; transform: translateX(${mobileOpen ? "0" : "-100%"}) !important; } }`}</style>
      <nav className="sidebar" style={{ width: collapsed ? 60 : 230, background: sidebarBg, color: "#fef0e7", transition: "width 0.2s" }}>
        <div style={{ flexShrink: 0, padding: "14px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {!collapsed && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,240,230,0.9)" }}>{APP_NAME_SHORT}</span>
              {pending > 0 && <span style={{ background: "#e05d36", color: "#fff", fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10 }}>{pending}</span>}
            </div>
          )}
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={toggleDark} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 14, padding: 4 }}>{dark ? "☀" : "🌙"}</button>
            <button onClick={() => setCollapsed(!collapsed)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 16, padding: 4 }}>{collapsed ? "▸" : "◂"}</button>
          </div>
        </div>
        {!collapsed && user && (
          <div style={{ flexShrink: 0, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8 }}>
            {user.profilePhotoUrl ? (
              <img src={user.profilePhotoUrl} alt="" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }} />
            ) : (
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg, #e05d36, #f0a060)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 11, flexShrink: 0 }}>{user.name[0]}</div>
            )}
            <div><div style={{ fontSize: 12, fontWeight: 500, color: "rgba(255,240,230,0.85)" }}>{user.name}</div><div style={{ fontSize: 10, color: "rgba(255,240,230,0.35)" }}>{user.role}</div></div>
          </div>
        )}
        <div className="app-sidebar-nav">
          {getNav(user?.role || "USER").map((group, gi) => (
            <div key={gi}>
              {group.section && !collapsed && <div style={{ padding: "12px 8px 4px", fontSize: 9, fontWeight: 700, color: "rgba(255,240,230,0.2)", letterSpacing: "0.08em" }}>{group.section}</div>}
              {group.items.map(item => {
                const active = location.pathname === item.href;
                return (
                  <Link key={item.href} to={item.href} title={item.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: collapsed ? "7px 0" : "6px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 6, fontSize: 13, color: active ? "#fff" : "rgba(255,240,230,0.5)", background: active ? "rgba(224,93,54,0.25)" : "transparent", textDecoration: "none", fontWeight: active ? 500 : 400, marginBottom: 1 }}>
                    <span style={{ fontSize: collapsed ? 16 : 13, width: collapsed ? "auto" : 18, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
        <div className="app-sidebar-footer" style={{ padding: "8px 6px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <button onClick={logout} style={{ display: "flex", alignItems: "center", gap: 8, width: "100%", padding: "6px 10px", justifyContent: collapsed ? "center" : "flex-start", borderRadius: 6, fontSize: 13, color: "rgba(255,120,100,0.7)", background: "none", border: "none", cursor: "pointer" }}>
            <span>⏻</span>{!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </nav>
      <main className="main-content app-main" style={{ padding: "28px 32px", background: mainBg }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}><Outlet /></div>
      </main>
    </div>
  );
}
