import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project credentials
// Get them from: https://app.supabase.com/project/_/settings/api
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      orders: {
        Row: {
          id: number;
          table_id: number;
          items: unknown;
          total: number;
          time: string;
          status: 'pending' | 'accepted' | 'served' | 'paid';
          created_at: string;
        };
        Insert: {
          id?: number;
          table_id: number;
          items: unknown;
          total: number;
          time: string;
          status?: 'pending' | 'accepted' | 'served' | 'paid';
          created_at?: string;
        };
        Update: {
          id?: number;
          table_id?: number;
          items?: unknown;
          total?: number;
          time?: string;
          status?: 'pending' | 'accepted' | 'served' | 'paid';
          created_at?: string;
        };
      };
    };
  };
}
