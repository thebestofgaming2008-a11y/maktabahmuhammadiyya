import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useCatalogProducts } from "@/lib/catalog";
import { BOOK_SUBJECTS, normalizeBookSubject, productSubjectKeys } from "@/data/products";
import type { Product } from "@/lib/products";
import { seo } from "@/lib/seo";

type Search = { c?: string; sort?: string };

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    c: typeof s.c === "string" ? s.c : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
  }),
  head: () => ({
    ...seo({
      title: "Shop Islamic Books - Maktabah Muhammadiya",
      description:
        "Shop Maktabah Muhammadiya Islamic books by Aqeedah, Tafsir, Hadith, Fiqh, Seerah, purification, family, history, Arabic, Urdu and more.",
      path: "/shop",
    }),
  }),
  component: Shop,
});

const sortOptions = [
  { v: "featured", l: "Featured" },
  { v: "price-asc", l: "Price: Low to high" },
  { v: "price-desc", l: "Price: High to low" },
  { v: "rating", l: "Top rated" },
  { v: "new", l: "Newest" },
];

const categories = [
  { v: "", l: "All" },
  { v: "books", l: "Books" },
  { v: "clothing", l: "Clothing" },
  { v: "children", l: "Extras" },
  { v: "other-languages", l: "Other languages" },
  ...BOOK_SUBJECTS.filter((subject) => !["arabic", "urdu"].includes(subject.key)).map(
    (subject) => ({ v: subject.key, l: subject.label }),
  ),
];

function pricedValue(product: Product) {
  return Number.isFinite(product.price) && product.price > 0
    ? product.price
    : Number.POSITIVE_INFINITY;
}

function productLanguage(product: Product) {
  const adminLanguage = String(product.language ?? "")
    .trim()
    .toLowerCase();
  if (adminLanguage) return adminLanguage === "english" ? "english" : "other";

  const text = [product.title, product.description, ...(product.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\burdu\b|\bhindi\b|\barabic\b/.test(text)) return "other";
  if (/[\u0600-\u06ff]/.test(product.title)) return "other";
  return "";
}

function matchesCategory(product: Product, category: string | undefined) {
  if (!category) return true;
  if (category === "books") return (product.topCategory ?? "books") === "books";
  if (category === "clothing")
    return product.topCategory === "clothing" || product.category === "clothing";
  if (category === "children")
    return (
      product.topCategory === "children" ||
      product.category === "children" ||
      product.category === "essentials" ||
      product.categoryId === "children" ||
      product.categoryId === "essentials"
    );
  if (category === "other-languages") {
    const subjectKeys = productSubjectKeys({
      name: product.title,
      slug: product.slug,
      author: product.author,
      publisher: null,
      category: product.category,
      category_id: product.categoryId,
      tags: product.tags ?? [],
      search_text: product.description,
    });
    return (
      productLanguage(product) === "other" ||
      subjectKeys.some((key) => ["arabic", "urdu"].includes(key))
    );
  }
  const requestedSubject = normalizeBookSubject(category);
  const subjectKeys = productSubjectKeys({
    name: product.title,
    slug: product.slug,
    author: product.author,
    publisher: null,
    category: product.category,
    category_id: product.categoryId,
    tags: product.tags ?? [],
    search_text: product.description,
  }).map((key) => (key === "dua-adhkar" ? "purification" : key));
  if (requestedSubject) {
    const normalizedRequest = requestedSubject === "dua-adhkar" ? "purification" : requestedSubject;
    return subjectKeys.includes(normalizedRequest);
  }
  return product.category === category || product.categoryId === category;
}

function Shop() {
  const { c, sort } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { products, loading } = useCatalogProducts();

  const filtered = useMemo(() => {
    let rows = [...products];
    if (c) rows = rows.filter((p) => matchesCategory(p, c));
    switch (sort) {
      case "price-asc":
        rows.sort((a, b) => pricedValue(a) - pricedValue(b));
        break;
      case "price-desc":
        rows.sort((a, b) => pricedValue(b) - pricedValue(a));
        break;
      case "rating":
        rows.sort((a, b) => b.rating - a.rating);
        break;
      case "new":
        rows.reverse();
        break;
    }
    return rows;
  }, [c, sort, products]);

  const setCat = (v: string) =>
    navigate({ search: (s: Search) => ({ ...s, c: v || undefined }) as never });
  const setSort = (v: string) => navigate({ search: (s: Search) => ({ ...s, sort: v }) as never });
  const title = c ? categories.find((x) => x.v === c)?.l : "All products";

  return (
    <div className="container-prose page-soft-enter py-6 md:py-10">
      <div className="mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
            Catalog
          </p>
          <h1 className="mt-1 font-display text-3xl leading-tight md:text-5xl">{title}</h1>
        </div>
        <p className="text-sm text-muted-foreground">{filtered.length} products</p>
      </div>

      <div className="md:hidden -mx-4 px-4 mb-4 overflow-x-auto no-scrollbar">
        <div className="flex gap-2 pb-1">
          {categories.map((cat) => (
            <button
              key={cat.v}
              onClick={() => setCat(cat.v)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm border transition duration-200 ${
                (c ?? "") === cat.v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:border-foreground/30"
              }`}
            >
              {cat.l}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mb-4 md:mb-6 gap-2">
        <button
          onClick={() => setFiltersOpen(true)}
          className="md:hidden inline-flex items-center gap-2 text-sm border rounded-full px-4 py-2"
        >
          <SlidersHorizontal className="h-4 w-4" /> Sort
        </button>
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat.v}
              onClick={() => setCat(cat.v)}
              className={`px-4 py-2 rounded-full text-sm border transition duration-200 ${
                (c ?? "") === cat.v
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border hover:bg-muted"
              }`}
            >
              {cat.l}
            </button>
          ))}
        </div>
        <div className="hidden md:block">
          <select
            value={sort ?? "featured"}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          >
            {sortOptions.map((o) => (
              <option key={o.v} value={o.v}>
                {o.l}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : filtered.length ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
          No products are listed here yet. Add products in admin and they will appear automatically.
        </div>
      )}

      {filtersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 bg-background rounded-t-2xl p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-xl">Sort by</h3>
              <button onClick={() => setFiltersOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul>
              {sortOptions.map((o) => (
                <li key={o.v}>
                  <button
                    onClick={() => {
                      setSort(o.v);
                      setFiltersOpen(false);
                    }}
                    className={`w-full text-left py-3 border-b last:border-0 ${
                      (sort ?? "featured") === o.v ? "font-semibold" : ""
                    }`}
                  >
                    {o.l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
