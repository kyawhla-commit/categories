import { useState, useEffect, useRef, useCallback, useMemo, useId } from 'react';
import type { Category, MenuItem, Language, Brand, Table, Order, CartItem, ViewType, Notification, WorkflowMode } from './types';
import { DEFAULT_BRAND, INITIAL_CATEGORIES, INITIAL_TABLES, ROLE_ACCESS } from './constants';
import { translations } from './translations';
import { CategoryModalShadcn } from './components/CategoryModalShadcn';
import { ItemModalShadcn } from './components/ItemModalShadcn';
import { ConfirmModal } from './components/ConfirmModal';
import { TableModalShadcn } from './components/TableModalShadcn';
import { QRModal } from './components/QRModal';
import { QRCode } from './components/QRCode';
import { BillModal } from './components/BillModal';
import { KitchenDisplay } from './components/KitchenDisplay';
import { Dashboard } from './components/Dashboard';
import { AuthScreenShadcn } from './components/AuthScreenShadcn';
import { StaffManagement } from './components/StaffManagement';
import { NotificationBellShadcn } from './components/NotificationBellShadcn';
import { Badge } from './components/ui/badge';
import { Card, CardContent } from './components/ui/card';
import { useAuth } from './contexts/AuthContext';
import { 
  supabase, 
  signOut, 
  fetchCategories, 
  fetchMenuItems, 
  fetchTables, 
  fetchRestaurantSettings,
  fetchOrders as dbFetchOrders,
  upsertCategory, 
  reorderCategories,
  deleteCategory as dbDeleteCategory,
  upsertMenuItem,
  reorderMenuItems,
  deleteMenuItem as dbDeleteMenuItem,
  upsertTable,
  deleteRestaurantTable as dbDeleteTable,
  upsertRestaurantSettings,
  createOrder as dbCreateOrder,
  updateOrderStatus as dbUpdateOrderStatus,
  markOrdersPaid,
  deleteOrder as dbDeleteOrder,
  type Database
} from './lib/supabase';
import { applyWorkflowTranslations, DEFAULT_WORKFLOW_MODE, getEnvWorkflowMode, getNextWorkflowStatus } from './workflows';
import { playOrderAlert } from './utils/sound';
import './App.css';

const fmtMMK = (n: number) => "MMK " + Number(n).toLocaleString();

const cardStyle: React.CSSProperties = {
  background: "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(250,245,236,0.9))",
  border: "1px solid rgba(220,206,184,0.72)",
  borderRadius: 24,
  boxShadow: "0 22px 54px rgba(15,23,42,0.08)"
};

const VIEW_META: Partial<Record<ViewType, { eyebrow: string; title: string; description: string }>> = {
  menu: {
    eyebrow: 'Customer Ordering',
    title: 'Menu',
    description: 'Browse categories, build a cart, and place orders by table.',
  },
  admin: {
    eyebrow: 'Operations',
    title: 'Operations',
    description: 'Manage categories, menu items, tables, and active orders.',
  },
  kitchen: {
    eyebrow: 'Service',
    title: 'Orders',
    description: 'Track incoming orders and mark them served once they are handed over.',
  },
  dashboard: {
    eyebrow: 'Reporting',
    title: 'Dashboard',
    description: 'Review revenue, order trends, and top-performing items.',
  },
  staff_mgmt: {
    eyebrow: 'Team',
    title: 'Staff Management',
    description: 'Review staff accounts and adjust access roles.',
  },
};

type CategoryRow = Database['public']['Tables']['categories']['Row'];
type MenuItemRow = Database['public']['Tables']['menu_items']['Row'];
type TableRow = Database['public']['Tables']['restaurant_tables']['Row'];
type RestaurantSettingsRow = Database['public']['Tables']['restaurant_settings']['Row'];
type OrderRow = Database['public']['Tables']['orders']['Row'];

const BILLABLE_ORDER_STATUSES: Order['status'][] = ['served'];

const mapMenuItemRow = (item: MenuItemRow): MenuItem => ({
  id: item.id,
  name: item.name,
  desc: item.description || '',
  price: item.price,
  image: item.image || '🍽️',
  available: item.available,
  sortOrder: item.sort_order
});

const mapCategoryRows = (categories: CategoryRow[], items: MenuItemRow[]): Category[] =>
  categories.map((category) => ({
    id: category.id,
    name: category.name,
    nameMy: category.name_my || '',
    icon: category.icon || '🍽️',
    sortOrder: category.sort_order,
    items: items
      .filter((item) => item.category_id === category.id)
      .map(mapMenuItemRow)
  }));

const mapTableRow = (table: TableRow): Table => ({
  id: table.id,
  name: table.name,
  desc: table.description || ''
});

const mapOrderRow = (row: OrderRow): Order => ({
  id: row.id,
  table: row.table_id,
  items: row.items as CartItem[],
  total: row.total,
  time: row.time,
  status: row.status as Order['status'],
  created_by: row.created_by ?? undefined,
  created_at: row.created_at
});

const sortOrders = (allOrders: Order[]) =>
  [...allOrders].sort((left, right) => {
    if (left.created_at && right.created_at) {
      return new Date(right.created_at).getTime() - new Date(left.created_at).getTime();
    }
    return right.id - left.id;
  });

const upsertOrderInState = (currentOrders: Order[], nextOrder: Order) =>
  sortOrders([nextOrder, ...currentOrders.filter((order) => order.id !== nextOrder.id)]);

const isBillableOrder = (order: Order) => BILLABLE_ORDER_STATUSES.includes(order.status);
const envWorkflowMode = getEnvWorkflowMode();
const isWorkflowManagedByEnv = envWorkflowMode !== null;

