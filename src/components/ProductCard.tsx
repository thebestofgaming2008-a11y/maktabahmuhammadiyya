import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.compareAt && product.compareAt > product.price;
  const { add, setOpen, fmt } = useCart();
  const priceLabel = fmt(product.price);

  const quickAdd = () => {
    add({
      slug: product.slug,
      product,
      color: product.colors[0]?.name ?? "Default",
      size: product.sizes?.[0],
      qty: 1,
    });
    setOpen(true);
  };

  const discount = onSale ? Math.round((1 - product.price / product.compareAt!) * 100) : 0;

  return (
    <article className="group flex h-full flex-col">
      <Link
        to="/product/$slug"
        params={{ slug: product.slug }}
        className="block"
        aria-label={product.title}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/70 bg-[linear-gradient(145deg,#fffdf6_0%,#f7f0e4_52%,#efe2cf_100%)] shadow-[0_1px_0_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.86)] transition duration-300 group-hover:-translate-y-1 group-hover:border-foreground/20 group-hover:shadow-[0_16px_38px_-24px_rgba(86,56,24,0.42)]">
          <div className="pointer-events-none absolute inset-3 rounded-[1rem] border border-white/70" />
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="relative z-10 h-full w-full object-contain p-4 transition duration-500 ease-out group-hover:scale-[1.035] md:p-5"
          />

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
            {product.badge ? (
              <span className="rounded-full bg-background/95 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-foreground shadow-sm">
                {product.badge}
              </span>
            ) : (
              <span />
            )}
            {onSale ? (
              <span className="rounded-full bg-sale px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-primary-foreground shadow-sm">
                -{discount}%
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="block text-[14px] font-semibold leading-snug tracking-[0.01em] transition-colors hover:text-accent md:text-[15px]"
        >
          <span className="line-clamp-2 min-h-[2.55em]">{product.title}</span>
        </Link>

        <p className="mt-1 min-h-[1.1rem] truncate text-xs text-muted-foreground">
          {product.author || product.language || "\u00a0"}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <div className="min-w-0">
            <span className="block text-[15px] font-semibold tabular-nums text-foreground">
              {priceLabel}
            </span>
            {onSale ? (
              <span className="text-xs text-muted-foreground line-through">
                {fmt(product.compareAt!)}
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={quickAdd}
            disabled={!product.inStock}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full bg-primary px-3 text-xs font-semibold text-primary-foreground shadow-[0_8px_22px_-16px_rgba(86,56,24,0.8)] transition duration-200 hover:-translate-y-0.5 hover:bg-primary/92 active:translate-y-0 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {product.inStock ? "Add" : "Out"}
          </button>
        </div>
      </div>
    </article>
  );
}
