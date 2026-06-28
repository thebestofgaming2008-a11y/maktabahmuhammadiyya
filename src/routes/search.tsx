import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Search as SearchIcon, X } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useCatalogProducts } from "@/lib/catalog";
import { seo } from "@/lib/seo";

export const Route = createFileRoute("/search")({
  head: () =>
    seo({
      title: "Search Maktabah Muhammadiya",
      description: "Search the Maktabah Muhammadiya catalog by title, author or subject.",
      path: "/search",
      noIndex: true,
    }),
  component: SearchPage,
});

const popular = ["tafsir", "hadith", "fiqh", "seerah", "quran"];
const RECENT_KEY = "maktabah-recent-searches";

function SearchPage() {
  const [q, setQ] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const { products, loading } = useCatalogProducts();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const commit = (term: string) => {
    const t = term.trim();
    if (!t) return;
    setRecent((cur) => {
      const next = [t, ...cur.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const t = q.toLowerCase();
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(t) ||
        (p.author ?? "").toLowerCase().includes(t) ||
        p.description.toLowerCase().includes(t) ||
        p.category.includes(t),
    );
  }, [q, products]);

  return (
    <div className="container-prose py-6 md:py-10">
      <h1 className="sr-only">Search catalog</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          commit(q);
        }}
        className="relative max-w-2xl mx-auto"
      >
        <SearchIcon className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search books, subjects, authors..."
          className="w-full pl-12 pr-12 py-4 text-base border-b-2 border-foreground bg-background focus:outline-none"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2"
            aria-label="Clear"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {!q && (
        <div className="max-w-2xl mx-auto mt-8 space-y-10">
          {recent.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground inline-flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5" /> Recent
                </h3>
                <button
                  onClick={() => {
                    setRecent([]);
                    try {
                      localStorage.removeItem(RECENT_KEY);
                    } catch {}
                  }}
                  className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recent.map((t) => (
                  <button
                    key={t}
                    onClick={() => setQ(t)}
                    className="px-4 py-2 rounded-full border text-sm hover:bg-muted transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Popular searches</h3>
            <div className="flex flex-wrap gap-2">
              {popular.map((t) => (
                <button
                  key={t}
                  onClick={() => setQ(t)}
                  className="px-4 py-2 rounded-full border text-sm hover:bg-muted transition-colors"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          {products.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">Recently added</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {products.slice(0, 4).map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {q && (
        <div className="mt-8 animate-in fade-in duration-300">
          <p className="text-sm text-muted-foreground mb-4">
            {results.length} result{results.length !== 1 && "s"} for "{q}"
          </p>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No results. Try a different keyword.</p>
              <Link to="/shop" className="mt-4 inline-block underline">
                Browse all products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {results.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
