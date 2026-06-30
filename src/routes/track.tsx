import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { CheckCircle2, MessageCircle, PackageSearch, Send, Star, Truck } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/track")({
  head: () =>
    seo({
      title: "Track Order - Maktabah al-Muhammadiyyah",
      description: "Track an order request with your order number and email address.",
      path: "/track",
      noIndex: true,
    }),
  component: TrackOrder,
});

function TrackOrder() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [lookup, setLookup] = useState<{ orderNumber: string; email: string } | null>(null);
  const order = useQuery(api.orders.getByNumber, lookup ?? "skip");

  function submit(event: FormEvent) {
    event.preventDefault();
    const cleanOrder = orderNumber.trim();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanOrder || !cleanEmail) {
      toast.error("Enter your order number and email.");
      return;
    }
    setLookup({ orderNumber: cleanOrder, email: cleanEmail });
  }

  return (
    <main className="container-prose page-soft-enter py-8 md:py-14">
      <section className="mx-auto max-w-3xl text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <PackageSearch className="h-5 w-5" />
        </div>
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
          Track order
        </p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Check your order status</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          Enter the order number and the email used at checkout.
        </p>
      </section>

      <form
        onSubmit={submit}
        className="mx-auto mt-8 grid max-w-3xl gap-3 rounded-2xl border bg-white p-4 shadow-sm md:grid-cols-[1fr_1.35fr_auto] md:p-5"
      >
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Order number
          </span>
          <input
            value={orderNumber}
            onChange={(event) => setOrderNumber(event.target.value)}
            placeholder="#1"
            className="h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">Email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            placeholder="you@example.com"
            className="h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <button
          type="submit"
          className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          <PackageSearch className="h-4 w-4" />
          Track
        </button>
      </form>

      {lookup && order === undefined ? (
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl border bg-white p-5 shadow-sm">
          <div className="h-24 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : null}

      {lookup && order === null ? (
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-dashed bg-white p-6 text-center text-sm text-muted-foreground">
          No order was found for that order number and email.
        </div>
      ) : null}

      {order ? <OrderResult order={order} email={lookup?.email ?? email} /> : null}
    </main>
  );
}

function OrderResult({ order, email }: { order: any; email: string }) {
  const items = Array.isArray(order.items) ? order.items : [];
  return (
    <section className="mx-auto mt-6 max-w-3xl overflow-hidden rounded-2xl border bg-white shadow-sm">
      <div className="border-b bg-muted/30 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {order.order_number}
            </p>
            <h2 className="mt-1 font-display text-2xl text-primary">Order request found</h2>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid gap-4 p-5 md:grid-cols-3">
        <InfoBlock icon={MessageCircle} label="Payment" value={label(order.payment_status)} />
        <InfoBlock icon={Truck} label="Shipping" value={label(order.shipping_payment_status)} />
        <InfoBlock
          icon={CheckCircle2}
          label="Total"
          value={money(order.total_inr ?? order.total)}
        />
      </div>

      {order.tracking_number || order.tracking_url ? (
        <div className="border-y bg-secondary/35 p-5 text-sm">
          <p className="font-semibold">Tracking</p>
          <p className="mt-1 text-muted-foreground">
            {[order.tracking_carrier, order.tracking_number].filter(Boolean).join(" - ")}
          </p>
          {order.tracking_url ? (
            <a
              href={order.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex font-medium underline underline-offset-4"
            >
              Open tracking link
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="divide-y">
        {items.map((item: any, index: number) => (
          <TrackedItem
            key={item.id || `${item.product_id}-${index}`}
            item={item}
            orderNumber={order.order_number}
            email={email}
            canReview={order.payment_status === "paid" || order.payment_status === "MOCKED_PAID"}
          />
        ))}
      </div>
    </section>
  );
}

function TrackedItem({
  item,
  orderNumber,
  email,
  canReview,
}: {
  item: any;
  orderNumber: string;
  email: string;
  canReview: boolean;
}) {
  const submitReview = useMutation(api.reviews.submitForOrder);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [body, setBody] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!item.product_id) return;
    try {
      await submitReview({
        orderNumber,
        email,
        productId: item.product_id,
        rating,
        body,
        title: null,
      });
      toast.success("Review sent");
      setOpen(false);
      setBody("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit review.");
    }
  }

  return (
    <article className="p-5">
      <div className="flex gap-3">
        {item.product_image_url ? (
          <img
            src={item.product_image_url}
            alt=""
            className="h-20 w-16 shrink-0 rounded-md border bg-white object-contain p-1"
            loading="lazy"
          />
        ) : (
          <div className="h-20 w-16 shrink-0 rounded-md border bg-muted" />
        )}
        <div className="min-w-0 flex-1">
          <p className="font-medium">{item.product_name || "Product"}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Qty {item.quantity ?? 1} · {money(item.subtotal ?? item.unit_price)}
          </p>
          {[item.selected_color, item.selected_size].filter(Boolean).length ? (
            <p className="mt-1 text-xs text-muted-foreground">
              {[item.selected_color, item.selected_size].filter(Boolean).join(" / ")}
            </p>
          ) : null}
        </div>
      </div>

      {canReview && item.product_id ? (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-9 items-center gap-2 rounded-full border px-4 text-sm font-medium transition hover:bg-muted"
          >
            <Star className="h-4 w-4" />
            Add review
          </button>
          {open ? (
            <form onSubmit={submit} className="mt-3 rounded-xl border bg-muted/30 p-3">
              <label className="block text-xs font-semibold text-muted-foreground">Rating</label>
              <div className="mt-1 flex gap-1">
                {Array.from({ length: 5 }).map((_, index) => {
                  const value = index + 1;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className="p-1 text-accent"
                      aria-label={`${value} stars`}
                    >
                      <Star className={value <= rating ? "h-5 w-5 fill-current" : "h-5 w-5"} />
                    </button>
                  );
                })}
              </div>
              <textarea
                value={body}
                onChange={(event) => setBody(event.target.value)}
                placeholder="Share your feedback..."
                className="mt-3 min-h-24 w-full rounded-lg border bg-white p-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="submit"
                className="mt-3 inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground"
              >
                <Send className="h-4 w-4" />
                Send review
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function InfoBlock({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MessageCircle;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-4">
      <Icon className="h-4 w-4 text-accent" />
      <p className="mt-3 text-xs uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: unknown }) {
  return (
    <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold capitalize text-primary-foreground">
      {label(status)}
    </span>
  );
}

function label(value: unknown) {
  return String(value || "requested").replace(/_/g, " ");
}

function money(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(amount) ? amount : 0);
}
