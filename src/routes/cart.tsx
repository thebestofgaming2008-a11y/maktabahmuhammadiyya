import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Minus,
  Plus,
  ShoppingBag,
  Truck,
  ShieldCheck,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { useCart } from "@/lib/cart";
import { useCatalogProducts } from "@/lib/catalog";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/cart")({
  head: () =>
    seo({
      title: "Your Bag - Maktabah al-Muhammadiyyah",
      description: "Review your selected books and prepare your order request.",
      path: "/cart",
      noIndex: true,
    }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, setQty, remove, add, fmt } = useCart();
  const { products } = useCatalogProducts();
  const subtotalLabel = fmt(subtotal);

  const inCart = new Set(detailed.map((d) => d.slug));
  const upsells = products.filter((p) => !inCart.has(p.slug)).slice(0, 4);

  if (detailed.length === 0) {
    return (
      <div className="container-prose py-20 text-center">
        <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground" />
        <h1 className="font-display text-3xl mt-4">Your bag is empty</h1>
        <p className="text-muted-foreground mt-2">
          Add books to your bag and send an order request on WhatsApp.
        </p>
        <Link
          to="/shop"
          className="btn-cta mt-6 inline-flex bg-primary text-primary-foreground rounded-full px-6 py-3 text-sm font-semibold"
        >
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-prose py-6 md:py-12 pb-32 md:pb-12">
      <h1 className="font-display text-3xl md:text-4xl mb-6">Your bag</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div>
          <ul className="border-y divide-y">
            {detailed.map((it) => (
              <li key={it.slug + it.size + it.color} className="flex gap-4 py-5">
                <Link to="/product/$slug" params={{ slug: it.slug }} className="shrink-0">
                  <img
                    src={it.product.images[0]}
                    alt={it.product.title}
                    className="w-24 md:w-28 aspect-[4/5] object-contain rounded-md bg-white p-1"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <Link
                      to="/product/$slug"
                      params={{ slug: it.slug }}
                      className="font-medium hover:text-accent transition-colors"
                    >
                      {it.product.title}
                    </Link>
                    <span className="font-medium tabular-nums">{fmt(it.lineTotal)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {[it.color, it.size].filter(Boolean).join(" - ")}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <div className="inline-flex items-center border rounded-full">
                      <button
                        onClick={() => setQty(it.slug, it.size, it.color, it.qty - 1)}
                        className="p-2 hover:bg-muted rounded-l-full transition-colors"
                        aria-label="Decrease"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 tabular-nums">{it.qty}</span>
                      <button
                        onClick={() => setQty(it.slug, it.size, it.color, it.qty + 1)}
                        className="p-2 hover:bg-muted rounded-r-full transition-colors"
                        aria-label="Increase"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => remove(it.slug, it.size, it.color)}
                      className="text-sm text-muted-foreground hover:text-foreground underline transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {upsells.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-4 w-4 text-accent" />
                <h2 className="font-display text-xl">You may also like</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {upsells.map((p) => (
                  <div
                    key={p.slug}
                    className="border rounded-lg p-2.5 hover:shadow-soft transition-shadow"
                  >
                    <Link to="/product/$slug" params={{ slug: p.slug }}>
                      <img
                        src={p.images[0]}
                        alt={p.title}
                        className="w-full aspect-[3/4] object-cover rounded-md bg-muted"
                      />
                      <h3 className="mt-2 text-sm font-medium line-clamp-2 leading-snug">
                        {p.title}
                      </h3>
                      <p className="text-sm font-semibold mt-0.5">{fmt(p.price)}</p>
                    </Link>
                    <button
                      onClick={() =>
                        add({
                          slug: p.slug,
                          product: p,
                          color: p.colors[0]?.name ?? "Default",
                          size: p.sizes?.[0],
                          qty: 1,
                        })
                      }
                      className="mt-2 w-full text-xs font-medium border border-foreground rounded-full py-1.5 hover:bg-foreground hover:text-background transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 self-start bg-card border rounded-lg p-5">
          <h2 className="font-display text-xl mb-4">Order summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">{subtotalLabel}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Arranged after order</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between text-base font-semibold">
            <span>Total shown</span>
            <span className="tabular-nums">{subtotalLabel}</span>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Final availability, delivery and payment details are confirmed before dispatch.
          </p>
          <Link
            to="/checkout"
            className="btn-cta mt-5 w-full inline-flex items-center justify-center bg-primary text-primary-foreground rounded-full py-3.5 text-sm font-semibold"
          >
            Send order request
          </Link>
          <div className="mt-4 grid grid-cols-3 gap-2 text-[11px] text-muted-foreground text-center">
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-4 w-4" />
              Shipping quote
            </div>
            <div className="flex flex-col items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              Order support
            </div>
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-4 w-4" />
              Admin verified
            </div>
          </div>
        </aside>
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 px-3 pt-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur border-t shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <Link
          to="/checkout"
          className="btn-cta w-full bg-primary text-primary-foreground rounded-full py-3.5 text-[15px] font-semibold flex items-center justify-between px-5"
        >
          <span>Send order request</span>
          <span className="tabular-nums">{fmt(subtotal)}</span>
        </Link>
      </div>
    </div>
  );
}
