import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { api } from "../lib/api";
import { FileUploadField } from "../components/FileUploadField";

export function UserEdit() {
  const { id } = useParams();
  const { user: session } = useAuth();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", mobile: "", profilePhotoUrl: "", status: "ACTIVE", role: "USER" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!id) return;
    api(`/users/${id}`)
      .then((d) => {
        const u = d.data;
        setForm({
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email || "",
          mobile: u.mobile,
          profilePhotoUrl: u.profilePhotoUrl || "",
          status: u.status,
          role: u.role,
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const save = async () => {
    if (!id) return;
    setSaving(true);
    setErr("");
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMsg("User updated.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = session?.role === "ADMIN" || session?.role === "EO";
  const inp = { width: "100%", padding: "9px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", fontSize: 14, boxSizing: "border-box" as const };

  if (loading) return <p style={{ color: "#7c7570" }}>Loading…</p>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Edit user</h1>
        <Link to={form.role === "USER" ? "/eo/citizen-role" : "/eo/official-role"} style={{ fontSize: 13, color: "#e05d36" }}>← Back</Link>
      </div>

      <div className="glass" style={{ padding: 24, marginBottom: 16 }}>
        <FileUploadField
          label="Profile photo"
          value={form.profilePhotoUrl}
          onChange={(url) => setForm((p) => ({ ...p, profilePhotoUrl: url }))}
          folder="users"
          pathEntityId={id}
          accept="image/jpeg,image/png,image/webp,image/gif"
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
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
          {isAdmin && (
            <>
              <div>
                <label style={{ fontSize: 11, color: "#7c7570" }}>Status</label>
                <select style={inp} value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>
              {form.role !== "USER" && (
                <div>
                  <label style={{ fontSize: 11, color: "#7c7570" }}>Role</label>
                  <select style={inp} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
                    <option value="EO">EO</option>
                    <option value="HC">HC</option>
                    <option value="TI">TI</option>
                    <option value="GO">GO</option>
                    <option value="ADMIN">ADMIN</option>
                  </select>
                </div>
              )}
            </>
          )}
        </div>
        {msg && <p style={{ color: "#155724", fontSize: 13, marginTop: 12 }}>{msg}</p>}
        {err && <p style={{ color: "#dc2626", fontSize: 13, marginTop: 12 }}>{err}</p>}
        <button type="button" onClick={save} disabled={saving} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 8, border: "none", background: "#e05d36", color: "#fff", fontWeight: 500, cursor: "pointer" }}>
          {saving ? "Saving…" : "Save"}
        </button>
      </div>

    </div>
  );
}
