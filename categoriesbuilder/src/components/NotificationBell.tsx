import React, { useState } from 'react';
import type { Notification, Brand } from '../types';

interface NotificationBellProps {
  notifications: Notification[];
  soundOn: boolean;
  onToggleSound: () => void;
  onMarkAllRead: () => void;
  brand: Brand;
  translations: Record<string, string>;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  soundOn,
  onToggleSound,
  onMarkAllRead,
  brand,
  translations: t
}) => {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          fontSize: 20,
          padding: "4px 6px",
          lineHeight: 1
        }}
      >
        🔔
        {unread > 0 && (
          <span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              background: "#ef4444",
              color: "white",
              borderRadius: "50%",
              width: 16,
              height: 16,
              fontSize: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700
            }}
          >
            {unread}
          </span>
        )}
      </button>
      {open && (
        <div
          style={{
            position: "absolute",
            top: 38,
            right: 0,
            width: 290,
            background: "white",
            borderRadius: 12,
            boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
            zIndex: 500,
            overflow: "hidden"
          }}
        >
          <div
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0ebe0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 13, color: "#1a1a2e" }}>🔔 {t.notifications}</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={onToggleSound}
                style={{
                  fontSize: 11,
                  padding: "3px 8px",
                  borderRadius: 10,
                  border: "1px solid #ddd",
                  background: "white",
                  cursor: "pointer",
                  color: "#555"
                }}
              >
                {soundOn ? t.soundOn : t.soundOff}
              </button>
              {unread > 0 && (
                <button
                  onClick={onMarkAllRead}
                  style={{
                    fontSize: 11,
                    padding: "3px 8px",
                    borderRadius: 10,
                    border: "none",
                    background: brand.primary,
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  {t.markAllRead}
                </button>
              )}
            </div>
          </div>
          <div style={{ maxHeight: 280, overflowY: "auto" }}>
            {notifications.length === 0 ? (
              <p style={{ padding: "20px 16px", color: "#aaa", fontSize: 13, textAlign: "center" }}>{t.noNotifs}</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: "10px 16px",
                    borderBottom: "1px solid #f9f7f2",
                    background: n.read ? "white" : "#fffbeb"
                  }}
                >
                  <p style={{ fontSize: 13, fontWeight: n.read ? 400 : 700, color: "#1a1a2e" }}>{n.msg}</p>
                  <p style={{ fontSize: 11, color: "#bbb", marginTop: 2 }}>{n.time}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
