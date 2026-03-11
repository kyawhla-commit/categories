import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from './Modal';
import { EMOJI_ICONS } from '../constants';
import type { Category } from '../types';

interface CategoryModalProps {
  category: Partial<Category> | null;
  onSave: (category: Partial<Category>) => void;
  onClose: () => void;
  translations: Record<string, string>;
}

export const CategoryModalShadcn: React.FC<CategoryModalProps> = ({
  category,
  onSave,
  onClose,
  translations: t,
}) => {
  const [form, setForm] = useState<Partial<Category>>({
    name: '',
    nameMy: '',
    icon: '🍽️',
    items: [],
    ...category,
  });

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-5 font-serif text-xl font-bold text-slate-900">
        {category?.id ? t.editCat : t.newCat}
      </h3>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.catName}</label>
            <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.catNameMy}</label>
            <Input value={form.nameMy} onChange={(e) => setForm((f) => ({ ...f, nameMy: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.catIcon}</label>
          <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto rounded-2xl bg-slate-50 p-3">
            {EMOJI_ICONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setForm((f) => ({ ...f, icon: emoji }))}
                className={`rounded-xl px-3 py-2 text-xl transition ${
                  form.icon === emoji
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
              if (form.name?.trim()) onSave(form);
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
