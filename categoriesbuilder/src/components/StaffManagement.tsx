import React, { useState, useEffect } from 'react';
import type { UserProfile, Brand } from '../types';
import { getAllProfiles, updateProfile, type Database } from '../lib/supabase';

interface StaffManagementProps {
  brand: Brand;
  translations: Record<string, string>;
  currentProfile: UserProfile | null;
}

const cardStyle: React.CSSProperties = {
  background: 'white',
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.06)'
};

type ProfileRow = Database['public']['Tables']['profiles']['Row'];

export const StaffManagement: React.FC<StaffManagementProps> = ({ brand, translations: t, currentProfile }) => {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserProfile['role'] | ''>('');
  const [toast, setToast] = useState<string | null>(null);

  const loadProfiles = async () => {
    setLoading(true);
    const { data } = await getAllProfiles();
    if (data) {
      setProfiles((data as ProfileRow[]).map((profile) => ({
        id: profile.id,
        full_name: profile.full_name,
        role: profile.role as UserProfile['role'],
        avatar_url: profile.avatar_url ?? undefined,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadProfiles();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  const handleUpdateRole = async (userId: string) => {
    const { error } = await updateProfile(userId, { role: editRole });
    if (!error) {
      setProfiles((p) => p.map((u) => u.id === userId ? { ...u, role: editRole as UserProfile['role'] } : u));
      setEditingId(null);
      setToast('Role updated successfully!');
      setTimeout(() => setToast(null), 2500);
    }
  };

  const roleConfig: Record<UserProfile['role'], { icon: string; color: string; bg: string; label: string }> = {
    admin: { icon: '👑', color: '#92400e', bg: '#fef3c7', label: t.roleAdmin },
    waiter: { icon: '🙋', color: '#1e40af', bg: '#dbeafe', label: t.roleWaiter },
    kitchen: { icon: '📋', color: '#9d174d', bg: '#fce7f3', label: t.roleKitchen },
    cashier: { icon: '💳', color: '#166534', bg: '#dcfce7', label: t.roleCashier },
  };

  const isAdmin = currentProfile?.role === 'admin';

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, padding: '12px 24px', borderRadius: 30,
          fontSize: 14, fontWeight: 600, background: '#1a1a2e', color: 'white',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
        }}>
          ✅ {toast}
        </div>
      )}

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#1a1a2e', marginBottom: 4 }}>
          👥 {t.staffTab?.replace('👤 ', '') || 'Team Management'}
        </h2>
        <p style={{ color: '#888', fontSize: 13 }}>
          Manage team members and their access roles
        </p>
      </div>

      {/* Role summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {Object.entries(roleConfig).map(([role, config]) => {
          const count = profiles.filter((p) => p.role === role).length;
          return (
            <div key={role} style={{
              ...cardStyle,
              padding: '16px',
              textAlign: 'center',
              border: '1px solid #f0f0f0'
            }}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{config.icon}</div>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#1a1a2e' }}>{count}</p>
              <p style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{config.label}</p>
            </div>
          );
        })}
      </div>

      {/* Staff list */}
      <div style={{ ...cardStyle, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
            ⏳ Loading team members...
          </div>
        ) : profiles.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#aaa' }}>
            No team members yet. Invite someone to sign up!
          </div>
        ) : (
          profiles.map((profile, i) => {
            const rc = roleConfig[profile.role] || roleConfig.waiter;
            const isEditing = editingId === profile.id;
            const isSelf = currentProfile?.id === profile.id;

            return (
              <div
                key={profile.id}
                style={{
                  padding: '16px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  borderBottom: i < profiles.length - 1 ? '1px solid #f5f0e8' : 'none',
                  background: isSelf ? '#fefce8' : 'white',
                  transition: 'background 0.2s'
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: 44, height: 44,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${brand.accent}, ${brand.accentDark})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, color: 'white', fontWeight: 700,
                  flexShrink: 0
                }}>
                  {profile.full_name?.[0]?.toUpperCase() || '?'}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <p style={{ fontWeight: 700, fontSize: 15, color: '#1a1a2e' }}>
                      {profile.full_name || 'Unknown'}
                    </p>
                    {isSelf && (
                      <span style={{
                        background: '#dbeafe', color: '#1e40af',
                        fontSize: 10, fontWeight: 700,
                        padding: '2px 8px', borderRadius: 20
                      }}>
                        You
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 12, color: '#aaa', marginTop: 2 }}>
                    Joined {profile.created_at ? new Date(profile.created_at).toLocaleDateString() : 'recently'}
                  </p>
                </div>

                {/* Role badge or editor */}
                {isEditing && isAdmin ? (
                  <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value as UserProfile['role'])}
                      style={{
                        padding: '6px 12px', borderRadius: 8,
                        border: '2px solid #e5e7eb', fontSize: 13,
                        outline: 'none'
                      }}
                    >
                      {(['admin', 'waiter', 'kitchen', 'cashier'] as UserProfile['role'][]).map((r) => (
                        <option key={r} value={r}>{roleConfig[r].label}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUpdateRole(profile.id)}
                      style={{
                        padding: '6px 14px', borderRadius: 8,
                        border: 'none', background: '#22c55e',
                        color: 'white', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ✓ Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: '6px 10px', borderRadius: 8,
                        border: '1px solid #e5e7eb', background: 'white',
                        color: '#888', fontSize: 12, cursor: 'pointer'
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: rc.bg, color: rc.color,
                      fontSize: 12, fontWeight: 700,
                      padding: '4px 12px', borderRadius: 20,
                      display: 'flex', alignItems: 'center', gap: 4
                    }}>
                      {rc.icon} {rc.label}
                    </span>
                    {isAdmin && !isSelf && (
                      <button
                        onClick={() => {
                          setEditingId(profile.id);
                          setEditRole(profile.role);
                        }}
                        style={{
                          padding: '4px 10px', borderRadius: 8,
                          border: `1px solid ${brand.accent}`, background: 'white',
                          color: brand.accentDark, fontSize: 11,
                          cursor: 'pointer', fontWeight: 600
                        }}
                      >
                        ✏️ Edit
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
