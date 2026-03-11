import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from './Modal';
import type { Table } from '../types';

interface TableModalProps {
  table: Partial<Table> | null;
  onSave: (table: Partial<Table>) => void;
  onClose: () => void;
  translations: Record<string, string>;
}

export const TableModalShadcn: React.FC<TableModalProps> = ({
  table,
  onSave,
  onClose,
  translations: t,
}) => {
  const [form, setForm] = useState<Partial<Table>>({
    name: '',
    desc: '',
    ...table,
  });

  return (
    <Modal onClose={onClose}>
      <h3 className="mb-5 font-serif text-xl font-bold text-slate-900">
        {table?.id ? t.editTable : t.newTable}
      </h3>
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.tableName}</label>
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="mb-2 block text-xs font-bold tracking-[0.14em] text-slate-500">{t.tableDesc}</label>
          <Input value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} />
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
