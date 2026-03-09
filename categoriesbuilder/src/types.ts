export interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string;
  available: boolean;
}

export interface Category {
  id: string;
  name: string;
  nameMy: string;
  icon: string;
  items: MenuItem[];
}

export interface Table {
  id: number;
  name: string;
  desc: string;
}

export interface CartItem extends MenuItem {
  qty: number;
}

export interface Order {
  id: number;
  table: number;
  items: CartItem[];
  total: number;
  time: string;
  status: 'pending' | 'accepted' | 'served' | 'paid';
}

export interface Brand {
  name: string;
  tagline: string;
  logo: string;
  primary: string;
  accent: string;
  accentDark: string;
}

export interface Staff {
  id: number;
  name: string;
  pin: string;
  role: 'admin' | 'waiter' | 'kitchen' | 'cashier';
}

export interface Notification {
  id: number;
  msg: string;
  time: string;
  read: boolean;
}

export type Language = 'en' | 'my';

export type ViewType = 'admin' | 'menu' | 'order-success' | 'kitchen' | 'dashboard' | 'login';
