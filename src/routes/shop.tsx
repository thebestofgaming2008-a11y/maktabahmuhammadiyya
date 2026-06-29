import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, X, ChevronDown, Check, Search } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useCatalogProducts } from "@/lib/catalog";
import { BOOK_SUBJECTS, normalizeBookSubject, productSubjectKeys } from "@/data/products";
import type { Product } from "@/lib/products";
import { seo } from "@/lib/seo";

type Search = {
  c?: string;
  sort?: string;
  lang?: string;
  min?: number;
  max?: number;
  avail?: string;
  rating?: number;
  badge?: string;
  q?: string;
};

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    c: typeof s.c === "string" ? s.c : undefined,
    sort: typeof s.sort === "string" ? s.sort : undefined,
    lang: typeof s.lang === "string" ? s.lang : undefined,
    min: typeof s.min === "number" ? s.min : s.min ? Number(s.min) : undefined,
    max: typeof s.max === "number" ? s.max : s.max ? Number(s.max) : undefined,
    avail: typeof s.avail === "string" ? s.avail : undefined,
    rating: typeof s.rating === "number" ? s.rating : s.rating ? Number(s.rating) : undefined,
    badge: typeof s.badge === "string" ? s.badge : undefined,
    q: typeof s.q === "string" ? s.q : undefined,
  }),
  head: () => ({
    ...seo({
      title: "Shop Islamic Books - Maktabah Muhammadiya",
      description:
        "Shop Maktabah Muhammadiya Islamic books by subject, language, price and availability. Aqeedah, Tafsir, Hadith, Fiqh, Seerah, Arabic, Urdu and more.",
      path: "/shop",
    }),
  }),
  component: Shop,
});

const sortOptions = [
  { v: "featured", l: "Featured" },
  { v: "new", l: "Newest" },
  { v: "bestseller", l: "Bestsellers" },
  { v: "price-asc", l: "Price: Low to high" },
  { v: "price-desc", l: "Price: High to low" },
  { v: "rating", l: "Top rated" },
  { v: "title-asc", l: "Alphabetical: A–Z" },
  { v: "title-desc", l: "Alphabetical: Z–A" },
];

const topCategories = [
  { v: "", l: "All" },
  { v: "books", l: "Books" },
  { v: "clothing", l: "Clothing" },
  { v: "children", l: "Extras" },
  { v: "other-languages", l: "Other languages" },
];

const subjectCategories = BOOK_SUBJECTS.filter(
  (subject) => !["arabic", "urdu"].includes(subject.key),
).map((subject) => ({ v: subject.key, l: subject.label }));

const allCategories = [...topCategories, ...subjectCategories];

const languageOptions = [
  { v: "english", l: "English" },
  { v: "arabic", l: "Arabic" },
  { v: "urdu", l: "Urdu" },
  { v: "other", l: "Other" },
];

const availabilityOptions = [
  { v: "in", l: "In stock" },
  { v: "out", l: "Out of stock" },
];

const badgeOptions = [
  { v: "new", l: "New arrival" },
  { v: "bestseller", l: "Bestseller" },
  { v: "featured", l: "Featured" },
  { v: "sale", l: "On sale" },
];

const ratingOptions = [4, 3, 2, 1];

function pricedValue(product: Product) {
  return Number.isFinite(product.price) && product.price > 0
    ? product.price
    : Number.POSITIVE_INFINITY;
}

