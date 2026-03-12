import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';
import type { WorkflowMode } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase credentials not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ── Auth helpers ──────────────────────────────────────────

export async function signUp(email: string, password: string, fullName: string, role: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role }
    }
  });
  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return { data, error };
}

export async function ensureProfile(user: User) {
  const fallbackName =
    typeof user.user_metadata?.full_name === 'string' && user.user_metadata.full_name.trim()
      ? user.user_metadata.full_name.trim()
      : user.email || 'User';

  const fallbackRole =
    typeof user.user_metadata?.role === 'string' && ['admin', 'waiter', 'kitchen', 'cashier'].includes(user.user_metadata.role)
      ? user.user_metadata.role
      : 'waiter';

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        full_name: fallbackName,
        role: fallbackRole,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  return { data, error };
}

export async function updateProfile(userId: string, updates: { full_name?: string; role?: string; avatar_url?: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single();
  return { data, error };
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });
  return { data, error };
}

// ── Categories ────────────────────────────────────────────

export async function fetchCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true });
  return { data, error };
}

export async function upsertCategory(cat: { id: string; name: string; name_my: string; icon: string; sort_order: number }) {
  const { data, error } = await supabase
    .from('categories')
    .upsert(cat, { onConflict: 'id' })
    .select()
    .single();
  return { data, error };
}

export async function reorderCategories(categories: Array<{ id: string; name: string; name_my: string; icon: string; sort_order: number }>) {
  const { data, error } = await supabase
    .from('categories')
    .upsert(categories, { onConflict: 'id' })
    .select();
  return { data, error };
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  return { error };
}

// ── Menu Items ────────────────────────────────────────────

export async function fetchMenuItems(categoryId?: string) {
  let query = supabase
    .from('menu_items')
    .select('*')
    .order('sort_order', { ascending: true });

  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }

  const { data, error } = await query;
  return { data, error };
}

export async function upsertMenuItem(item: {
  id?: number;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  sort_order?: number;
}) {
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(item)
    .select()
    .single();
  return { data, error };
}

export async function reorderMenuItems(items: Array<{
  id: number;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  available: boolean;
  sort_order?: number;
}>) {
  const { data, error } = await supabase
    .from('menu_items')
    .upsert(items)
    .select();
  return { data, error };
}

export async function deleteMenuItem(id: number) {
  const { error } = await supabase.from('menu_items').delete().eq('id', id);
  return { error };
}

// ── Restaurant Tables ─────────────────────────────────────

export async function fetchTables() {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .select('*')
    .order('id', { ascending: true });
  return { data, error };
}

export async function upsertTable(table: { id?: number; name: string; description: string }) {
  const { data, error } = await supabase
    .from('restaurant_tables')
    .upsert(table)
    .select()
    .single();
  return { data, error };
}

export async function deleteRestaurantTable(id: number) {
  const { error } = await supabase.from('restaurant_tables').delete().eq('id', id);
  return { error };
}

// ── Restaurant Settings ────────────────────────────────────

export async function fetchRestaurantSettings() {
  const { data, error } = await supabase
    .from('restaurant_settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  return { data, error };
}

export async function upsertRestaurantSettings(settings: { workflow_mode: WorkflowMode }) {
  const { data, error } = await supabase
    .from('restaurant_settings')
    .upsert(
      {
        id: 1,
        ...settings,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'id' }
    )
    .select()
    .single();
  return { data, error };
}

// ── Orders ────────────────────────────────────────────────

export async function fetchOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createOrder(order: { table_id: number; items: unknown; total: number; time: string; status: string; created_by?: string }) {
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  return { data, error };
}

export async function updateOrderStatus(id: number, status: string) {
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id);
  return { error };
}

export async function markOrdersPaid(ids: number[]) {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'paid' })
    .in('id', ids);
  return { error };
}

export async function deleteOrder(id: number) {
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id);
  return { error };
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: string;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          name_my: string;
          icon: string;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
      };
      menu_items: {
        Row: {
          id: number;
          category_id: string;
          name: string;
          description: string;
          price: number;
          image: string;
          available: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
      };
      restaurant_tables: {
        Row: {
          id: number;
          name: string;
          description: string;
          is_active: boolean;
          created_at: string;
        };
      };
      restaurant_settings: {
        Row: {
          id: number;
          workflow_mode: string;
          updated_at: string;
        };
      };
      orders: {
        Row: {
          id: number;
          table_id: number;
          items: unknown;
          total: number;
          time: string;
          status: string;
          created_by: string | null;
          created_at: string;
        };
      };
    };
  };
}
