import React, { useState } from 'react';
import type { Staff, Brand } from '../types';

interface LoginScreenProps {
  staff: Staff[];
  brand: Brand;
  onLogin: (staff: Staff) => void;
  translations: Record<string, string>;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ staff, brand, onLogin, translations: t }) => {
  const [selected, setSelected] = useState<Staff | null>(null);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");

  const handlePin = (digit: string) => {
    if (digit === "del") {
      setPin((p) => p.slice(0, -1));
      setError("");
      return;
    }
    const next = pin + digit;
    setPin(next);
    if (next.length === 4) {
      if (selected && selected.pin === next) {
        onLogin(selected);
        setPin("");
      } else {
        setError(t.wrongPin);
        setTimeout(() => {
          setPin("");
          setError("");
        }, 900);
      }
    }
  };

  const roleIcon = (r: Staff['role']) => {
    if (r === "admin") return "👑";
    if (r === "kitchen") return "📋";
    if (r === "cashier") return "💳";
    return "🙋";
  };

  const roleLabel = (r: Staff['role']) => {
    return t["role" + r.charAt(0).toUpperCase() + r.slice(1)] || r;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: brand.primary,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 24
      }}
    >
      <div style={{ fontSize: 56, marginBottom: 8 }}>{brand.logo}</div>
      <h1
        style={{
          fontFamily: "Georgia,serif",
          color: brand.accent,
          fontSize: 28,
          fontWeight: 700,
          marginBottom: 4
        }}
      >
        {brand.name}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 36 }}>{brand.tagline}</p>
      <div
        style={{
          background: "white",
          borderRadius: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          padding: 28,
          width: "100%",
          maxWidth: 360
        }}
      >
        <p style={{ textAlign: "center", fontWeight: 700, fontSize: 15, color: "#1a1a2e", marginBottom: 16 }}>
          {t.selectStaff}
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          {staff.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelected(s);
                setPin("");
                setError("");
              }}
              style={{
                padding: "12px 8px",
                borderRadius: 10,
                border: selected?.id === s.id ? `2px solid ${brand.accent}` : "2px solid #e5e7eb",
                background: selected?.id === s.id ? "#fef9c3" : "#fafafa",
                cursor: "pointer",
                textAlign: "center",
                transition: "all 0.15s"
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{roleIcon(s.role)}</div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "#1a1a2e" }}>{s.name}</p>
              <p style={{ fontSize: 11, color: "#888" }}>{roleLabel(s.role)}</p>
            </button>
          ))}
        </div>
        {selected && (
          <>
            <p style={{ textAlign: "center", fontSize: 13, color: "#888", marginBottom: 10 }}>
              {t.enterPin} — <strong>{selected.name}</strong>
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: pin.length > i ? brand.primary : "#e5e7eb",
                    transition: "background 0.15s"
                  }}
                />
              ))}
            </div>
            {error && (
              <p style={{ textAlign: "center", color: "#dc2626", fontSize: 13, marginBottom: 8, fontWeight: 600 }}>
                {error}
              </p>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "del", "0", "✓"].map((d) => (
                <button
                  key={d}
                  onClick={() => d !== "✓" && handlePin(d)}
                  style={{
                    padding: "14px",
                    borderRadius: 10,
                    border: "1.5px solid #e5e7eb",
                    background: d === "del" ? "#fef2f2" : d === "✓" ? "#e5e7eb" : "white",
                    color: d === "del" ? "#dc2626" : "#1a1a2e",
                    fontSize: 18,
                    fontWeight: 700,
                    cursor: d === "✓" ? "default" : "pointer"
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 20 }}>
        Demo PINs: Admin=0000 · Waiter=1111 · Order Desk=2222 · Cashier=3333
      </p>
    </div>
  );
};
