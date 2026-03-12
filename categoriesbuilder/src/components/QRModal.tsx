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
    <Modal onClose={onClose} maxWidth={340}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(24,32,45,0.08)] text-3xl shadow-inner">
          📱
        </div>
        <p className="font-serif text-2xl font-bold text-slate-900">
          {t.tableLabel} {table.name}
        </p>
        {table.desc && (
          <p className="mt-2 text-sm text-stone-500">{table.desc}</p>
        )}
        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.22em] text-stone-400">{t.scanQr}</p>

        <div className="my-5 inline-flex rounded-[28px] border border-stone-200 bg-white p-4 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
          <QRCode tableId={table.id} size={176} />
        </div>

        <p className="mb-5 text-xs text-stone-400">{t.printTable}</p>
        <button
          onClick={onClose}
          className="rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-[0_18px_36px_rgba(15,23,42,0.16)]"
        >
          {t.close}
        </button>
      </div>
    </Modal>
  );
};
