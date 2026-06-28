import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Heart, LayoutDashboard, LogOut, MapPin, Package, User } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/contexts/AuthContext";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () =>
    seo({
      title: "Account - Maktabah al-Muhammadiyyah",
      description: "Preview account page for the Lovable redesign export.",
      path: "/account",
      noIndex: true,
    }),
  component: Account,
});

function Account() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const [authOpen, setAuthOpen] = useState(false);

  if (!user) {
    return (
      <main className="commerce-shell container-prose py-10 md:py-20 page-soft-enter">
        <section className="mx-auto max-w-2xl rounded-2xl border bg-white p-6 text-center shadow-pop md:p-10">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <User className="h-5 w-5" />
          </div>
          <h1 className="mt-5 font-display text-4xl">Sign in</h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
            This export uses local demo auth so Lovable can redesign the account flow.
          </p>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
          >
            Open sign in
          </button>
        </section>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </main>
    );
  }

  const name = profile?.full_name || user.name || user.email || "Demo customer";
  const email = profile?.email || user.email || "demo@maktabahmuhammadiya.local";

  return (
    <main className="commerce-shell container-prose py-8 md:py-12 page-soft-enter">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Link
            to="/"
            className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold"
          >
            <ArrowLeft className="h-4 w-4" />
            Store
          </Link>
          {isAdmin ? (
            <Link
              to="/admin"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <LayoutDashboard className="h-4 w-4" />
              Admin dashboard
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void signOut()}
          className="inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-semibold text-destructive"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>

      <section className="mt-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">Account</p>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">My account</h1>
        <p className="mt-2 text-sm text-muted-foreground">Signed in as {email}</p>
      </section>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <PreviewCard icon={Package} title="Orders" text="Demo order history and tracking preview." />
        <PreviewCard icon={MapPin} title="Profile" text={`${name} · saved address preview.`} />
        <PreviewCard icon={Heart} title="Wishlist" text="Saved products appear here in the real store." />
      </div>

      <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent order</p>
        <div className="mt-4 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">#DEMO-001</p>
              <p className="mt-1 text-sm text-muted-foreground">2 items · request preview</p>
            </div>
            <Link to="/track" className="text-sm font-semibold underline underline-offset-4">
              Track
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function PreviewCard({
  icon: Icon,
  title,
  text,
}: {
  icon: typeof Package;
  title: string;
  text: string;
}) {
  return (
    <article className="rounded-2xl border bg-white p-5 shadow-sm">
      <Icon className="h-5 w-5 text-accent" />
      <h2 className="mt-4 font-display text-2xl">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </article>
  );
}
