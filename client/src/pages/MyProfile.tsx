import { useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { FileUploadField } from "../components/FileUploadField";

export function MyProfile() {
  const { user, refresh } = useAuth();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    profilePhotoUrl: "",
    profilePhotoThumbUrl: "",
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || user.name.split(" ")[0] || "",
      lastName: user.lastName || user.name.split(" ").slice(1).join(" ") || "",
      email: user.email || "",
      mobile: user.mobile || "",
      profilePhotoUrl: user.profilePhotoUrl || "",
      profilePhotoThumbUrl: user.profilePhotoThumbUrl || "",
    });
  }, [user]);

  const save = async () => {
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      await refresh();
      setMsg("Profile updated.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  const glass = {
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(20px) saturate(180%)",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.4)",
    boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
    padding: 24,
    marginBottom: 16,
  };
  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", fontSize: 14, boxSizing: "border-box" as const };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 4 }}>My Profile</h1>
      <p style={{ fontSize: 13, color: "#7c7570", marginBottom: 24 }}>Update your details and profile photo.</p>

      <div style={glass}>
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: "0 0 200px" }}>
            {form.profilePhotoUrl ? (
              <img
                src={form.profilePhotoThumbUrl || form.profilePhotoUrl}
                alt=""
                style={{ width: 120, height: 120, borderRadius: "50%", objectFit: "cover", border: "3px solid #e05d36" }}
              />
            ) : (
              <div style={{ width: 120, height: 120, borderRadius: "50%", background: "linear-gradient(135deg, #e05d36, #f0a060)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40, fontWeight: 600 }}>
                {user.name[0]}
              </div>
            )}
            <FileUploadField
              label="Profile photo"
              value={form.profilePhotoUrl}
              onChange={(url, thumb) =>
                setForm((p) => ({
                  ...p,
                  profilePhotoUrl: url,
                  profilePhotoThumbUrl: thumb || "",
                }))
              }
              folder="users"
              pathEntityId={user.id}
              accept="image/jpeg,image/png,image/webp,image/gif"
            />
          </div>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <label style={{ fontSize: 11, color: "#7c7570" }}>First name</label>
                <input style={inp} value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7c7570" }}>Last name</label>
                <input style={inp} value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7c7570" }}>Mobile</label>
                <input style={inp} value={form.mobile} onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 11, color: "#7c7570" }}>Email</label>
                <input style={inp} value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <p style={{ fontSize: 12, color: "#7c7570", marginTop: 12 }}>Role: {user.role}</p>
            {msg && <p style={{ fontSize: 13, color: "#155724", marginTop: 12 }}>{msg}</p>}
            {err && <p style={{ fontSize: 13, color: "#dc2626", marginTop: 12 }}>{err}</p>}
            <button type="button" onClick={save} disabled={saving} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 8, border: "none", background: "#e05d36", color: "#fff", fontWeight: 500, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>
              {saving ? "Saving…" : "Save profile"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
