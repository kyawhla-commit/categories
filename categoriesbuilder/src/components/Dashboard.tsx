import React from 'react';
import type { Order, Brand } from '../types';

interface DashboardProps {
  orders: Order[];
  brand: Brand;
  translations: Record<string, string>;
}

const fmtMMK = (n: number) => "MMK " + Number(n).toLocaleString();

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
};

export const Dashboard: React.FC<DashboardProps> = ({ orders, brand, translations: t }) => {
  const paid = orders.filter((o) => o.status === "paid");
  const totalRev = paid.reduce((s, o) => s + o.total, 0);
  const avgOrder = paid.length > 0 ? Math.round(totalRev / paid.length) : 0;

  // Top dishes
  const dishMap: Record<string, { name: string; image: string; qty: number; revenue: number }> = {};
  orders.forEach((o) =>
    o.items.forEach((i) => {
      if (!dishMap[i.name]) dishMap[i.name] = { name: i.name, image: i.image, qty: 0, revenue: 0 };
      dishMap[i.name].qty += i.qty;
      dishMap[i.name].revenue += i.price * i.qty;
    })
  );
  const topDishes = Object.values(dishMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 6);

  // Orders by hour
  const hourMap: Record<number, number> = {};
  orders.forEach((o) => {
    const h = new Date(o.id).getHours();
    hourMap[h] = (hourMap[h] || 0) + 1;
  });
  const hours = Array.from({ length: 24 }, (_, i) => ({ h: i, count: hourMap[i] || 0 })).filter((h) => h.count > 0);
  const maxCount = Math.max(...hours.map((h) => h.count), 1);

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>📊</div>
        <p style={{ color: "#888", fontSize: 16 }}>{t.noData}</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          {
            label: t.todayRevenue,
            value: fmtMMK(totalRev),
            icon: "💰",
            bg: "#fef9c3",
            sub: paid.length + " paid orders"
          },
          {
            label: t.totalOrders,
            value: orders.length,
            icon: "📋",
            bg: "#dbeafe",
            sub: orders.filter((o) => o.status === "served").length + " served"
          },
          { label: t.avgOrder, value: fmtMMK(avgOrder), icon: "📈", bg: "#dcfce7", sub: "per paid order" }
        ].map((k) => (
          <div key={k.label} style={{ ...cardStyle, padding: "20px 24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 6 }}>{k.label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, color: "#1a1a2e" }}>{k.value}</p>
                <p style={{ fontSize: 12, color: "#aaa", marginTop: 4 }}>{k.sub}</p>
              </div>
              <div style={{ background: k.bg, borderRadius: 12, padding: 12, fontSize: 26 }}>{k.icon}</div>
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>
        <div style={{ ...cardStyle, padding: 20 }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e", marginBottom: 16 }}>
            🏆 {t.topDishes}
          </h3>
          {topDishes.map((d, i) => (
            <div
              key={d.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 0",
                borderBottom: "1px solid #f5f0e8"
              }}
            >
              <span style={{ fontWeight: 700, color: brand.accent, minWidth: 20, fontSize: 15 }}>#{i + 1}</span>
              <span style={{ fontSize: 22 }}>{d.image}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{d.name}</p>
                <div style={{ background: "#f5f0e8", borderRadius: 4, height: 6, marginTop: 4 }}>
                  <div
                    style={{
                      background: `linear-gradient(90deg,${brand.accent},${brand.accentDark})`,
                      height: 6,
                      borderRadius: 4,
                      width: Math.round((d.qty / topDishes[0].qty) * 100) + "%"
                    }}
                  />
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontWeight: 700, fontSize: 14 }}>{d.qty} sold</p>
                <p style={{ fontSize: 12, color: "#888" }}>{fmtMMK(d.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ ...cardStyle, padding: 20 }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e", marginBottom: 16 }}>
              📂 {t.orderBreakdown}
            </h3>
            {[
              { label: t.paidOrders, count: paid.length, color: "#22c55e", bg: "#dcfce7" },
              {
                label: t.servedUnpaid,
                count: orders.filter((o) => o.status === "served").length,
                color: "#3b82f6",
                bg: "#dbeafe"
              },
              {
                label: t.preparing,
                count: orders.filter((o) => o.status === "accepted").length,
                color: "#f59e0b",
                bg: "#fef3c7"
              },
              {
                label: t.newOrder,
                count: orders.filter((o) => o.status === "pending").length,
                color: "#ef4444",
                bg: "#fee2e2"
              }
            ].map((s) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                <span style={{ flex: 1, fontSize: 13, color: "#555" }}>{s.label}</span>
                <span
                  style={{
                    background: s.bg,
                    color: s.color,
                    fontSize: 12,
                    fontWeight: 700,
                    padding: "2px 10px",
                    borderRadius: 20
                  }}
                >
                  {s.count}
                </span>
              </div>
            ))}
          </div>
          {hours.length > 0 && (
            <div style={{ ...cardStyle, padding: 20 }}>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e", marginBottom: 16 }}>
                🕐 {t.revenueByHour}
              </h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80 }}>
                {hours.map((h) => (
                  <div
                    key={h.h}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 2
                    }}
                  >
                    <span style={{ fontSize: 10, color: "#888" }}>{h.count}</span>
                    <div
                      style={{
                        width: "100%",
                        background: `linear-gradient(180deg,${brand.accent},${brand.accentDark})`,
                        borderRadius: "4px 4px 0 0",
                        height: Math.max(8, Math.round((h.count / maxCount) * 60))
                      }}
                    />
                    <span style={{ fontSize: 9, color: "#aaa" }}>{h.h}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
