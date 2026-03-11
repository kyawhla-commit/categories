import React from 'react';
import { Modal } from './Modal';
import { QRCode } from './QRCode';
import type { Table } from '../types';

interface QRModalProps {
  table: Table;
  onClose: () => void;
  translations: Record<string, string>;
}

export const QRModal: React.FC<QRModalProps> = ({ table, onClose, translations: t }) => {
  return (
    <Modal onClose={onClose} maxWidth={300}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 700, marginBottom: 4, color: "#1a1a2e" }}>
          {t.tableLabel} {table.name}
        </p>
        {table.desc && (
          <p style={{ color: "#888", fontSize: 13, marginBottom: 10 }}>{table.desc}</p>
        )}
        <p style={{ color: "#aaa", fontSize: 12, marginBottom: 12 }}>{t.scanQr}</p>
        <div
          style={{
            display: "inline-block",
            padding: 12,
            background: "#fff",
            border: "1px solid #eee",
            borderRadius: 10,
            marginBottom: 12
          }}
        >
          <QRCode tableId={table.id} size={160} />
        </div>
        <p style={{ fontSize: 11, color: "#bbb", marginBottom: 16 }}>{t.printTable}</p>
        <button
          onClick={onClose}
          style={{
            padding: "9px 28px",
            borderRadius: 25,
            border: "none",
            background: "#1a1a2e",
            color: "white",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 700
          }}
        >
          {t.close}
        </button>
      </div>
    </Modal>
  );
};
