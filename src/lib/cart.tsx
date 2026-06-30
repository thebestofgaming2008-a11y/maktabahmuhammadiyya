import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { mapBackendProduct } from "@/lib/catalog";
import { listActiveProducts } from "@/services/productService";
import { products, type Product } from "./products";

export type CartItem = {
  slug: string;
  product?: Product;
  size?: string;
  color: string;
  qty: number;
};

export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "CAD" | "AUD";
export const CURRENCIES: { code: CurrencyCode; label: string; symbol: string; rate: number }[] = [
  { code: "INR", label: "Indian Rupee", symbol: "₹", rate: 1 },
  { code: "USD", label: "US Dollar", symbol: "$", rate: 0.012 },
  { code: "EUR", label: "Euro", symbol: "€", rate: 0.011 },
  { code: "GBP", label: "British Pound", symbol: "£", rate: 0.0095 },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$", rate: 0.016 },
  { code: "AUD", label: "Australian Dollar", symbol: "A$", rate: 0.018 },
];

type CartCtx = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (slug: string, size: string | undefined, color: string) => void;
  setQty: (slug: string, size: string | undefined, color: string, qty: number) => void;
  clear: () => void;
  open: boolean;
  setOpen: (o: boolean) => void;
  count: number;
  subtotal: number;
  detailed: (CartItem & { product: Product; lineTotal: number })[];
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  fmt: (inr: number) => string;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "maktabah-cart-v2";
const CUR_KEY = "maktabah-currency";

const sameLine = (a: CartItem, b: CartItem) =>
  a.slug === b.slug && a.size === b.size && a.color === b.color;

function cartStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");

  useEffect(() => {
    try {
      const store = cartStorage();
      const raw = store?.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
      const cur = store?.getItem(CUR_KEY) as CurrencyCode | null;
      if (cur && CURRENCIES.some((x) => x.code === cur)) setCurrencyState(cur);
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    listActiveProducts()
      .then((rows) => {
        if (!cancelled) {
          setCatalog(Array.isArray(rows) ? rows.map((row) => mapBackendProduct(row)) : []);
        }
      })
      .catch(() => {
        if (!cancelled) setCatalog([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      cartStorage()?.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items, hydrated]);

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      cartStorage()?.setItem(CUR_KEY, c);
    } catch {}
  }, []);

  const fmt = useCallback(
    (inr: number) => {
      if (!Number.isFinite(inr) || inr <= 0) return "₹0";
      const c = CURRENCIES.find((x) => x.code === currency)!;
      const v = inr * c.rate;
      try {
        return new Intl.NumberFormat(c.code === "INR" ? "en-IN" : "en-US", {
          style: "currency",
          currency: c.code,
          maximumFractionDigits: c.code === "INR" ? 0 : 2,
        }).format(v);
      } catch {
        const rounded = c.code === "INR" ? Math.round(v) : Number(v.toFixed(2));
        return `${c.symbol}${rounded.toLocaleString(c.code === "INR" ? "en-IN" : "en-US")}`;
      }
    },
    [currency],
  );

  const value = useMemo<CartCtx>(() => {
    const catalogBySlug = new Map(
      [...products, ...catalog].map((product) => [product.slug, product]),
    );
    const detailed = items
      .map((it) => {
        const product = catalogBySlug.get(it.slug) ?? it.product;
        return product ? { ...it, product, lineTotal: product.price * it.qty } : null;
      })
      .filter(Boolean) as CartCtx["detailed"];
    return {
      items,
      open,
      setOpen,
      add: (item) =>
        setItems((cur) => {
          const i = cur.findIndex((x) => sameLine(x, item));
          if (i > -1) {
            const next = [...cur];
            next[i] = { ...next[i], ...item, qty: next[i].qty + item.qty };
            return next;
          }
          return [...cur, item];
        }),
      remove: (slug, size, color) =>
        setItems((cur) => cur.filter((x) => !sameLine(x, { slug, size, color, qty: 0 }))),
      setQty: (slug, size, color, qty) =>
        setItems((cur) =>
          cur
            .map((x) => (sameLine(x, { slug, size, color, qty: 0 }) ? { ...x, qty } : x))
            .filter((x) => x.qty > 0),
        ),
      clear: () => setItems([]),
      count: detailed.reduce((n, x) => n + x.qty, 0),
      subtotal: detailed.reduce((n, x) => n + x.lineTotal, 0),
      detailed,
      currency,
      setCurrency,
      fmt,
    };
  }, [items, catalog, open, currency, setCurrency, fmt]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useCart = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useCart outside provider");
  return v;
};

/** Backwards-compatible INR formatter. Prefer `useCart().fmt` for live currency. */
export const formatPrice = (n: number) => {
  if (!Number.isFinite(n) || n <= 0) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};
