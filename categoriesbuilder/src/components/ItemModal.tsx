import React, { useState } from 'react';
import { Modal } from './Modal';
import type { MenuItem } from '../types';
import { ITEM_EMOJIS } from '../constants';

interface ItemModalProps {
  item: Partial<MenuItem> | null;
  onSave: (item: Partial<MenuItem>) => void;
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

export const ItemModal: React.FC<ItemModalProps> = ({
  item,
  onSave,
  onClose,
  translations: t
}) => {
  const [form, setForm] = useState<Partial<MenuItem>>({
    name: "",
    desc: "",
    price: 0,
    image: "🍽️",
    available: true,
    ...item
  });

  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: 19, marginBottom: 18, color: "#1a1a2e" }}>
        {item?.id ? t.editItem : t.newItem}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>{t.itemName}</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{t.description}</label>
          <textarea
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            rows={2}
            style={{ ...inputStyle, resize: "none" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelStyle}>{t.price}</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>{t.availableLabel}</label>
            <select
              value={String(form.available)}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.value === "true" }))}
              style={inputStyle}
            >
              <option value="true">{t.yes}</option>
              <option value="false">{t.no}</option>
            </select>
          </div>
        </div>
        <div>
          <label style={{ ...labelStyle, marginBottom: 8 }}>{t.iconLabel}</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ITEM_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => setForm((f) => ({ ...f, image: emoji }))}
                style={{
                  fontSize: 22,
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: form.image === emoji ? "2px solid #c9a96e" : "2px solid transparent",
                  background: form.image === emoji ? "#fef9c3" : "#f5f5f5",
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
              if (form.name && form.price) onSave(form);
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
