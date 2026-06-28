import { Link } from "@tanstack/react-router";
import { LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { CurrencySwitcher } from "@/components/CurrencySwitcher";
import { AuthDialog } from "@/components/auth/AuthDialog";
import { useAuth } from "@/contexts/AuthContext";
import logo from "@/assets/brand/maktabah-logo-navy.png";

const nav = [
  { to: "/shop", label: "Shop All" },
  { to: "/shop?c=quran", label: "Qur'an" },
  { to: "/shop?c=tafsir", label: "Tafsir" },
  { to: "/shop?c=hadith", label: "Hadith" },
  { to: "/shop?c=fiqh", label: "Fiqh" },
  { to: "/track", label: "Track order" },
];

export function Header() {
  const [menu, setMenu] = useState(false);
  const [menuClosing, setMenuClosing] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const menuTimer = useRef<number | null>(null);
  const { count, setOpen } = useCart();
  const { user, profile, isAdmin, signOut } = useAuth();
  const accountLabel = profile?.full_name || user?.name || user?.email || "Account";

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
      <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-border">
        <div className="container-prose grid grid-cols-[1fr_auto_1fr] items-center h-14 md:h-16">
          {/* Left */}
          <div className="flex items-center gap-1">
            <button
              className="md:hidden -ml-2 p-2 text-black transition-transform active:scale-90"
              onClick={openMenu}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              {nav.slice(0, 3).map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="relative text-black/80 transition-colors hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center logo */}
          <Link
            to="/"
            className="justify-self-center transition-opacity hover:opacity-85"
            aria-label="Maktabah Muhammadiya home"
          >
            <img
              src={logo}
              alt="Maktabah Muhammadiya"
              className="h-10 w-auto object-contain md:h-12"
            />
          </Link>

          {/* Right */}
          <div className="flex items-center gap-1 justify-end">
            <nav className="hidden md:flex items-center gap-6 text-sm mr-2">
              {nav.slice(3).map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className="relative text-black/80 transition-colors hover:text-black after:absolute after:left-0 after:-bottom-1 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-300 hover:after:scale-x-100"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
            <Link
              to="/search"
              className="p-2 text-black hover:bg-muted rounded-full transition-colors active:scale-90"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </Link>
            <div className="relative">
              <button
                type="button"
                onClick={handleAccountClick}
                className="p-2 text-black hover:bg-muted rounded-full transition-colors active:scale-90"
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
                  <div className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-xl border bg-popover text-popover-foreground shadow-pop animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200">
                    <div className="border-b px-4 py-3">
                      <p className="truncate text-sm font-semibold">{accountLabel}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="p-1">
                      <Link
                        to="/account"
                        search={{ tab: "orders" } as never}
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <User className="h-4 w-4" />
                        My account
                      </Link>
                      <Link
                        to="/account"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition hover:bg-muted"
                      >
                        <Package className="h-4 w-4" />
                        My orders
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setAccountOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-primary transition hover:bg-muted"
                        >
                          <LayoutDashboard className="h-4 w-4" />
                          Admin dashboard
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setAccountOpen(false);
                          void signOut();
                        }}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-red-50"
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
              className="relative p-2 text-black hover:bg-muted rounded-full transition-colors active:scale-90"
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
                className="p-2 text-black transition-transform active:scale-90 hover:rotate-90 duration-300"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-2">
              {nav.map((n, i) => (
                <Link
                  key={n.to}
                  to={n.to}
                  onClick={closeMenu}
                  className="menu-item block border-b border-border/60 px-4 py-4 text-lg text-black transition-colors hover:bg-muted/50"
                  style={{ animationDelay: `${0.08 + i * 0.05}s` }}
                >
                  {n.label}
                </Link>
              ))}
              <Link
                to="/contact"
                onClick={closeMenu}
                className="menu-item block border-b border-border/60 px-4 py-4 text-lg text-black transition-colors hover:bg-muted/50"
                style={{ animationDelay: `${0.08 + nav.length * 0.05}s` }}
              >
                Help & Contact
              </Link>
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
                className="menu-item block border-b border-border/60 px-4 py-4 text-lg text-black transition-colors hover:bg-muted/50"
                style={{ animationDelay: `${0.08 + (nav.length + 1) * 0.05}s` }}
              >
                {user ? "Account" : "Sign in"}
              </Link>
              {user && isAdmin && (
                <Link
                  to="/admin"
                  onClick={closeMenu}
                  className="menu-item block px-4 py-4 text-lg font-semibold text-primary border-b border-border/60 hover:bg-muted/50 transition-colors"
                  style={{ animationDelay: `${0.08 + (nav.length + 2) * 0.05}s` }}
                >
                  Admin dashboard
                </Link>
              )}
              <div
                className="menu-item px-4 py-5 border-b border-border/60"
                style={{
                  animationDelay: `${0.08 + (nav.length + (user && isAdmin ? 3 : 2)) * 0.05}s`,
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
