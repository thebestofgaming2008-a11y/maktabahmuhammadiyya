import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowLeft, Check, Lock, MessageCircle, ShieldCheck } from "lucide-react";
import { useCart } from "@/lib/cart";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/checkout")({
  head: () =>
    seo({
      title: "Checkout - Maktabah al-Muhammadiyyah",
      description: "Complete your details and send your order request.",
      path: "/checkout",
      noIndex: true,
    }),
  component: Checkout,
});

type CustomerForm = {
  name: string;
  email: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
};

const emptyCustomer: CustomerForm = {
  name: "",
  email: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
};

const whatsappChannel = "https://whatsapp.com/channel/0029VbB3VMzCBtx88CK0Hm3Y";
const whatsappPhone = String(import.meta.env.VITE_WHATSAPP_ORDER_PHONE ?? "").replace(/\D/g, "");

function Checkout() {
  const { detailed, subtotal, clear, fmt } = useCart();
  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomer);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [placed, setPlaced] = useState<{ orderNumber?: string } | null>(null);

  const total = subtotal;
  const totalLabel = fmt(total);

  const canCreateBackendOrder = detailed.every((item) => Boolean(item.product.id));

  const update = (key: keyof CustomerForm, value: string) => {
    setCustomer((current) => ({ ...current, [key]: value }));
  };

  const buildMessage = () => {
    const itemLines = detailed.map((item, index) => {
      const options = [item.color && item.color !== "Default" ? item.color : "", item.size]
        .filter(Boolean)
        .join(" / ");
      return [
        `${index + 1}. ${item.product.title}`,
        options ? `   Options: ${options}` : "",
        `   Quantity: ${item.qty}`,
        `   Product page: ${window.location.origin}/product/${item.slug}`,
      ]
        .filter(Boolean)
        .join("\n");
    });

    return [
      `Assalamu alaikum. I would like to order to ${customer.country}.`,
      "",
      `Name: ${customer.name}`,
      `Email: ${customer.email}`,
      `WhatsApp number: ${customer.phone}`,
      "",
      "",
      `Country: ${customer.country}`,
      `Address: ${customer.address_line_1}`,
      ...(customer.address_line_2 ? [`Apartment / extra: ${customer.address_line_2}`] : []),
      `City: ${customer.city}`,
      ...(customer.state ? [`State / province / region: ${customer.state}`] : []),
      `Postal code: ${customer.postal_code}`,
      "",
      "",
      ...itemLines,
    ].join("\n");
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!canCreateBackendOrder) {
      setError("This cart contains unavailable items. Please refresh the shop and try again.");
      return;
    }

    setSubmitting(true);
    try {
      const orderNumber = `DEMO-${Date.now().toString().slice(-6)}`;
      const finalMessage = buildMessage();

      try {
        await navigator.clipboard.writeText(finalMessage);
      } catch {}

      if (whatsappPhone) {
        window.open(
          `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(finalMessage)}`,
          "_blank",
          "noopener,noreferrer",
        );
      } else {
        window.open(whatsappChannel, "_blank", "noopener,noreferrer");
      }

      clear();
      setPlaced({ orderNumber });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the WhatsApp order request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (placed) {
    return (
      <div className="container-prose py-20 text-center max-w-lg">
        <div className="h-16 w-16 mx-auto rounded-full bg-success/15 inline-flex items-center justify-center animate-in zoom-in duration-300">
          <Check className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-display text-3xl mt-5">Order request saved</h1>
        <p className="text-muted-foreground mt-2">
          {placed.orderNumber ? `Your request is ${placed.orderNumber}. ` : ""}
          Your order message is ready.
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

  if (detailed.length === 0) {
    return (
      <div className="container-prose py-20 text-center">
        <h1 className="font-display text-3xl">Your bag is empty</h1>
        <Link to="/shop" className="mt-4 inline-block underline">
          Browse products
        </Link>
      </div>
    );
  }

  return (
    <div className="container-prose py-6 md:py-10 pb-32 lg:pb-10">
      <div className="flex items-center justify-between mb-4">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to bag
        </Link>
        <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Secure order request
        </div>
      </div>

      <form id="checkout-form" onSubmit={submit} className="grid lg:grid-cols-[1fr_400px] gap-10">
        <div className="space-y-5">
          <section className="rounded-lg border bg-card p-5">
            <h1 className="font-display text-3xl">Checkout</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Fill your details and send the prepared WhatsApp order request.
            </p>
            {error && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-xl mb-4">Contact</h2>
            <div className="space-y-3">
              <Input
                required
                label="Full name"
                value={customer.name}
                onChange={(e) => update("name", e.target.value)}
              />
              <Input
                required
                type="email"
                label="Email"
                value={customer.email}
                onChange={(e) => update("email", e.target.value)}
              />
              <Input
                required
                label="WhatsApp number"
                value={customer.phone}
                onChange={(e) => update("phone", e.target.value)}
              />
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5">
            <h2 className="font-display text-xl mb-4">Delivery address</h2>
            <div className="space-y-3">
              <Input
                required
                label="Country"
                value={customer.country}
                onChange={(e) => update("country", e.target.value)}
              />
              <Input
                required
                label="Address"
                value={customer.address_line_1}
                onChange={(e) => update("address_line_1", e.target.value)}
              />
              <Input
                label="Apartment, suite, etc. (optional)"
                value={customer.address_line_2}
                onChange={(e) => update("address_line_2", e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  required
                  label="City"
                  value={customer.city}
                  onChange={(e) => update("city", e.target.value)}
                />
                <Input
                  required
                  label="Postal code"
                  value={customer.postal_code}
                  onChange={(e) => update("postal_code", e.target.value)}
                />
              </div>
              <Input
                label="State / province / region"
                value={customer.state}
                onChange={(e) => update("state", e.target.value)}
              />
            </div>
          </section>

          <button
            type="submit"
            disabled={submitting}
            className="btn-cta hidden lg:inline-flex w-full items-center justify-center gap-2 bg-primary text-primary-foreground rounded-full py-4 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          >
            <MessageCircle className="h-5 w-5" />
            {submitting ? "Preparing order..." : `Send WhatsApp order - ${fmt(total)}`}
          </button>
          <p className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Your request is saved before the message opens.
          </p>
        </div>

        <aside className="bg-card border rounded-lg p-5 self-start lg:sticky lg:top-24">
          <h2 className="font-display text-xl mb-4">Order summary</h2>
          <ul className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {detailed.map((item) => (
              <li key={item.slug + item.size + item.color} className="flex gap-3">
                <div className="relative shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt=""
                    className="w-14 h-16 object-contain rounded-md bg-white p-1"
                  />
                  <span className="absolute -top-1 -right-1 bg-muted-foreground text-background text-[10px] h-5 w-5 inline-flex items-center justify-center rounded-full">
                    {item.qty}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium leading-snug line-clamp-1">
                    {item.product.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {[item.color !== "Default" ? item.color : "", item.size]
                      .filter(Boolean)
                      .join(" - ")}
                  </div>
                </div>
                <div className="text-sm tabular-nums">{fmt(item.lineTotal)}</div>
              </li>
            ))}
          </ul>
          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="tabular-nums">{fmt(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>Confirmed on WhatsApp</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t flex justify-between text-base font-semibold">
            <span>Total before shipping</span>
            <span className="tabular-nums">{totalLabel}</span>
          </div>
        </aside>
      </form>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 px-3 pt-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] bg-background/95 backdrop-blur border-t shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.15)]">
        <button
          form="checkout-form"
          onClick={(event) => {
            event.preventDefault();
            document.querySelector<HTMLFormElement>("form")?.requestSubmit();
          }}
          disabled={submitting}
          className="btn-cta w-full bg-primary text-primary-foreground rounded-full py-3.5 text-[15px] font-semibold flex items-center justify-between px-5 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <span>{submitting ? "Preparing..." : "Send WhatsApp order"}</span>
          <span className="tabular-nums">{fmt(total)}</span>
        </button>
      </div>
    </div>
  );
}

function Input({
  label,
  ...rest
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="block">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        {...rest}
        className="mt-1 w-full border border-border rounded-md px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
      />
    </label>
  );
}
