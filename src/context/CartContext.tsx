import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  productId: number; slug: string; name: string; sku: string | null; price: string | null;
  currency: string; image: string | null; quantity: number;
};

type CartContextValue = {
  items: CartItem[]; count: number; isOpen: boolean; setIsOpen: (open: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void; clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sitronics-kt-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); }, [items]);
  const value = useMemo<CartContextValue>(() => ({
    items, count: items.reduce((sum, item) => sum + item.quantity, 0), isOpen, setIsOpen,
    addItem: (item, quantity = 1) => {
      setItems((current) => {
        const existing = current.find((row) => row.productId === item.productId);
        if (existing) return current.map((row) => row.productId === item.productId ? { ...row, ...item, quantity: Math.min(99, row.quantity + quantity) } : row);
        return [...current, { ...item, quantity }];
      });
      setIsOpen(true);
    },
    updateQuantity: (productId, quantity) => setItems((current) => current.map((item) => item.productId === productId ? { ...item, quantity: Math.max(1, Math.min(99, quantity)) } : item)),
    removeItem: (productId) => setItems((current) => current.filter((item) => item.productId !== productId)),
    clearCart: () => setItems([]),
  }), [items, isOpen]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
