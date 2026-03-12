import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { UserProfile } from '../types';
import { supabase, getProfile, ensureProfile } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  refreshProfile: async () => {}
});

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const applyProfile = useCallback((data: {
    id: string;
    full_name: string;
    role: string;
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  }) => {
    setProfile({
      id: data.id,
      full_name: data.full_name,
      role: data.role as UserProfile['role'],
      avatar_url: data.avatar_url ?? undefined,
      created_at: data.created_at,
      updated_at: data.updated_at
    });
  }, []);

  const loadProfile = useCallback(async (authUser: User) => {
    const { data, error } = await getProfile(authUser.id);

    if (data) {
      applyProfile(data);
      return true;
    }

    if (error) {
      console.warn('Profile fetch failed, attempting repair:', error.message);
    }

    const repaired = await ensureProfile(authUser);
    if (repaired.data) {
      applyProfile(repaired.data);
      return true;
    }

    console.error('Unable to load or create profile:', repaired.error?.message || error?.message || 'unknown error');
    setProfile(null);
    return false;
  }, [applyProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadProfile(user);
    }
  }, [user, loadProfile]);

  useEffect(() => {
    let isMounted = true;
    const resetAuthState = () => {
      setSession(null);
      setUser(null);
      setProfile(null);
    };

    const bootstrapAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!isMounted) {
          return;
        }

        if (s?.user) {
          setSession(s);
          setUser(s.user);
          const loaded = await loadProfile(s.user);
          if (!isMounted) {
            return;
          }

          if (!loaded) {
            await supabase.auth.signOut();
            if (!isMounted) {
              return;
            }
            resetAuthState();
          }
        } else {
          resetAuthState();
        }
        setLoading(false);
      } catch (error) {
        console.error('Error restoring auth session:', error);
        if (isMounted) {
          resetAuthState();
          setLoading(false);
        }
      }
    };

    void bootstrapAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) {
          return;
        }

        if (!session?.user) {
          resetAuthState();
          setLoading(false);
          return;
        }

        setSession(session);
        setUser(session.user);
        setLoading(true);

        setTimeout(() => {
          void (async () => {
            try {
              const loaded = await loadProfile(session.user);
              if (!isMounted) {
                return;
              }

              if (!loaded) {
                await supabase.auth.signOut();
                if (!isMounted) {
                  return;
                }
                resetAuthState();
              }
            } catch (error) {
              console.error('Error handling auth state change:', error);
              if (isMounted) {
                resetAuthState();
              }
            } finally {
              if (isMounted) {
                setLoading(false);
              }
            }
          })();
        }, 0);
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
