# Supabase Setup Guide

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `restaurant-menu-builder`
   - Database password: (generate a strong password)
   - Region: Choose closest to your location
5. Click "Create new project"
6. Wait for the project to be ready (~2 minutes)

## 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon/public key** (the `anon` key under "Project API keys")

## 3. Configure Your App

1. Create a `.env` file in the `categoriesbuilder` directory:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

## 4. Create Database Tables

Run this SQL in the Supabase SQL Editor (**SQL Editor** → **New query**):

```sql
-- Create orders table
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  table_id INTEGER NOT NULL,
  items JSONB NOT NULL,
  total INTEGER NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for demo purposes)
-- In production, you should create more restrictive policies
CREATE POLICY "Enable all operations for orders" ON orders
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Enable Realtime for orders table
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

## 5. Test the Connection

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Place an order from the menu
3. Check the Supabase dashboard → **Table Editor** → **orders**
4. You should see the order appear in real-time!

## 6. Enable Realtime (Important!)

1. Go to **Database** → **Replication**
2. Find the `orders` table
3. Toggle **Realtime** to ON
4. This enables real-time notifications when new orders are placed

## Features Enabled by Supabase

### Real-time Order Sync
- Orders placed from customer menu appear instantly in admin/kitchen views
- Multiple devices stay in sync automatically
- No page refresh needed

### Real-time Notifications
- Sound alert plays when new order arrives
- Notification popup shows order details
- Notification bell shows unread count

### Persistent Data
- All orders saved to database
- Survives page refreshes
- Accessible from multiple devices

### Multi-user Support
- Multiple staff can use the system simultaneously
- Changes sync across all connected devices
- Perfect for busy restaurants

## Troubleshooting

### Orders not appearing?
- Check your `.env` file has correct credentials
- Verify Realtime is enabled for `orders` table
- Check browser console for errors

### Connection errors?
- Verify your Supabase project is active
- Check API keys are correct
- Ensure you're using the `anon` key, not the `service_role` key

### Realtime not working?
- Go to Database → Replication
- Enable Realtime for `orders` table
- Restart your dev server

## Security Notes

For production use, you should:
1. Create proper Row Level Security (RLS) policies
2. Implement authentication
3. Restrict access based on user roles
4. Use environment variables for sensitive data
5. Never commit `.env` file to version control

## Next Steps

- Implement user authentication
- Add more tables (categories, items, tables)
- Create admin dashboard for analytics
- Set up proper RLS policies
- Deploy to production
