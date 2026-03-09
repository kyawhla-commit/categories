import React, { useState } from 'react';
import { Modal } from './Modal';
import type { Table } from '../types';

interface TableModalProps {
  table: Partial<Table> | null;
  onSave: (table: Partial<Table>) => void;
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

export const TableModal: React.FC<TableModalProps> = ({
  table,
  onSave,
  onClose,
  translations: t
}) => {
  const [form, setForm] = useState<Partial<Table>>({
    name: "",
    desc: "",
    ...table
  });

  return (
    <Modal onClose={onClose}>
      <h3 style={{ fontFamily: "Georgia,serif", fontSize: 19, marginBottom: 18, color: "#1a1a2e" }}>
        {table?.id ? t.editTable : t.newTable}
      </h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div>
          <label style={labelStyle}>{t.tableName}</label>
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>{t.tableDesc}</label>
          <input
            value={form.desc}
            onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
            style={inputStyle}
          />
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
