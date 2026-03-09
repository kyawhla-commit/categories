# 🚀 Quick Start Guide

## Get Running in 5 Minutes!

### Step 1: Install Dependencies (1 min)
```bash
cd categoriesbuilder
npm install
```

### Step 2: Setup Supabase (2 mins)

#### Option A: Use Without Supabase (Local Only)
Just run the app! It will work with in-memory storage:
```bash
npm run dev
```
⚠️ Note: Orders won't persist and won't sync across devices

#### Option B: Full Setup with Supabase (Recommended)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Wait ~2 minutes for setup

2. **Get Credentials**
   - Go to Settings → API
   - Copy Project URL and anon key

3. **Configure App**
   ```bash
   cp .env.example .env
   ```
   Edit `.env`:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

4. **Create Database Table**
   - Go to SQL Editor in Supabase
   - Run this SQL:
   ```sql
   CREATE TABLE orders (
     id BIGSERIAL PRIMARY KEY,
     table_id INTEGER NOT NULL,
     items JSONB NOT NULL,
     total INTEGER NOT NULL,
     time TEXT NOT NULL,
     status TEXT NOT NULL DEFAULT 'pending',
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

   CREATE POLICY "Enable all" ON orders FOR ALL USING (true) WITH CHECK (true);

   ALTER PUBLICATION supabase_realtime ADD TABLE orders;
   ```

5. **Enable Realtime**
   - Go to Database → Replication
   - Toggle Realtime ON for `orders` table

### Step 3: Run the App (30 seconds)
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Step 4: Login (30 seconds)

Choose a staff member and enter PIN:
- **Admin** → PIN: `0000` (Full access)
- **Waiter** → PIN: `1111` (Menu only)
- **Kitchen** → PIN: `2222` (Kitchen display)
- **Cashier** → PIN: `3333` (Admin & Dashboard)

### Step 5: Test Features (1 min)

1. **Place an Order**
   - Click "🍕 Menu" tab
   - Select a table
   - Add items to cart
   - Click "Place Order"

2. **See Real-time Updates**
   - Open another browser tab
   - Login as Kitchen (PIN: 2222)
   - See the order appear instantly!
   - Hear the notification sound 🔔

3. **Manage Orders**
   - Click "⚙️ Admin" tab
   - Accept the order
   - Mark as served
   - Generate bill
   - Mark as paid

4. **View Analytics**
   - Click "📊 Dashboard" tab
   - See revenue, top dishes, order stats

## 🎯 What You Get

### Without Supabase
- ✅ Full UI/UX
- ✅ All features work
- ✅ Single device
- ❌ No persistence
- ❌ No real-time sync

### With Supabase
- ✅ Full UI/UX
- ✅ All features work
- ✅ Multi-device support
- ✅ Data persistence
- ✅ Real-time sync
- ✅ Notifications
- ✅ Cloud storage

## 🔧 Troubleshooting

### Port already in use?
```bash
npm run dev -- --port 3000
```

### Supabase connection error?
- Check `.env` file exists
- Verify credentials are correct
- Ensure project is active

### No sound?
- Click anywhere first (browser autoplay policy)
- Check sound toggle is ON (🔔)
- Verify system volume

### Orders not syncing?
- Check Realtime is enabled
- Verify RLS policy exists
- Check browser console for errors

## 📱 Test Scenarios

### Single Device
1. Login as Admin
2. Switch to Menu tab
3. Place order
4. Switch to Kitchen tab
5. Accept order
6. Switch to Admin tab
7. Generate bill

### Multi-Device
1. **Device 1**: Login as Waiter, place order
2. **Device 2**: Login as Kitchen, see order appear
3. **Device 2**: Accept and mark served
4. **Device 3**: Login as Cashier, generate bill

## 🎨 Customization

### Change Restaurant Name
Edit `src/constants.ts`:
```typescript
export const DEFAULT_BRAND = {
  name: "Your Restaurant",
  tagline: "Your Tagline",
  logo: "🍕",
  // ...
};
```

### Add Menu Items
Edit `src/constants.ts`:
```typescript
export const INITIAL_CATEGORIES = [
  {
    id: "starters",
    name: "Starters",
    items: [
      { id: 1, name: "Your Item", price: 5000, ... }
    ]
  }
];
```

### Change Staff
Edit `src/constants.ts`:
```typescript
export const DEFAULT_STAFF = [
  { id: 1, name: "Your Name", pin: "1234", role: "admin" }
];
```

## 📚 Next Steps

1. Read `SUPABASE_SETUP.md` for detailed setup
2. Check `REALTIME_FEATURES.md` for feature details
3. See `FEATURES.md` for complete feature list
4. Review `IMPLEMENTATION_COMPLETE.md` for overview

## 🎉 You're Ready!

Your restaurant management system is now running with:
- Real-time order synchronization
- Role-based access control
- Sound notifications
- Multi-device support
- Professional UI/UX

Enjoy! 🚀
