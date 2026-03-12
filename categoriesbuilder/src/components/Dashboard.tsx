import React, { useState, useMemo } from 'react';
import type { Order, Brand } from '../types';

interface DashboardProps {
  orders: Order[];
  brand: Brand;
  translations: Record<string, string>;
}

const fmtMMK = (n: number) => "MMK " + Number(n).toLocaleString();

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,245,236,0.9))",
  border: "1px solid rgba(220,206,184,0.72)",
  borderRadius: 24,
  boxShadow: "0 22px 54px rgba(15,23,42,0.08)"
};

type DateRange = 'today' | 'week' | 'month' | 'all';

export const Dashboard: React.FC<DashboardProps> = ({ orders, brand, translations: t }) => {
  const [dateRange, setDateRange] = useState<DateRange>('all');
  const [selectedStat, setSelectedStat] = useState<string | null>(null);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.filter((o) => {
      if (dateRange === 'all') return true;
      const orderDate = new Date(o.created_at || o.time);
      if (dateRange === 'today') return orderDate >= startOfDay;
      if (dateRange === 'week') return orderDate >= startOfWeek;
      if (dateRange === 'month') return orderDate >= startOfMonth;
      return true;
    });
  }, [orders, dateRange]);

  const paid = filteredOrders.filter((o) => o.status === "paid");
  const totalRev = paid.reduce((s, o) => s + o.total, 0);
  const avgOrder = paid.length > 0 ? Math.round(totalRev / paid.length) : 0;
  const pendingCount = filteredOrders.filter((o) => o.status === "pending").length;
  const activeCount = filteredOrders.filter((o) => o.status !== "paid").length;

  // Top dishes
  const dishMap: Record<string, { name: string; image: string; qty: number; revenue: number }> = {};
  filteredOrders.forEach((o) =>
    o.items.forEach((i) => {
      if (!dishMap[i.name]) dishMap[i.name] = { name: i.name, image: i.image, qty: 0, revenue: 0 };
      dishMap[i.name].qty += i.qty;
      dishMap[i.name].revenue += i.price * i.qty;
    })
  );
  const topDishes = Object.values(dishMap)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8);

  // Revenue by status
  const revenueByStatus = {
    pending: filteredOrders.filter((o) => o.status === 'pending').reduce((s, o) => s + o.total, 0),
    accepted: filteredOrders.filter((o) => o.status === 'accepted').reduce((s, o) => s + o.total, 0),
    served: filteredOrders.filter((o) => o.status === 'served').reduce((s, o) => s + o.total, 0),
    paid: totalRev,
  };

  // Orders by hour
  const hourMap: Record<number, { count: number; revenue: number }> = {};
  filteredOrders.forEach((o) => {
    const created = o.created_at ? new Date(o.created_at) : new Date();
    const h = created.getHours();
    if (!hourMap[h]) hourMap[h] = { count: 0, revenue: 0 };
    hourMap[h].count += 1;
    hourMap[h].revenue += o.total;
  });
  const hours = Array.from({ length: 24 }, (_, i) => ({
    h: i,
    count: hourMap[i]?.count || 0,
    revenue: hourMap[i]?.revenue || 0
  })).filter((h) => h.count > 0);
  const maxCount = Math.max(...hours.map((h) => h.count), 1);

  // Category revenue
  const catRevenue: Record<string, number> = {};
  filteredOrders.forEach((o) =>
    o.items.forEach((i) => {
      const name = i.name;
      catRevenue[name] = (catRevenue[name] || 0) + i.price * i.qty;
    })
  );

  if (orders.length === 0) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{
          ...cardStyle,
          padding: '60px 40px',
          background: 'linear-gradient(135deg, #faf8f4, white)'
        }}>
          <div style={{ fontSize: 80, marginBottom: 20, opacity: 0.8 }}>📊</div>
          <p style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#1a1a2e', marginBottom: 8 }}>
            {t.noData}
          </p>
          <p style={{ color: '#aaa', fontSize: 14 }}>
            Orders will appear here once customers start placing them
          </p>
        </div>
      </div>
    );
  }

  const dateRangeButtons: { key: DateRange; label: string }[] = [
    { key: 'today', label: '📅 Today' },
    { key: 'week', label: '📆 Week' },
    { key: 'month', label: '🗓️ Month' },
    { key: 'all', label: '📊 All' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: '#1a1a2e', marginBottom: 4 }}>
            📊 {t.dashboardTab?.replace('📊 ', '') || 'Analytics Dashboard'}
          </h2>
          <p style={{ color: '#888', fontSize: 13 }}>
            Real-time business insights and performance metrics
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: '#f5f5f5', borderRadius: 12, padding: 4 }}>
          {dateRangeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => setDateRange(btn.key)}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                border: 'none',
                background: dateRange === btn.key ? 'white' : 'transparent',
                color: dateRange === btn.key ? brand.primary : '#888',
                fontWeight: 600,
                fontSize: 12,
                cursor: 'pointer',
                boxShadow: dateRange === btn.key ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[
          {
            key: 'revenue',
            label: t.todayRevenue || "Revenue",
            value: fmtMMK(totalRev),
            icon: "💰",
            gradient: `linear-gradient(135deg, #fef9c3, #fef3c7)`,
            sub: `${paid.length} paid orders`,
            trend: totalRev > 0 ? '+' + Math.round((totalRev / Math.max(avgOrder, 1)) * 10) + '%' : '—'
          },
          {
            key: 'orders',
            label: t.totalOrders || "Total Orders",
            value: String(filteredOrders.length),
            icon: "📋",
            gradient: `linear-gradient(135deg, #dbeafe, #bfdbfe)`,
            sub: `${activeCount} active`,
            trend: filteredOrders.length > 0 ? `${pendingCount} pending` : '—'
          },
          {
            key: 'avg',
            label: t.avgOrder || "Avg Order",
            value: fmtMMK(avgOrder),
            icon: "📈",
            gradient: `linear-gradient(135deg, #dcfce7, #bbf7d0)`,
            sub: "per paid order",
            trend: '—'
          },
          {
            key: 'items',
            label: "Items Sold",
            value: String(filteredOrders.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0)),
            icon: "🍽️",
            gradient: `linear-gradient(135deg, #fce7f3, #fbcfe8)`,
            sub: `${topDishes.length} unique dishes`,
            trend: '—'
          }
        ].map((k) => (
          <div
            key={k.key}
            onClick={() => setSelectedStat(selectedStat === k.key ? null : k.key)}
            style={{
              ...cardStyle,
              padding: "20px 24px",
              cursor: 'pointer',
              border: selectedStat === k.key ? `2px solid ${brand.accent}` : '2px solid transparent',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ color: "#888", fontSize: 12, marginBottom: 8, fontWeight: 600, letterSpacing: 0.5 }}>{k.label}</p>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>{k.value}</p>
                <p style={{ fontSize: 11, color: "#aaa", marginTop: 6 }}>{k.sub}</p>
              </div>
              <div style={{
                background: k.gradient,
                borderRadius: 14,
                padding: 14,
                fontSize: 28,
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
              }}>
                {k.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 20 }}>
        {/* Top Dishes */}
        <div style={{ ...cardStyle, padding: 24 }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e", marginBottom: 20 }}>
            🏆 {t.topDishes || 'Top Selling Items'}
          </h3>
          {topDishes.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 13, textAlign: 'center', padding: 20 }}>No items data</p>
          ) : (
            topDishes.map((d, i) => (
              <div
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "12px 0",
                  borderBottom: i < topDishes.length - 1 ? "1px solid #f5f0e8" : "none",
                  transition: 'background 0.2s'
                }}
              >
                <span style={{
                  fontWeight: 800,
                  color: i < 3 ? brand.accent : '#ccc',
                  minWidth: 24,
                  fontSize: i < 3 ? 18 : 14,
                  textAlign: 'center'
                }}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
                <span style={{ fontSize: 26 }}>{d.image}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 600, fontSize: 14, color: "#1a1a2e", marginBottom: 4 }}>{d.name}</p>
                  <div style={{ background: "#f5f0e8", borderRadius: 6, height: 8, overflow: 'hidden' }}>
                    <div
                      style={{
                        background: `linear-gradient(90deg,${brand.accent},${brand.accentDark})`,
                        height: 8,
                        borderRadius: 6,
                        width: Math.round((d.qty / topDishes[0].qty) * 100) + "%",
                        transition: 'width 0.6s ease'
                      }}
                    />
                  </div>
                </div>
                <div style={{ textAlign: "right", minWidth: 80 }}>
                  <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>{d.qty} <span style={{ fontSize: 11, color: '#888' }}>sold</span></p>
                  <p style={{ fontSize: 12, color: brand.accentDark, fontWeight: 600 }}>{fmtMMK(d.revenue)}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Order Breakdown */}
          <div style={{ ...cardStyle, padding: 24 }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e", marginBottom: 20 }}>
              📂 {t.orderBreakdown || 'Order Status'}
            </h3>
            {[
              { label: t.paidOrders || 'Paid', count: paid.length, color: "#22c55e", bg: "#dcfce7", revenue: revenueByStatus.paid },
              { label: t.servedUnpaid || 'Served', count: filteredOrders.filter((o) => o.status === "served").length, color: "#3b82f6", bg: "#dbeafe", revenue: revenueByStatus.served },
              { label: t.preparing || 'Preparing', count: filteredOrders.filter((o) => o.status === "accepted").length, color: "#f59e0b", bg: "#fef3c7", revenue: revenueByStatus.accepted },
              { label: t.newOrder || 'Pending', count: filteredOrders.filter((o) => o.status === "pending").length, color: "#ef4444", bg: "#fee2e2", revenue: revenueByStatus.pending }
            ].map((s) => {
              const pct = filteredOrders.length > 0 ? Math.round((s.count / filteredOrders.length) * 100) : 0;
              return (
                <div key={s.label} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: 'space-between', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: s.color }} />
                      <span style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>{s.label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#aaa' }}>{fmtMMK(s.revenue)}</span>
                      <span style={{
                        background: s.bg, color: s.color,
                        fontSize: 12, fontWeight: 700,
                        padding: "3px 10px", borderRadius: 20,
                        minWidth: 32, textAlign: 'center'
                      }}>
                        {s.count}
                      </span>
                    </div>
                  </div>
                  <div style={{ background: '#f5f5f5', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                    <div style={{
                      background: s.color, height: 6, borderRadius: 4,
                      width: pct + '%',
                      transition: 'width 0.5s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Orders by Hour */}
          {hours.length > 0 && (
            <div style={{ ...cardStyle, padding: 24 }}>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e", marginBottom: 20 }}>
                🕐 {t.revenueByHour || 'Orders by Hour'}
              </h3>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 100, padding: '0 4px' }}>
                {hours.map((h) => (
                  <div
                    key={h.h}
                    style={{
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 4
                    }}
                    title={`${h.h}:00 — ${h.count} orders, ${fmtMMK(h.revenue)}`}
                  >
                    <span style={{ fontSize: 10, color: brand.accentDark, fontWeight: 700 }}>{h.count}</span>
                    <div
                      style={{
                        width: "100%",
                        background: `linear-gradient(180deg,${brand.accent},${brand.accentDark})`,
                        borderRadius: "6px 6px 2px 2px",
                        height: Math.max(12, Math.round((h.count / maxCount) * 72)),
                        transition: 'height 0.5s ease',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <span style={{ fontSize: 9, color: "#aaa", fontWeight: 600 }}>{h.h}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders Table */}
      <div style={{ ...cardStyle, padding: 24 }}>
        <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e", marginBottom: 16 }}>
          📋 Recent Orders
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f5f0e8' }}>
                {['Order #', 'Table', 'Items', 'Total', 'Status', 'Time'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 12px', color: '#888', fontWeight: 700, fontSize: 11, letterSpacing: 0.5 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOrders.slice(0, 10).map((o) => {
                const statusColors: Record<string, { bg: string; color: string }> = {
                  pending: { bg: '#fef3c7', color: '#92400e' },
                  accepted: { bg: '#dbeafe', color: '#1e40af' },
                  served: { bg: '#fce7f3', color: '#9d174d' },
                  paid: { bg: '#dcfce7', color: '#166534' }
                };
                const sc = statusColors[o.status] || statusColors.pending;
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f9f5ef' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600 }}>
                      #{String(o.id).slice(-6)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      🪑 Table {o.table}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {o.items.map((i) => i.image).join(' ')} ({o.items.reduce((a, i) => a + i.qty, 0)})
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, color: brand.accentDark }}>
                      {fmtMMK(o.total)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: sc.bg, color: sc.color,
                        fontSize: 11, fontWeight: 700,
                        padding: '3px 10px', borderRadius: 20
                      }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#aaa', fontSize: 12 }}>
                      {o.time}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length > 10 && (
          <p style={{ textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 12 }}>
            Showing 10 of {filteredOrders.length} orders
          </p>
        )}
      </div>
    </div>
  );
};
