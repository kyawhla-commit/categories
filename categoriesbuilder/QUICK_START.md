# 🚀 Quick Start Guide

## Get Running in 5 Minutes!

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A [Supabase](https://supabase.com) account (free tier works)

---

### Step 1: Install Dependencies (~1 min)

```bash
cd categoriesbuilder
npm install
```

---

### Step 2: Set Up Supabase (~3 mins)

#### 2.1 — Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click **"New Project"**
3. Choose an organization, name, database password, and region
4. Wait ~2 minutes for provisioning

#### 2.2 — Get Your API Credentials

1. Navigate to **Settings → API**
2. Copy the **Project URL** and the **anon (public) key**

#### 2.3 — Configure the App

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...
```

`SUPABASE_SERVICE_ROLE_KEY` is only for server-side admin tasks. Do not expose it in client code.

#### 2.4 — Run the Database Migration

1. In your Supabase dashboard, open the **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of [`supabase-migration.sql`](supabase-migration.sql) and paste it into the editor
4. Click **"Run"**

This single migration creates everything you need:

| What                  | Details                                                |
|-----------------------|--------------------------------------------------------|
| **`profiles`**        | Extends `auth.users` with `full_name`, `role`, `avatar_url` |
| **`categories`**      | Menu categories (name, icon, sort order)               |
| **`menu_items`**      | Items within categories (price, availability, image)   |
| **`restaurant_tables`** | Tables with name and description                    |
| **`orders`**          | Orders with status workflow and JSONB items            |
| **RLS Policies**      | Role-based Row Level Security on every table           |
| **Realtime**          | Enabled on `orders`, `categories`, `menu_items`, `restaurant_tables` |
| **Seed Data**         | Sample categories, menu items, and tables              |

#### 2.5 — Enable Realtime (verify)

1. Go to **Database → Replication**
2. Verify that Realtime is **ON** for:
   - `orders`
   - `categories`
   - `menu_items`
   - `restaurant_tables`

> The migration script enables these automatically, but it's good to double-check.

---

### Step 3: Start the Dev Server (~30 seconds)

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

### Step 4: Create Your First Account (~1 min)

The app uses **Supabase email/password authentication** — there are no hardcoded PINs.

1. On the login screen, click **"✨ Sign Up"**
2. Enter your **full name**, **email**, and **password** (min 6 characters)
3. Choose a **role**:

| Role       | Icon | Access                                |
|------------|------|---------------------------------------|
| **Admin**  | 👑   | All views — Menu, Kitchen, Dashboard, Staff Management, Admin |
| **Waiter** | 🙋   | Menu only — place orders for tables   |
| **Kitchen**| 👨‍🍳  | Kitchen Display — accept & manage incoming orders |
| **Cashier**| 💳   | Admin panel, Dashboard, Staff Management |

4. Click **"Create Account"**
5. Check your email and click the **confirmation link**
6. Return to the app and **Sign In**

> **Tip:** Create your first account with the **Admin** role so you have full access to all features.

#### Optional: Create or Promote a User with the Admin Script

If you need to create a specific admin account directly from this repo, run:

```bash
npm run supabase:create-user -- --email youtekyaw@gmail.com --password password123 --role admin --name "Admin User"
```

This uses the Supabase Admin API, marks the email as confirmed, and ensures the matching `profiles` row has the correct role.

---

### Step 5: Explore the App (~2 mins)

#### 🍕 Place an Order (Menu View)

1. Switch to the **Menu** tab
2. Select a table from the table selector
3. Browse categories (Starters, Main Course, Pizzas, Desserts)
4. Tap items to add them to the cart
5. Open the cart and click **"Place Order"**

#### 👨‍🍳 Kitchen Display

1. Open another browser tab or device
2. Sign in with a **Kitchen** role account
3. See orders appear in real-time with 🔔 notification sounds
4. Accept orders and mark them as served

#### ⚙️ Admin Panel

1. Switch to the **Admin** tab
2. Manage orders through the full workflow:
   - `Pending` → `Accepted` → `Served` → `Paid`
3. Generate bills and track order history

#### 📊 Dashboard

- View revenue stats, top dishes, and order analytics
- Real-time metrics updated as orders flow through

#### 👥 Staff Management

- View and manage staff accounts
- Update roles for team members

---

## 🗂️ Project Structure

```
categoriesbuilder/
├── src/
│   ├── components/
│   │   ├── AuthScreen.tsx         # Login / Sign-up screen
│   │   ├── BillModal.tsx          # Bill generation modal
│   │   ├── CategoryModal.tsx      # Category create/edit
│   │   ├── ConfirmModal.tsx       # Confirmation dialog
│   │   ├── Dashboard.tsx          # Analytics dashboard
│   │   ├── ItemModal.tsx          # Menu item create/edit
│   │   ├── KitchenDisplay.tsx     # Kitchen order display
│   │   ├── LoginScreen.tsx        # Legacy login component
│   │   ├── Modal.tsx              # Base modal wrapper
│   │   ├── NotificationBell.tsx   # Real-time notification bell
│   │   ├── QRCode.tsx             # QR code generator
│   │   ├── QRModal.tsx            # QR code display modal
│   │   ├── StaffManagement.tsx    # Staff management panel
│   │   └── TableModal.tsx         # Table create/edit
│   ├── contexts/
│   │   └── AuthContext.tsx        # Supabase auth context provider
│   ├── lib/
│   │   └── supabase.ts           # Supabase client & helper functions
│   ├── utils/
│   │   └── sound.ts              # Notification sound utilities
│   ├── App.tsx                    # Main application component
│   ├── App.css                    # Component styles
│   ├── constants.ts               # Default data, branding, role access
│   ├── index.css                  # Global styles
│   ├── main.tsx                   # Entry point
│   ├── translations.ts           # EN/MY bilingual translations
│   └── types.ts                   # TypeScript type definitions
├── supabase-migration.sql         # Full database migration
├── .env.example                   # Environment variable template
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 🎨 Customization

### Change Restaurant Branding

Edit `src/constants.ts`:

```typescript
export const DEFAULT_BRAND: Brand = {
  name: "Your Restaurant Name",
  tagline: "Your Tagline Here",
  logo: "🍽️",
  primary: "#1a1a2e",      // Dark background color
  accent: "#c9a96e",       // Gold accent color
  accentDark: "#a07840"    // Darker accent for gradients
};
```

### Modify the Menu

Edit `src/constants.ts` → `INITIAL_CATEGORIES`:

```typescript
export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "starters",
    name: "Starters",
    nameMy: "အစပျိုး",     // Burmese translation
    icon: "🥗",
    items: [
      { id: 1, name: "Your Item", desc: "Description", price: 3500, image: "🍅", available: true },
    ]
  },
  // ... more categories
];
```

> **Note:** Prices are in MMK (Myanmar Kyat). Adjust the currency display in `App.tsx` if needed.

### Update Tables

Edit `src/constants.ts` → `INITIAL_TABLES`:

```typescript
export const INITIAL_TABLES: Table[] = [
  { id: 1, name: "1", desc: "Window seat" },
  { id: 2, name: "VIP", desc: "Private room" },
  // ... more tables
];
```

### Add Translations

Edit `src/translations.ts` to modify English or Burmese strings, or add a new language.

---

## 🔧 Troubleshooting

### Port already in use?

```bash
npm run dev -- --port 3000
```

### Supabase connection error?

- Verify `.env` file exists with correct credentials
- Check that your Supabase project is active (not paused)
- Open browser DevTools → Console for detailed error messages

### "Email not confirmed" error?

- Check your inbox (and spam folder) for the confirmation email
- In Supabase Dashboard → Authentication → Users, you can manually confirm a user

### Orders not syncing in real-time?

- Verify Realtime is enabled: Database → Replication
- Check that RLS policies were created by the migration
- Open browser console for WebSocket errors

### No notification sound?

- Click anywhere on the page first (browser autoplay policy)
- Check that system volume is not muted

---

## 📱 Multi-Device Testing

### Scenario: Full Order Workflow

| Step | Device / Tab | Role    | Action                              |
|------|-------------|---------|-------------------------------------|
| 1    | Tab 1       | Waiter  | Place an order from the Menu view   |
| 2    | Tab 2       | Kitchen | See the order appear, accept it     |
| 3    | Tab 2       | Kitchen | Mark the order as "Served"          |
| 4    | Tab 3       | Cashier | Generate the bill, mark as "Paid"   |

> All updates sync instantly across tabs and devices via Supabase Realtime.

---

## 📚 Related Documentation

| Document                   | Description                           |
|----------------------------|---------------------------------------|
| [`README.md`](README.md)   | Full project overview and features    |
| [`FEATURES.md`](FEATURES.md) | Complete feature list              |
| [`SUPABASE_SETUP.md`](SUPABASE_SETUP.md) | Detailed Supabase setup guide |
| [`REALTIME_FEATURES.md`](REALTIME_FEATURES.md) | Real-time feature details |
| [`IMPLEMENTATION.md`](IMPLEMENTATION.md) | Implementation notes         |
| [`supabase-migration.sql`](supabase-migration.sql) | Database schema & seed data |

---

## 🎉 You're Ready!

Your restaurant management system is now running with:

- ✅ **Supabase Auth** — Secure email/password authentication
- ✅ **Role-Based Access** — Admin, Waiter, Kitchen, Cashier
- ✅ **Real-Time Sync** — Orders update instantly across devices
- ✅ **Sound Notifications** — Audio alerts for new orders
- ✅ **Bilingual UI** — English & Burmese language support
- ✅ **Analytics Dashboard** — Revenue, top dishes, order stats
- ✅ **Staff Management** — Manage team roles and accounts
- ✅ **QR Codes** — Generate QR codes for each table

Enjoy building your restaurant! 🚀