function App() {
  const { user, profile, loading: authLoading } = useAuth();
  const [lang, setLang] = useState<Language>("en");
  const [brand] = useState<Brand>(DEFAULT_BRAND);
  const [view, setView] = useState<ViewType>("login");
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>("starters");
  const [orderPlaced, setOrderPlaced] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode>(envWorkflowMode ?? DEFAULT_WORKFLOW_MODE);
  const [workflowSaving, setWorkflowSaving] = useState<WorkflowMode | null>(null);
  const prevPendingCount = useRef(0);
  const tablePickerRef = useRef<HTMLDivElement | null>(null);
  const tablePickerPanelId = useId();
  
  // Modals
  const [catModal, setCatModal] = useState<Partial<Category> | null>(null);
  const [itemModal, setItemModal] = useState<{ catId: string; item: Partial<MenuItem> } | null>(null);
  const [tableModal, setTableModal] = useState<Partial<Table> | null>(null);
  const [qrModal, setQrModal] = useState<Table | null>(null);
  const [billModal, setBillModal] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ msg: string; onConfirm: () => void } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);
  const [tablePickerOpen, setTablePickerOpen] = useState(false);

  const baseTranslations = translations[lang];
  const t = applyWorkflowTranslations(baseTranslations, lang, workflowMode);
  const scannedTableId = typeof window !== 'undefined'
    ? Number(new URLSearchParams(window.location.search).get('table'))
    : NaN;
  const isCustomerEntry = Number.isFinite(scannedTableId);
  const scannedTable = isCustomerEntry ? tables.find((tb) => tb.id === scannedTableId) : undefined;
  const effectiveSelectedTable = scannedTable?.id ?? selectedTable;
  const activeTable = tables.find((tb) => tb.id === effectiveSelectedTable);
  const hasSelectableTables = tables.length > 0;
  const activeTableName = activeTable?.name || String(effectiveSelectedTable);
  const activeTableDescription = activeTable?.desc?.trim();
  const guestCustomerMode = !user && isCustomerEntry;
  const staffPortalLabel = lang === "my" ? "ဝန်ထမ်း ဝင်ရန်" : "Staff Portal";
  const backToMenuLabel = lang === "my" ? "မီနူးသို့ ပြန်မည်" : "Back to Menu";
  const staffAccessHint = t.staffAccessHint;
  const customerOrderingHint = lang === "my"
    ? "ဝန်ထမ်း ဝင်ရောက်နေစဉ်အတွင်း ဖောက်သည်မှာယူမှုကို ဆက်လက်အသုံးပြုနိုင်သည်။"
    : "Customer ordering stays open while staff sign in.";
  const tablePickerTitle = lang === "my" ? "စားပွဲရွေးပါ" : "Choose a table";
  const tablePickerHint = scannedTable
    ? (lang === "my" ? "QR ကုဒ်ဖြင့် စားပွဲသတ်မှတ်ထားပါသည်။" : "Locked to the scanned QR table.")
    : (lang === "my" ? "ဒီအော်ဒါကို ဘယ်စားပွဲသို့ ပို့မလဲ ရွေးပါ။" : "Select where this order should be sent.");
  const tablePickerDisplayHint = activeTableDescription || tablePickerHint;
  const tablePickerOptionFallback = lang === "my" ? "မှာယူရန် အသင့်" : "Ready for ordering";
  const tablePickerSelectedLabel = lang === "my" ? "ရွေးထားသည်" : "Selected";
  const tablePickerCountLabel = lang === "my" ? `${tables.length} စားပွဲ` : `${tables.length} tables`;
  const tablePickerEmptyLabel = t.noTables;
  const customerModeLabel = lang === "my"
    ? `${t.tableLabel} ${activeTableName} · ဖောက်သည်`
    : `${t.tableLabel} ${activeTableName} · Customer`;
  const defaultRoleView = profile ? ROLE_ACCESS[profile.role]?.[0] ?? 'menu' : 'menu';
  const canManageMenu = profile?.role === 'admin';
  const canAdvanceOrders = profile?.role === 'admin' || profile?.role === 'kitchen';
  const canMarkPaid = profile?.role === 'admin' || profile?.role === 'cashier';
  const canDeleteOrders = profile?.role === 'admin';
  const roleLabels = {
    admin: t.roleAdmin,
    waiter: t.roleWaiter,
    kitchen: t.roleKitchen,
    cashier: t.roleCashier,
  } as const;
  const roleIcons = {
    admin: "👑",
    waiter: "🙋",
    kitchen: workflowMode === 'kitchen' ? "👨‍🍳" : "📋",
    cashier: "💳",
  } as const;
  const workflowLabel = workflowMode === 'kitchen' ? t.kitchenWorkflow : t.serviceWorkflow;

  // Check if user can access current view
  const canAccess = (v: ViewType) => {
    if (!profile) return v === "login" || v === "menu";
    if (v === "menu" || v === "order-success") return true;
    return ROLE_ACCESS[profile.role]?.includes(v) || false;
  };

  const resolvedView = useMemo<ViewType>(() => {
    if (authLoading) {
      return view;
    }

    if (!user) {
      if (isCustomerEntry) {
        if (view === "login" || view === "order-success") {
          return view;
        }
        return "menu";
      }
      return "login";
    }

    if (!profile) {
      return "login";
    }

    if (view === "login") {
      return defaultRoleView;
    }

    if (view === "menu" || view === "order-success") {
      return view;
    }

    return ROLE_ACCESS[profile.role]?.includes(view) ? view : defaultRoleView;
  }, [authLoading, defaultRoleView, isCustomerEntry, profile, user, view]);

  // Load categories and tables from Supabase
  const loadInitialData = useCallback(async () => {
    try {
      const [{ data: catsData }, { data: tblsData }, { data: itemsData }, { data: settingsData }] = await Promise.all([
        fetchCategories(),
        fetchTables(),
        fetchMenuItems(),
        fetchRestaurantSettings()
      ]);

      if (catsData && itemsData) {
        const enrichedCats = mapCategoryRows(catsData as CategoryRow[], itemsData as MenuItemRow[]);
        if (enrichedCats.length > 0) {
          setCategories(enrichedCats);
          setActiveCategory((current) =>
            enrichedCats.some((category) => category.id === current) ? current : enrichedCats[0].id
          );
        }
      }

      if (catsData && itemsData && catsData.length === 0) {
        const enrichedCats: Category[] = (catsData as CategoryRow[]).map((c) => ({
          id: c.id,
          name: c.name,
          nameMy: c.name_my || '',
          icon: c.icon || '🍽️',
          items: (itemsData as MenuItemRow[])
            .filter((i) => i.category_id === c.id)
            .map((i) => ({
              id: i.id,
              name: i.name,
              desc: i.description || '',
              price: i.price,
              image: i.image || '🍽️',
              available: i.available
            }))
        }));
        if (enrichedCats.length > 0) {
          setCategories(enrichedCats);
          setActiveCategory(enrichedCats[0].id);
        }
      }

      if (tblsData) {
        const mappedTables = (tblsData as TableRow[]).map(mapTableRow);
        if (mappedTables.length > 0) {
          setTables(mappedTables);
          setSelectedTable((current) =>
            mappedTables.some((table) => table.id === current) ? current : mappedTables[0].id
          );
        }
      }

      if (tblsData && tblsData.length === 0) {
        const mappedTables: Table[] = (tblsData as TableRow[]).map((t) => ({
          id: t.id,
          name: t.name,
          desc: t.description || ''
        }));
        if (mappedTables.length > 0) {
          setTables(mappedTables);
          setSelectedTable(mappedTables[0].id);
        }
      }

      if (envWorkflowMode) {
        setWorkflowMode(envWorkflowMode);
      } else if (settingsData) {
        const nextWorkflowMode = (settingsData as RestaurantSettingsRow).workflow_mode === 'kitchen'
          ? 'kitchen'
          : DEFAULT_WORKFLOW_MODE;
        setWorkflowMode(nextWorkflowMode);
      } else {
        setWorkflowMode(DEFAULT_WORKFLOW_MODE);
      }

      setDataLoaded(true);
    } catch (err) {
      console.error('Error loading initial data:', err);
    }
  }, []);

  useEffect(() => {
    if (authLoading || dataLoaded) {
      return;
    }

    const timerId = window.setTimeout(() => {
      void loadInitialData();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [authLoading, dataLoaded, loadInitialData]);

  useEffect(() => {
    if (!tablePickerOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (tablePickerRef.current && !tablePickerRef.current.contains(event.target as Node)) {
        setTablePickerOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setTablePickerOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [tablePickerOpen]);

  useEffect(() => {
    if (!scannedTable && resolvedView === 'menu') {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      setTablePickerOpen(false);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [resolvedView, scannedTable]);

  // Load orders from Supabase
  const loadOrders = useCallback(async () => {
    const { data, error } = await dbFetchOrders();

    if (error) {
      console.error('Error loading orders:', error);
      return;
    }

    if (data) {
      const loadedOrders = sortOrders((data as OrderRow[]).map(mapOrderRow));
      prevPendingCount.current = loadedOrders.filter((order) => order.status === "pending").length;
      setOrders(loadedOrders);
    }
  }, []);

  // Supabase real-time subscription
  useEffect(() => {
    if (!profile) {
      return;
    }

    const ordersChannel = supabase
      .channel(`orders-${profile.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const nextOrder = mapOrderRow(payload.new as OrderRow);
        setOrders((current) => upsertOrderInState(current, nextOrder));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const nextOrder = mapOrderRow(payload.new as OrderRow);
        setOrders((current) => upsertOrderInState(current, nextOrder));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'orders' }, (payload) => {
        const deletedOrder = payload.old as Pick<OrderRow, 'id'>;
        setOrders((current) => current.filter((order) => order.id !== deletedOrder.id));
      })
      .subscribe();

    const catalogChannel = supabase
      .channel(`catalog-${profile.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'categories' }, () => {
        void loadInitialData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'menu_items' }, () => {
        void loadInitialData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_tables' }, () => {
        void loadInitialData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurant_settings' }, () => {
        void loadInitialData();
      })
      .subscribe();

    const timerId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
      void supabase.removeChannel(ordersChannel);
      void supabase.removeChannel(catalogChannel);
    };
  }, [loadInitialData, loadOrders, profile]);

  // Notification system
  useEffect(() => {
    if (!profile) {
      prevPendingCount.current = 0;
      return;
    }

    const pendingCount = orders.filter((o) => o.status === "pending").length;
    if (pendingCount > prevPendingCount.current) {
      if (soundOn) playOrderAlert();
      const latest = orders.find((o) => o.status === "pending");
      if (latest) {
        const tableName = tables.find((tb) => tb.id === latest.table)?.name || latest.table;
        const msg = `🆕 ${t.newOrderAlert} ${t.tableLabel} ${tableName} — ${fmtMMK(latest.total)}`;
        window.setTimeout(() => {
          setNotifications((n) => [{ id: Date.now(), msg, time: new Date().toLocaleTimeString(), read: false }, ...n].slice(0, 50));
          setToast({ msg, type: "success" });
          window.setTimeout(() => setToast(null), 4000);
        }, 0);
      }
    }
    prevPendingCount.current = pendingCount;
  }, [orders, profile, soundOn, t, tables]);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getCatName = (cat: Category) => lang === "my" && cat.nameMy ? cat.nameMy : cat.name;

  const handleAuthSuccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setView("login");
    }
  };

  const handleLogout = async () => {
    await signOut();
    setNotifications([]);
    setOrders([]);
    setOrderPlaced(null);
    setCart([]);
    setConfirmModal(null);
    setCatModal(null);
    setItemModal(null);
    setTableModal(null);
    setQrModal(null);
    setBillModal(null);
    setToast(null);
    setDataLoaded(false);
    setWorkflowSaving(null);
    prevPendingCount.current = 0;
    setView(isCustomerEntry ? "menu" : "login");
  };

  const getBillableOrders = useCallback(
    (tableId: number) => orders.filter((order) => order.table === tableId && isBillableOrder(order)),
    [orders]
  );

  const saveWorkflowMode = async (nextMode: WorkflowMode) => {
    if (isWorkflowManagedByEnv) {
      showToast(t.workflowEnvLocked, 'error');
      return;
    }

    if (!canManageMenu || workflowSaving || nextMode === workflowMode) {
      return;
    }

    setWorkflowSaving(nextMode);
    const { data, error } = await upsertRestaurantSettings({ workflow_mode: nextMode });

    if (error) {
      console.error('Error updating workflow mode:', error);
      showToast(t.workflowSaveFailed, 'error');
      setWorkflowSaving(null);
      return;
    }

    const persistedMode = data?.workflow_mode === 'kitchen' ? 'kitchen' : DEFAULT_WORKFLOW_MODE;
    setWorkflowMode(persistedMode);
    showToast(t.workflowSaved);
    setWorkflowSaving(null);
  };

  // Print receipt function
  const printReceipt = (tableOrders: Order[], tableName: string) => {
    if (tableOrders.length === 0) {
      showToast("No served items are ready for billing yet.", "error");
      return;
    }

    const subtotal = tableOrders.reduce((s, o) => s + o.total, 0);
    const tax = Math.round(subtotal * 0.05);
    const grand = subtotal + tax;
    
    const merged = tableOrders.flatMap((o) => o.items).reduce((acc, item) => {
      const existing = acc.find((a) => a.id === item.id);
      if (existing) {
        existing.qty += item.qty;
        existing.sub += item.price * item.qty;
      } else {
        acc.push({ ...item, qty: item.qty, sub: item.price * item.qty });
      }
      return acc;
    }, [] as Array<{ id: number; name: string; image: string; qty: number; price: number; sub: number }>);

    const w = window.open("", "_blank", "width=420,height=640");
    if (!w) return;
    
    w.document.write(`<!DOCTYPE html><html><head><title>Receipt</title><style>
      body{font-family:monospace;padding:24px 20px;max-width:320px;margin:0 auto}
      h2{text-align:center;font-size:20px;margin-bottom:2px}.center{text-align:center}
      hr{border:none;border-top:1px dashed #999;margin:10px 0}
      .row{display:flex;justify-content:space-between;margin:4px 0;font-size:13px}
      .bold{font-weight:bold}.big{font-size:15px}
      .paid{text-align:center;font-size:20px;font-weight:900;margin-top:14px;border:3px solid #000;padding:8px;letter-spacing:3px}
      .foot{text-align:center;font-size:11px;color:#888;margin-top:14px}
    </style></head><body>
      <h2>${brand.logo} ${brand.name}</h2>
      <p class="center" style="font-size:12px;color:#666">${brand.tagline}</p>
      <hr/><div class="row"><span>${t.tableLabel}: ${tableName}</span><span>${tableOrders[0]?.time || ""}</span></div>
      <div class="row"><span>Order #${String(tableOrders[0]?.id || "").slice(-4)}</span></div><hr/>
      ${merged.map((i) => `<div class="row"><span>${i.image} ${i.name} x${i.qty}</span><span>${fmtMMK(i.sub)}</span></div>`).join("")}
      <hr/>
      <div class="row"><span>${t.subtotal}</span><span>${fmtMMK(subtotal)}</span></div>
      <div class="row" style="color:#777"><span>${t.tax}</span><span>${fmtMMK(tax)}</span></div><hr/>
      <div class="row bold big"><span>${t.grandTotal}</span><span>${fmtMMK(grand)}</span></div>
      ${tableOrders.every((o) => o.status === "paid") ? `<div class="paid">${t.billPaid}</div>` : ""}
      <p class="foot">Thank you for dining with us!</p>
      <script>window.onload=()=>window.print()</script>
    </body></html>`);
    w.document.close();
  };

  // Mark table as paid
  const markTablePaid = async (tableId: number) => {
    const billableOrders = getBillableOrders(tableId);
    
    if (billableOrders.length === 0) {
      showToast("No served items are ready for payment yet.", "error");
      return;
    }

    const { error } = await markOrdersPaid(billableOrders.map((order) => order.id));

    if (error) {
      showToast("Failed to record payment", "error");
      return;
    }
    
    setOrders((current) =>
      current.map((order) =>
        billableOrders.some((billableOrder) => billableOrder.id === order.id)
          ? { ...order, status: "paid" }
          : order
      )
    );
    setBillModal(null);
    showToast("Payment recorded! 💳");
  };

  // Category handlers
  const saveCat = async (form: Partial<Category>) => {
    const existingCategory = form.id ? categories.find((category) => category.id === form.id) : undefined;
    const { error } = await upsertCategory({
      id: form.id || 'cat-' + Date.now(),
      name: form.name || '',
      name_my: form.nameMy || '',
      icon: form.icon || '🍽️',
      sort_order: existingCategory?.sortOrder ?? form.sortOrder ?? categories.length + 1
    });

    if (error) {
      showToast("Error saving category: " + error.message, "error");
    } else {
      await loadInitialData();
      setCatModal(null);
      showToast("Category saved!");
    }
  };

  const deleteCat = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setConfirmModal({
      msg: cat && cat.items.length > 0 ? t.catHasItems : t.confirmDelete,
      onConfirm: async () => {
        const { error } = await dbDeleteCategory(id);
        if (error) {
          showToast("Error deleting: " + error.message, "error");
        } else {
          await loadInitialData();
          setConfirmModal(null);
          showToast("Deleted", "error");
        }
      }
    });
  };

  const moveCat = async (idx: number, direction: 'up' | 'down') => {
    const reorderedCategories = [...categories];
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= reorderedCategories.length) return;

    [reorderedCategories[idx], reorderedCategories[newIdx]] = [reorderedCategories[newIdx], reorderedCategories[idx]];
    setCategories(reorderedCategories.map((category, index) => ({ ...category, sortOrder: index + 1 })));

    const { error } = await reorderCategories(
      reorderedCategories.map((category, index) => ({
        id: category.id,
        name: category.name,
        name_my: category.nameMy,
        icon: category.icon,
        sort_order: index + 1
      }))
    );

    if (error) {
      showToast("Failed to save category order", "error");
      await loadInitialData();
      return;
    }

    showToast("Category order updated");
  };

  // Item handlers
  const saveItem = async (catId: string, item: Partial<MenuItem>) => {
    const category = categories.find((currentCategory) => currentCategory.id === catId);
    const existingItem = category?.items.find((currentItem) => currentItem.id === item.id);
    const nextSortOrder = existingItem?.sortOrder
      ?? item.sortOrder
      ?? ((category?.items.reduce((maxSortOrder, currentItem) => Math.max(maxSortOrder, currentItem.sortOrder ?? 0), 0) ?? 0) + 1);

    const { error } = await upsertMenuItem({
      id: item.id,
      category_id: catId,
      name: item.name || '',
      description: item.desc || '',
      price: item.price || 0,
      image: item.image || '🍽️',
      available: item.available ?? true,
      sort_order: nextSortOrder
    });

    if (error) {
      showToast("Error saving item: " + error.message, "error");
    } else {
      await loadInitialData();
      setItemModal(null);
      showToast("Item saved!");
    }
  };

  const moveItem = async (catId: string, itemId: number, direction: 'up' | 'down') => {
    const category = categories.find((currentCategory) => currentCategory.id === catId);
    if (!category) {
      return;
    }

    const reorderedItems = [...category.items];
    const currentIndex = reorderedItems.findIndex((item) => item.id === itemId);
    if (currentIndex === -1) {
      return;
    }

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= reorderedItems.length) {
      return;
    }

    [reorderedItems[currentIndex], reorderedItems[newIndex]] = [reorderedItems[newIndex], reorderedItems[currentIndex]];
    setCategories((currentCategories) =>
      currentCategories.map((currentCategory) =>
        currentCategory.id === catId
          ? {
              ...currentCategory,
              items: reorderedItems.map((currentItem, index) => ({ ...currentItem, sortOrder: index + 1 }))
            }
          : currentCategory
      )
    );

    const { error } = await reorderMenuItems(
      reorderedItems.map((currentItem, index) => ({
        id: currentItem.id,
        category_id: catId,
        name: currentItem.name,
        description: currentItem.desc,
        price: currentItem.price,
        image: currentItem.image,
        available: currentItem.available,
        sort_order: index + 1
      }))
    );

    if (error) {
      showToast("Failed to save item order", "error");
      await loadInitialData();
      return;
    }

    showToast("Item order updated");
  };

  const deleteItem = async (itemId: number) => {
    const { error } = await dbDeleteMenuItem(itemId);
    if (error) {
      showToast("Error deleting item: " + error.message, "error");
    } else {
      await loadInitialData();
      showToast("Deleted", "error");
    }
  };

  const toggleAvail = async (catId: string, itemId: number) => {
    const cat = categories.find(c => c.id === catId);
    const item = cat?.items.find(i => i.id === itemId);
    if (!item) return;

    const { error } = await upsertMenuItem({
      ...item,
      id: item.id,
      category_id: catId,
      name: item.name,
      description: item.desc,
      available: !item.available,
      sort_order: item.sortOrder ?? 0
    });

    if (!error) {
      await loadInitialData();
    }
  };

  // Table handlers
  const saveTable = async (form: Partial<Table>) => {
    const { error } = await upsertTable({
      id: form.id,
      name: form.name || '',
      description: form.desc || ''
    });

    if (error) {
      showToast("Error saving table: " + error.message, "error");
    } else {
      await loadInitialData();
      setTableModal(null);
      showToast("Table saved!");
    }
  };

  const deleteTable = (id: number) => {
    setConfirmModal({
      msg: t.confirmDelete,
      onConfirm: async () => {
        const { error } = await dbDeleteTable(id);
        if (error) {
          showToast("Error deleting table: " + error.message, "error");
        } else {
          await loadInitialData();
          setConfirmModal(null);
          showToast("Deleted", "error");
        }
      }
    });
  };

  // Cart handlers
  const addToCart = (item: MenuItem) => {
    setCart((p) => {
      const existing = p.find((i) => i.id === item.id);
      if (existing) {
        return p.map((i) => (i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...p, { ...item, qty: 1 }];
    });
    showToast(item.name + " " + t.addedToCart);
  };

  const removeFromCart = (id: number) => {
    setCart((p) => p.filter((i) => i.id !== id));
  };

  const updateQty = (id: number, delta: number) => {
    setCart((p) => p.map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty + delta) } : i)));
  };

  const cartTotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  // Order handlers
  const placeOrder = async () => {
    const order = {
      table_id: effectiveSelectedTable,
      items: cart,
      total: cartTotal,
      time: new Date().toLocaleTimeString(),
      status: "pending",
      created_by: user?.id ?? undefined
    };

    // Save to Supabase
    const { data, error } = await dbCreateOrder(order);

    if (error) {
      console.error('Error saving order:', error);
      showToast("Failed to place order", "error");
      return;
    }

    if (data) {
      const savedOrder = mapOrderRow(data as OrderRow);
      if (profile) {
        setOrders((current) => upsertOrderInState(current, savedOrder));
      }
      setOrderPlaced(savedOrder);
      setCart([]);
      setView("order-success");
    }
  };

  const updateOrderStatus = async (id: number, status: Order['status']) => {
    const { error } = await dbUpdateOrderStatus(id, status);

    if (error) {
      console.error('Error updating order:', error);
      showToast("Failed to update order", "error");
      return;
    }

    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const deleteOrder = async (id: number) => {
    const { error } = await dbDeleteOrder(id);

    if (error) {
      console.error('Error deleting order:', error);
      showToast("Failed to delete order", "error");
      return;
    }

    setOrders((p) => p.filter((o) => o.id !== id));
  };

  const statusConfig = {
    pending: { label: t.newOrder, bg: "#fef3c7", color: "#92400e", dot: "#f59e0b" },
    accepted: { label: t.preparing, bg: "#dbeafe", color: "#1e40af", dot: "#3b82f6" },
    served: { label: t.servedLabel, bg: "#fce7f3", color: "#9d174d", dot: "#ec4899" },
    paid: { label: t.paid, bg: "#dcfce7", color: "#166534", dot: "#22c55e" }
  };

  const navItems = [
    canAccess("admin") ? { view: "admin" as ViewType, label: t.adminTab } : null,
    { view: "menu" as ViewType, label: t.menuTab },
    canAccess("kitchen") ? { view: "kitchen" as ViewType, label: t.kitchenTab } : null,
    canAccess("dashboard") ? { view: "dashboard" as ViewType, label: t.dashboardTab } : null,
    canAccess("staff_mgmt") ? { view: "staff_mgmt" as ViewType, label: t.teamManagement } : null,
  ].filter(Boolean) as Array<{ view: ViewType; label: string }>;

  const currentViewMeta = resolvedView === "kitchen"
    ? {
        eyebrow: t.kitchenViewEyebrow,
        title: t.kitchenViewTitle,
        description: t.kitchenViewDescription,
      }
    : VIEW_META[resolvedView];
  const activeViewLabel = navItems.find((item) => item.view === resolvedView)?.label ?? currentViewMeta?.title ?? resolvedView;

  return (
    <div
      className="app-shell"
      style={{
        ["--brand-primary" as string]: brand.primary,
        ["--brand-accent" as string]: brand.accent,
        ["--brand-accent-dark" as string]: brand.accentDark,
      }}
    >
      <div className="app-shell__orb app-shell__orb--one" />
      <div className="app-shell__orb app-shell__orb--two" />
      <div className="app-shell__orb app-shell__orb--three" />
      {authLoading && (
        <div className="flex min-h-screen items-center justify-center px-6">
          <Card className="w-full max-w-sm border-slate-200 bg-white">
            <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
              <div
                className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
                style={{ background: `${brand.accent}22` }}
              >
                {brand.logo}
              </div>
              <p className="font-serif text-xl font-bold text-slate-900">Restoring workspace</p>
              <p className="text-sm text-slate-500">Checking your session and loading the latest restaurant data.</p>
            </CardContent>
          </Card>
        </div>
      )}

      {!authLoading && resolvedView === "login" && (
        <AuthScreenShadcn
          brand={brand}
          translations={t}
          workflowMode={workflowMode}
          onAuthSuccess={handleAuthSuccess}
          onBack={isCustomerEntry ? () => setView("menu") : undefined}
          backLabel={backToMenuLabel}
          contextLabel={guestCustomerMode ? customerModeLabel : undefined}
          supportHint={guestCustomerMode ? staffAccessHint : undefined}
        />
      )}

      {!authLoading && resolvedView !== "login" && (
        <>
          {toast && (
            <div className={`workspace-toast ${toast.type === "error" ? "workspace-toast--error" : "workspace-toast--success"}`}>
              {toast.msg}
            </div>
          )}

      {confirmModal && (
        <ConfirmModal
          message={confirmModal.msg}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
          cancelText={t.cancel}
          confirmText={t.del}
        />
      )}

      {catModal !== null && (
        <CategoryModalShadcn
          category={catModal}
          onSave={saveCat}
          onClose={() => setCatModal(null)}
          translations={t}
        />
      )}

      {itemModal && (
        <ItemModalShadcn
          item={itemModal.item}
          onSave={(item) => saveItem(itemModal.catId, item)}
          onClose={() => setItemModal(null)}
          translations={t}
        />
      )}

      {tableModal !== null && (
        <TableModalShadcn
          table={tableModal}
          onSave={saveTable}
          onClose={() => setTableModal(null)}
          translations={t}
        />
      )}

      {qrModal && (
        <QRModal
          table={qrModal}
          onClose={() => setQrModal(null)}
          translations={t}
        />
      )}

      {billModal !== null && (() => {
        const tableOrders = getBillableOrders(billModal);
        const tableName = tables.find((tb) => tb.id === billModal)?.name || String(billModal);
        return tableOrders.length > 0 ? (
          <BillModal
            tableOrders={tableOrders}
            tableName={tableName}
            onClose={() => setBillModal(null)}
            onMarkPaid={() => markTablePaid(billModal)}
            onPrintReceipt={() => printReceipt(tableOrders, tableName)}
            brand={brand}
            translations={t}
          />
        ) : null;
      })()}

      <nav className="workspace-nav">
        <div className="workspace-nav__brand">
          <span className="workspace-nav__logo">{brand.logo}</span>
          <div className="workspace-nav__brand-copy">
            <p className="workspace-nav__title">{brand.name}</p>
            <p className="workspace-nav__subtitle">Restaurant Builder</p>
          </div>
        </div>
        <div className="workspace-nav__actions">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => setView(item.view)}
              className={`workspace-nav__button ${resolvedView === item.view ? "is-active" : ""}`}
            >
              {item.label}
            </button>
          ))}
          {guestCustomerMode && (
            <button
              onClick={() => setView("login")}
              className="workspace-chip-button workspace-chip-button--solid"
            >
              {staffPortalLabel}
            </button>
          )}
          {profile && (
            <NotificationBellShadcn
              notifications={notifications}
              soundOn={soundOn}
              onToggleSound={() => setSoundOn((s) => !s)}
              onMarkAllRead={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
              brand={brand}
              translations={t}
            />
          )}
          <button
            onClick={() => setLang((l) => (l === "en" ? "my" : "en"))}
            className="workspace-chip-button"
          >
            {lang === "en" ? "🇲🇲" : "🇬🇧"}
          </button>
          {profile && (
            <div className="workspace-profile-pill">
              <span style={{ fontSize: 13 }}>
                {roleIcons[profile.role]}
              </span>
              <span className="workspace-profile-pill__name">
                {(profile.full_name || 'User').split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="workspace-profile-pill__logout"
              >
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </nav>

      <main className="workspace-main">
        {currentViewMeta && resolvedView !== "order-success" && (
          <Card className="workspace-overview mb-6">
            <CardContent className="flex flex-col gap-3 p-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.28em]" style={{ color: brand.accentDark }}>
                  {currentViewMeta.eyebrow}
                </p>
                <h1 className="mt-2 font-serif text-3xl font-bold text-slate-900">{currentViewMeta.title}</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-500">{currentViewMeta.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile && (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                    {roleLabels[profile.role]}
                  </Badge>
                )}
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  {workflowLabel}
                </Badge>
                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                  {activeViewLabel}
                </Badge>
                {resolvedView === "menu" && (
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-700">
                    {t.tableLabel} {tables.find((tb) => tb.id === effectiveSelectedTable)?.name || effectiveSelectedTable}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

      {resolvedView === "kitchen" && (
        <div className="view-frame fade-in">
          <KitchenDisplay
            orders={orders}
            tables={tables}
            onUpdateStatus={updateOrderStatus}
            brand={brand}
            translations={t}
            workflowMode={workflowMode}
          />
        </div>
      )}

      {resolvedView === "dashboard" && (
        <div className="view-frame fade-in">
          <Dashboard
            orders={orders}
            brand={brand}
            translations={t}
          />
        </div>
      )}

      {resolvedView === "staff_mgmt" && (
        <div className="view-frame fade-in">
          <StaffManagement
            brand={brand}
            translations={t}
            currentProfile={profile}
            workflowMode={workflowMode}
          />
        </div>
      )}

      {resolvedView === "menu" && (
        <div className="menu-view fade-in">
          <div className="menu-hero" style={{ background: `linear-gradient(135deg, ${brand.primary}, ${brand.accentDark})` }}>
            <div className="menu-hero__content">
              <div className="mb-2 text-5xl">{brand.logo}</div>
              <p className="menu-hero__eyebrow">{t.welcomeTo}</p>
              <h1 className="menu-hero__title">{brand.name}</h1>
              <p className="menu-hero__subtitle">{brand.tagline}</p>
              <div
                ref={tablePickerRef}
                className={`menu-table-picker ${scannedTable ? "is-locked" : tablePickerOpen ? "is-open" : ""}`}
              >
                <div className="menu-table-picker__hero">
                  <div className="menu-table-picker__icon" aria-hidden="true">
                    <span style={{ color: brand.accent }}>🪑</span>
                  </div>
                  <div className="menu-table-picker__copy">
                    <span className="menu-table-picker__label">{t.tableLabel}</span>
                    <span className="menu-table-picker__value">{activeTableName}</span>
                    <span className="menu-table-picker__hint">{tablePickerDisplayHint}</span>
                  </div>
                  <div className="menu-table-picker__control">
                    {scannedTable ? (
                      <div className="menu-table-picker__locked">
                        <span className="menu-table-picker__locked-badge">QR</span>
                        <span className="menu-table-picker__locked-text">{activeTableName}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="menu-table-picker__trigger"
                        onClick={() => hasSelectableTables && setTablePickerOpen((open) => !open)}
                        aria-haspopup="dialog"
                        aria-expanded={tablePickerOpen}
                        aria-controls={tablePickerPanelId}
                        aria-label={tablePickerTitle}
                        disabled={!hasSelectableTables}
                      >
                        <span className="menu-table-picker__trigger-copy">
                          <span className="menu-table-picker__trigger-label">{tablePickerTitle}</span>
                          <span className="menu-table-picker__trigger-value">
                            {hasSelectableTables ? activeTableName : tablePickerEmptyLabel}
                          </span>
                        </span>
                        <span className="menu-table-picker__chevron" aria-hidden="true">
                          {tablePickerOpen ? "▴" : "▾"}
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                {!scannedTable && tablePickerOpen && (
                  <div id={tablePickerPanelId} className="menu-table-picker__panel" role="group" aria-label={tablePickerTitle}>
                    <div className="menu-table-picker__panel-head">
                      <div>
                        <p className="menu-table-picker__panel-title">{tablePickerTitle}</p>
                        <p className="menu-table-picker__panel-subtitle">{tablePickerHint}</p>
                      </div>
                      <span className="menu-table-picker__panel-count">{tablePickerCountLabel}</span>
                    </div>
                    <div className="menu-table-picker__grid">
                      {tables.length === 0 ? (
                        <div className="menu-table-picker__empty">{tablePickerEmptyLabel}</div>
                      ) : (
                        tables.map((tb) => {
                          const isSelected = tb.id === effectiveSelectedTable;

                          return (
                            <button
                              key={tb.id}
                              type="button"
                              className={`menu-table-picker__option ${isSelected ? "is-selected" : ""}`}
                              onClick={() => {
                                setSelectedTable(tb.id);
                                setTablePickerOpen(false);
                              }}
                              aria-pressed={isSelected}
                            >
                              <span className="menu-table-picker__option-label">{t.tableLabel}</span>
                              <span className="menu-table-picker__option-value">{tb.name}</span>
                              <span className="menu-table-picker__option-desc">{tb.desc || tablePickerOptionFallback}</span>
                              {isSelected && (
                                <span className="menu-table-picker__option-badge">{tablePickerSelectedLabel}</span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              {guestCustomerMode && (
                <div className="menu-hero__actions">
                  <button
                    onClick={() => setView("login")}
                    className="menu-hero__staff-button"
                  >
                    {staffPortalLabel}
                  </button>
                  <p className="menu-hero__helper">{customerOrderingHint}</p>
                </div>
              )}
          </div>
        </div>

          <div className="menu-tab-strip">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`menu-tab ${activeCategory === cat.id ? "is-active" : ""}`}
              >
                {cat.icon} {getCatName(cat)}
              </button>
            ))}
          </div>

          <div className="menu-content">
            {categories
              .filter((c) => c.id === activeCategory)
              .map((cat) => (
                <div key={cat.id}>
                  <h2 className="menu-section-title">
                    {cat.icon} {getCatName(cat)}
                  </h2>
                  <div className="grid gap-3">
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        className="menu-item-card flex items-center gap-4 rounded-[28px] bg-white/94 p-5"
                        style={{ opacity: item.available ? 1 : 0.56 }}
                      >
                        <div className="menu-item-card__media text-center text-4xl" style={{ minWidth: 52 }}>{item.image}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <p className="text-[15px] font-extrabold text-slate-900">{item.name}</p>
                            {!item.available && (
                              <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700">
                                {t.unavailable}
                              </span>
                            )}
                          </div>
                          <p className="text-[13px] leading-6 text-stone-500">{item.desc}</p>
                        </div>
                        <div className="menu-item-card__aside text-right" style={{ minWidth: 110 }}>
                          <p className="menu-item-price">{fmtMMK(item.price)}</p>
                          {item.available && (
                            <button
                              onClick={() => addToCart(item)}
                              className="menu-item-action"
                            >
                              {t.addToCart}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>

          {cart.length > 0 && (
            <div className="menu-cart-dock">
              <div className="menu-cart-dock__inner">
                <div className="menu-cart-dock__summary">
                  <p className="text-[15px] font-extrabold text-slate-900">
                    🛒 {cartCount} {cartCount > 1 ? t.items : t.item}
                  </p>
                  <p className="text-lg font-extrabold" style={{ color: brand.accentDark }}>{fmtMMK(cartTotal)}</p>
                </div>
                <div className="menu-cart-dock__chips">
                  {cart.map((i) => (
                    <div key={i.id} className="menu-cart-chip">
                      <span>{i.image}</span>
                      <span>{i.name}</span>
                      <button
                        onClick={() => updateQty(i.id, -1)}
                        className="menu-cart-chip__circle"
                      >
                        −
                      </button>
                      <span className="menu-cart-chip__qty">{i.qty}</span>
                      <button
                        onClick={() => updateQty(i.id, 1)}
                        className="menu-cart-chip__circle menu-cart-chip__circle--accent"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(i.id)}
                        className="menu-cart-chip__remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={placeOrder}
                  className="menu-cart-dock__action"
                >
                  {t.placeOrder} · {t.tableLabel} {tables.find((tb) => tb.id === effectiveSelectedTable)?.name || effectiveSelectedTable}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {resolvedView === "order-success" && orderPlaced && (
        <div className="order-success-view fade-in">
          <div className="order-success-card p-12 text-center">
            <div className="mb-4 text-6xl">✅</div>
            <p className="mb-2 font-serif text-[26px] font-bold text-slate-900">
              {t.orderPlaced}
            </p>
            <p className="mb-6 text-sm text-stone-500">
              {t.tableLabel} {tables.find((tb) => tb.id === orderPlaced.table)?.name || orderPlaced.table} · {orderPlaced.time}
            </p>
            <div className="mb-6 rounded-3xl bg-[rgba(247,241,231,0.9)] p-5 text-left">
              {orderPlaced.items.map((i) => (
                <div
                  key={i.id}
                  className="flex justify-between border-b border-stone-200 py-1.5 text-sm"
                >
                  <span>
                    {i.image} {i.name} × {i.qty}
                  </span>
                  <span className="font-extrabold" style={{ color: brand.accentDark }}>{fmtMMK(i.price * i.qty)}</span>
                </div>
              ))}
              <div className="mt-3 flex justify-between text-base font-extrabold">
                <span>Total</span>
                <span style={{ color: brand.accentDark }}>{fmtMMK(orderPlaced.total)}</span>
              </div>
            </div>
            <p className="mb-6 text-sm text-stone-500">{t.yourFoodPrepared}</p>
            <button
              onClick={() => {
                setView("menu");
                setOrderPlaced(null);
              }}
              className="menu-item-action px-8 py-3 text-[15px]"
            >
              {t.orderMore}
            </button>
          </div>
        </div>
      )}

      {resolvedView === "admin" && (
        <div className="admin-view fade-in mx-auto max-w-[1100px] px-4 py-6">
          <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: t.tables, value: tables.length, icon: "🪑", bg: "#dbeafe" },
              { label: t.categories, value: categories.length, icon: "📂", bg: "#dcfce7" },
              { label: t.menuItems, value: categories.reduce((s, c) => s + c.items.length, 0), icon: "🍽️", bg: "#fef3c7" },
              { label: t.activeOrders, value: orders.filter((o) => o.status !== "paid").length, icon: "📋", bg: "#fce7f3" }
            ].map((stat) => (
              <div key={stat.label} className="workspace-stat-card flex items-center gap-3 px-5 py-4">
                <div style={{ background: stat.bg, borderRadius: 14, padding: 12, fontSize: 22 }}>{stat.icon}</div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ color: "#888", fontSize: 12 }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontFamily: "Georgia,serif", fontSize: 22, color: "#1a1a2e" }}>{t.manageCats}</h2>
                {canManageMenu && (
                  <button
                    onClick={() => setCatModal({})}
                    style={{
                      padding: "8px 18px",
                      borderRadius: 25,
                      border: "none",
                      background: brand.primary,
                      color: "white",
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: 700
                    }}
                  >
                    {t.addCategory}
                  </button>
                )}
              </div>
              {!canManageMenu && (
                <p style={{ marginBottom: 16, color: "#888", fontSize: 13 }}>
                  Menu and table configuration is admin-only. Cashier access here is read-only for billing support.
                </p>
              )}

              <div style={{ display: "grid", gap: 10, marginBottom: 32 }}>
                {categories.map((cat, idx) => (
                  <div key={cat.id} style={{ ...cardStyle, marginBottom: 16, overflow: "hidden" }}>
                    <div
                      style={{
                        padding: "12px 20px",
                        background: brand.primary,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 28 }}>{cat.icon}</span>
                        <div>
                          <p style={{ fontFamily: "Georgia,serif", color: brand.accent, fontWeight: 700, fontSize: 16 }}>
                            {getCatName(cat)}
                          </p>
                          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{cat.items.length} items</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            disabled={!canManageMenu || idx === 0}
                            onClick={() => moveCat(idx, "up")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.2)",
                              background: "rgba(255,255,255,0.1)",
                              cursor: !canManageMenu || idx === 0 ? "not-allowed" : "pointer",
                              color: !canManageMenu || idx === 0 ? "rgba(255,255,255,0.3)" : "white",
                              fontSize: 12
                            }}
                          >
                            ↑
                          </button>
                          <button
                            disabled={!canManageMenu || idx === categories.length - 1}
                            onClick={() => moveCat(idx, "down")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.2)",
                              background: "rgba(255,255,255,0.1)",
                              cursor: !canManageMenu || idx === categories.length - 1 ? "not-allowed" : "pointer",
                              color: !canManageMenu || idx === categories.length - 1 ? "rgba(255,255,255,0.3)" : "white",
                              fontSize: 12
                            }}
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          disabled={!canManageMenu}
                          onClick={() => setItemModal({ catId: cat.id, item: {} })}
                          style={{
                            padding: "5px 14px",
                            borderRadius: 20,
                            border: "none",
                            background: `linear-gradient(135deg,${brand.accent},${brand.accentDark})`,
                            color: "white",
                            cursor: canManageMenu ? "pointer" : "not-allowed",
                            fontSize: 12,
                            fontWeight: 700,
                            opacity: canManageMenu ? 1 : 0.5
                          }}
                        >
                          {t.addItem}
                        </button>
                        <button
                          disabled={!canManageMenu}
                          onClick={() => setCatModal(cat)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 15,
                            border: "1px solid rgba(255,255,255,0.3)",
                            background: "transparent",
                            color: "white",
                            cursor: canManageMenu ? "pointer" : "not-allowed",
                            fontSize: 11,
                            opacity: canManageMenu ? 1 : 0.5
                          }}
                        >
                          {t.edit}
                        </button>
                        <button
                          disabled={!canManageMenu}
                          onClick={() => deleteCat(cat.id)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 15,
                            border: "1px solid #fca5a5",
                            background: "white",
                            color: "#dc2626",
                            cursor: canManageMenu ? "pointer" : "not-allowed",
                            fontSize: 11,
                            opacity: canManageMenu ? 1 : 0.5
                          }}
                        >
                          {t.del}
                        </button>
                      </div>
                    </div>

                    {cat.items.length === 0 && (
                      <p style={{ padding: "16px 20px", color: "#bbb", fontSize: 13, fontStyle: "italic" }}>No items yet</p>
                    )}

                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: "12px 20px",
                          borderBottom: "1px solid #f5f0e8",
                          display: "flex",
                          alignItems: "center",
                          gap: 12
                        }}
                      >
                        <span style={{ fontSize: 24 }}>{item.image}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <p style={{ fontWeight: 600, fontSize: 14 }}>{item.name}</p>
                            <span
                              style={{
                                background: item.available ? "#dcfce7" : "#fee2e2",
                                color: item.available ? "#166534" : "#991b1b",
                                fontSize: 11,
                                fontWeight: 700,
                                padding: "2px 8px",
                                borderRadius: 20
                              }}
                            >
                              {item.available ? t.available : t.unavailable}
                            </span>
                          </div>
                          <p style={{ fontSize: 12, color: "#888" }}>{item.desc}</p>
                        </div>
                        <p style={{ fontWeight: 700, color: brand.accentDark, minWidth: 70, textAlign: "right", fontSize: 13 }}>
                          {fmtMMK(item.price)}
                        </p>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button
                            disabled={!canManageMenu}
                            onClick={() => moveItem(cat.id, item.id, "up")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 15,
                              border: "1px solid #ddd",
                              background: "white",
                              cursor: canManageMenu ? "pointer" : "not-allowed",
                              fontSize: 11,
                              opacity: canManageMenu ? 1 : 0.5
                            }}
                          >
                            ↑
                          </button>
                          <button
                            disabled={!canManageMenu}
                            onClick={() => moveItem(cat.id, item.id, "down")}
                            style={{
                              padding: "4px 8px",
                              borderRadius: 15,
                              border: "1px solid #ddd",
                              background: "white",
                              cursor: canManageMenu ? "pointer" : "not-allowed",
                              fontSize: 11,
                              opacity: canManageMenu ? 1 : 0.5
                            }}
                          >
                            ↓
                          </button>
                          <button
                            disabled={!canManageMenu}
                            onClick={() => toggleAvail(cat.id, item.id)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 15,
                              border: "1px solid #ddd",
                              background: "white",
                              cursor: canManageMenu ? "pointer" : "not-allowed",
                              fontSize: 11,
                              opacity: canManageMenu ? 1 : 0.5
                            }}
                          >
                            {item.available ? t.disable : t.enable}
                          </button>
                          <button
                            disabled={!canManageMenu}
                            onClick={() => setItemModal({ catId: cat.id, item })}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 15,
                              border: `1px solid ${brand.accent}`,
                              background: "white",
                              color: brand.accentDark,
                              cursor: canManageMenu ? "pointer" : "not-allowed",
                              fontSize: 11,
                              opacity: canManageMenu ? 1 : 0.5
                            }}
                          >
                            {t.edit}
                          </button>
                          <button
                            disabled={!canManageMenu}
                            onClick={() => deleteItem(item.id)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 15,
                              border: "1px solid #fca5a5",
                              background: "white",
                              color: "#dc2626",
                              cursor: canManageMenu ? "pointer" : "not-allowed",
                              fontSize: 11,
                              opacity: canManageMenu ? 1 : 0.5
                            }}
                          >
                            {t.del}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ ...cardStyle, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
                  <div>
                    <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e", marginBottom: 4 }}>
                      ⚙️ {t.workflowMode}
                    </h3>
                    <p style={{ color: "#888", fontSize: 12 }}>
                      {t.workflowModeDescription}
                    </p>
                  </div>
                  <span
                    style={{
                      background: "#f8f4eb",
                      color: brand.accentDark,
                      fontSize: 11,
                      fontWeight: 700,
                      padding: "5px 10px",
                      borderRadius: 999
                    }}
                  >
                    {workflowLabel}
                  </span>
                </div>
                <div style={{ display: "grid", gap: 10 }}>
                  {isWorkflowManagedByEnv && (
                    <p style={{ margin: 0, color: "#777", fontSize: 12 }}>
                      {t.workflowEnvHint}
                    </p>
                  )}
                  {[
                    {
                      value: "service_only" as WorkflowMode,
                      icon: "📋",
                      label: t.serviceWorkflow,
                      hint: t.serviceWorkflowHint
                    },
                    {
                      value: "kitchen" as WorkflowMode,
                      icon: "👨‍🍳",
                      label: t.kitchenWorkflow,
                      hint: t.kitchenWorkflowHint
                    }
                  ].map((option) => {
                    const isSelected = workflowMode === option.value;
                    const isSavingOption = workflowSaving === option.value;

                    return (
                      <button
                        key={option.value}
                        disabled={!canManageMenu || Boolean(workflowSaving) || isWorkflowManagedByEnv}
                        onClick={() => saveWorkflowMode(option.value)}
                        style={{
                          textAlign: "left",
                          padding: "14px 16px",
                          borderRadius: 18,
                          border: isSelected ? `2px solid ${brand.accent}` : "1px solid #e5e7eb",
                          background: isSelected ? "#fffaf1" : "white",
                          cursor: !canManageMenu || Boolean(workflowSaving) || isWorkflowManagedByEnv ? "not-allowed" : "pointer",
                          opacity: !canManageMenu || Boolean(workflowSaving) || isWorkflowManagedByEnv ? 0.75 : 1,
                          transition: "all 0.2s ease"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontSize: 24 }}>{option.icon}</span>
                            <div>
                              <p style={{ fontSize: 14, fontWeight: 700, color: "#1a1a2e", marginBottom: 4 }}>{option.label}</p>
                              <p style={{ fontSize: 12, color: "#777" }}>{option.hint}</p>
                            </div>
                          </div>
                          {isSelected && (
                            <span style={{ color: brand.accentDark, fontSize: 11, fontWeight: 700 }}>
                              {isSavingOption ? `${t.save}...` : "✓"}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ ...cardStyle, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e" }}>🪑 {t.tables}</h3>
                  {canManageMenu && (
                    <button
                      onClick={() => setTableModal({})}
                      style={{
                        padding: "5px 12px",
                        borderRadius: 20,
                        border: "none",
                        background: brand.primary,
                        color: "white",
                        cursor: "pointer",
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    >
                      {t.addTable}
                    </button>
                  )}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, maxHeight: 220, overflowY: "auto" }}>
                  {tables.map((tb) => (
                    <button
                      key={tb.id}
                      onClick={() => setQrModal(tb)}
                      style={{
                        padding: 10,
                        borderRadius: 10,
                        border: `1.5px solid ${brand.accent}`,
                        background: "white",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 4,
                        fontSize: 12,
                        color: brand.accentDark,
                        fontWeight: 600
                      }}
                    >
                      <QRCode tableId={tb.id} size={48} />
                      <span>
                        {t.tableLabel} {tb.name}
                      </span>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tables.map((tb) => (
                    <div
                      key={tb.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 4,
                        padding: "4px 8px",
                        borderRadius: 15,
                        background: "#f5f5f5",
                        fontSize: 11
                      }}
                    >
                      <span>{tb.name}</span>
                      <button
                        disabled={!canManageMenu}
                        onClick={() => setTableModal(tb)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: canManageMenu ? "pointer" : "not-allowed",
                          color: "#666",
                          fontSize: 10,
                          padding: 2,
                          opacity: canManageMenu ? 1 : 0.5
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        disabled={!canManageMenu}
                        onClick={() => deleteTable(tb.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: canManageMenu ? "pointer" : "not-allowed",
                          color: "#dc2626",
                          fontSize: 10,
                          padding: 2,
                          opacity: canManageMenu ? 1 : 0.5
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ ...cardStyle, padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e" }}>📋 {t.ordersTab}</h3>
                  {orders.filter((o) => o.status === "pending").length > 0 && (
                    <span
                      style={{
                        background: "#fef3c7",
                        color: "#92400e",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "2px 10px",
                        borderRadius: 20
                      }}
                    >
                      {orders.filter((o) => o.status === "pending").length} {t.newBadge}
                    </span>
                  )}
                </div>
                {orders.length === 0 ? (
                  <p style={{ color: "#aaa", fontSize: 13, textAlign: "center", padding: "16px 0" }}>{t.noOrders}</p>
                ) : (
                  orders.slice(0, 5).map((o) => {
                    const sc = statusConfig[o.status];
                    const billableCount = getBillableOrders(o.table).length;
                    const nextWorkflowStatus = getNextWorkflowStatus(workflowMode, o.status);
                    return (
                      <div key={o.id} style={{ padding: "10px 0", borderBottom: "1px solid #f5f0e8" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ fontWeight: 700, fontSize: 13 }}>
                              {t.tableLabel} {tables.find((tb) => tb.id === o.table)?.name || o.table}
                            </span>
                            <span
                              style={{
                                background: sc.bg,
                                color: sc.color,
                                fontSize: 10,
                                fontWeight: 700,
                                padding: "1px 8px",
                                borderRadius: 20
                              }}
                            >
                              {sc.label}
                            </span>
                          </div>
                          <span style={{ color: brand.accentDark, fontWeight: 700, fontSize: 12 }}>{fmtMMK(o.total)}</span>
                        </div>
                        <p style={{ fontSize: 11, color: "#bbb", marginBottom: 6 }}>🕐 {o.time}</p>
                        <div style={{ display: "flex", gap: 4, marginTop: 6, marginBottom: 6 }}>
                          <button
                            disabled={billableCount === 0}
                            onClick={() => setBillModal(o.table)}
                            style={{
                              flex: 1,
                              padding: "5px",
                              borderRadius: 6,
                              border: "1px solid #c9a96e",
                              background: "white",
                              color: "#a07840",
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: billableCount === 0 ? "not-allowed" : "pointer",
                              opacity: billableCount === 0 ? 0.5 : 1
                            }}
                          >
                            🧾 {t.generateBill}
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                          {nextWorkflowStatus && canAdvanceOrders && (
                            <button
                              onClick={() => updateOrderStatus(o.id, nextWorkflowStatus)}
                              style={{
                                flex: 1,
                                padding: "5px",
                                borderRadius: 6,
                                border: "none",
                                background: o.status === "pending" ? brand.primary : "#16a34a",
                                color: "white",
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              {o.status === "pending" ? t.acceptOrder : t.markServed}
                            </button>
                          )}
                          {o.status === "served" && canMarkPaid && (
                            <button
                              onClick={() => markTablePaid(o.table)}
                              style={{
                                flex: 1,
                                padding: "5px",
                                borderRadius: 6,
                                border: "none",
                                background: "#7c3aed",
                                color: "white",
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              {t.markPaid}
                            </button>
                          )}
                          {o.status === "paid" && (
                            <div
                              style={{
                                flex: 1,
                                padding: "5px",
                                borderRadius: 6,
                                background: "#f0fdf4",
                                border: "1px solid #bbf7d0",
                                textAlign: "center",
                                fontSize: 10,
                                color: "#166534",
                                fontWeight: 600
                              }}
                            >
                              {t.completed}
                            </div>
                          )}
                          <button
                            disabled={!canDeleteOrders}
                            onClick={() => deleteOrder(o.id)}
                            style={{
                              padding: "5px 8px",
                              borderRadius: 6,
                              border: "1px solid #fca5a5",
                              background: "white",
                              color: "#dc2626",
                              fontSize: 10,
                              cursor: canDeleteOrders ? "pointer" : "not-allowed",
                              opacity: canDeleteOrders ? 1 : 0.5
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
                {orders.length > 5 && (
                  <p style={{ fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 8 }}>+{orders.length - 5} more</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </main>
        </>
      )}
    </div>
  );
}

export default App;
