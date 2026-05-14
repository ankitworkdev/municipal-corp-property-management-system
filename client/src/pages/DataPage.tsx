import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiPost, apiPut } from "../lib/api";

interface Col { key: string; h: string; badge?: boolean; prefix?: string; }
interface AddField { key: string; label: string; type?: string; options?: { v: string; l: string }[]; }

const Badge = ({ status }: { status: string }) => {
  const colors: Record<string, [string, string]> = {
    DRAFT: ["#fff3cd", "#856404"], SUBMITTED: ["#cce5ff", "#004085"], APPROVED: ["#d4edda", "#155724"],
    REJECTED: ["#f8d7da", "#721c24"], ACTIVE: ["#d4edda", "#155724"], SUCCESS: ["#d4edda", "#155724"],
    PENDING: ["#fff3cd", "#856404"], FAILED: ["#f8d7da", "#721c24"], OPEN: ["#cce5ff", "#004085"],
    RESOLVED: ["#d4edda", "#155724"], PAID: ["#d4edda", "#155724"], UNPAID: ["#f8d7da", "#721c24"],
  };
  const [bg, fg] = colors[status] || ["#e2e3e5", "#383d41"];
  return <span style={{ padding: "2px 10px", borderRadius: 20, fontSize: 11, fontWeight: 500, background: bg, color: fg }}>{status}</span>;
};

const getValue = (row: any, key: string) => key.split(".").reduce((o: any, k) => o?.[k], row);

export function DataPage({ title, api: apiPath, columns, addFields, rowLink }: { title: string; api: string; columns: Col[]; addFields?: AddField[]; rowLink?: string }) {
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const nav = useNavigate();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    const params = `?page=${page}&pageSize=25${search ? `&search=${encodeURIComponent(search)}` : ""}`;
    api(`${apiPath}${params}`).then(d => { setData(d.data || []); setTotal(d.pagination?.total || 0); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, [apiPath, page, search]);

  const handleSave = async () => {
    setSaving(true);
    if (editItem) {
      await apiPut(apiPath, { id: editItem.id, ...form });
    } else {
      await apiPost(apiPath, form);
    }
    setSaving(false); setShowAdd(false); setEditItem(null); setForm({}); load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return;
    await api(`${apiPath}?id=${id}`, { method: "DELETE" });
    load();
  };

  const openEdit = (row: any) => {
    if (!addFields) return;
    const f: Record<string, string> = {};
    addFields.forEach(af => { f[af.key] = row[af.key] || ""; });
    setForm(f);
    setEditItem(row);
    setShowAdd(true);
  };

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px) saturate(180%)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" };
  const th = { padding: "11px 16px", textAlign: "left" as const, fontSize: 11, fontWeight: 600, color: "#7c7570", textTransform: "uppercase" as const, letterSpacing: "0.04em" };
  const totalPages = Math.ceil(total / 25) || 1;
  const inp = { width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "#faf9f7", fontSize: 14, outline: "none", boxSizing: "border-box" as const };

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{title}</h1>
          <p style={{ fontSize: 13, color: "#7c7570", marginTop: 3 }}>{total} records</p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* Search */}
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search..." style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, outline: "none", width: 180 }} />
          {/* Export CSV */}
          <button onClick={() => window.open(`/api/export?type=${apiPath.split("/").pop()}`, "_blank")} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 13, cursor: "pointer", color: "#1a1614" }}>↓ CSV</button>
          {/* Add */}
          {addFields && <button onClick={() => { setForm({}); setEditItem(null); setShowAdd(true); }} style={{ padding: "7px 16px", borderRadius: 8, border: "none", background: "#e05d36", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>+ Add</button>}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAdd && addFields && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100 }} onClick={e => e.target === e.currentTarget && (setShowAdd(false), setEditItem(null))}>
          <div style={{ ...glass, background: "rgba(255,255,255,0.95)", width: 420, padding: 28 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>{editItem ? "Edit" : "Add"} {title.replace(/s$/, "")}</h2>
            {addFields.map(f => (
              <div key={f.key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 500, color: "#7c7570", marginBottom: 4 }}>{f.label}</label>
                {f.type === "select" ? (
                  <select value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} style={{ ...inp, appearance: "auto" }}>
                    <option value="">Select</option>
                    {f.options?.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                ) : (
                  <input value={form[f.key] || ""} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} type={f.key === "password" ? "password" : "text"} style={inp} />
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button onClick={() => { setShowAdd(false); setEditItem(null); setForm({}); }} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid rgba(0,0,0,0.1)", background: "#fff", fontSize: 13, cursor: "pointer" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#e05d36", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer", opacity: saving ? 0.6 : 1 }}>{saving ? "Saving..." : "Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div style={glass}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead><tr style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              {columns.map(c => <th key={c.key} style={th}>{c.h}</th>)}
              {addFields && <th style={th}>Actions</th>}
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={columns.length + (addFields ? 1 : 0)} style={{ padding: 48, textAlign: "center", color: "#7c7570" }}>Loading...</td></tr>
              : data.length === 0 ? <tr><td colSpan={columns.length + (addFields ? 1 : 0)} style={{ padding: 48, textAlign: "center", color: "#7c7570" }}>📭 No data{addFields ? " — click + Add" : ""}{search ? ` matching "${search}"` : ""}</td></tr>
              : data.map((row, i) => (
                <tr key={row.id || i} onClick={() => rowLink && nav(`${rowLink}/${row.id}`)} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", cursor: rowLink ? "pointer" : "default" }}>
                  {columns.map(c => {
                    const val = getValue(row, c.key);
                    return <td key={c.key} style={{ padding: "10px 16px" }}>{c.badge ? <Badge status={val || "—"} /> : (c.prefix ? `${c.prefix}${(val || 0).toLocaleString("en-IN")}` : (val ?? "—"))}</td>;
                  })}
                  {addFields && (
                    <td style={{ padding: "10px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(row)} style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)", background: "rgba(255,255,255,0.8)", fontSize: 12, cursor: "pointer", color: "#3498db" }}>Edit</button>
                        <button onClick={() => handleDelete(row.id)} style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.05)", fontSize: 12, cursor: "pointer", color: "#dc2626" }}>Delete</button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderTop: "1px solid rgba(0,0,0,0.04)" }}>
            <span style={{ fontSize: 12, color: "#7c7570" }}>{Math.min((page-1)*25+1,total)}-{Math.min(page*25,total)} of {total}</span>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", cursor: "pointer", fontSize: 12, opacity: page===1?0.3:1 }}>‹</button>
              <span style={{ padding: "4px 10px", fontSize: 12 }}>{page}/{totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages} style={{ padding: "4px 12px", borderRadius: 6, border: "1px solid rgba(0,0,0,0.08)", background: "#fff", cursor: "pointer", fontSize: 12, opacity: page===totalPages?0.3:1 }}>›</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
