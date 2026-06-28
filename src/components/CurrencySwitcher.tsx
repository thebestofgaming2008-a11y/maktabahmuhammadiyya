import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Globe } from "lucide-react";
import { CURRENCIES, useCart, type CurrencyCode } from "@/lib/cart";

export function CurrencySwitcher({ tone = "light" }: { tone?: "light" | "dark" }) {
  const { currency, setCurrency } = useCart();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const triggerCls =
    tone === "light"
      ? "text-primary-foreground/90 hover:text-primary-foreground"
      : "text-foreground/80 hover:text-foreground";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] font-medium transition-colors ${triggerCls}`}
      >
        <Globe className="h-3.5 w-3.5 opacity-80" />
        <span>{currency}</span>
        <ChevronDown
          className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 top-full mt-2 min-w-[180px] rounded-lg border border-border bg-popover text-popover-foreground shadow-pop overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {CURRENCIES.map((c) => {
            const active = c.code === currency;
            return (
              <button
                key={c.code}
                role="option"
                aria-selected={active}
                onClick={() => {
                  setCurrency(c.code as CurrencyCode);
                  setOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm text-left hover:bg-muted transition-colors ${
                  active ? "font-medium" : ""
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="w-6 tabular-nums text-muted-foreground">{c.symbol}</span>
                  <span>{c.code}</span>
                  <span className="text-xs text-muted-foreground">· {c.label}</span>
                </span>
                {active && <Check className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
