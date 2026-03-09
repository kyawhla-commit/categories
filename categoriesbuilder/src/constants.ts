import type { Brand, Category, Table, Staff, ViewType } from './types';

export const DEFAULT_BRAND: Brand = {
  name: "La Bella Cucina",
  tagline: "Authentic Italian Kitchen",
  logo: "🍽️",
  primary: "#1a1a2e",
  accent: "#c9a96e",
  accentDark: "#a07840"
};

export const DEFAULT_STAFF: Staff[] = [
  { id: 1, name: "Admin", pin: "0000", role: "admin" },
  { id: 2, name: "Marco (Waiter)", pin: "1111", role: "waiter" },
  { id: 3, name: "Chef Luigi", pin: "2222", role: "kitchen" },
  { id: 4, name: "Sara (Cashier)", pin: "3333", role: "cashier" },
];

export const ROLE_ACCESS: Record<Staff['role'], ViewType[]> = {
  admin: ["admin", "kitchen", "dashboard", "menu"],
  waiter: ["menu"],
  kitchen: ["kitchen"],
  cashier: ["admin", "dashboard"]
};

export const INITIAL_TABLES: Table[] = [
  { id: 1, name: "1", desc: "Window seat" },
  { id: 2, name: "2", desc: "Garden view" },
  { id: 3, name: "3", desc: "" },
  { id: 4, name: "4", desc: "" },
  { id: 5, name: "5", desc: "Private corner" },
  { id: 6, name: "6", desc: "" },
  { id: 7, name: "7", desc: "" },
  { id: 8, name: "8", desc: "Bar area" },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: "starters",
    name: "Starters",
    nameMy: "အစပျိုး",
    icon: "🥗",
    items: [
      { id: 1, name: "Bruschetta al Pomodoro", desc: "Toasted bread, tomatoes, basil", price: 3500, image: "🍅", available: true },
      { id: 2, name: "Burrata Caprese", desc: "Fresh burrata, heirloom tomatoes", price: 5500, image: "🧀", available: true },
      { id: 3, name: "Arancini", desc: "Crispy risotto balls, mozzarella", price: 4000, image: "🟡", available: true },
    ]
  },
  {
    id: "mains",
    name: "Main Course",
    nameMy: "အဓိကအစာ",
    icon: "🍝",
    items: [
      { id: 4, name: "Spaghetti Carbonara", desc: "Egg, pecorino, guanciale", price: 8500, image: "🍝", available: true },
      { id: 5, name: "Osso Buco Milanese", desc: "Braised veal shank, saffron risotto", price: 12000, image: "🥩", available: true },
      { id: 6, name: "Penne all'Arrabbiata", desc: "Spicy tomato sauce, garlic", price: 6500, image: "🌶️", available: true },
    ]
  },
  {
    id: "pizzas",
    name: "Pizzas",
    nameMy: "ပီဇာ",
    icon: "🍕",
    items: [
      { id: 8, name: "Margherita", desc: "San Marzano tomato, fior di latte", price: 6000, image: "🍕", available: true },
      { id: 9, name: "Diavola", desc: "Spicy salami, chili, mozzarella", price: 7000, image: "🌶️", available: true },
    ]
  },
  {
    id: "desserts",
    name: "Desserts",
    nameMy: "အချိုပွဲ",
    icon: "🍮",
    items: [
      { id: 11, name: "Tiramisu", desc: "Mascarpone, espresso, ladyfingers", price: 3800, image: "☕", available: true },
      { id: 12, name: "Panna Cotta", desc: "Vanilla cream, wild berry coulis", price: 3500, image: "🍮", available: true },
    ]
  },
];

export const EMOJI_ICONS = ["🥗", "🍝", "🍕", "🥩", "🐟", "🍮", "☕", "🍷", "🧀", "🌶️", "🍅", "🍞", "🥐", "🫕", "🍲", "🥘", "🍜", "🫔", "🍱", "🧆", "🥤", "🍵", "🧋", "🫙"];

export const ITEM_EMOJIS = ["🍝", "🍕", "🥗", "🥩", "🐟", "🍮", "☕", "🍷", "🧀", "🌶️", "🍅", "💧", "🟡", "🍞", "🥐", "🫕", "🍲", "🫙", "🍜", "🧆"];
