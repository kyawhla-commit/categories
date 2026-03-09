import { useState, useEffect, useRef } from 'react';
import type { Category, MenuItem, Language, Brand, Table, Order, CartItem, ViewType, Staff, Notification } from './types';
import { DEFAULT_BRAND, INITIAL_CATEGORIES, INITIAL_TABLES, DEFAULT_STAFF, ROLE_ACCESS } from './constants';
import { translations } from './translations';
import { CategoryModal } from './components/CategoryModal';
import { ItemModal } from './components/ItemModal';
import { ConfirmModal } from './components/ConfirmModal';
import { TableModal } from './components/TableModal';
import { QRModal } from './components/QRModal';
import { QRCode } from './components/QRCode';
import { BillModal } from './components/BillModal';
import { KitchenDisplay } from './components/KitchenDisplay';
import { Dashboard } from './components/Dashboard';
import { LoginScreen } from './components/LoginScreen';
import { NotificationBell } from './components/NotificationBell';
import { supabase } from './lib/supabase';
import { playOrderAlert } from './utils/sound';
import './App.css';

const fmtMMK = (n: number) => "MMK " + Number(n).toLocaleString();

const cardStyle: React.CSSProperties = {
  background: "white",
  borderRadius: 12,
  boxShadow: "0 2px 12px rgba(0,0,0,0.06)"
};

