import { useEffect, useRef } from 'react';

interface QRCodeProps {
  tableId: string | number;
  size?: number;
}

declare global {
  interface Window {
    _qrLoaded?: boolean;
    QRCode?: {
      new (el: HTMLElement, options: {
        text: string;
        width: number;
        height: number;
        colorDark: string;
        colorLight: string;
        correctLevel: number;
      }): void;
      CorrectLevel: { M: number };
    };
  }
}

// Load QR library dynamically
function loadQRLib(cb: () => void) {
  if (window._qrLoaded) {
    cb();
    return;
  }
  const script = document.createElement("script");
  script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
  script.onload = () => {
    window._qrLoaded = true;
    cb();
  };
  script.onerror = () => cb();
  document.head.appendChild(script);
}

export const QRCode: React.FC<QRCodeProps> = ({ tableId, size = 120 }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    el.innerHTML = "";
    const qrValue = `${window.location.origin}${window.location.pathname}?table=${encodeURIComponent(String(tableId))}`;

    loadQRLib(() => {
      const QRCodeLib = window.QRCode;
      if (QRCodeLib) {
        try {
          new QRCodeLib(el, {
            text: qrValue,
            width: size,
            height: size,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: 2
          });
        } catch {
          el.innerHTML = `<div style="width:${size}px;height:${size}px;background:#f0f0f0;display:flex;align-items:center;justify-content:center;border:1px solid #ddd;border-radius:8px;font-size:12px;color:#999">QR</div>`;
        }
      }
    });
  }, [tableId, size]);

  return <div ref={divRef} style={{ width: size, height: size }} />;
};
