import React, { useEffect, useMemo, useState } from 'react';
import type { Order, Table, Brand, WorkflowMode } from '../types';
import { getNextWorkflowStatus } from '../workflows';

interface KitchenDisplayProps {
  orders: Order[];
  tables: Table[];
  onUpdateStatus: (id: number, status: Order['status']) => void;
  brand: Brand;
  translations: Record<string, string>;
  workflowMode: WorkflowMode;
}

type OrderBoardFilter = 'open' | 'new' | 'ready';

const INITIAL_ORDER_BOARD_NOW = Date.now();
const fmtMMK = (value: number) => `MMK ${Number(value).toLocaleString()}`;

export const KitchenDisplay: React.FC<KitchenDisplayProps> = ({
  orders,
  tables,
  onUpdateStatus,
  brand,
  translations: t,
  workflowMode
}) => {
  const [filter, setFilter] = useState<OrderBoardFilter>('open');
  const [now, setNow] = useState(INITIAL_ORDER_BOARD_NOW);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(id);
  }, []);

  const minAgo = (order: Order) => {
    const placedAt = order.created_at ? new Date(order.created_at).getTime() : now;
    return Math.max(0, Math.floor((now - placedAt) / 60000));
  };

  const filtered = useMemo(
    () =>
      orders
        .filter((order) => {
          if (filter === 'open') return order.status === 'pending' || order.status === 'accepted';
          if (filter === 'new') return order.status === 'pending';
          if (filter === 'ready') return order.status === 'accepted';
          return false;
        })
        .sort((left, right) => {
          if (left.status !== right.status) {
            return left.status === 'pending' ? -1 : 1;
          }

          const leftPlacedAt = left.created_at ? new Date(left.created_at).getTime() : left.id;
          const rightPlacedAt = right.created_at ? new Date(right.created_at).getTime() : right.id;
          return leftPlacedAt - rightPlacedAt;
        }),
    [filter, orders]
  );

  const filterOptions: { value: OrderBoardFilter; label: string }[] = [
    { value: 'open', label: t.allOrders },
    { value: 'new', label: t.pendingOnly },
    { value: 'ready', label: t.cookingOnly }
  ];

  const urgency = (order: Order) => {
    const minutes = minAgo(order);
    if (minutes >= 20) return { bg: '#fff7ed', border: '#fb923c', tone: '#c2410c' };
    if (minutes >= 10) return { bg: '#fffbeb', border: '#fbbf24', tone: '#a16207' };
    return { bg: '#f8fafc', border: '#cbd5e1', tone: '#475569' };
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '28px 20px 36px',
        background: 'linear-gradient(180deg, #f8f4eb 0%, #fffdf9 45%, #f6efe3 100%)'
      }}
    >
      <div style={{ maxWidth: 1220, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            gap: 20,
            marginBottom: 22,
            flexWrap: 'wrap'
          }}
        >
          <div>
            <p
              style={{
                margin: '0 0 8px',
                textTransform: 'uppercase',
                letterSpacing: 2,
                fontSize: 11,
                fontWeight: 700,
                color: brand.accentDark
              }}
            >
              {t.roleKitchen}
            </p>
            <h1
              style={{
                margin: 0,
                fontFamily: '"Fraunces", Georgia, serif',
                color: '#1f2937',
                fontSize: 30
              }}
            >
              {t.kitchenDisplay}
            </h1>
            <p style={{ margin: '10px 0 0', color: '#6b7280', fontSize: 14, maxWidth: 620 }}>
              {t.workflowBoardIntro}
            </p>
          </div>
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: 6,
              borderRadius: 999,
              background: 'rgba(255,255,255,0.82)',
              border: '1px solid rgba(220,206,184,0.72)',
              boxShadow: '0 14px 32px rgba(15,23,42,0.08)'
            }}
          >
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                style={{
                  padding: '10px 16px',
                  borderRadius: 999,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 700,
                  background: filter === option.value ? `linear-gradient(135deg, ${brand.accent}, ${brand.accentDark})` : 'transparent',
                  color: filter === option.value ? '#fff' : '#6b7280',
                  transition: 'all 0.2s ease'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        {filtered.length === 0 ? (
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              background: 'rgba(255,255,255,0.82)',
              borderRadius: 28,
              border: '1px solid rgba(220,206,184,0.72)',
              boxShadow: '0 24px 60px rgba(15,23,42,0.08)',
              color: '#6b7280'
            }}
          >
            <p style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{t.noKitchenOrders}</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
            {filtered.map((order) => {
              const orderUrgency = urgency(order);
              const minutes = minAgo(order);
              const tableName = tables.find((table) => table.id === order.table)?.name || String(order.table);
              const isNewOrder = order.status === 'pending';
              const nextStatus = getNextWorkflowStatus(workflowMode, order.status);
              const statusLabel = isNewOrder ? t.newOrder : t.preparing;
              const actionLabel = isNewOrder ? t.acceptOrder : t.markServed;
              return (
                <div
                  key={order.id}
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    borderRadius: 24,
                    border: `1px solid ${orderUrgency.border}`,
                    boxShadow: '0 20px 48px rgba(15,23,42,0.08)',
                    overflow: 'hidden'
                  }}
                >
                  <div
                    style={{
                      padding: '18px 20px 14px',
                      background: orderUrgency.bg,
                      borderBottom: '1px solid rgba(15,23,42,0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                      <div>
                        <p
                          style={{
                            margin: '0 0 6px',
                            fontSize: 12,
                            fontWeight: 700,
                            letterSpacing: 1.2,
                            textTransform: 'uppercase',
                            color: orderUrgency.tone
                          }}
                        >
                          {t.tableLabel} {tableName}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                          <span
                            style={{
                              background: isNewOrder ? '#fef3c7' : '#dbeafe',
                              color: isNewOrder ? '#92400e' : '#1e40af',
                              fontSize: 11,
                              fontWeight: 800,
                              padding: '4px 10px',
                              borderRadius: 999
                            }}
                          >
                            {statusLabel}
                          </span>
                          <span style={{ color: '#6b7280', fontSize: 12 }}>
                            {minutes}m {t.timeSince}
                          </span>
                        </div>
                      </div>
                      <span style={{ color: '#9ca3af', fontSize: 12, fontWeight: 700 }}>
                        #{String(order.id).slice(-6)}
                      </span>
                    </div>
                  </div>
                  <div style={{ padding: '16px 20px 18px' }}>
                    <div style={{ display: 'grid', gap: 10, marginBottom: 18 }}>
                      {order.items.map((i) => (
                        <div
                          key={i.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            paddingBottom: 10,
                            borderBottom: '1px solid rgba(15,23,42,0.06)'
                          }}
                        >
                          <span style={{ fontSize: 22 }}>{i.image}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#1f2937' }}>{i.name}</p>
                            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9ca3af' }}>
                              {i.qty} x {fmtMMK(i.price)}
                            </p>
                          </div>
                          <span
                            style={{
                              minWidth: 34,
                              height: 34,
                              borderRadius: '50%',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: '#f8f4eb',
                              color: brand.accentDark,
                              fontSize: 13,
                              fontWeight: 800
                            }}
                          >
                            {i.qty}
                          </span>
                        </div>
                      ))}
                    </div>
                    {nextStatus && (
                      <button
                        onClick={() => onUpdateStatus(order.id, nextStatus)}
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          borderRadius: 16,
                          border: 'none',
                          background: isNewOrder
                            ? `linear-gradient(135deg, ${brand.accent}, ${brand.accentDark})`
                            : 'linear-gradient(135deg, #16a34a, #15803d)',
                          color: '#fff',
                          fontSize: 13,
                          fontWeight: 800,
                          cursor: 'pointer',
                          boxShadow: isNewOrder
                            ? '0 12px 24px rgba(193, 127, 78, 0.22)'
                            : '0 12px 24px rgba(22, 163, 74, 0.18)'
                        }}
                      >
                        {actionLabel}
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
