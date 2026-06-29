import { Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/brand/maktabah-logo-navy.png";

const primaryNav = [
  { to: "/shop", label: "Shop all", search: undefined as Record<string, string> | undefined },
  { to: "/shop", label: "Books", search: { c: "books" } },
  { to: "/shop", label: "Other languages", search: { c: "other-languages" } },
  { to: "/shop", label: "Clothing", search: { c: "clothing" } },
  { to: "/shop", label: "Special items", search: { c: "children" } },
];

const utilityNav = [
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
  { to: "/track", label: "Track order" },
];

export function Header() {
  const [menu, setMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const menuTimer = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { count, setOpen } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const accountLabel = profile?.full_name || user?.name || user?.email || "Account";
  const initials = (accountLabel || "?").trim().slice(0, 1).toUpperCase();

  function handleAccountClick() {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setAccountOpen((open) => !open);
  }

  const openMenu = useCallback(() => {
    if (menuTimer.current) window.clearTimeout(menuTimer.current);
    setMenuClosing(false);
    setMenu(true);
  }, []);

  const closeMenu = useCallback(() => {
    if (!menu || menuClosing) return;
    setMenuClosing(true);
    if (menuTimer.current) window.clearTimeout(menuTimer.current);
    menuTimer.current = window.setTimeout(() => {
      setMenu(false);
      setMenuClosing(false);
      menuTimer.current = null;
    }, 220);
  }, [menu, menuClosing]);

  useEffect(() => {
    return () => {
      if (menuTimer.current) window.clearTimeout(menuTimer.current);
    };
  }, []);

  return (
    <>
      {/* Announcement bar (Shopify-style) */}
      <div className="bg-primary text-primary-foreground text-[11px] md:text-xs">
        <div className="container-prose py-2 text-center tracking-[0.18em] uppercase font-medium">
          Free shipping over ₹2000 · Carefully packed Islamic books & essentials
        </div>
      </div>

      <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border text-neutral-900">
        <div className="container-prose grid grid-cols-[auto_1fr_auto] md:grid-cols-[1fr_auto_1fr] items-center h-14 md:h-[68px] gap-2">
          {/* Left: mobile menu */}
          <div className="flex items-center">
            <button
              className="md:hidden -ml-2 p-2 transition-transform active:scale-90"
              onClick={openMenu}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="hidden md:block" />
          </div>

          {/* Center: logo */}
          <Link
            to="/"
            className="justify-self-center transition-opacity hover:opacity-85"
            aria-label="Maktabah Muhammadiya home"
          >
            <img
              src={logo}
              alt="Maktabah Muhammadiya"
              className="h-9 w-auto object-contain md:h-12"
            />
          </Link>

          {/* Right: icons */}
          <div className="flex items-center gap-0.5 justify-end">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setSearchOpen((o) => !o);
                  setAccountOpen(false);
                  setTimeout(() => searchInputRef.current?.focus(), 50);
                }}
                className="p-2 hover:bg-muted rounded-full transition-colors active:scale-90"
                aria-label="Search"
                aria-expanded={searchOpen}
              >
                <Search className="h-5 w-5" />
              </button>
              {searchOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close search"
                    onClick={() => setSearchOpen(false)}
                    tabIndex={-1}
                  />
                  <div className="absolute right-0 top-full z-50 mt-3 w-[88vw] max-w-[420px] origin-top-right overflow-hidden rounded-2xl border border-border/70 bg-popover/95 text-popover-foreground shadow-pop backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const v = searchValue.trim();
                        setSearchOpen(false);
                        navigate({ to: "/search" });
                        if (v) {
                          setTimeout(() => {
                            const input = document.querySelector<HTMLInputElement>(
                              'input[type="search"], input[placeholder*="Search" i]',
                            );
                            if (input) {
                              input.value = v;
                              input.dispatchEvent(new Event("input", { bubbles: true }));
                              input.focus();
                            }
                          }, 80);
                        }
                      }}
                      className="flex items-center gap-2 border-b border-border/60 px-4 py-3"
                    >
                      <Search className="h-4 w-4 text-muted-foreground" />
                      <input
                        ref={searchInputRef}
                        type="search"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search titles, authors, subjects…"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                      />
                      {searchValue && (
                        <button
                          type="button"
                          onClick={() => setSearchValue("")}
                          aria-label="Clear"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </form>
                    <div className="px-4 py-3">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        Popular
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {["Tafsir", "Hadith", "Aqeedah", "Seerah", "Quran", "Niqab", "Kufi"].map(
                          (t) => (
                            <Link
                              key={t}
                              to="/shop"
                              search={{ q: t.toLowerCase() } as never}
                              onClick={() => setSearchOpen(false)}
                              className="rounded-full border border-border bg-background px-3 py-1 text-xs hover:bg-foreground hover:text-background transition"
                            >
                              {t}
                            </Link>
                          ),
                        )}
                      </div>
                      <Link
                        to="/search"
                        onClick={() => setSearchOpen(false)}
                        className="mt-4 flex items-center justify-between rounded-lg bg-muted/60 px-3 py-2.5 text-xs font-semibold uppercase tracking-[0.16em] transition hover:bg-muted"
                      >
                        Advanced search
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={handleAccountClick}
                className="p-2 hover:bg-muted rounded-full transition-colors active:scale-90"
                aria-label={user ? "Open account menu" : "Sign in"}
                aria-expanded={accountOpen}
              >
                <User className="h-5 w-5" />
              </button>
              {user && accountOpen && (
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-40 cursor-default"
                    aria-label="Close account menu"
                    onClick={() => setAccountOpen(false)}
                    tabIndex={-1}
                  />
                  <div className="absolute right-0 top-full z-50 mt-3 w-72 origin-top-right overflow-hidden rounded-2xl border border-border/70 bg-popover/95 text-popover-foreground shadow-pop backdrop-blur-xl animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-3 border-b border-border/60 px-4 py-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{accountLabel}</p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                    <nav className="p-1.5">
                      <Link
                        to="/account"
                        search={{ tab: "orders" } as never}
                        onClick={() => setAccountOpen(false)}
                        className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <span className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          My account
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <span className="flex items-center gap-3">
                          <Package className="h-4 w-4 text-muted-foreground" />
                          My orders
                        </span>
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
                        >
                          <span className="flex items-center gap-3">
                            <LayoutDashboard className="h-4 w-4" />
                            Admin dashboard
                          </span>
                          <ChevronRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                        </Link>
                      )}
                    </nav>
                    <div className="border-t border-border/60 p-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          void signOut();
                        }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={() => setOpen(true)}
              className="relative p-2 hover:bg-muted rounded-full transition-colors active:scale-90"
              aria-label="Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-accent-foreground text-[10px] font-semibold inline-flex items-center justify-center animate-in zoom-in duration-200">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Desktop category nav row (Shopify-style) */}
        <nav className="hidden md:block border-t border-border/60">
          <div className="container-prose flex items-center justify-center gap-8 h-11 text-[13px]">
            {primaryNav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                search={n.search as never}
                className="relative text-neutral-900/80 transition-colors hover:text-neutral-900 font-medium tracking-wide after:absolute after:left-0 after:-bottom-3 after:h-[2px] after:w-full after:origin-left after:scale-x-0 after:bg-neutral-900 after:transition-transform after:duration-300 hover:after:scale-x-100"
              >
                {n.label}
              </Link>
            ))}
            <span className="h-3 w-px bg-border" />
            {utilityNav.map((n) => (
              <Link
                key={n.label}
                to={n.to}
                className="text-neutral-900/65 transition-colors hover:text-neutral-900 text-[12px]"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>

      {/* Mobile menu */}
      {menu && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className={`absolute inset-0 bg-foreground/40 menu-overlay ${
              menuClosing ? "menu-closing" : ""
            }`}
            onClick={closeMenu}
          />
          <aside
            className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-background flex flex-col shadow-2xl menu-panel ${
              menuClosing ? "menu-closing" : ""
            }`}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-display text-lg">Menu</span>
              <button
                onClick={closeMenu}
                className="p-2 transition-transform active:scale-90 hover:rotate-90 duration-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              {primaryNav.map((n, i) => (
                <Link
                  key={n.label}
                  to={n.to}
                  search={n.search as never}
                  onClick={closeMenu}
                  className="menu-item block border-b border-border/60 px-4 py-4 text-lg transition-colors hover:bg-muted/50"
                  style={{ animationDelay: `${0.08 + i * 0.05}s` }}
                >
                  {n.label}
                </Link>
              ))}
              {utilityNav.map((n, i) => (
                <Link
                  key={n.label}
                  to={n.to}
                  onClick={closeMenu}
                  className="menu-item block border-b border-border/60 px-4 py-4 text-base text-foreground/80 transition-colors hover:bg-muted/50"
                  style={{ animationDelay: `${0.08 + (primaryNav.length + i) * 0.05}s` }}
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/account"
                onClick={(event) => {
                  if (!user) {
                    event.preventDefault();
                    closeMenu();
                    setAuthOpen(true);
                    return;
                  }
                  closeMenu();
                }}
                className="menu-item block border-b border-border/60 px-4 py-4 text-base text-foreground/80 transition-colors hover:bg-muted/50"
                style={{ animationDelay: `${0.08 + (primaryNav.length + utilityNav.length) * 0.05}s` }}
              >
                {user ? "Account" : "Sign in"}
              </Link>
              {user && isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="menu-item block px-4 py-4 text-base font-semibold text-primary border-b border-border/60 hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${0.08 + (primaryNav.length + utilityNav.length + 1) * 0.05}s` }}
                >
                  Admin dashboard
                </Link>
              )}
              <div
                className="menu-item px-4 py-5 border-b border-border/60"
                style={{
                  animationDelay: `${0.08 + (primaryNav.length + utilityNav.length + (user && isAdmin ? 2 : 1)) * 0.05}s`,
                }}
              >
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  Currency
                </div>
                <CurrencySwitcher tone="dark" />
              </div>
            </nav>
          </aside>
        </div>
      )}
      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} />
    </>
  );
}
