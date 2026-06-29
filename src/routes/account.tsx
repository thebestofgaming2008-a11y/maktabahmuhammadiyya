import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/contexts/AuthContext";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/account")({
  head: () =>
    seo({
      title: "Account - Maktabah Muhammadiya",
      description: "Manage your account, orders and addresses.",
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
      <main className="min-h-[70vh] flex items-center justify-center px-4 py-16 page-soft-enter">
        <div className="w-full max-w-sm text-center">
          <h1 className="font-display text-3xl">Login</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Sign in to view orders and manage your account.
          </p>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="mt-8 w-full h-11 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition"
          >
            Sign in
          </button>
          <Link
            to="/"
            className="mt-4 inline-block text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
          >
            Return to store
          </Link>
        </div>
        <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
      </main>
    );
  }

  const name = profile?.full_name || user.name || user.email || "Customer";
  const email = profile?.email || user.email || "";

  return (
    <main className="page-soft-enter">
      <div className="container-prose py-10 md:py-16 max-w-3xl">
        {/* Header */}
        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-8 border-b">
          <h1 className="font-display text-3xl md:text-4xl">My account</h1>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-sm underline underline-offset-4 text-muted-foreground hover:text-foreground"
          >
            Log out
          </button>
        </div>

        {/* Greeting */}
        <section className="py-8 border-b">
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <p className="mt-1 text-lg font-medium">{name}</p>
          {email && <p className="text-sm text-muted-foreground mt-0.5">{email}</p>}
        </section>

        {/* Orders */}
        <section className="py-8 border-b">
          <h2 className="font-display text-xl mb-4">Order history</h2>
          <div className="text-sm text-muted-foreground">
            You haven't placed any orders yet.
          </div>
          <Link
            to="/shop"
            className="mt-5 inline-block text-sm underline underline-offset-4 hover:text-accent"
          >
            Start shopping →
          </Link>
        </section>

        {/* Account details */}
        <section className="py-8 border-b">
          <h2 className="font-display text-xl mb-4">Account details</h2>
          <div className="text-sm space-y-1">
            <p>{name}</p>
            {email && <p className="text-muted-foreground">{email}</p>}
            <p className="text-muted-foreground">No address on file</p>
          </div>
        </section>

        {/* Quick links */}
        <section className="py-8 flex flex-wrap gap-x-6 gap-y-3 text-sm">
          <Link to="/track" className="underline underline-offset-4 hover:text-accent">
            Track an order
          </Link>
          <Link to="/contact" className="underline underline-offset-4 hover:text-accent">
            Contact support
          </Link>
          {isAdmin && (
            <Link to="/admin" className="underline underline-offset-4 hover:text-accent">
              Admin dashboard
            </Link>
          )}
        </section>
      </div>
    </main>
  );
}
