import { Link } from "@tanstack/react-router";
import { Instagram, MessageCircle } from "lucide-react";
import logo from "@/assets/brand/maktabah-logo-navy.png";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-secondary/40">
      <div className="container-prose py-12 grid grid-cols-2 md:grid-cols-5 gap-8 text-sm">
        <div className="col-span-2">
          <img src={logo} alt="Maktabah Muhammadiya" className="mb-4 h-14 w-auto object-contain" />
          <p className="text-muted-foreground max-w-sm">
            Maktabah Muhammadiya offers authentic Islamic books from trusted publishers, curated and
            packed with care.
          </p>
        </div>
        <div>
          <div className="font-semibold mb-3">Shop</div>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/shop">All Products</Link>
            </li>
            <li>
              <Link to="/shop" search={{ c: "quran" } as never}>
                Qur'an
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ c: "tafsir" } as never}>
                Tafsir
              </Link>
            </li>
            <li>
              <Link to="/shop" search={{ c: "hadith" } as never}>
                Hadith
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Help</div>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/contact">Contact</Link>
            </li>
            <li>
              <Link to="/contact">Order support</Link>
            </li>
            <li>
              <Link to="/contact">Shipping</Link>
            </li>
            <li>
              <Link to="/contact">Support</Link>
            </li>
          </ul>
        </div>
        <div>
          <div className="font-semibold mb-3">Company</div>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/about">About</Link>
            </li>
            <li>
              <Link to="/shop">Collections</Link>
            </li>
            <li>
              <Link to="/contact">Wholesale</Link>
            </li>
            <li>
              <Link to="/contact">Bulk orders</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-prose py-6 flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Maktabah Muhammadiya. All rights reserved.</p>
          <div className="flex gap-3">
            <Instagram className="h-4 w-4" />
            <MessageCircle className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