function detectLanguage(product: Product): "english" | "arabic" | "urdu" | "other" {
  const admin = String(product.language ?? "").trim().toLowerCase();
  if (admin.includes("english")) return "english";
  if (admin.includes("arab")) return "arabic";
  if (admin.includes("urdu")) return "urdu";
  if (admin) return "other";

  const subjects = productSubjectKeys({
    name: product.title,
    slug: product.slug,
    author: product.author ?? null,
    publisher: null,
    category: product.category,
    category_id: product.categoryId ?? null,
    tags: product.tags ?? [],
    search_text: product.description,
  });
  if (subjects.includes("urdu")) return "urdu";
  if (subjects.includes("arabic")) return "arabic";

  const text = [product.title, product.description, ...(product.tags ?? [])]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  if (/\burdu\b/.test(text)) return "urdu";
  if (/\barabic\b/.test(text) || /[\u0600-\u06ff]/.test(product.title)) return "arabic";
  return "english";
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
    const lang = detectLanguage(product);
    return lang === "arabic" || lang === "urdu" || lang === "other";
  }
  const requestedSubject = normalizeBookSubject(category);
  const subjectKeys = productSubjectKeys({
    name: product.title,
    slug: product.slug,
    author: product.author ?? null,
    publisher: null,
    category: product.category,
    category_id: product.categoryId ?? null,
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
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const { products, loading } = useCatalogProducts();

  const { c, sort, lang, min, max, avail, rating, badge, q } = search;

  const setSearch = (patch: Partial<Search>) => {
    navigate({
      search: (s: Search) => {
        const next: Search = { ...s, ...patch };
        // Strip undefined / empty
        (Object.keys(next) as (keyof Search)[]).forEach((k) => {
          if (next[k] === undefined || next[k] === "" || (typeof next[k] === "number" && Number.isNaN(next[k] as number))) {
            delete next[k];
          }
        });
        return next as never;
      },
    });
  };

  // Compute price bounds for slider
  const { priceMin, priceMax } = useMemo(() => {
    const prices = products.map((p) => p.price).filter((n) => Number.isFinite(n) && n > 0);
    if (!prices.length) return { priceMin: 0, priceMax: 0 };
    return {
      priceMin: Math.floor(Math.min(...prices)),
      priceMax: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  // Local price input state (so user can drag without spamming URL)
  const [localMin, setLocalMin] = useState<number | undefined>(min);
  const [localMax, setLocalMax] = useState<number | undefined>(max);
  useEffect(() => setLocalMin(min), [min]);
  useEffect(() => setLocalMax(max), [max]);

  const filtered = useMemo(() => {
    let rows = [...products];
    if (c) rows = rows.filter((p) => matchesCategory(p, c));
    if (q) {
      const term = q.toLowerCase();
      rows = rows.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.author ?? "").toLowerCase().includes(term) ||
          (p.tags ?? []).some((t) => t.toLowerCase().includes(term)),
      );
    }
    if (lang) rows = rows.filter((p) => detectLanguage(p) === lang);
    if (min !== undefined) rows = rows.filter((p) => p.price >= min);
    if (max !== undefined) rows = rows.filter((p) => p.price <= max);
    if (avail === "in") rows = rows.filter((p) => p.inStock);
    if (avail === "out") rows = rows.filter((p) => !p.inStock);
    if (rating !== undefined) rows = rows.filter((p) => p.rating >= rating);
    if (badge) {
      rows = rows.filter((p) => {
        if (badge === "new") return p.isNewArrival;
        if (badge === "bestseller") return p.isBestseller;
        if (badge === "featured") return p.isFeatured;
        if (badge === "sale") return p.compareAt && p.compareAt > p.price;
        return true;
      });
    }

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
      case "title-asc":
        rows.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "title-desc":
        rows.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "bestseller":
        rows.sort((a, b) => Number(!!b.isBestseller) - Number(!!a.isBestseller));
        break;
      case "new":
        rows.reverse();
        break;
    }
    return rows;
  }, [products, c, sort, lang, min, max, avail, rating, badge, q]);

  const title = c ? allCategories.find((x) => x.v === c)?.l ?? "All products" : "All products";
  const sortLabel = sortOptions.find((o) => o.v === (sort ?? "featured"))?.l ?? "Featured";

  const activeFilters: { key: keyof Search; label: string }[] = [];
  if (c) activeFilters.push({ key: "c", label: title });
  if (lang) activeFilters.push({ key: "lang", label: languageOptions.find((l) => l.v === lang)?.l ?? lang });
  if (avail) activeFilters.push({ key: "avail", label: availabilityOptions.find((l) => l.v === avail)?.l ?? avail });
  if (badge) activeFilters.push({ key: "badge", label: badgeOptions.find((l) => l.v === badge)?.l ?? badge });
  if (rating) activeFilters.push({ key: "rating", label: `${rating}★ & up` });
  if (min !== undefined || max !== undefined)
    activeFilters.push({
      key: "min",
      label: `₹${min ?? priceMin} – ₹${max ?? priceMax}`,
    });
  if (q) activeFilters.push({ key: "q", label: `"${q}"` });

  const clearAll = () =>
    navigate({ search: (() => ({}) as never) });

  return (
    <div className="page-soft-enter">
      {/* Page header */}
      <header className="border-b bg-secondary/20">
        <div className="container-prose py-8 md:py-12">
          <nav className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">Shop</span>
          </nav>
          <h1 className="mt-3 font-display text-3xl md:text-5xl leading-[1.05]">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {loading ? "Loading…" : `${filtered.length} ${filtered.length === 1 ? "product" : "products"}`}
          </p>
        </div>
      </header>

      <div className="container-prose py-6 md:py-10">
        <div className="md:grid md:grid-cols-[260px_minmax(0,1fr)] md:gap-10">
          {/* DESKTOP SIDEBAR FILTERS */}
          <aside className="hidden md:block">
            <FilterPanel
              search={search}
              setSearch={setSearch}
              priceMin={priceMin}
              priceMax={priceMax}
              localMin={localMin}
              localMax={localMax}
              setLocalMin={setLocalMin}
              setLocalMax={setLocalMax}
            />
          </aside>

          {/* RIGHT: toolbar + grid */}
          <div className="min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2 flex-1 min-w-[200px] max-w-md">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    defaultValue={q ?? ""}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setSearch({ q: (e.target as HTMLInputElement).value || undefined });
                      }
                    }}
                    placeholder="Search this collection"
                    className="w-full h-10 rounded-full border bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground transition"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  className="md:hidden inline-flex items-center gap-2 h-10 rounded-full border px-4 text-sm"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </button>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setSortOpen((v) => !v)}
                    className="inline-flex items-center gap-2 h-10 rounded-full border bg-background px-4 text-sm"
                  >
                    <span className="text-muted-foreground hidden sm:inline">Sort:</span>
                    <span className="font-medium">{sortLabel}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {sortOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-20"
                        onClick={() => setSortOpen(false)}
                        aria-hidden
                      />
                      <ul className="absolute right-0 mt-2 w-56 z-30 rounded-lg border bg-background shadow-lg py-1">
                        {sortOptions.map((o) => (
                          <li key={o.v}>
                            <button
                              type="button"
                              onClick={() => {
                                setSearch({ sort: o.v === "featured" ? undefined : o.v });
                                setSortOpen(false);
                              }}
                              className="w-full text-left flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                            >
                              <Check
                                className={`h-4 w-4 ${
                                  (sort ?? "featured") === o.v ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {o.l}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Active filter chips */}
            {activeFilters.length > 0 && (
              <div className="mb-5 flex flex-wrap items-center gap-2">
                {activeFilters.map((f) => (
                  <button
                    key={f.key}
                    type="button"
                    onClick={() =>
                      setSearch(
                        f.key === "min"
                          ? { min: undefined, max: undefined }
                          : ({ [f.key]: undefined } as Partial<Search>),
                      )
                    }
                    className="inline-flex items-center gap-1.5 rounded-full bg-secondary text-foreground px-3 py-1.5 text-xs hover:bg-secondary/80"
                  >
                    {f.label}
                    <X className="h-3 w-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={clearAll}
                  className="text-xs underline underline-offset-4 text-muted-foreground hover:text-foreground"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={index} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : filtered.length ? (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed p-10 text-center">
                <p className="font-display text-2xl">No products match</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try removing a filter or clearing all to see everything.
                </p>
                <button
                  type="button"
                  onClick={clearAll}
                  className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE FILTERS DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute right-0 top-0 h-full w-[88%] max-w-sm bg-background shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="font-display text-xl">Filter</h3>
              <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <FilterPanel
                search={search}
                setSearch={setSearch}
                priceMin={priceMin}
                priceMax={priceMax}
                localMin={localMin}
                localMax={localMax}
                setLocalMin={setLocalMin}
                setLocalMax={setLocalMax}
              />
            </div>
            <div className="border-t p-3 flex gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="flex-1 h-11 rounded-full border text-sm font-semibold"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 h-11 rounded-full bg-primary text-primary-foreground text-sm font-semibold"
              >
                Show {filtered.length}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FilterPanel({
  search,
  setSearch,
  priceMin,
  priceMax,
  localMin,
  localMax,
  setLocalMin,
  setLocalMax,
}: {
  search: Search;
  setSearch: (p: Partial<Search>) => void;
  priceMin: number;
  priceMax: number;
  localMin: number | undefined;
  localMax: number | undefined;
  setLocalMin: (n: number | undefined) => void;
  setLocalMax: (n: number | undefined) => void;
}) {
  return (
    <div className="space-y-1">
      <FilterGroup title="Category" defaultOpen>
        <ul className="space-y-1.5">
          {allCategories.map((cat) => (
            <li key={cat.v || "all"}>
              <button
                type="button"
                onClick={() => setSearch({ c: cat.v || undefined })}
                className={`w-full text-left text-sm py-1 ${
                  (search.c ?? "") === cat.v
                    ? "font-semibold text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.l}
              </button>
            </li>
          ))}
        </ul>
      </FilterGroup>

      <FilterGroup title="Language" defaultOpen>
        <ul className="space-y-2">
          {languageOptions.map((l) => (
            <li key={l.v}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="lang"
                  className="accent-foreground"
                  checked={search.lang === l.v}
                  onChange={() => setSearch({ lang: l.v })}
                />
                {l.l}
              </label>
            </li>
          ))}
          {search.lang && (
            <li>
              <button
                type="button"
                onClick={() => setSearch({ lang: undefined })}
                className="text-xs underline underline-offset-4 text-muted-foreground"
              >
                Clear language
              </button>
            </li>
          )}
        </ul>
      </FilterGroup>

      <FilterGroup title="Price" defaultOpen>
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={localMin ?? ""}
            placeholder={`${priceMin}`}
            onChange={(e) => setLocalMin(e.target.value ? Number(e.target.value) : undefined)}
            onBlur={() => setSearch({ min: localMin })}
            className="w-full h-9 rounded-md border bg-background px-2 text-sm"
          />
          <span className="text-muted-foreground text-xs">to</span>
          <input
            type="number"
            value={localMax ?? ""}
            placeholder={`${priceMax}`}
            onChange={(e) => setLocalMax(e.target.value ? Number(e.target.value) : undefined)}
            onBlur={() => setSearch({ max: localMax })}
            className="w-full h-9 rounded-md border bg-background px-2 text-sm"
          />
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          Range ₹{priceMin} – ₹{priceMax}
        </p>
      </FilterGroup>

      <FilterGroup title="Availability">
        <ul className="space-y-2">
          {availabilityOptions.map((a) => (
            <li key={a.v}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="avail"
                  className="accent-foreground"
                  checked={search.avail === a.v}
                  onChange={() => setSearch({ avail: a.v })}
                />
                {a.l}
              </label>
            </li>
          ))}
          {search.avail && (
            <li>
              <button
                type="button"
                onClick={() => setSearch({ avail: undefined })}
                className="text-xs underline underline-offset-4 text-muted-foreground"
              >
                Clear
              </button>
            </li>
          )}
        </ul>
      </FilterGroup>

      <FilterGroup title="Highlights">
        <ul className="space-y-2">
          {badgeOptions.map((b) => (
            <li key={b.v}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="badge"
                  className="accent-foreground"
                  checked={search.badge === b.v}
                  onChange={() => setSearch({ badge: b.v })}
                />
                {b.l}
              </label>
            </li>
          ))}
          {search.badge && (
            <li>
              <button
                type="button"
                onClick={() => setSearch({ badge: undefined })}
                className="text-xs underline underline-offset-4 text-muted-foreground"
              >
                Clear
              </button>
            </li>
          )}
        </ul>
      </FilterGroup>

      <FilterGroup title="Rating">
        <ul className="space-y-2">
          {ratingOptions.map((r) => (
            <li key={r}>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="rating"
                  className="accent-foreground"
                  checked={search.rating === r}
                  onChange={() => setSearch({ rating: r })}
                />
                <span>{"★".repeat(r)}<span className="text-muted-foreground">{"★".repeat(5 - r)}</span> & up</span>
              </label>
            </li>
          ))}
          {search.rating && (
            <li>
              <button
                type="button"
                onClick={() => setSearch({ rating: undefined })}
                className="text-xs underline underline-offset-4 text-muted-foreground"
              >
                Clear
              </button>
            </li>
          )}
        </ul>
      </FilterGroup>
    </div>
  );
}

function FilterGroup({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[12px] font-semibold uppercase tracking-[0.16em]">{title}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="pb-4">{children}</div>}
    </div>
  );
}
