import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Brand, Notification } from '../types';

interface NotificationBellProps {
  notifications: Notification[];
  soundOn: boolean;
  onToggleSound: () => void;
  onMarkAllRead: () => void;
  brand: Brand;
  translations: Record<string, string>;
}

export const NotificationBellShadcn: React.FC<NotificationBellProps> = ({
  notifications,
  soundOn,
  onToggleSound,
  onMarkAllRead,
  brand,
  translations: t,
}) => {
  const [open, setOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-xl bg-white/8 px-2 py-1.5 text-xl leading-none text-white transition hover:bg-white/14"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <Card className="absolute right-0 top-11 z-[500] w-[290px] overflow-hidden border-slate-200 bg-white text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between border-b border-amber-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold">🔔 {t.notifications}</span>
              {unread > 0 && <Badge variant="warning">{unread} new</Badge>}
            </div>
            <div className="flex gap-2">
              <Button onClick={onToggleSound} variant="outline" size="sm" className="h-8 px-3 text-[11px]">
                {soundOn ? t.soundOn : t.soundOff}
              </Button>
              {unread > 0 && (
                <Button onClick={onMarkAllRead} size="sm" className="h-8 px-3 text-[11px]" style={{ background: brand.primary }}>
                  {t.markAllRead}
                </Button>
              )}
            </div>
          </div>
          <CardContent className="max-h-72 overflow-y-auto p-0">
            {notifications.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">{t.noNotifs}</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`border-b border-slate-100 px-4 py-3 ${n.read ? 'bg-white' : 'bg-amber-50/70'}`}
                >
                  <p className={`text-sm text-slate-900 ${n.read ? 'font-normal' : 'font-bold'}`}>{n.msg}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{n.time}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
