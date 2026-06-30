import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import {
  ArrowLeft,
  ChevronDown,
  Heart,
  LayoutDashboard,
  LogOut,
  MapPin,
  MessageCircle,
  Package,
  Pencil,
  Plus,
  Trash2,
  User,
} from "lucide-react";
import { useState, type FormEvent, type InputHTMLAttributes, type ReactNode } from "react";
import { toast } from "sonner";
import { api } from "../../convex/_generated/api";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/contexts/AuthContext";
import { seo } from "@/lib/seo";
import { cn } from "@/lib/utils";

const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029VbB3VMzCBtx88CK0Hm3Y";

type AccountTab = "orders" | "profile" | "wishlist";

type AddressDraft = {
  full_name: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
};

const emptyAddress: AddressDraft = {
  full_name: "",
  phone: "",
  address_line_1: "",
  address_line_2: "",
  city: "",
  state: "",
  postal_code: "",
  country: "",
  is_default: false,
};

export const Route = createFileRoute("/account")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      search.tab === "orders" || search.tab === "profile" || search.tab === "wishlist"
        ? search.tab
        : undefined,
  }),
  head: () =>
    seo({
      title: "Account - Maktabah al-Muhammadiyyah",
      description: "Manage your profile, saved addresses, orders and wishlist.",
      path: "/account",
      noIndex: true,
    }),
  component: Account,
});

