import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import type { Product } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ product }: { product: Product }) {
  const onSale = product.compareAt && product.compareAt > product.price;
  const { add, setOpen, fmt } = useCart();
  const priceLabel = fmt(product.price);

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-secondary/40 transition duration-300 group-hover:bg-secondary/60">
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-contain p-5 transition duration-500 ease-out group-hover:scale-[1.04]"
          />

          {/* Badges */}
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2.5">
            {product.badge ? (
              <span className="rounded-sm bg-foreground/90 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-background">
                {product.badge}
              </span>
            ) : (
              <span />
            )}
            {onSale ? (
              <span className="rounded-sm bg-sale px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary-foreground">
                -{discount}%
              </span>
            ) : null}
          </div>

          {/* Quick add: desktop hover overlay */}
          <button
            type="button"
            onClick={quickAdd}
            disabled={!product.inStock}
            className="hidden md:flex absolute inset-x-3 bottom-3 h-10 items-center justify-center gap-2 rounded-md bg-background/95 text-foreground text-xs font-semibold uppercase tracking-[0.14em] opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0 hover:bg-foreground hover:text-background disabled:opacity-0"
          >
            {product.inStock ? "Quick add" : "Sold out"}
          </button>
        </div>
      </Link>

      <div className="flex flex-1 flex-col pt-3">
        <Link
          to="/product/$slug"
          params={{ slug: product.slug }}
          className="block text-[13px] md:text-[14px] font-medium leading-snug transition-colors hover:text-accent"
        >
          <span className="line-clamp-2 min-h-[2.5em]">{product.title}</span>
        </Link>

        {product.author ? (
          <p className="mt-1 truncate text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
            {product.author}
          </p>
        ) : null}

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-2 min-w-0">
            <span className="text-[14px] font-semibold tabular-nums text-foreground">
              {priceLabel}
            </span>
            {onSale ? (
              <span className="text-[12px] text-muted-foreground line-through tabular-nums">
                {fmt(product.compareAt!)}
              </span>
            ) : null}
          </div>

          {/* Mobile add button */}
          <button
            type="button"
            onClick={quickAdd}
            disabled={!product.inStock}
            aria-label={product.inStock ? "Add to cart" : "Sold out"}
            className="md:hidden inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-foreground transition hover:bg-foreground hover:text-background hover:border-foreground active:scale-95 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
