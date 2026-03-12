import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { signIn, signUp } from '../lib/supabase';
import type { Brand, WorkflowMode } from '../types';

interface AuthScreenProps {
  brand: Brand;
  translations: Record<string, string>;
  workflowMode: WorkflowMode;
  onAuthSuccess: () => void;
  onBack?: () => void;
  backLabel?: string;
  contextLabel?: string;
  supportHint?: string;
}

export const AuthScreenShadcn: React.FC<AuthScreenProps> = ({
  brand,
  translations: t,
  workflowMode,
  onAuthSuccess,
  onBack,
  backLabel = 'Back',
  contextLabel,
  supportHint
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'admin' | 'waiter' | 'kitchen' | 'cashier'>('waiter');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { error: err } = await signIn(email, password);
        if (err) {
          setError(err.message);
        } else {
          onAuthSuccess();
        }
      } else {
        if (!fullName.trim()) {
          setError('Please enter your full name');
          setLoading(false);
          return;
        }

        const { error: err } = await signUp(email, password, fullName, role);
        if (err) {
          setError(err.message);
        } else {
          setSuccess('Account created! Check your email to confirm, then log in.');
          setMode('login');
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'admin' as const, icon: '👑', label: t.roleAdmin || 'Admin' },
    { value: 'waiter' as const, icon: '🙋', label: t.roleWaiter || 'Waiter' },
    { value: 'kitchen' as const, icon: workflowMode === 'kitchen' ? '👨‍🍳' : '📋', label: t.roleKitchen || 'Order Desk' },
    { value: 'cashier' as const, icon: '💳', label: t.roleCashier || 'Cashier' },
  ];

  return (
    <div
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 text-white"
      style={{ background: `linear-gradient(135deg, ${brand.primary} 0%, #0f0f1e 50%, ${brand.primary} 100%)` }}
    >
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${brand.accent}25, transparent 68%)` }}
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-10 h-80 w-80 rounded-full blur-3xl"
        style={{ background: `radial-gradient(circle, ${brand.accent}18, transparent 70%)` }}
      />

      <div className="relative z-10 w-full max-w-md">
        {(onBack || contextLabel) && (
          <div className="mb-4 flex items-center justify-between gap-3">
            {onBack ? (
              <button
                type="button"
                onClick={onBack}
                className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-white/78 backdrop-blur transition hover:bg-white/12"
              >
                ← {backLabel}
              </button>
            ) : (
              <div />
            )}
            {contextLabel && (
              <div className="rounded-full border border-white/14 bg-white/8 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70 backdrop-blur">
                {contextLabel}
              </div>
            )}
          </div>
        )}

        <div className="mb-8 text-center">
          <div className="mb-3 animate-pulse text-6xl drop-shadow-[0_6px_24px_rgba(201,169,110,0.35)]">
            {brand.logo}
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-[0.08em]" style={{ color: brand.accent }}>
            {brand.name}
          </h1>
          <p className="mt-2 text-sm italic text-white/45">{brand.tagline}</p>
        </div>

        <Card className="border-white/10 bg-white/96 text-slate-900">
          <CardHeader className="pb-6">
            <div className="mb-1 flex rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                🔑 {t.login || 'Sign In'}
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  mode === 'signup' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                ✨ {t.signUp || 'Sign Up'}
              </button>
            </div>
            <CardTitle>{mode === 'login' ? (t.login || 'Sign In') : (t.signUp || 'Create Account')}</CardTitle>
            <CardDescription>
              {mode === 'login'
                ? (supportHint || 'Secure staff access with Supabase Authentication.')
                : 'Create a staff account and assign the initial access role.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="space-y-2">
                  <label className="block text-[11px] font-bold tracking-[0.18em] text-slate-500">
                    {t.staffName || 'FULL NAME'}
                  </label>
                  <Input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.18em] text-slate-500">
                  EMAIL
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-bold tracking-[0.18em] text-slate-500">
                  PASSWORD
                </label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
              </div>

              {mode === 'signup' && (
                <div className="space-y-3">
                  <label className="block text-[11px] font-bold tracking-[0.18em] text-slate-500">
                    {t.staffRole || 'ROLE'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {roleOptions.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRole(r.value)}
                        className={`rounded-2xl border px-3 py-3 text-center transition ${
                          role === r.value
                            ? 'border-[var(--accent)] bg-[color-mix(in_srgb,var(--accent)_14%,white)] text-slate-900 shadow-sm'
                            : 'border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300'
                        }`}
                        style={{ ['--accent' as string]: brand.accent }}
                      >
                        <div className="mb-1 text-xl">{r.icon}</div>
                        <p className="text-[11px] font-semibold">{r.label}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                  ⚠️ {error}
                </div>
              )}

              {success && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  ✅ {success}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full text-white shadow-[0_10px_28px_rgba(201,169,110,0.45)]"
                style={{
                  background: loading
                    ? '#9ca3af'
                    : `linear-gradient(135deg, ${brand.accent}, ${brand.accentDark})`,
                }}
              >
                {loading
                  ? '⏳ Please wait...'
                  : mode === 'login'
                    ? `🔐 ${t.login || 'Sign In'}`
                    : `✨ ${t.signUp || 'Create Account'}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mx-auto mt-6 max-w-xs text-center text-xs leading-5 text-white/25">
          Powered by Supabase Authentication — Secure email & password login
        </p>
      </div>
    </div>
  );
};
