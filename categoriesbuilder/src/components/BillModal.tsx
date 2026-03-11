import React from 'react';
import { Modal } from './Modal';
import type { Order, Brand } from '../types';

interface BillModalProps {
  tableOrders: Order[];
  tableName: string;
  onClose: () => void;
  onMarkPaid: () => void;
  onPrintReceipt: () => void;
  brand: Brand;
  translations: Record<string, string>;
}

const fmtMMK = (n: number) => "MMK " + Number(n).toLocaleString();

export const BillModal: React.FC<BillModalProps> = ({
  tableOrders,
  tableName,
  onClose,
  onMarkPaid,
  onPrintReceipt,
  brand,
  translations: t
}) => {
  const subtotal = tableOrders.reduce((s, o) => s + o.total, 0);
  const tax = Math.round(subtotal * 0.05);
  const grand = subtotal + tax;
  const allPaid = tableOrders.every((o) => o.status === "paid");

  // Merge items from all orders
  const merged = tableOrders.flatMap((o) => o.items).reduce((acc, item) => {
    const existing = acc.find((a) => a.id === item.id);
    if (existing) {
      existing.qty += item.qty;
      existing.sub += item.price * item.qty;
    } else {
      acc.push({ ...item, qty: item.qty, sub: item.price * item.qty });
    }
    return acc;
  }, [] as Array<{ id: number; name: string; image: string; qty: number; price: number; sub: number }>);

  return (
    <Modal onClose={onClose} maxWidth={420}>
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 36, marginBottom: 6 }}>🧾</div>
        <h3 style={{ fontFamily: "Georgia,serif", fontSize: 20, color: "#1a1a2e" }}>
          {t.billFor} {t.tableLabel} {tableName}
        </h3>
      </div>
      <div style={{ background: "#faf8f4", borderRadius: 10, padding: 16, marginBottom: 16 }}>
        {merged.map((item, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "6px 0",
              borderBottom: "1px solid #eee",
              fontSize: 14
            }}
          >
            <span>
              {item.image} {item.name} × {item.qty}
            </span>
            <span style={{ fontWeight: 600 }}>{fmtMMK(item.sub)}</span>
          </div>
        ))}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px dashed #ccc" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 4 }}>
            <span>{t.subtotal}</span>
            <span>{fmtMMK(subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, marginBottom: 8, color: "#888" }}>
            <span>{t.tax}</span>
            <span>{fmtMMK(tax)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 17, fontWeight: 700 }}>
            <span>{t.grandTotal}</span>
            <span style={{ color: brand.accentDark }}>{fmtMMK(grand)}</span>
          </div>
        </div>
      </div>
      {allPaid ? (
        <div
          style={{
            textAlign: "center",
            padding: "10px",
            borderRadius: 8,
            background: "#dcfce7",
            color: "#166534",
            fontWeight: 700,
            fontSize: 16,
            marginBottom: 14
          }}
        >
          ✅ {t.billPaid}
        </div>
      ) : (
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <button
            onClick={onMarkPaid}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "none",
              background: brand.primary,
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700
            }}
          >
            💳 {t.markPaid}
          </button>
          <button
            onClick={onPrintReceipt}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 10,
              border: "1.5px solid #c9a96e",
              background: "white",
              color: "#a07840",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700
            }}
          >
            🖨️ {t.printReceipt}
          </button>
        </div>
      )}
      {allPaid && (
        <button
          onClick={onPrintReceipt}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            border: "none",
            background: brand.primary,
            color: "white",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 10
          }}
        >
          🖨️ {t.printReceipt}
        </button>
      )}
      <button
        onClick={onClose}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: 8,
          border: "1.5px solid #ddd",
          background: "white",
          cursor: "pointer",
          fontSize: 14,
          color: "#666"
        }}
      >
        {t.close}
      </button>
    </Modal>
  );
};
