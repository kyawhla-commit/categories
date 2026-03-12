-- ============================================================
-- Restaurant Menu Builder — Supabase Migration
-- Run this in Supabase SQL Editor (SQL Editor → New Query)
-- ============================================================

-- ============================================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'waiter' CHECK (role IN ('admin', 'waiter', 'kitchen', 'cashier')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'waiter')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 2. CATEGORIES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_my TEXT DEFAULT '',
  icon TEXT DEFAULT '🍽️',
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- ============================================================
-- 3. MENU_ITEMS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id BIGSERIAL PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL DEFAULT 0,
  image TEXT DEFAULT '🍽️',
  available BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_available ON menu_items(available);

-- ============================================================
-- 4. RESTAURANT_TABLES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_tables (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. RESTAURANT_SETTINGS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS restaurant_settings (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  workflow_mode TEXT NOT NULL DEFAULT 'service_only' CHECK (workflow_mode IN ('service_only', 'kitchen')),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO restaurant_settings (id, workflow_mode)
VALUES (1, 'service_only')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. ORDERS TABLE (handles both new and existing tables)
-- ============================================================

-- Create if it doesn't exist yet
CREATE TABLE IF NOT EXISTS orders (
  id BIGSERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- If orders table already existed, add the new columns safely
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add check constraint only if it doesn't already exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_status_check
      CHECK (status IN ('pending', 'accepted', 'served', 'paid'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table_id ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_created_by ON orders(created_by);

-- ============================================================
-- 7. ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- --- PROFILES ---
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_admin_update" ON profiles FOR UPDATE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_admin_insert" ON profiles FOR INSERT WITH CHECK (public.get_user_role() = 'admin' OR auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- --- CATEGORIES ---
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "categories_select" ON categories FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "categories_insert" ON categories FOR INSERT WITH CHECK (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "categories_update" ON categories FOR UPDATE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "categories_delete" ON categories FOR DELETE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- --- MENU_ITEMS ---
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "menu_items_select" ON menu_items FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "menu_items_insert" ON menu_items FOR INSERT WITH CHECK (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "menu_items_update" ON menu_items FOR UPDATE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "menu_items_delete" ON menu_items FOR DELETE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- --- RESTAURANT_TABLES ---
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "tables_select" ON restaurant_tables FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "tables_insert" ON restaurant_tables FOR INSERT WITH CHECK (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "tables_update" ON restaurant_tables FOR UPDATE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "tables_delete" ON restaurant_tables FOR DELETE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- --- RESTAURANT_SETTINGS ---
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "restaurant_settings_select" ON restaurant_settings FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "restaurant_settings_insert" ON restaurant_settings FOR INSERT WITH CHECK (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "restaurant_settings_update" ON restaurant_settings FOR UPDATE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- --- ORDERS ---
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "orders_select" ON orders FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "orders_insert" ON orders FOR INSERT WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "orders_update" ON orders FOR UPDATE USING (
    public.get_user_role() IN ('admin', 'kitchen', 'cashier')
    OR auth.uid() = created_by
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "orders_delete" ON orders FOR DELETE USING (public.get_user_role() = 'admin');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 8. ENABLE REALTIME (safe — ignores if already added)
-- ============================================================
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE orders;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE categories;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE menu_items;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_tables;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE restaurant_settings;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- 9. SEED DATA
-- ============================================================

-- Seed Categories
INSERT INTO categories (id, name, name_my, icon, sort_order) VALUES
  ('starters', 'Starters', 'အစပျိုး', '🥗', 1),
  ('mains', 'Main Course', 'အဓိကအစာ', '🍝', 2),
  ('pizzas', 'Pizzas', 'ပီဇာ', '🍕', 3),
  ('desserts', 'Desserts', 'အချိုပွဲ', '🍮', 4)
ON CONFLICT (id) DO NOTHING;

-- Seed Menu Items
INSERT INTO menu_items (category_id, name, description, price, image, available, sort_order) VALUES
  ('starters', 'Bruschetta al Pomodoro', 'Toasted bread, tomatoes, basil', 3500, '🍅', true, 1),
  ('starters', 'Burrata Caprese', 'Fresh burrata, heirloom tomatoes', 5500, '🧀', true, 2),
  ('starters', 'Arancini', 'Crispy risotto balls, mozzarella', 4000, '🟡', true, 3),
  ('mains', 'Spaghetti Carbonara', 'Egg, pecorino, guanciale', 8500, '🍝', true, 1),
  ('mains', 'Osso Buco Milanese', 'Braised veal shank, saffron risotto', 12000, '🥩', true, 2),
  ('mains', 'Penne all''Arrabbiata', 'Spicy tomato sauce, garlic', 6500, '🌶️', true, 3),
  ('pizzas', 'Margherita', 'San Marzano tomato, fior di latte', 6000, '🍕', true, 1),
  ('pizzas', 'Diavola', 'Spicy salami, chili, mozzarella', 7000, '🌶️', true, 2),
  ('desserts', 'Tiramisu', 'Mascarpone, espresso, ladyfingers', 3800, '☕', true, 1),
  ('desserts', 'Panna Cotta', 'Vanilla cream, wild berry coulis', 3500, '🍮', true, 2)
ON CONFLICT DO NOTHING;

-- Seed Restaurant Tables
INSERT INTO restaurant_tables (name, description) VALUES
  ('1', 'Window seat'),
  ('2', 'Garden view'),
  ('3', ''),
  ('4', ''),
  ('5', 'Private corner'),
  ('6', ''),
  ('7', ''),
  ('8', 'Bar area')
ON CONFLICT DO NOTHING;
