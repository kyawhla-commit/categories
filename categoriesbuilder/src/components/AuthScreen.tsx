import React, { useState } from 'react';
import type { Brand } from '../types';
import { signIn, signUp } from '../lib/supabase';

interface AuthScreenProps {
  brand: Brand;
  translations: Record<string, string>;
  onAuthSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ brand, translations: t, onAuthSuccess }) => {
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
    { value: 'kitchen' as const, icon: '📋', label: t.roleKitchen || 'Order Desk' },
    { value: 'cashier' as const, icon: '💳', label: t.roleCashier || 'Cashier' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${brand.primary} 0%, #0f0f1e 50%, ${brand.primary} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Decorative circles */}
      <div style={{
        position: 'absolute', top: -80, right: -80,
        width: 260, height: 260, borderRadius: '50%',
        background: `radial-gradient(circle, ${brand.accent}15, transparent)`,
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: -120, left: -60,
        width: 340, height: 340, borderRadius: '50%',
        background: `radial-gradient(circle, ${brand.accent}10, transparent)`,
        pointerEvents: 'none'
      }} />

      {/* Logo & branding */}
      <div style={{ textAlign: 'center', marginBottom: 32, position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 56, marginBottom: 8,
          filter: 'drop-shadow(0 4px 20px rgba(201,169,110,0.3))',
          animation: 'pulse 3s ease-in-out infinite'
        }}>
          {brand.logo}
        </div>
        <h1 style={{
          fontFamily: 'Georgia, serif',
          color: brand.accent,
          fontSize: 30,
          fontWeight: 700,
          marginBottom: 4,
          letterSpacing: 1
        }}>
          {brand.name}
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontStyle: 'italic' }}>
          {brand.tagline}
        </p>
      </div>

      {/* Auth form card */}
      <div style={{
        background: 'rgba(255,255,255,0.97)',
        borderRadius: 20,
        boxShadow: '0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
        padding: '36px 32px',
        width: '100%',
        maxWidth: 400,
        position: 'relative',
        zIndex: 1,
        backdropFilter: 'blur(20px)'
      }}>
        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          background: '#f5f5f5',
          borderRadius: 12,
          padding: 4,
          marginBottom: 28
        }}>
          <button
            onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 10, border: 'none',
              background: mode === 'login' ? 'white' : 'transparent',
              color: mode === 'login' ? brand.primary : '#888',
              fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            🔑 {t.login || 'Sign In'}
          </button>
          <button
            onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            style={{
              flex: 1, padding: '10px 0',
              borderRadius: 10, border: 'none',
              background: mode === 'signup' ? 'white' : 'transparent',
              color: mode === 'signup' ? brand.primary : '#888',
              fontWeight: 700, fontSize: 14,
              cursor: 'pointer',
              boxShadow: mode === 'signup' ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            ✨ {t.signUp || 'Sign Up'}
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Name (signup only) */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 1, marginBottom: 6 }}>
                {t.staffName || 'FULL NAME'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                style={{
                  width: '100%', padding: '12px 16px',
                  borderRadius: 10,
                  border: '2px solid #e5e7eb',
                  fontSize: 15, outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                required
              />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 1, marginBottom: 6 }}>
              EMAIL
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@restaurant.com"
              style={{
                width: '100%', padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #e5e7eb',
                fontSize: 15, outline: 'none',
                transition: 'border-color 0.2s'
              }}
              required
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: mode === 'signup' ? 16 : 24 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 1, marginBottom: 6 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={6}
              style={{
                width: '100%', padding: '12px 16px',
                borderRadius: 10,
                border: '2px solid #e5e7eb',
                fontSize: 15, outline: 'none',
                transition: 'border-color 0.2s'
              }}
              required
            />
          </div>

          {/* Role selector (signup only) */}
          {mode === 'signup' && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#888', letterSpacing: 1, marginBottom: 8 }}>
                {t.staffRole || 'ROLE'}
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
                {roleOptions.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    style={{
                      padding: '10px 4px',
                      borderRadius: 10,
                      border: role === r.value ? `2px solid ${brand.accent}` : '2px solid #e5e7eb',
                      background: role === r.value ? `${brand.accent}15` : '#fafafa',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s'
                    }}
                  >
                    <div style={{ fontSize: 20, marginBottom: 2 }}>{r.icon}</div>
                    <p style={{ fontSize: 10, fontWeight: 600, color: role === r.value ? brand.accentDark : '#888' }}>
                      {r.label}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div style={{
              background: '#fef2f2', color: '#dc2626', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, fontWeight: 600,
              marginBottom: 16, border: '1px solid #fecaca'
            }}>
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div style={{
              background: '#f0fdf4', color: '#16a34a', borderRadius: 10,
              padding: '10px 14px', fontSize: 13, fontWeight: 600,
              marginBottom: 16, border: '1px solid #bbf7d0'
            }}>
              ✅ {success}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 0',
              borderRadius: 12,
              border: 'none',
              background: loading
                ? '#ccc'
                : `linear-gradient(135deg, ${brand.accent}, ${brand.accentDark})`,
              color: 'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: 16,
              fontWeight: 700,
              letterSpacing: 0.5,
              boxShadow: loading ? 'none' : '0 4px 20px rgba(201,169,110,0.4)',
              transition: 'all 0.2s'
            }}
          >
            {loading
              ? '⏳ Please wait...'
              : mode === 'login'
                ? `🔓 ${t.login || 'Sign In'}`
                : `✨ ${t.signUp || 'Create Account'}`
            }
          </button>
        </form>
      </div>

      {/* Footer note */}
      <p style={{
        color: 'rgba(255,255,255,0.2)',
        fontSize: 11, marginTop: 24,
        textAlign: 'center', maxWidth: 300, lineHeight: 1.5
      }}>
        Powered by Supabase Authentication — Secure email & password login
      </p>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};
