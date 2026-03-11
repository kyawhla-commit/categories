import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Modal } from './Modal';
import { ITEM_EMOJIS } from '../constants';
import type { MenuItem } from '../types';

interface ItemModalProps {
  item: Partial<MenuItem> | null;
  onSave: (item: Partial<MenuItem>) => void;
  onClose: () => void;
  translations: Record<string, string>;
}

export const ItemModalShadcn: React.FC<ItemModalProps> = ({
  item,
  onSave,
  onClose,
  translations: t,
}) => {
  const [form, setForm] = useState<Partial<MenuItem>>({
    name: '',
    desc: '',
    price: 0,
    image: '🍽️',
    available: true,
    ...item,
  });

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-5 font-serif text-xl font-bold text-slate-900">
        {item?.id ? t.editItem : t.newItem}
      </h3>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.itemName}</label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.description}</label>
          <Textarea value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} rows={2} className="resize-none" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.price}</label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: parseFloat(e.target.value) || 0 }))}
            />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.availableLabel}</label>
            <select
              value={String(form.available)}
              onChange={(e) => setForm((f) => ({ ...f, available: e.target.value === 'true' }))}
              className="flex h-11 w-full rounded-xl border border-input bg-white px-4 py-2 text-sm shadow-sm outline-none transition focus-visible:ring-4 focus-visible:ring-ring/60"
            >
              <option value="true">{t.yes}</option>
              <option value="false">{t.no}</option>
            </select>
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.iconLabel}</label>
          <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-50 p-3">
            {ITEM_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm((f) => ({ ...f, image: emoji }))}
                className={`rounded-xl px-3 py-2 text-2xl transition ${
                  form.image === emoji
                    ? 'border-2 border-amber-400 bg-amber-50 shadow-sm'
                    : 'border-2 border-transparent bg-white hover:border-slate-200'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-2 flex gap-3">
          <Button onClick={onClose} variant="outline" className="flex-1 border-amber-300 text-amber-700 hover:bg-amber-50">
            {t.cancel}
          </Button>
          <Button
            onClick={() => {
              if (form.name && form.price) onSave(form);
            }}
            className="flex-1"
          >
            {t.save}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
