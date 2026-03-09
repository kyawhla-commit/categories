import React, { useState, useEffect } from 'react';
import type { Order, Table, Brand } from '../types';

interface KitchenDisplayProps {
  orders: Order[];
  tables: Table[];
  onUpdateStatus: (id: number, status: Order['status']) => void;
  brand: Brand;
  translations: Record<string, string>;
}

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  orders,
  tables,
  onUpdateStatus,
  brand,
  translations: t
}) => {
  const [filter, setFilter] = useState<'active' | 'pending' | 'cooking'>('active');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  const minAgo = (id: number) => Math.max(0, Math.floor((now - id) / 60000));

  const filtered = orders
    .filter((o) => {
      if (filter === 'active') return o.status === 'pending' || o.status === 'accepted';
      if (filter === 'pending') return o.status === 'pending';
      if (filter === 'cooking') return o.status === 'accepted';
      return true;
    })
    .sort((a, b) => a.id - b.id);

  const urgency = (o: Order) => {
    const m = minAgo(o.id);
    if (m >= 20) return { bg: "#fef2f2", border: "#fca5a5" };
    if (m >= 10) return { bg: "#fffbeb", border: "#fcd34d" };
    return { bg: "#f0fdf4", border: "#86efac" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h1 style={{ fontFamily: "Georgia,serif", color: brand.accent, fontSize: 26 }}>
            👨‍🍳 {t.kitchenDisplay}
          </h1>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              ['active', t.allOrders],
              ['pending', t.pendingOnly],
              ['cooking', t.cookingOnly]
            ].map(([v, lb]) => (
              <button
                key={v}
                onClick={() => setFilter(v as typeof filter)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 20,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                  background: filter === v ? brand.accent : "#1e293b",
                  color: filter === v ? brand.primary : "#94a3b8"
                }}
              >
                {lb}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0", color: "#475569", fontSize: 18 }}>
            {t.noKitchenOrders}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
            {filtered.map((o) => {
              const u = urgency(o);
              const m = minAgo(o.id);
              const tableName = tables.find((tb) => tb.id === o.table)?.name || o.table;
              return (
                <div
                  key={o.id}
                  style={{
                    background: u.bg,
                    borderRadius: 14,
                    border: "2px solid " + u.border,
                    padding: 18
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 700 }}>
                        T{tableName}
                      </span>
                      <span
                        style={{
                          background: o.status === "pending" ? "#fef3c7" : "#dbeafe",
                          color: o.status === "pending" ? "#92400e" : "#1e40af",
                          fontSize: 11,
                          fontWeight: 700,
                          padding: "3px 10px",
                          borderRadius: 20
                        }}
                      >
                        {o.status === "pending" ? "⏳ NEW" : "🔥 COOKING"}
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 12,
                        color: m >= 10 ? "#dc2626" : "#6b7280",
                        fontWeight: m >= 10 ? 700 : 400
                      }}
                    >
                      {m}m {t.timeSince}
                    </span>
                  </div>
                  <div style={{ borderTop: "1px solid rgba(0,0,0,0.08)", paddingTop: 10, marginBottom: 10 }}>
                    {o.items.map((i) => (
                      <div
                        key={i.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          padding: "5px 0",
                          borderBottom: "1px solid rgba(0,0,0,0.05)"
                        }}
                      >
                        <span style={{ fontSize: 20 }}>{i.image}</span>
                        <span style={{ flex: 1, fontSize: 14, fontWeight: 600 }}>{i.name}</span>
                        <span
                          style={{
                            background: "#1a1a2e",
                            color: "white",
                            borderRadius: 20,
                            padding: "2px 10px",
                            fontSize: 13,
                            fontWeight: 700
                          }}
                        >
                          ×{i.qty}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {o.status === "pending" && (
                      <button
                        onClick={() => onUpdateStatus(o.id, "accepted")}
                        style={{
                          flex: 1,
                          padding: "9px",
                          borderRadius: 8,
                          border: "none",
                          background: "#1a1a2e",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        ✅ {t.acceptOrder}
                      </button>
                    )}
                    {o.status === "accepted" && (
                      <button
                        onClick={() => onUpdateStatus(o.id, "served")}
                        style={{
                          flex: 1,
                          padding: "9px",
                          borderRadius: 8,
                          border: "none",
                          background: "#16a34a",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: "pointer"
                        }}
                      >
                        🍽️ {t.markServed}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
