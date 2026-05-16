import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, apiPut } from "../lib/api";
import { MediaGallery } from "../components/MediaGallery";

type DemandOption = {
  id: string;
  demandId: string;
  balanceAmount?: number;
  status?: string;
};

export function UpdatePayment() {
  const [f, setF] = useState({ demandId: "", chequeNumber: "", orderId: "", paymentMode: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [demandQuery, setDemandQuery] = useState("");
  const [demandOptions, setDemandOptions] = useState<DemandOption[]>([]);
  const [searchingDemands, setSearchingDemands] = useState(false);

  const u = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  const inp = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "none",
    background: "#f5f5f7",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box" as const,
    marginBottom: 12,
  };

  const searchDemands = useCallback(async (q: string) => {
    if (!q.trim()) {
      setDemandOptions([]);
      return;
    }
    setSearchingDemands(true);
    try {
      const d = await api(`/demands?page=1&pageSize=8&search=${encodeURIComponent(q.trim())}`);
      setDemandOptions(d.data || []);
    } catch {
      setDemandOptions([]);
    } finally {
      setSearchingDemands(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => searchDemands(demandQuery), 300);
    return () => clearTimeout(t);
  }, [demandQuery, searchDemands]);

  const pickDemand = (d: DemandOption) => {
    setF((p) => ({ ...p, demandId: d.demandId }));
    setDemandQuery(d.demandId);
    setDemandOptions([]);
  };

  const submit = async () => {
    if (!f.demandId || !f.paymentMode) {
      setMsg("Fill required fields");
      return;
    }
    setLoading(true);
    setMsg("");
    const res = await apiPut("/payments", f);
    if (res.success && res.data?.id) {
      setPaymentId(res.data.id);
      setMsg("Payment recorded. Add up to 2 receipt images or PDFs below.");
    } else {
      setMsg(res.error || "Failed");
      setPaymentId(null);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setF({ demandId: "", chequeNumber: "", orderId: "", paymentMode: "" });
    setDemandQuery("");
    setPaymentId(null);
    setMsg("");
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24 }}>Update Payment</h1>

      {!paymentId ? (
        <div
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(20px)",
            borderRadius: 16,
            padding: 28,
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          {msg && (
            <div
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                fontSize: 13,
                marginBottom: 16,
                background: msg.includes("recorded") ? "#d4edda" : "#fef2f2",
                color: msg.includes("recorded") ? "#155724" : "#dc2626",
              }}
            >
              {msg}
            </div>
          )}

          <label style={{ fontSize: 12, fontWeight: 500, color: "#7c7570" }}>Demand ID *</label>
          <input
            value={demandQuery}
            onChange={(e) => {
              setDemandQuery(e.target.value);
              u("demandId", e.target.value);
            }}
            placeholder="Search DEM-… or property ID"
            style={inp}
            autoComplete="off"
          />
          {searchingDemands && <p style={{ fontSize: 12, color: "#7c7570", marginTop: -8, marginBottom: 12 }}>Searching…</p>}
          {demandOptions.length > 0 && (
            <ul
              style={{
                listStyle: "none",
                margin: "-4px 0 12px",
                padding: 0,
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 10,
                overflow: "hidden",
                background: "#fff",
              }}
            >
              {demandOptions.map((d) => (
                <li key={d.id}>
                  <button
                    type="button"
                    onClick={() => pickDemand(d)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "10px 14px",
                      border: "none",
                      borderBottom: "1px solid rgba(0,0,0,0.04)",
                      background: "#fff",
                      cursor: "pointer",
                      fontSize: 14,
                    }}
                  >
                    <strong>{d.demandId}</strong>
                    <span style={{ color: "#7c7570", marginLeft: 8 }}>
                      ₹{(d.balanceAmount ?? 0).toLocaleString("en-IN")} · {d.status}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <label style={{ fontSize: 12, fontWeight: 500, color: "#7c7570" }}>Cheque/DD Number</label>
          <input value={f.chequeNumber} onChange={(e) => u("chequeNumber", e.target.value)} style={inp} />
          <label style={{ fontSize: 12, fontWeight: 500, color: "#7c7570" }}>Order ID</label>
          <input value={f.orderId} onChange={(e) => u("orderId", e.target.value)} style={inp} />
          <label style={{ fontSize: 12, fontWeight: 500, color: "#7c7570" }}>Payment Mode *</label>
          <select value={f.paymentMode} onChange={(e) => u("paymentMode", e.target.value)} style={{ ...inp, appearance: "auto" }}>
            <option value="">Select</option>
            <option value="CASH">Cash</option>
            <option value="CHEQUE">Cheque</option>
            <option value="DD">DD</option>
            <option value="NEFT">NEFT</option>
            <option value="ONLINE">Online</option>
          </select>
          <button
            onClick={submit}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: loading ? "#999" : "#e05d36",
              color: "#fff",
              fontSize: 15,
              fontWeight: 500,
              cursor: "pointer",
              marginTop: 8,
            }}
          >
            {loading ? "Updating..." : "Update Payment"}
          </button>
        </div>
      ) : (
        <>
          {msg && <p style={{ fontSize: 13, color: "#155724", marginBottom: 12 }}>{msg}</p>}
          <MediaGallery
            title="Payment receipts & proof (up to 2)"
            entityType="PAYMENT"
            entityId={paymentId}
            folder="payments"
          />
          <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
            <Link to={`/eo/payments/${paymentId}`} style={{ fontSize: 14, color: "#e05d36", fontWeight: 500 }}>
              View payment detail →
            </Link>
            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                border: "1px solid rgba(0,0,0,0.1)",
                background: "#fff",
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Record another payment
            </button>
          </div>
        </>
      )}
    </div>
  );
}
