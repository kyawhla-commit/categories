import React from 'react';

interface ModalProps {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: number;
}

export const Modal: React.FC<ModalProps> = ({ onClose, children, maxWidth = 440 }) => {
  return (
    <div
      onClick={onClose}
      className="workspace-modal"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="workspace-modal__panel"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
};
