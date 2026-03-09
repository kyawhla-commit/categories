import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Category } from '../types';
import { EMOJI_ICONS } from '../constants';

interface CategoryModalProps {
  category: Partial<Category> | null;
  onSave: (category: Partial<Category>) => void;
  onClose: () => void;
  translations: Record<string, string>;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: 6,
  padding: "10px 14px",
  borderRadius: 8,
  border: "1.5px solid #e5e7eb",
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit"
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#666",
  display: "block"
};

export const CategoryModal: React.FC<CategoryModalProps> = ({
  category,
  onSave,
  onClose,
  translations: t
}) => {
  const [form, setForm] = useState<Partial<Category>>({
    name: "",
    nameMy: "",
    icon: "🍽️",
    items: [],
    ...category
  });

  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: 19, marginBottom: 18, color: "#1a1a2e" }}>
        {category?.id ? t.editCat : t.newCat}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>{t.catName}</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.catNameMy}</label>
            <input
              value={form.nameMy}
              onChange={(e) => setForm((f) => ({ ...f, nameMy: e.target.value }))}
              style={inputStyle}
            />
          </div>
        </div>
        <div>
          <label style={{ ...labelStyle, marginBottom: 8 }}>{t.catIcon}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 100, overflowY: "auto" }}>
            {EMOJI_ICONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setForm((f) => ({ ...f, icon: emoji }))}
                style={{
                  fontSize: 20,
                  padding: "5px 8px",
                  borderRadius: 8,
                  border: form.icon === emoji ? "2px solid #c9a96e" : "2px solid transparent",
                  background: form.icon === emoji ? "#fef9c3" : "#f5f5f5",
                  cursor: "pointer"
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "1.5px solid #c9a96e",
              background: "white",
              color: "#a07840",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600
            }}
          >
            {t.cancel}
          </button>
          <button
            onClick={() => {
              if (form.name?.trim()) onSave(form);
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#1a1a2e",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700
            }}
          >
            {t.save}
          </button>
        </div>
      </div>
    </Modal>
  );
};
