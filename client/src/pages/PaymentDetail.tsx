import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../lib/api";
import { MediaGallery } from "../components/MediaGallery";

export function PaymentDetail() {
  const { id } = useParams();
  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api(`/payments/${id}`)
      .then((d) => setPayment(d.data))
      .finally(() => setLoading(false));
  }, [id]);

  const glass = { background: "rgba(255,255,255,0.72)", backdropFilter: "blur(20px)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.4)", padding: 24, marginBottom: 16 };
  const label = { fontSize: 11, fontWeight: 600, color: "#7c7570", textTransform: "uppercase" as const };
  const value = { fontSize: 15, fontWeight: 500, marginBottom: 12 };

  if (loading) return <p style={{ color: "#7c7570" }}>Loading…</p>;
  if (!payment) return <p>Payment not found. <Link to="/eo/payment-detail">Back</Link></p>;

  const prop = payment.demand?.assessment?.property;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 600, margin: 0 }}>Payment {payment.paymentId || payment.id.slice(0, 8)}</h1>
          <p style={{ fontSize: 13, color: "#7c7570" }}>₹{payment.amount?.toLocaleString("en-IN")} · {payment.paymentStatus}</p>
        </div>
        <Link to="/eo/payment-detail" style={{ fontSize: 13, color: "#e05d36" }}>← Back</Link>
      </div>

      <div style={glass}>
        <p style={label}>Amount</p><p style={value}>₹{payment.amount?.toLocaleString("en-IN")}</p>
        <p style={label}>Mode</p><p style={value}>{payment.paymentMode}</p>
        <p style={label}>Status</p><p style={value}>{payment.paymentStatus}</p>
        <p style={label}>Property</p>
        <p style={value}>
          {prop ? <Link to={`/eo/properties/${prop.id}`}>{prop.propertyId}</Link> : "—"}
        </p>
        <p style={label}>Demand</p>
        <p style={value}>
          {payment.demand ? <Link to={`/eo/demands/${payment.demand.id}`}>{payment.demand.demandId}</Link> : "—"}
        </p>
      </div>

      <MediaGallery title="Receipts & payment proof (up to 2)" entityType="PAYMENT" entityId={payment.id} folder="payments" />
      {payment.demand?.id && (
        <MediaGallery title="Related demand documents" entityType="DEMAND" entityId={payment.demand.id} folder="demands" />
      )}
    </div>
  );
}
