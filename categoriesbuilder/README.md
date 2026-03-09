# Restaurant Menu Builder

A complete TypeScript-based restaurant menu management system with customer ordering, table management, and order tracking.

## 🎯 Features

### Core Functionality
- **Category Management**: Create, edit, delete, and reorder menu categories
- **Item Management**: Add, edit, delete, and toggle availability of menu items
- **Table Management**: Create and manage restaurant tables with QR codes
- **Customer Menu View**: Beautiful public-facing menu for customers to browse and order
- **Order System**: Full cart functionality with order placement
- **Order Status Management**: Track orders through Pending → Accepted → Served → Paid workflow
- **Multi-language Support**: English and Burmese translations
- **Real-time Statistics**: Track categories, items, tables, and active orders
- **Responsive Design**: Clean, modern UI with smooth animations

### Customer Experience
- Browse menu by category with tab navigation
- Select table before ordering
- Add items to cart with quantity adjustment
- Place orders with one tap
- Order confirmation screen
- Mobile-responsive design

### Admin Features
- Dashboard with key metrics (tables, categories, items, active orders)
- Category management with reordering
- Item management within categories
- Table management with QR code generation
- Order tracking and status updates
- Quick actions for order management

### Key Components

#### Categories
- Custom icons (emoji-based)
- Bilingual names (English + Burmese)
- Reorder functionality (up/down buttons)
- Item count tracking

#### Menu Items
- Name and description
- Price in MMK (Myanmar Kyat)
- Custom emoji icons
- Availability toggle
- Category assignment

#### Tables
- Table name/number
- Optional description
- QR code generation for each table
- Quick QR preview

#### Orders
- Order placement from customer menu
- Status tracking: Pending → Accepted → Served → Paid
- Order history
- Table assignment
- Time tracking
- Quick status updates

#### UI Features
- Toast notifications for actions
- Confirmation modals for deletions
- Inline editing modals
- Language switcher (EN/MY)
- Sticky navigation bar
- Custom scrollbar styling
- Status badges with color coding

## 📁 Project Structure

```
src/
├── components/
│   ├── Modal.tsx              # Base modal component
│   ├── ConfirmModal.tsx       # Confirmation dialog
│   ├── CategoryModal.tsx      # Category create/edit modal
│   ├── ItemModal.tsx          # Item create/edit modal
│   ├── TableModal.tsx         # Table create/edit modal
│   ├── QRModal.tsx            # QR code display modal
│   └── QRCode.tsx             # QR code generator component
├── types.ts                   # TypeScript type definitions
├── constants.ts               # Default data and configurations
├── translations.ts            # Multi-language support
├── App.tsx                    # Main application component
├── App.css                    # Component styles
├── index.css                  # Global styles
└── main.tsx                   # Application entry point
```

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🛠️ Technologies Used

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **CSS-in-JS** - Inline styling for component encapsulation
- **QRCode.js** - QR code generation (loaded via CDN)

## 📱 Views

### Admin View
- Statistics dashboard
- Category management with items
- Table management with QR codes
- Order tracking sidebar
- Quick actions for all entities

### Customer Menu View
- Hero section with restaurant branding
- Table selector
- Category tabs
- Menu items with add to cart
- Floating cart with checkout
- Order confirmation

### Order Success View
- Order confirmation
- Itemized receipt
- Order details
- Return to menu button

## 🎨 Customization

### Branding
Edit `src/constants.ts` to customize:
- Restaurant name and tagline
- Logo emoji
- Color scheme (primary, accent colors)

### Initial Data
Modify `INITIAL_CATEGORIES` and `INITIAL_TABLES` in `src/constants.ts` to set default data.

### Translations
Add or modify translations in `src/translations.ts` for additional language support.

## 🔄 Order Workflow

1. **Customer places order** from menu view
2. **Order appears as "Pending"** in admin panel
3. **Staff accepts order** → Status changes to "Accepted" (Preparing)
4. **Kitchen prepares food** → Staff marks as "Served"
5. **Customer pays** → Staff marks as "Paid"
6. **Order complete** → Appears in order history

## 💡 Future Enhancements

Potential features to add:
- Local storage persistence
- Export/import functionality
- Kitchen display view
- Bills & checkout system
- Sales dashboard with analytics
- Staff & roles management
- Branding customization panel
- Real-time notifications
- Print receipts
- Drag-and-drop item reordering
- Search and filter
- Bulk operations

## 📝 Notes

- QR codes are generated using QRCode.js library loaded from CDN
- All data is currently stored in component state (no persistence)
- Order IDs are generated using timestamps
- The app is fully bilingual with instant language switching

## 📄 License

MIT