function App() {
  const [lang, setLang] = useState<Language>("en");
  const [brand] = useState<Brand>(DEFAULT_BRAND);
  const [view, setView] = useState<ViewType>("login");
  const [currentUser, setCurrentUser] = useState<Staff | null>(null);
  const [staff] = useState<Staff[]>(DEFAULT_STAFF);
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedTable, setSelectedTable] = useState<number>(1);
  const [activeCategory, setActiveCategory] = useState<string>("starters");
  const [orderPlaced, setOrderPlaced] = useState<Order | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const prevPendingCount = useRef(0);
  
  // Modals
  const [catModal, setCatModal] = useState<Partial<Category> | null>(null);
  const [itemModal, setItemModal] = useState<{ catId: string; item: Partial<MenuItem> } | null>(null);
  const [tableModal, setTableModal] = useState<Partial<Table> | null>(null);
  const [qrModal, setQrModal] = useState<Table | null>(null);
  const [billModal, setBillModal] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ msg: string; onConfirm: () => void } | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const t = translations[lang];

  // Check if user can access current view
  const canAccess = (v: ViewType) => {
    if (!currentUser) return v === "login" || v === "menu";
    if (v === "menu" || v === "order-success") return true;
    return ROLE_ACCESS[currentUser.role]?.includes(v) || false;
  };

  // Redirect if user doesn't have access
  useEffect(() => {
    const checkAccess = () => {
      if (!currentUser && view !== "login" && view !== "menu" && view !== "order-success") {
        setView("login");
      } else if (currentUser && view !== "menu" && view !== "order-success") {
        const accessible = ROLE_ACCESS[currentUser.role];
        if (accessible && !accessible.includes(view)) {
          if (accessible.length > 0) {
            setView(accessible[0]);
          }
        }
      }
    };
    checkAccess();
  }, [currentUser, view]);

  // Load orders from Supabase
  const loadOrders = async () => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading orders:', error);
      return;
    }

    if (data) {
      const loadedOrders: Order[] = data.map((row: { id: number; table_id: number; items: unknown; total: number; time: string; status: string }) => ({
        id: row.id,
        table: row.table_id,
        items: row.items as CartItem[],
        total: row.total,
        time: row.time,
        status: row.status as Order['status']
      }));
      setOrders(loadedOrders);
    }
  };

  // Supabase real-time subscription
  useEffect(() => {
    // Subscribe to new orders
    const channel = supabase
      .channel('orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
        const newOrder = payload.new as { id: number; table_id: number; items: unknown; total: number; time: string; status: string };
        const order: Order = {
          id: newOrder.id,
          table: newOrder.table_id,
          items: newOrder.items as CartItem[],
          total: newOrder.total,
          time: newOrder.time,
          status: newOrder.status as Order['status']
        };
        setOrders((prev) => [order, ...prev]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
        const updated = payload.new as { id: number; status: string };
        setOrders((prev) =>
          prev.map((o) =>
            o.id === updated.id
              ? { ...o, status: updated.status as Order['status'] }
              : o
          )
        );
      })
      .subscribe();

    // Load existing orders
    loadOrders();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Notification system
  useEffect(() => {
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    if (pendingCount > prevPendingCount.current) {
      if (soundOn) playOrderAlert();
      const latest = orders.find((o) => o.status === "pending");
      if (latest) {
        const tableName = tables.find((tb) => tb.id === latest.table)?.name || latest.table;
        const msg = `🆕 ${t.newOrderAlert} ${t.tableLabel} ${tableName} — ${fmtMMK(latest.total)}`;
        setNotifications((n) => [{ id: Date.now(), msg, time: new Date().toLocaleTimeString(), read: false }, ...n].slice(0, 50));
        setToast({ msg, type: "success" });
        setTimeout(() => setToast(null), 4000);
      }
    }
    prevPendingCount.current = pendingCount;
  }, [orders, soundOn, t, tables]);

  const showToast = (msg: string, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getCatName = (cat: Category) => lang === "my" && cat.nameMy ? cat.nameMy : cat.name;

  const handleLogin = (user: Staff) => {
    setCurrentUser(user);
    const accessible = ROLE_ACCESS[user.role];
    if (accessible && accessible.length > 0) {
      setView(accessible[0]);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView("login");
  };

  // Print receipt function
  const printReceipt = (tableId: number) => {
    const tableOrders = orders.filter((o) => o.table === tableId);
    const tableName = tables.find((tb) => tb.id === tableId)?.name || String(tableId);
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
  const markTablePaid = (tableId: number) => {
    setOrders((p) => p.map((o) => (o.table === tableId && o.status === "served" ? { ...o, status: "paid" } : o)));
    setBillModal(null);
    showToast("Payment recorded! 💳");
  };

  // Category handlers
  const saveCat = (form: Partial<Category>) => {
    if (form.id) {
      setCategories((p) => p.map((c) => (c.id === form.id ? { ...c, ...form } as Category : c)));
    } else {
      setCategories((p) => [...p, { ...form, id: "cat-" + Date.now(), items: [] } as Category]);
    }
    setCatModal(null);
    showToast("Category saved!");
  };

  const deleteCat = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    setConfirmModal({
      msg: cat && cat.items.length > 0 ? t.catHasItems : t.confirmDelete,
      onConfirm: () => {
        setCategories((p) => p.filter((c) => c.id !== id));
        setConfirmModal(null);
        showToast("Deleted", "error");
      }
    });
  };

  const moveCat = (idx: number, direction: 'up' | 'down') => {
    setCategories((p) => {
      const arr = [...p];
      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= arr.length) return arr;
      [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
      return arr;
    });
  };

  // Item handlers
  const saveItem = (catId: string, item: Partial<MenuItem>) => {
    setCategories((p) =>
      p.map((cat) =>
        cat.id === catId
          ? {
              ...cat,
              items: item.id
                ? cat.items.map((i) => (i.id === item.id ? item as MenuItem : i))
                : [...cat.items, { ...item, id: Date.now() } as MenuItem]
            }
          : cat
      )
    );
    setItemModal(null);
    showToast("Item saved!");
  };

  const deleteItem = (catId: string, itemId: number) => {
    setCategories((p) =>
      p.map((cat) =>
        cat.id === catId ? { ...cat, items: cat.items.filter((i) => i.id !== itemId) } : cat
      )
    );
    showToast("Deleted", "error");
  };

  const toggleAvail = (catId: string, itemId: number) => {
    setCategories((p) =>
      p.map((cat) =>
        cat.id === catId
          ? { ...cat, items: cat.items.map((i) => (i.id === itemId ? { ...i, available: !i.available } : i)) }
          : cat
      )
    );
  };

  // Table handlers
  const saveTable = (form: Partial<Table>) => {
    if (form.id) {
      setTables((p) => p.map((t) => (t.id === form.id ? { ...t, ...form } as Table : t)));
    } else {
      setTables((p) => [...p, { ...form, id: Date.now() } as Table]);
    }
    setTableModal(null);
    showToast("Table saved!");
  };

  const deleteTable = (id: number) => {
    setConfirmModal({
      msg: t.confirmDelete,
      onConfirm: () => {
        setTables((p) => p.filter((t) => t.id !== id));
        setConfirmModal(null);
        showToast("Deleted", "error");
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
    const order: Order = {
      id: Date.now(),
      table: selectedTable,
      items: cart,
      total: cartTotal,
      time: new Date().toLocaleTimeString(),
      status: "pending"
    };

    // Save to Supabase
    const { data, error } = await supabase
      .from('orders')
      .insert({
        table_id: order.table,
        items: order.items,
        total: order.total,
        time: order.time,
        status: order.status
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving order:', error);
      showToast("Failed to place order", "error");
      return;
    }

    if (data) {
      const savedOrder: Order = {
        id: data.id,
        table: data.table_id,
        items: data.items,
        total: data.total,
        time: data.time,
        status: data.status
      };
      setOrders((p) => [savedOrder, ...p]);
      setOrderPlaced(savedOrder);
      setCart([]);
      setView("order-success");
    }
  };

  const updateOrderStatus = async (id: number, status: Order['status']) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id);

    if (error) {
      console.error('Error updating order:', error);
      showToast("Failed to update order", "error");
      return;
    }

    setOrders((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
  };

  const deleteOrder = async (id: number) => {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

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

  return (
    <div style={{ fontFamily: "system-ui,'Noto Sans Myanmar',sans-serif", minHeight: "100vh", background: "#faf8f4" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Myanmar:wght@400;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: ${brand.accent}; border-radius: 3px; }
      `}</style>

      {view === "login" && (
        <LoginScreen
          staff={staff}
          brand={brand}
          onLogin={handleLogin}
          translations={t}
        />
      )}

      {view !== "login" && (
        <>
          {toast && (
        <div
          style={{
            position: "fixed",
            top: 20,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            padding: "12px 24px",
            borderRadius: 30,
            fontSize: 14,
            fontWeight: 600,
            background: toast.type === "error" ? "#fee2e2" : "#1a1a2e",
            color: toast.type === "error" ? "#991b1b" : "white",
            boxShadow: "0 4px 24px rgba(0,0,0,0.2)"
          }}
        >
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
        <CategoryModal
          category={catModal}
          onSave={saveCat}
          onClose={() => setCatModal(null)}
          translations={t}
        />
      )}

      {itemModal && (
        <ItemModal
          item={itemModal.item}
          onSave={(item) => saveItem(itemModal.catId, item)}
          onClose={() => setItemModal(null)}
          translations={t}
        />
      )}

      {tableModal !== null && (
        <TableModal
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
        const tableOrders = orders.filter((o) => o.table === billModal);
        const tableName = tables.find((tb) => tb.id === billModal)?.name || String(billModal);
        return tableOrders.length > 0 ? (
          <BillModal
            tableOrders={tableOrders}
            tableName={tableName}
            onClose={() => setBillModal(null)}
            onMarkPaid={() => markTablePaid(billModal)}
            onPrintReceipt={() => printReceipt(billModal)}
            brand={brand}
            translations={t}
          />
        ) : null;
      })()}

      <nav
        style={{
          background: brand.primary,
          padding: "0 16px",
          height: 60,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          zIndex: 100,
          boxShadow: "0 2px 20px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 22 }}>{brand.logo}</span>
          <div>
            <p style={{ fontFamily: "Georgia,serif", color: brand.accent, fontSize: 15, fontWeight: 700, lineHeight: 1 }}>
              {brand.name}
            </p>
            <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, letterSpacing: 1 }}>
              RESTAURANT BUILDER
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {canAccess("admin") && (
            <button
              onClick={() => setView("admin")}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: view === "admin" ? "white" : "transparent",
                color: view === "admin" ? brand.primary : "rgba(255,255,255,0.6)"
              }}
            >
              {t.adminTab}
            </button>
          )}
          <button
            onClick={() => setView("menu")}
            style={{
              padding: "5px 12px",
              borderRadius: 20,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              background: view === "menu" ? "white" : "transparent",
              color: view === "menu" ? brand.primary : "rgba(255,255,255,0.6)"
            }}
          >
            {t.menuTab}
          </button>
          {canAccess("kitchen") && (
            <button
              onClick={() => setView("kitchen")}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: view === "kitchen" ? "white" : "transparent",
                color: view === "kitchen" ? brand.primary : "rgba(255,255,255,0.6)"
              }}
            >
              {t.kitchenTab}
            </button>
          )}
          {canAccess("dashboard") && (
            <button
              onClick={() => setView("dashboard")}
              style={{
                padding: "5px 12px",
                borderRadius: 20,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background: view === "dashboard" ? "white" : "transparent",
                color: view === "dashboard" ? brand.primary : "rgba(255,255,255,0.6)"
              }}
            >
              {t.dashboardTab}
            </button>
          )}
          <NotificationBell
            notifications={notifications}
            soundOn={soundOn}
            onToggleSound={() => setSoundOn((s) => !s)}
            onMarkAllRead={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}
            brand={brand}
            translations={t}
          />
          <button
            onClick={() => setLang((l) => (l === "en" ? "my" : "en"))}
            style={{
              padding: "4px 10px",
              borderRadius: 20,
              border: `1px solid ${brand.accent}`,
              background: "transparent",
              color: brand.accent,
              cursor: "pointer",
              fontSize: 11,
              fontWeight: 700
            }}
          >
            {lang === "en" ? "🇲🇲" : "🇬🇧"}
          </button>
          {currentUser && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 4, padding: "4px 10px", borderRadius: 20, background: "rgba(255,255,255,0.08)" }}>
              <span style={{ fontSize: 13 }}>
                {currentUser.role === "admin" ? "👑" : currentUser.role === "kitchen" ? "👨‍🍳" : currentUser.role === "cashier" ? "💳" : "🙋"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, fontWeight: 600, maxWidth: 70, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {currentUser.name.split(" ")[0]}
              </span>
              <button
                onClick={handleLogout}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "rgba(255,255,255,0.35)",
                  cursor: "pointer",
                  fontSize: 11
                }}
              >
                {t.logout}
              </button>
            </div>
          )}
        </div>
      </nav>

      {view === "kitchen" && (
        <KitchenDisplay
          orders={orders}
          tables={tables}
          onUpdateStatus={updateOrderStatus}
          brand={brand}
          translations={t}
        />
      )}

      {view === "dashboard" && (
        <Dashboard
          orders={orders}
          brand={brand}
          translations={t}
        />
      )}

      {view === "menu" && (
        <div className="fade-in" style={{ maxWidth: 800, margin: "0 auto", paddingBottom: 120 }}>
          <div style={{ background: `linear-gradient(135deg,${brand.primary},${brand.primary}dd)`, padding: "36px 24px 28px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 6 }}>{brand.logo}</div>
            <p style={{ color: brand.accent, fontSize: 11, letterSpacing: 3, marginBottom: 6 }}>{t.welcomeTo}</p>
            <h1 style={{ fontFamily: "Georgia,serif", color: "white", fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{brand.name}</h1>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, fontStyle: "italic", marginBottom: 18 }}>{brand.tagline}</p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.1)", borderRadius: 30, padding: "8px 20px" }}>
              <span style={{ color: brand.accent }}>🪑</span>
              <span style={{ color: "white", fontSize: 14 }}>{t.tableLabel}</span>
              <select
                value={selectedTable}
                onChange={(e) => setSelectedTable(Number(e.target.value))}
                style={{ background: "transparent", border: "none", color: brand.accent, fontSize: 16, fontWeight: 700, outline: "none", cursor: "pointer" }}
              >
                {tables.map((tb) => (
                  <option key={tb.id} value={tb.id} style={{ color: "#1a1a2e" }}>
                    {tb.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ background: "white", borderBottom: "1px solid #eee", display: "flex", overflowX: "auto", position: "sticky", top: 60, zIndex: 50 }}>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: "14px 16px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: activeCategory === cat.id ? 700 : 400,
                  color: activeCategory === cat.id ? brand.accentDark : "#666",
                  borderBottom: activeCategory === cat.id ? `2.5px solid ${brand.accent}` : "2.5px solid transparent",
                  whiteSpace: "nowrap",
                  transition: "all 0.2s"
                }}
              >
                {cat.icon} {getCatName(cat)}
              </button>
            ))}
          </div>

          <div style={{ padding: "20px 16px" }}>
            {categories
              .filter((c) => c.id === activeCategory)
              .map((cat) => (
                <div key={cat.id}>
                  <h2 style={{ fontFamily: "Georgia,serif", fontSize: 22, color: "#1a1a2e", marginBottom: 16, paddingBottom: 8, borderBottom: "1px solid #e8e0d0" }}>
                    {cat.icon} {getCatName(cat)}
                  </h2>
                  <div style={{ display: "grid", gap: 12 }}>
                    {cat.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          ...cardStyle,
                          padding: "16px 20px",
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          opacity: item.available ? 1 : 0.5
                        }}
                      >
                        <div style={{ fontSize: 36, minWidth: 48, textAlign: "center" }}>{item.image}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <p style={{ fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>{item.name}</p>
                            {!item.available && (
                              <span style={{ background: "#fee2e2", color: "#991b1b", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                                {t.unavailable}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color: "#888", lineHeight: 1.4 }}>{item.desc}</p>
                        </div>
                        <div style={{ textAlign: "right", minWidth: 90 }}>
                          <p style={{ fontSize: 16, fontWeight: 700, color: brand.accentDark, marginBottom: 8 }}>{fmtMMK(item.price)}</p>
                          {item.available && (
                            <button
                              onClick={() => addToCart(item)}
                              style={{
                                padding: "6px 16px",
                                borderRadius: 20,
                                border: "none",
                                background: `linear-gradient(135deg,${brand.accent},${brand.accentDark})`,
                                color: "white",
                                cursor: "pointer",
                                fontSize: 13,
                                fontWeight: 700
                              }}
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
            <div
              style={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                background: "white",
                borderTop: "1px solid #eee",
                padding: "14px 20px",
                boxShadow: "0 -4px 20px rgba(0,0,0,0.1)",
                zIndex: 200
              }}
            >
              <div style={{ maxWidth: 800, margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <p style={{ fontWeight: 700, fontSize: 15 }}>
                    🛒 {cartCount} {cartCount > 1 ? t.items : t.item}
                  </p>
                  <p style={{ fontWeight: 700, color: brand.accentDark, fontSize: 18 }}>{fmtMMK(cartTotal)}</p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                  {cart.map((i) => (
                    <div
                      key={i.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        background: "#faf8f4",
                        borderRadius: 20,
                        padding: "4px 12px",
                        fontSize: 13
                      }}
                    >
                      <span>{i.image}</span>
                      <span>{i.name}</span>
                      <button
                        onClick={() => updateQty(i.id, -1)}
                        style={{
                          background: "#e5e7eb",
                          border: "none",
                          borderRadius: "50%",
                          width: 18,
                          height: 18,
                          cursor: "pointer",
                          fontSize: 11
                        }}
                      >
                        −
                      </button>
                      <span style={{ fontWeight: 700 }}>{i.qty}</span>
                      <button
                        onClick={() => updateQty(i.id, 1)}
                        style={{
                          background: brand.accent,
                          border: "none",
                          borderRadius: "50%",
                          width: 18,
                          height: 18,
                          cursor: "pointer",
                          fontSize: 11,
                          color: "white"
                        }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeFromCart(i.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#ccc",
                          fontSize: 14
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={placeOrder}
                  style={{
                    width: "100%",
                    padding: 14,
                    borderRadius: 30,
                    border: "none",
                    background: `linear-gradient(135deg,${brand.accent},${brand.accentDark})`,
                    color: "white",
                    cursor: "pointer",
                    fontSize: 16,
                    fontWeight: 700
                  }}
                >
                  {t.placeOrder} · {t.tableLabel} {tables.find((tb) => tb.id === selectedTable)?.name || selectedTable}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {view === "order-success" && orderPlaced && (
        <div className="fade-in" style={{ maxWidth: 500, margin: "60px auto", padding: 24, textAlign: "center" }}>
          <div style={{ ...cardStyle, padding: 48 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 26, fontWeight: 700, color: "#1a1a2e", marginBottom: 8 }}>
              {t.orderPlaced}
            </p>
            <p style={{ color: "#888", marginBottom: 24 }}>
              {t.tableLabel} {tables.find((tb) => tb.id === orderPlaced.table)?.name || orderPlaced.table} · {orderPlaced.time}
            </p>
            <div style={{ background: "#faf8f4", borderRadius: 12, padding: 20, marginBottom: 24, textAlign: "left" }}>
              {orderPlaced.items.map((i) => (
                <div
                  key={i.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #eee",
                    fontSize: 14
                  }}
                >
                  <span>
                    {i.image} {i.name} × {i.qty}
                  </span>
                  <span style={{ fontWeight: 700, color: brand.accentDark }}>{fmtMMK(i.price * i.qty)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 12, fontWeight: 700, fontSize: 16 }}>
                <span>Total</span>
                <span style={{ color: brand.accentDark }}>{fmtMMK(orderPlaced.total)}</span>
              </div>
            </div>
            <p style={{ color: "#888", fontSize: 14, marginBottom: 24 }}>{t.yourFoodPrepared}</p>
            <button
              onClick={() => {
                setView("menu");
                setOrderPlaced(null);
              }}
              style={{
                padding: "12px 32px",
                borderRadius: 30,
                border: "none",
                background: `linear-gradient(135deg,${brand.accent},${brand.accentDark})`,
                color: "white",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 700
              }}
            >
              {t.orderMore}
            </button>
          </div>
        </div>
      )}

      {view === "admin" && (
        <div className="fade-in" style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 22 }}>
            {[
              { label: t.tables, value: tables.length, icon: "🪑", bg: "#dbeafe" },
              { label: t.categories, value: categories.length, icon: "📂", bg: "#dcfce7" },
              { label: t.menuItems, value: categories.reduce((s, c) => s + c.items.length, 0), icon: "🍽️", bg: "#fef3c7" },
              { label: t.activeOrders, value: orders.filter((o) => o.status !== "paid").length, icon: "📋", bg: "#fce7f3" }
            ].map((stat) => (
              <div key={stat.label} style={{ ...cardStyle, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ background: stat.bg, borderRadius: 10, padding: 10, fontSize: 22 }}>{stat.icon}</div>
                <div>
                  <p style={{ fontSize: 24, fontWeight: 700, color: "#1a1a2e", lineHeight: 1 }}>{stat.value}</p>
                  <p style={{ color: "#888", fontSize: 12 }}>{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h2 style={{ fontFamily: "Georgia,serif", fontSize: 22, color: "#1a1a2e" }}>{t.manageCats}</h2>
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
              </div>

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
                            disabled={idx === 0}
                            onClick={() => moveCat(idx, "up")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.2)",
                              background: "rgba(255,255,255,0.1)",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                              color: idx === 0 ? "rgba(255,255,255,0.3)" : "white",
                              fontSize: 12
                            }}
                          >
                            ↑
                          </button>
                          <button
                            disabled={idx === categories.length - 1}
                            onClick={() => moveCat(idx, "down")}
                            style={{
                              padding: "3px 8px",
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.2)",
                              background: "rgba(255,255,255,0.1)",
                              cursor: idx === categories.length - 1 ? "not-allowed" : "pointer",
                              color: idx === categories.length - 1 ? "rgba(255,255,255,0.3)" : "white",
                              fontSize: 12
                            }}
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          onClick={() => setItemModal({ catId: cat.id, item: {} })}
                          style={{
                            padding: "5px 14px",
                            borderRadius: 20,
                            border: "none",
                            background: `linear-gradient(135deg,${brand.accent},${brand.accentDark})`,
                            color: "white",
                            cursor: "pointer",
                            fontSize: 12,
                            fontWeight: 700
                          }}
                        >
                          {t.addItem}
                        </button>
                        <button
                          onClick={() => setCatModal(cat)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 15,
                            border: "1px solid rgba(255,255,255,0.3)",
                            background: "transparent",
                            color: "white",
                            cursor: "pointer",
                            fontSize: 11
                          }}
                        >
                          {t.edit}
                        </button>
                        <button
                          onClick={() => deleteCat(cat.id)}
                          style={{
                            padding: "5px 12px",
                            borderRadius: 15,
                            border: "1px solid #fca5a5",
                            background: "white",
                            color: "#dc2626",
                            cursor: "pointer",
                            fontSize: 11
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
                            onClick={() => toggleAvail(cat.id, item.id)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 15,
                              border: "1px solid #ddd",
                              background: "white",
                              cursor: "pointer",
                              fontSize: 11
                            }}
                          >
                            {item.available ? t.disable : t.enable}
                          </button>
                          <button
                            onClick={() => setItemModal({ catId: cat.id, item })}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 15,
                              border: `1px solid ${brand.accent}`,
                              background: "white",
                              color: brand.accentDark,
                              cursor: "pointer",
                              fontSize: 11
                            }}
                          >
                            {t.edit}
                          </button>
                          <button
                            onClick={() => deleteItem(cat.id, item.id)}
                            style={{
                              padding: "4px 10px",
                              borderRadius: 15,
                              border: "1px solid #fca5a5",
                              background: "white",
                              color: "#dc2626",
                              cursor: "pointer",
                              fontSize: 11
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
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, color: "#1a1a2e" }}>🪑 {t.tables}</h3>
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
                      <QRCode tableNum={tb.name} size={48} />
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
                        onClick={() => setTableModal(tb)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#666",
                          fontSize: 10,
                          padding: 2
                        }}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTable(tb.id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          color: "#dc2626",
                          fontSize: 10,
                          padding: 2
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
                              cursor: "pointer"
                            }}
                          >
                            🧾 {t.generateBill}
                          </button>
                        </div>
                        <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                          {o.status === "pending" && (
                            <button
                              onClick={() => updateOrderStatus(o.id, "accepted")}
                              style={{
                                flex: 1,
                                padding: "5px",
                                borderRadius: 6,
                                border: "none",
                                background: brand.primary,
                                color: "white",
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              {t.acceptOrder}
                            </button>
                          )}
                          {o.status === "accepted" && (
                            <button
                              onClick={() => updateOrderStatus(o.id, "served")}
                              style={{
                                flex: 1,
                                padding: "5px",
                                borderRadius: 6,
                                border: "none",
                                background: "#16a34a",
                                color: "white",
                                fontSize: 10,
                                fontWeight: 700,
                                cursor: "pointer"
                              }}
                            >
                              {t.markServed}
                            </button>
                          )}
                          {o.status === "served" && (
                            <button
                              onClick={() => updateOrderStatus(o.id, "paid")}
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
                            onClick={() => deleteOrder(o.id)}
                            style={{
                              padding: "5px 8px",
                              borderRadius: 6,
                              border: "1px solid #fca5a5",
                              background: "white",
                              color: "#dc2626",
                              fontSize: 10,
                              cursor: "pointer"
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
        </>
      )}
    </div>
  );
}

export default App;
