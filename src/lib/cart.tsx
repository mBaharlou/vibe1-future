import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from "react";
import { SHOP } from "../config/shop";
import { productById, type Product } from "../data/products";
import { useGate } from "./gate";

// The showcase cart: product id → quantity, kept in localStorage (so it survives a refresh) and
// shared live with the other tabs through the "storage" event. Passing the age gate adds a discount
// (src/lib/gate.ts) on every product. No payments, no backend.

type Quantities = Record<string, number>;
export type CartLine = { product: Product; qty: number };

type Cart = {
  lines: CartLine[];
  count: number;
  /** Before the discount. */
  subtotal: number;
  /** 0.1 for 10% off once the age gate is passed, else 0. */
  rate: number;
  discount: number;
  total: number;
  qtyOf: (id: string) => number;
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  /** Counts landings (ping), so the badge can play its bump when a thumbnail arrives. */
  bump: number;
  ping: () => void;
  /** The cart button: where the fly-to-cart thumbnail lands. */
  targetRef: RefObject<HTMLButtonElement | null>;
};

const CartContext = createContext<Cart | null>(null);

function load(): Quantities {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(SHOP.storageKey) ?? "{}");
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).filter(
        (entry): entry is [string, number] => typeof entry[1] === "number" && entry[1] > 0 && !!productById(entry[0]),
      ),
    );
  } catch {
    return {};
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [quantities, setQuantities] = useState<Quantities>(load);
  const [bump, setBump] = useState(0);
  const targetRef = useRef<HTMLButtonElement>(null);
  const rate = useGate().discount;
  // Changes that came from another tab aren't written back.
  const external = useRef(false);

  useEffect(() => {
    if (external.current) {
      external.current = false;
      return;
    }
    try {
      localStorage.setItem(SHOP.storageKey, JSON.stringify(quantities));
    } catch {
      // Storage blocked: the cart still works for this page view.
    }
  }, [quantities]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SHOP.storageKey) return;
      external.current = true;
      setQuantities(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setQuantities((q) => {
      const next = { ...q };
      if (qty > 0) next[id] = Math.min(99, qty);
      else delete next[id];
      return next;
    });
  }, []);

  const add = useCallback((id: string) => {
    setQuantities((q) => ({ ...q, [id]: Math.min(99, (q[id] ?? 0) + 1) }));
  }, []);
  const ping = useCallback(() => setBump((b) => b + 1), []);

  const value = useMemo<Cart>(() => {
    const lines = Object.entries(quantities).flatMap(([id, qty]) => {
      const product = productById(id);
      return product ? [{ product, qty }] : [];
    });
    const subtotal = lines.reduce((s, l) => s + l.qty * l.product.price, 0);
    const discount = Math.round(subtotal * rate * 100) / 100;
    return {
      lines,
      count: lines.reduce((s, l) => s + l.qty, 0),
      subtotal,
      rate,
      discount,
      total: subtotal - discount,
      qtyOf: (id) => quantities[id] ?? 0,
      add,
      setQty,
      remove: (id) => setQty(id, 0),
      clear: () => setQuantities({}),
      bump,
      ping,
      targetRef,
    };
  }, [quantities, add, setQty, bump, ping, rate]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  if (!cart) throw new Error("useCart outside CartProvider");
  return cart;
}