function Account() {
  const search = Route.useSearch();
  const { user, profile, isAdmin, loading, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);
  const [tab, setTab] = useState<AccountTab>((search.tab as AccountTab) || "orders");
  const [profileOpen, setProfileOpen] = useState(false);
  const [addressOpen, setAddressOpen] = useState(false);

  const orders = useQuery(api.orders.listMine, user ? {} : "skip");
  const addresses = useQuery(api.addresses.listMine, user ? {} : "skip");
  const wishlistIds = useQuery(api.wishlists.listMine, user ? {} : "skip");
  const wishlistProducts = useQuery(
    api.products.listByIds,
    wishlistIds && wishlistIds.length ? { ids: wishlistIds } : "skip",
  );

  const displayName = profile?.full_name || user?.name || user?.email || "Customer";
  const accountInitial = String(displayName || user?.email || "A")
    .trim()
    .charAt(0)
    .toUpperCase();
  const orderCount = orders === undefined ? "..." : String(orders.length);
  const addressCount = addresses === undefined ? "..." : String(addresses.length);
  const wishlistCount = wishlistIds === undefined ? "..." : String(wishlistIds.length);

  if (loading) {
    return (
      <main className="commerce-shell container-prose py-10 md:py-16">
        <div className="h-44 rounded-2xl border bg-white/70 shadow-soft animate-pulse" />
      </main>
    );
  }

  if (!user) {
    return (
      <main className="commerce-shell container-prose py-10 md:py-20 page-soft-enter">
        <section className="mx-auto max-w-2xl rounded-2xl border bg-white/90 p-6 text-center shadow-pop md:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Customer account
          </p>
          <h1 className="mt-2 font-display text-4xl md:text-5xl">Sign in to continue</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            Save your address, view your order requests, and keep your wishlist ready for future
            purchases.
          </p>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-soft transition hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0"
          >
            Sign in or create account
          </button>
        </section>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <QuickCard
            icon={Package}
            title="Order history"
            text="See order requests linked to your account."
          />
          <QuickCard
            icon={MapPin}
            title="Saved addresses"
            text="Keep checkout details ready for next time."
          />
          <QuickCard
            icon={Heart}
            title="Wishlist"
            text="Save titles you want to return to later."
          />
        </div>

        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="container-prose py-5 md:py-10 page-soft-enter">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-medium transition hover:bg-muted"
            >
              <ArrowLeft className="h-4 w-4" />
              Store
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-soft transition hover:bg-primary/90"
              >
                <LayoutDashboard className="h-4 w-4" />
                Admin dashboard
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>

        <section className="mt-5 border-b pb-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary font-display text-xl text-primary-foreground">
                {accountInitial}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Account
                </p>
                <h1 className="mt-1 font-display text-3xl text-primary md:text-4xl">My account</h1>
                <p className="mt-1 truncate text-sm text-muted-foreground">
                  {displayName !== user.email ? displayName : "Signed in"}{" "}
                  <span className="text-muted-foreground/70">as</span>{" "}
                  <span className="break-all">{user.email}</span>
                </p>
              </div>
            </div>
          </div>

          <nav className="mt-5 flex gap-5 overflow-x-auto text-sm">
            {(["orders", "profile", "wishlist"] as AccountTab[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn(
                  "h-10 shrink-0 border-b-2 px-1 font-medium capitalize transition",
                  tab === item
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {item}
                {item === "orders"
                  ? ` (${orderCount})`
                  : item === "profile"
                    ? ` (${addressCount})`
                    : ` (${wishlistCount})`}
              </button>
            ))}
          </nav>
        </section>

        {tab === "orders" && (
          <section className="mt-4 rounded-xl border border-border/70 bg-white p-4 shadow-sm md:p-6 vibe-fade-in">
            <SectionHeading
              icon={Package}
              title="Orders"
              subtitle="Order requests saved to this account."
            />
            <div className="mt-4 space-y-3">
              {orders === undefined ? (
                <SkeletonRows />
              ) : orders.length === 0 ? (
                <EmptyPanel
                  title="No account orders yet"
                  text="Orders placed while signed in will appear here."
                  action="Browse books"
                  to="/shop"
                />
              ) : (
                orders.map((order: any) => <OrderCard key={order.id} order={order} />)
              )}
            </div>
          </section>
        )}

        {tab === "profile" && (
          <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_420px] vibe-fade-in">
            <div className="rounded-xl border border-border/70 bg-white p-4 shadow-sm md:p-6">
              <SectionHeading icon={User} title="Profile" subtitle="Your saved customer details." />
              <div className="mt-4 rounded-lg border border-border/70 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-semibold">{displayName}</p>
                    <p className="mt-1 break-all text-sm text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {profile?.phone || "No phone number saved yet."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProfileOpen(true)}
                    className="inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition hover:bg-muted"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit
                  </button>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border/70 bg-white p-4 shadow-sm md:p-6">
              <div className="flex items-start justify-between gap-3">
                <SectionHeading
                  icon={MapPin}
                  title="Addresses"
                  subtitle="Delivery details for quicker checkout."
                />
                <button
                  type="button"
                  onClick={() => setAddressOpen(true)}
                  className="inline-flex h-9 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <AddressList addresses={addresses} />
            </div>
          </section>
        )}

        {tab === "wishlist" && (
          <section className="mt-4 rounded-xl border border-border/70 bg-white p-4 shadow-sm md:p-6 vibe-fade-in">
            <SectionHeading icon={Heart} title="Wishlist" subtitle="Books saved for later." />
            <div className="mt-4">
              {wishlistIds === undefined ? (
                <SkeletonRows />
              ) : !wishlistIds.length ? (
                <EmptyPanel
                  title="Your wishlist is empty"
                  text="Save books from product pages so you can return to them quickly."
                  action="Explore shop"
                  to="/shop"
                />
              ) : wishlistProducts === undefined ? (
                <SkeletonRows />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {wishlistProducts.map((product: any) => (
                    <Link
                      key={product.id}
                      to="/product/$slug"
                      params={{ slug: product.slug }}
                      className="group rounded-lg border border-border/70 bg-white p-3 transition hover:-translate-y-0.5 hover:shadow-soft"
                    >
                      <div className="aspect-[3/4] overflow-hidden rounded-lg bg-muted">
                        {product.cover_image_url || product.image_url ? (
                          <img
                            src={product.cover_image_url || product.image_url}
                            alt={product.name}
                            className="h-full w-full object-contain p-2 transition duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : null}
                      </div>
                      <p className="mt-3 line-clamp-2 font-medium">{product.name}</p>
                      <p className="mt-1 text-sm font-semibold text-primary">
                        {money(product.sale_price_inr ?? product.price_inr ?? product.price)}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        <a
          href={WHATSAPP_CHANNEL}
          target="_blank"
          rel="noreferrer"
          className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-border/70 bg-white px-4 py-3 text-sm shadow-sm transition hover:bg-muted/40"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
              <MessageCircle className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block font-medium">WhatsApp updates</span>
              <span className="block truncate text-xs text-muted-foreground">
                New arrivals, restocks, and announcements
              </span>
            </span>
          </span>
          <span className="shrink-0 text-sm font-medium underline underline-offset-4">
            Open channel
          </span>
        </a>
      </div>

      <ProfileDialog open={profileOpen} onOpenChange={setProfileOpen} profile={profile} />
      <AddressDialog open={addressOpen} onOpenChange={setAddressOpen} />
    </main>
  );
}

function QuickCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Package;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border bg-white/90 p-5 shadow-soft premium-card-in">
      <Icon className="h-5 w-5 text-accent" />
      <h2 className="mt-4 font-display text-xl">{title}</h2>
      <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Package;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span>
        <h2 className="font-display text-xl text-primary md:text-2xl">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </span>
    </div>
  );
}

function OrderCard({ order }: { order: any }) {
  const [open, setOpen] = useState(false);
  const items = order.items ?? [];

  return (
    <article className="overflow-hidden rounded-xl border bg-white">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 p-4 text-left transition hover:bg-muted"
      >
        <span>
          <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground">
            {order.order_number || order.orderNumber || "Order request"}
          </span>
          <span className="mt-1 block font-semibold">{money(order.total_inr ?? order.total)}</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {statusLabel(order.status)} · {items.length} item{items.length === 1 ? "" : "s"}
          </span>
        </span>
        <ChevronDown
          className={cn("h-5 w-5 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div className="space-y-3 border-t p-4 animate-in fade-in slide-in-from-top-1 duration-200">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground">No item details saved.</p>
          ) : (
            items.map((item: any, index: number) => (
              <div
                key={item.id || `${item.product_id}-${index}`}
                className="flex items-center gap-3"
              >
                {item.product_image_url || item.image ? (
                  <img
                    src={item.product_image_url || item.image}
                    alt=""
                    className="h-16 w-12 rounded-md border bg-white object-contain p-1"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-14 w-12 rounded-md border bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.product_name || item.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Qty {item.quantity ?? item.qty ?? 1} · {money(item.subtotal ?? item.price)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </article>
  );
}

function AddressList({ addresses }: { addresses: any[] | undefined }) {
  const removeAddress = useMutation(api.addresses.remove);
  const setDefaultAddress = useMutation(api.addresses.setDefault);

  if (addresses === undefined) return <SkeletonRows />;
  if (!addresses.length) {
    return (
      <div className="mt-5 rounded-xl border bg-white p-4 text-sm text-muted-foreground">
        No saved addresses yet.
      </div>
    );
  }

  return (
    <div className="mt-5 space-y-3">
      {addresses.map((address) => (
        <div key={address.id} className="rounded-xl border bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-semibold">{address.full_name}</p>
                {address.is_default && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">Default</span>
                )}
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                {[
                  address.address_line_1,
                  address.address_line_2,
                  address.city,
                  address.state,
                  address.postal_code,
                  address.country,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              {address.phone && (
                <p className="mt-1 text-sm text-muted-foreground">{address.phone}</p>
              )}
            </div>
            <button
              type="button"
              onClick={async () => {
                await removeAddress({ id: address.id });
                toast.success("Address removed");
              }}
              className="rounded-full p-2 text-red-600 transition hover:bg-red-50"
              aria-label="Remove address"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          {!address.is_default && (
            <button
              type="button"
              onClick={async () => {
                await setDefaultAddress({ id: address.id });
                toast.success("Default address updated");
              }}
              className="mt-3 text-sm font-medium underline-offset-4 hover:underline"
            >
              Make default
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

function ProfileDialog({
  open,
  onOpenChange,
  profile,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: any;
}) {
  const updateProfile = useMutation(api.users.updateProfile);
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");

  async function submit(event: FormEvent) {
    event.preventDefault();
    await updateProfile({ full_name: fullName.trim() || null, phone: phone.trim() || null });
    toast.success("Profile updated");
    onOpenChange(false);
  }

  if (!open) return null;
  return (
    <ModalShell title="Edit profile" onClose={() => onOpenChange(false)}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Full name" value={fullName} onChange={setFullName} autoComplete="name" />
        <Field label="Phone" value={phone} onChange={setPhone} autoComplete="tel" />
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-lg border text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Save
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AddressDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const createAddress = useMutation(api.addresses.create);
  const [draft, setDraft] = useState<AddressDraft>(emptyAddress);

  async function submit(event: FormEvent) {
    event.preventDefault();
    await createAddress({ payload: draft });
    toast.success("Address saved");
    setDraft(emptyAddress);
    onOpenChange(false);
  }

  if (!open) return null;
  return (
    <ModalShell title="Add address" onClose={() => onOpenChange(false)}>
      <form onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
        <Field
          label="Full name"
          value={draft.full_name}
          onChange={(value) => setDraft((next) => ({ ...next, full_name: value }))}
          className="sm:col-span-2"
          autoComplete="name"
        />
        <Field
          label="Phone"
          value={draft.phone}
          onChange={(value) => setDraft((next) => ({ ...next, phone: value }))}
          autoComplete="tel"
        />
        <Field
          label="Country"
          value={draft.country}
          onChange={(value) => setDraft((next) => ({ ...next, country: value }))}
          autoComplete="country-name"
        />
        <Field
          label="Address line 1"
          value={draft.address_line_1}
          onChange={(value) => setDraft((next) => ({ ...next, address_line_1: value }))}
          className="sm:col-span-2"
          autoComplete="address-line1"
        />
        <Field
          label="Address line 2"
          value={draft.address_line_2}
          onChange={(value) => setDraft((next) => ({ ...next, address_line_2: value }))}
          className="sm:col-span-2"
          autoComplete="address-line2"
        />
        <Field
          label="City"
          value={draft.city}
          onChange={(value) => setDraft((next) => ({ ...next, city: value }))}
          autoComplete="address-level2"
        />
        <Field
          label="State / region"
          value={draft.state}
          onChange={(value) => setDraft((next) => ({ ...next, state: value }))}
          autoComplete="address-level1"
        />
        <Field
          label="Postal code"
          value={draft.postal_code}
          onChange={(value) => setDraft((next) => ({ ...next, postal_code: value }))}
          autoComplete="postal-code"
        />
        <label className="flex h-11 items-center gap-3 rounded-lg border bg-white px-3 text-sm">
          <input
            type="checkbox"
            checked={draft.is_default}
            onChange={(event) =>
              setDraft((next) => ({ ...next, is_default: event.target.checked }))
            }
            className="h-4 w-4"
          />
          Make default
        </label>
        <div className="grid grid-cols-2 gap-3 pt-2 sm:col-span-2">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="h-11 rounded-lg border text-sm font-medium transition hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="h-11 rounded-lg bg-primary text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
          >
            Save address
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/45 p-0 animate-in fade-in duration-200 sm:place-items-center sm:p-4">
      <button className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close" />
      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border bg-white p-5 shadow-pop animate-in slide-in-from-bottom-4 zoom-in-95 duration-300 sm:max-w-xl sm:rounded-2xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl text-primary">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border px-3 py-1.5 text-sm transition hover:bg-muted"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 block text-xs font-semibold text-muted-foreground">{label}</span>
      <input
        {...props}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border bg-white px-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
      />
    </label>
  );
}

function EmptyPanel({
  title,
  text,
  action,
  to,
}: {
  title: string;
  text: string;
  action: string;
  to: "/shop";
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <h3 className="font-display text-xl text-primary">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{text}</p>
      <Link
        to={to}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        {action}
      </Link>
    </div>
  );
}

function SkeletonRows() {
  return (
    <div className="space-y-3">
      <div className="h-20 rounded-xl border bg-white/70 animate-pulse" />
      <div className="h-20 rounded-xl border bg-white/70 animate-pulse" />
    </div>
  );
}

function money(value: unknown) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount) || amount <= 0) return "₹0";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function statusLabel(status: unknown) {
  return String(status || "requested").replace(/_/g, " ");
}
