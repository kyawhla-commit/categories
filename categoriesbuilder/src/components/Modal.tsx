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
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/55 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[92vh] w-full overflow-y-auto rounded-2xl bg-white p-7 shadow-[0_16px_50px_rgba(15,23,42,0.22)]"
        style={{ maxWidth }}
      >
        {children}
      </div>
    </div>
  );
};
