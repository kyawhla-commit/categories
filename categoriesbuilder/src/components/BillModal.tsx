import React from 'react';
import { Modal } from './Modal';
import type { Order, Brand } from '../types';

interface BillModalProps {
  tableOrders: Order[];
  tableName: string;
  onClose: () => void;
  onMarkPaid: () => void;
  onPrintReceipt: () => void;
  brand: Brand;
  translations: Record<string, string>;
}

const fmtMMK = (n: number) => "MMK " + Number(n).toLocaleString();

export const BillModal: React.FC<BillModalProps> = ({
  tableOrders,
  tableName,
  onClose,
  onMarkPaid,
  onPrintReceipt,
  brand,
  translations: t
}) => {
  const subtotal = tableOrders.reduce((s, o) => s + o.total, 0);
  const tax = Math.round(subtotal * 0.05);
  const grand = subtotal + tax;
  const allPaid = tableOrders.every((o) => o.status === 'paid');

  const merged = tableOrders.flatMap((o) => o.items).reduce((acc, item) => {
    const existing = acc.find((a) => a.id === item.id);
    if (existing) {
      existing.qty += item.qty;
      existing.sub += item.price * item.qty;
    } else {
      acc.push({ ...item, qty: item.qty, sub: item.price * item.qty });
    }
    return acc;
  }, [] as Array<{ id: number; name: string; image: string; qty: number; price: number; sub: number }>);

  return (
    <Modal onClose={onClose} maxWidth={420}>
      <div className="space-y-5">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[rgba(199,157,82,0.16)] text-3xl text-slate-900 shadow-inner">
            🧾
          </div>
          <h3 className="font-serif text-2xl font-bold text-slate-900">
            {t.billFor} {t.tableLabel} {tableName}
          </h3>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.24em] text-stone-400">
            {tableOrders.length} orders ready to settle
          </p>
        </div>

        <div className="rounded-[28px] border border-stone-200 bg-[rgba(247,241,231,0.82)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          <div className="space-y-2">
            {merged.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border-b border-stone-200 pb-2 text-sm last:border-b-0 last:pb-0"
              >
                <span className="pr-4 text-slate-700">
                  {item.image} {item.name} x {item.qty}
                </span>
                <span className="font-bold text-slate-900">{fmtMMK(item.sub)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-dashed border-stone-300 pt-4">
            <div className="mb-1 flex justify-between text-sm text-slate-600">
              <span>{t.subtotal}</span>
              <span>{fmtMMK(subtotal)}</span>
            </div>
            <div className="mb-3 flex justify-between text-sm text-stone-400">
              <span>{t.tax}</span>
              <span>{fmtMMK(tax)}</span>
            </div>
            <div className="flex justify-between text-lg font-extrabold text-slate-900">
              <span>{t.grandTotal}</span>
              <span style={{ color: brand.accentDark }}>{fmtMMK(grand)}</span>
            </div>
          </div>
        </div>

        {allPaid ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center text-sm font-bold text-emerald-700">
            ✅ {t.billPaid}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={onMarkPaid}
              className="rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]"
              style={{ background: brand.primary }}
            >
              💳 {t.markPaid}
            </button>
            <button
              onClick={onPrintReceipt}
              className="rounded-2xl border px-4 py-3 text-sm font-bold shadow-[0_10px_24px_rgba(199,157,82,0.12)]"
              style={{ borderColor: `${brand.accent}66`, color: brand.accentDark, background: 'rgba(255,255,255,0.86)' }}
            >
              🖨️ {t.printReceipt}
            </button>
          </div>
        )}

        {allPaid && (
          <button
            onClick={onPrintReceipt}
            className="w-full rounded-2xl px-4 py-3 text-sm font-bold text-white shadow-[0_16px_32px_rgba(15,23,42,0.16)]"
            style={{ background: brand.primary }}
          >
            🖨️ {t.printReceipt}
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full rounded-2xl border border-stone-200 bg-white px-4 py-3 text-sm font-semibold text-stone-500"
        >
          {t.close}
        </button>
      </div>
    </Modal>
  );
};
