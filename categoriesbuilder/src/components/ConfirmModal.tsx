import React from 'react';
import { Modal } from './Modal';

interface ConfirmModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  cancelText?: string;
  confirmText?: string;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  onConfirm,
  onCancel,
  cancelText = "Cancel",
  confirmText = "Delete"
}) => {
  return (
    <Modal onClose={onCancel} maxWidth={340}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>⚠️</div>
        <p style={{ fontSize: 15, color: "#1a1a2e", marginBottom: 22, lineHeight: 1.5 }}>
          {message}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "1.5px solid #ddd",
              background: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: 8,
              border: "none",
              background: "#dc2626",
              color: "white",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 700
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};
