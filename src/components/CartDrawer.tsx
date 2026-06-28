import { Link } from "@tanstack/react-router";
import { X, Plus, Minus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";

export function CartDrawer() {
  const { open, setOpen, detailed, subtotal, setQty, remove, fmt } = useCart();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [rendered, setRendered] = useState(open);
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);
  const subtotalLabel = fmt(subtotal);

  const closeCart = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  useEffect(() => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }

    if (open) {
      setRendered(true);
      setClosing(false);
      window.setTimeout(() => closeRef.current?.focus(), 50);
      return;
    }

    if (rendered) {
      setClosing(true);
      closeTimer.current = window.setTimeout(() => {
        setRendered(false);
        setClosing(false);
        closeTimer.current = null;
      }, 220);
    }

    return () => {
      if (closeTimer.current) {
        window.clearTimeout(closeTimer.current);
        closeTimer.current = null;
      }
    };
  }, [open, rendered]);

  useEffect(() => {
    if (!rendered) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [rendered, closeCart]);

  if (!rendered) return null;
  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping bag"
    >
      <aside
        className={`pointer-events-auto absolute inset-y-0 right-0 flex h-full w-[min(88vw,420px)] flex-col overflow-hidden border-l bg-white shadow-2xl ${
          closing
            ? "animate-out slide-out-to-right duration-200"
            : "animate-in slide-in-from-right duration-300"
        }`}
      >
        <div className="flex items-center justify-between border-b px-4 py-4">
          <h2 className="font-display text-xl text-black">Cart</h2>
          <button
            ref={closeRef}
            onClick={closeCart}
            aria-label="Close"
            className="p-2 hover:rotate-90 transition-transform duration-300 rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {detailed.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-muted-foreground mb-4">Your bag is empty.</p>
              <button
                onClick={closeCart}
                className="inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-medium"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="divide-y">
              {detailed.map((it) => (
                <li
                  key={it.slug + it.size + it.color}
                  className="flex gap-3 p-4 animate-in fade-in slide-in-from-right-2 duration-200"
                >
                  <Link
                    to="/product/$slug"
                    params={{ slug: it.slug }}
                    onClick={closeCart}
                    className="shrink-0"
                  >
                    <img
                      src={it.product.images[0]}
                      alt={it.product.title}
                      className="h-24 w-20 rounded-lg border border-border/70 bg-white object-contain p-1.5"
                    />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between gap-2">
                      <Link
                        to="/product/$slug"
                        params={{ slug: it.slug }}
                        onClick={closeCart}
                        className="font-medium text-sm leading-snug line-clamp-2"
                      >
                        {it.product.title}
                      </Link>
                      <span className="shrink-0 text-sm font-medium">{fmt(it.lineTotal)}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {it.color}
                      {it.size ? ` / ${it.size}` : ""}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="inline-flex items-center rounded-full border border-border/80 bg-white">
                        <button
                          onClick={() => setQty(it.slug, it.size, it.color, it.qty - 1)}
                          className="p-1.5 hover:bg-muted rounded-l-full transition-colors"
                          aria-label="Decrease"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-3 text-sm tabular-nums">{it.qty}</span>
                        <button
                          onClick={() => setQty(it.slug, it.size, it.color, it.qty + 1)}
                          className="p-1.5 hover:bg-muted rounded-r-full transition-colors"
                          aria-label="Increase"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => remove(it.slug, it.size, it.color)}
                        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {detailed.length > 0 && (
          <div className="border-t p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-semibold tabular-nums">{subtotalLabel}</span>
            </div>
            <Link
              to="/checkout"
              onClick={closeCart}
              className="btn-cta w-full inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold"
            >
              Checkout - {fmt(subtotal)}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
