import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useCatalogProducts } from "@/lib/catalog";
import type { Product } from "@/lib/products";
import { productSubjectKeys } from "@/data/products";
import { Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import heroImage from "@/assets/hero.jpg";
import heroBooks from "@/assets/hero-books-real.jpg";
import heroStudy from "@/assets/hero-study-real.jpg";
import { seo } from "@/lib/seo";
import subjectAqeedah from "@/assets/subjects/aqeedah.webp";
import subjectArabic from "@/assets/subjects/arabic.webp";
import subjectClothing from "@/assets/subjects/clothing.webp";
import subjectFiqh from "@/assets/subjects/fiqh.webp";
import subjectHadith from "@/assets/subjects/hadith.webp";
import subjectHistory from "@/assets/subjects/history.webp";
import subjectKids from "@/assets/subjects/kids.webp";
import subjectPurification from "@/assets/subjects/purification.webp";
import subjectQuran from "@/assets/subjects/quran.webp";
import subjectSeerah from "@/assets/subjects/seerah.webp";
import subjectTafsir from "@/assets/subjects/tafsir.webp";

const heroSlides = [
  {
    image: heroImage,
    eyebrow: "Modest clothing",
    title: "Niqabs and essentials, carefully selected.",
    sub: "Simple, modest pieces alongside a curated Islamic bookshop.",
    cta: "Shop clothing",
    category: "clothing",
    position: "center",
  },
  {
    image: heroBooks,
    eyebrow: "Islamic books",
    title: "Build a library you can return to.",
    sub: "Aqeedah, Tafsir, Hadith, Seerah and carefully chosen study titles.",
    cta: "Browse books",
    category: "books",
    position: "72% center",
  },
  {
    image: heroStudy,
    eyebrow: "Study collections",
    title: "Find the right title by subject.",
    sub: "Browse clear categories so every customer reaches the correct book faster.",
    cta: "Explore subjects",
    category: "aqeedah",
    position: "72% center",
  },
];

const collections = [
  { slug: "quran", title: "Qur'an", desc: "Mushafs & Tajweed", image: subjectQuran },
  { slug: "tafsir", title: "Tafsir", desc: "Exegesis", image: subjectTafsir },
  { slug: "hadith", title: "Hadith", desc: "Prophetic tradition", image: subjectHadith },
  { slug: "aqeedah", title: "Aqeedah", desc: "Creed & belief", image: subjectAqeedah },
  { slug: "fiqh", title: "Fiqh", desc: "Islamic law", image: subjectFiqh },
  { slug: "seerah", title: "Seerah", desc: "Life of the Prophet", image: subjectSeerah },
  { slug: "history", title: "History", desc: "Islamic civilization", image: subjectHistory },
  { slug: "kids", title: "Kids", desc: "Stories & learning", image: subjectKids },
  {
    slug: "other-languages",
    title: "Other languages",
    desc: "Arabic, Urdu & more",
    image: subjectArabic,
  },
  {
    slug: "purification",
    title: "Purification",
    desc: "Heart & manners",
    image: subjectPurification,
  },
  { slug: "clothing", title: "Clothing", desc: "Kufis & modest wear", image: subjectClothing },
  { slug: "children", title: "Extras", desc: "Accessories & gifts", image: subjectKids },
];

export const Route = createFileRoute("/")({
  head: () => ({
    ...seo({
      title: "Maktabah Muhammadiya - Islamic Books by Subject",
      description:
        "Browse Maktabah Muhammadiya for curated Islamic books by subject, language and collection, with personal order support and worldwide delivery.",
      path: "/",
    }),
  }),
  component: Home,
});

// Round-trip helper: scroll by one card width
function getCardStep(el: HTMLDivElement) {
  const first = el.querySelector<HTMLElement>("[data-rail-item]");
  if (!first) return el.clientWidth * 0.8;
  const style = window.getComputedStyle(el);
  const gap = parseFloat(style.columnGap || style.gap || "16") || 16;
  return first.getBoundingClientRect().width + gap;
}

// Reusable horizontally-scrolling product rail with mobile controls + "See all"
function ProductRail({
  eyebrow,
  title,
  desc,
  items,
  seeAllTo = "/shop",
}: {
  eyebrow: string;
  title: string;
  desc?: string;
  items: Product[];
  seeAllTo?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * getCardStep(el), behavior: "smooth" });
  };

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    const frame = requestAnimationFrame(() => {
      el.scrollLeft = 0;
    });
    return () => cancelAnimationFrame(frame);
  }, [items, title]);

  return (
    <section className="py-10 md:py-16">
      <div className="container-prose">
        <div className="flex items-end justify-between mb-5 md:mb-7 reveal gap-4">
          <div className="min-w-0">
            <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
              {eyebrow}
            </span>
            <h2 className="font-display text-[28px] md:text-4xl mt-1.5 leading-[1.05]">{title}</h2>
            {desc && <p className="text-muted-foreground mt-1.5 text-sm max-w-md">{desc}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      <div
        ref={railRef}
        className="flex gap-3 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 px-4 md:px-[max(1rem,calc((100vw-72rem)/2))] scroll-pl-4 md:scroll-pl-[max(1rem,calc((100vw-72rem)/2))]"
        style={{ direction: "ltr" }}
      >
        {items.map((p) => (
          <div
            key={p.slug}
            data-rail-item
            className="shrink-0 snap-start w-[44vw] sm:w-[32vw] md:w-[240px] lg:w-[260px]"
          >
            <ProductCard product={p} />
          </div>
        ))}
        <Link
          to={seeAllTo}
          data-rail-item
          className="shrink-0 snap-start w-[44vw] sm:w-[32vw] md:w-[240px] lg:w-[260px] aspect-[4/5] rounded-lg bg-secondary/40 flex flex-col items-center justify-center gap-3 text-foreground hover:bg-secondary/70 transition-colors group"
        >
          <span className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:translate-x-1 transition-transform">
            <ArrowRight className="h-5 w-5" />
          </span>
          <span className="font-display text-lg text-center px-3">See all</span>
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Browse collection
          </span>
        </Link>
        <div className="shrink-0 w-1 md:hidden" />
      </div>
    </section>
  );
}

// Infinite, smoothly auto-scrolling rail (loops both directions)
function InfiniteRail({
  items,
  speed = 0.35, // px per frame (~21 px/s at 60fps)
}: {
  items: Product[];
  speed?: number;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const dirRef = useRef<1 | -1>(1);
  const looped = [...items, ...items, ...items];

  // Keep scroll in the middle copy for seamless looping
  const recenter = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const third = el.scrollWidth / 3;
    if (el.scrollLeft < third * 0.4) {
      el.scrollLeft += third;
    } else if (el.scrollLeft > third * 1.8) {
      el.scrollLeft -= third;
    }
  }, []);

  useEffect(() => {
    const el = railRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollLeft = el.scrollWidth / 3;
    });

    let raf = 0;
    const tick = () => {
      if (!pausedRef.current && el) {
        el.scrollLeft += speed * dirRef.current;
        recenter();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const onScroll = () => recenter();
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
    };
  }, [recenter, speed]);

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  const nudge = (dir: 1 | -1) => {
    dirRef.current = dir;
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * getCardStep(el), behavior: "smooth" });
  };

  if (!items.length) {
    return (
      <div className="container-prose rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        More books will appear here once products are available.
      </div>
    );
  }

  return (
    <div className="relative group/rail">
      {/* Edge fades */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 md:w-24 bg-gradient-to-r from-secondary/30 to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 md:w-24 bg-gradient-to-l from-secondary/30 to-transparent z-10" />

      <div
        ref={railRef}
        onMouseEnter={pause}
        onMouseLeave={resume}
        onTouchStart={pause}
        onTouchEnd={resume}
        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar pb-2 px-4 md:px-[max(1rem,calc((100vw-72rem)/2))]"
      >
        {looped.map((p, i) => (
          <div
            key={`${p.slug}-${i}`}
            data-rail-item
            className="shrink-0 w-[42vw] sm:w-[28vw] md:w-[210px] transition-transform duration-300 hover:-translate-y-1"
          >
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="container-prose mt-5 flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse mr-2 align-middle" />
          Auto-scrolling - hover to pause
        </p>
        <div className="flex gap-2">
          <button
            onClick={() => nudge(-1)}
            aria-label="Previous"
            className="h-10 w-10 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => nudge(1)}
            aria-label="Next"
            className="h-10 w-10 rounded-full border border-border bg-background flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Home() {
  const { products, loading } = useCatalogProducts();
  const booksOnly = products.filter((product) => product.topCategory === "books");
  const featuredPool = products.filter(
    (product) => product.isNewArrival || product.isFeatured || product.showInCategorySection,
  );
  const featured = (featuredPool.length ? featuredPool : products).slice(0, 8);
  const addOnPool = products.filter(
    (product) =>
      product.isBestseller ||
      product.tags?.some((tag) => /add[-\s]?on|extra|accessor/i.test(tag)) ||
      product.topCategory === "children" ||
      product.topCategory === "clothing",
  );
  const addOns = (addOnPool.length ? addOnPool : products.slice(2)).slice(0, 8);
  const [slide, setSlide] = useState(0);
  const collectionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.body.classList.add("is-landing");
    return () => document.body.classList.remove("is-landing");
  }, []);

  const scrollCollections = (dir: 1 | -1) => {
    const el = collectionsRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * getCardStep(el), behavior: "smooth" });
  };

  const byHomepagePriority = (a: Product, b: Product) =>
    Number(Boolean(b.showInCategorySection || b.isFeatured || b.isNewArrival)) -
      Number(Boolean(a.showInCategorySection || a.isFeatured || a.isNewArrival)) ||
    Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller)) ||
    a.title.localeCompare(b.title);
  const productLanguage = (product: Product) => {
    const adminLanguage = String(product.language ?? "")
      .trim()
      .toLowerCase();
    if (adminLanguage) {
      if (adminLanguage === "english") return "english";
      return "other";
    }

    const text = [product.title, product.description, ...(product.tags ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (/\burdu\b/.test(text)) return "other";
    if (/\barabic\b|\bعربي\b/.test(text) || /[\u0600-\u06ff]/.test(product.title)) {
      return "other";
    }
    if (/\benglish\b/.test(text)) return "english";
    return "";
  };
  const subjectKeysForProduct = (product: Product) =>
    productSubjectKeys({
      name: product.title,
      slug: product.slug,
      author: product.author ?? null,
      publisher: null,
      category: product.category,
      category_id: product.categoryId ?? null,
      tags: product.tags ?? [],
      search_text: product.description,
    }).map((key) => (key === "dua-adhkar" ? "purification" : key));
  const englishMatches = booksOnly
    .filter((product) => productLanguage(product) === "english")
    .sort(byHomepagePriority)
    .slice(0, 8);
  const otherLanguageMatches = booksOnly
    .filter(
      (product) =>
        productLanguage(product) === "other" ||
        subjectKeysForProduct(product).some((key) => ["arabic", "urdu"].includes(key)),
    )
    .sort(byHomepagePriority)
    .slice(0, 8);
  const english = englishMatches.length ? englishMatches : booksOnly.slice(0, 8);
  const otherLanguages = otherLanguageMatches;
  const moreBooks = [...booksOnly].reverse();

  // Special items: niqab, jilbab, kufi, pen
  const specialRegex = /(niqab|jilbab|jilbāb|khimar|kufi|kufiyya|topi|pen|miswak)/i;
  const specialItems = products
    .filter((p) => {
      const haystack = [
        p.title,
        p.category,
        p.categoryId ?? "",
        ...(p.tags ?? []),
      ]
        .join(" ")
        .toLowerCase();
      return specialRegex.test(haystack) || p.topCategory === "clothing" || p.topCategory === "children";
    })
    .slice(0, 10);

  return (
    <div>
      {/* HERO CAROUSEL */}
      <section className="relative">
        <div className="relative h-[68vh] min-h-[460px] md:h-[78vh] md:max-h-[720px] overflow-hidden">
          {heroSlides.map((s, i) => (
            <div
              key={i}
              className={`absolute inset-0 transition-opacity duration-1000 ${i === slide ? "opacity-100" : "opacity-0 pointer-events-none"}`}
            >
              <img
                src={s.image}
                alt={s.title}
                className={`absolute inset-0 w-full h-full object-cover ${i === slide ? "ken-burns" : ""}`}
                style={{ objectPosition: s.position }}
                fetchPriority={i === 0 ? "high" : "low"}
              />
              {/* Cleaner single overlay: subtle vignette bottom-left */}
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/30 to-transparent md:bg-[linear-gradient(100deg,rgba(20,12,4,0.62)_0%,rgba(20,12,4,0.28)_42%,rgba(20,12,4,0)_70%)]" />
              <div className="absolute inset-0 flex flex-col justify-end">
                <div
                  key={`${i}-${slide}`}
                  className="container-prose pb-14 md:pb-24 text-background hero-rise"
                >
                  <span className="inline-block text-[11px] uppercase tracking-[0.28em] mb-4 opacity-90 font-medium">
                    {s.eyebrow}
                  </span>
                  <h1 className="font-display text-[34px] md:text-6xl lg:text-[68px] max-w-3xl leading-[1.02]">
                    {s.title}
                  </h1>
                  <p className="mt-4 max-w-md text-sm md:text-base opacity-90 leading-relaxed">
                    {s.sub}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      to="/shop"
                      search={{ c: s.category } as never}
                      className="inline-flex items-center gap-2 bg-background text-foreground rounded-none px-8 py-3.5 text-[12px] font-semibold uppercase tracking-[0.16em] transition hover:bg-foreground hover:text-background"
                    >
                      {s.cta}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-1 rounded-full transition-all duration-500 ${i === slide ? "w-8 bg-background" : "w-4 bg-background/50 hover:bg-background/75"}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Trust strip (Shopify-style) */}
      <section className="border-b border-border bg-secondary/30">
        <div className="container-prose grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
          {[
            { t: "Curated", d: "Hand-picked titles" },
            { t: "Authentic", d: "Trusted publishers" },
            { t: "Worldwide", d: "Careful packing" },
            { t: "Support", d: "Personal order help" },
          ].map((f) => (
            <div key={f.t} className="px-4 py-5 text-center">
              <p className="text-[11px] uppercase tracking-[0.18em] font-semibold">{f.t}</p>
              <p className="text-xs text-muted-foreground mt-1">{f.d}</p>
            </div>
          ))}
        </div>
      </section>


      {/* BROWSE COLLECTIONS */}
      <section className="py-12 md:py-20">
        <div className="container-prose">
          <div className="flex items-end justify-between mb-6 md:mb-8 reveal gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
                Collections
              </span>
              <h2 className="font-display text-[28px] md:text-4xl mt-1.5 leading-[1.05]">
                Browse collections
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Books, clothing and curated Islamic study collections.
              </p>
            </div>
            <div className="flex gap-2 shrink-0 md:hidden">
              <button
                onClick={() => scrollCollections(-1)}
                aria-label="Scroll left"
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCollections(1)}
                aria-label="Scroll right"
                className="h-10 w-10 rounded-full border border-border flex items-center justify-center hover:bg-muted active:scale-95 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <div
          ref={collectionsRef}
          className="flex gap-3 overflow-x-auto no-scrollbar snap-x snap-mandatory px-4 scroll-pl-4 md:grid md:grid-cols-4 lg:grid-cols-6 md:gap-5 md:overflow-visible md:px-[max(2rem,calc((100vw-72rem)/2))]"
        >
          {collections.map((s) => (
            <Link
              key={s.slug}
              to="/shop"
              search={{ c: s.slug } as never}
              data-rail-item
              className="group relative shrink-0 snap-start w-[44vw] sm:w-[30vw] md:w-auto aspect-[3/4] rounded-xl overflow-hidden"
            >
              <img
                src={s.image}
                alt={s.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-background">
                <div className="font-display text-xl md:text-2xl leading-tight">{s.title}</div>
                <div className="text-[11px] uppercase tracking-wider opacity-80 mt-0.5">
                  {s.desc}
                </div>
              </div>
            </Link>
          ))}
          <div className="shrink-0 w-1 md:hidden" />
        </div>
      </section>

      {/* FEATURED */}
      <section className="container-prose pb-12 md:pb-20">
        <div className="flex items-end justify-between mb-6 md:mb-8 reveal">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
              Just landed
            </span>
            <h2 className="font-display text-[28px] md:text-4xl mt-1.5 leading-[1.05]">
              New this week
            </h2>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium underline underline-offset-4 hover:text-accent transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="aspect-[3/4] rounded-xl bg-muted animate-pulse" />
            ))
          ) : featured.length ? (
            featured.map((p) => <ProductCard key={p.slug} product={p} />)
          ) : (
            <div className="col-span-full rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
              Real products will appear here as soon as they are added in admin.
            </div>
          )}
        </div>
      </section>

      {/* LANGUAGE SECTIONS */}
      <ProductRail
        eyebrow="English"
        title="English books"
        desc="Translations, contemporary works and study guides."
        items={english}
        seeAllTo="/shop"
      />
      <ProductRail
        eyebrow="Other languages"
        title="Arabic, Urdu & more"
        desc="Non-English titles for native readers and students."
        items={otherLanguages}
        seeAllTo="/shop"
      />

      {/* SPECIAL ITEMS */}
      {specialItems.length > 0 && (
        <section className="bg-secondary/40 border-y">
          <ProductRail
            eyebrow="Special items"
            title="Niqab, jilbab, kufi & pens"
            desc="A small, considered selection of essentials beyond the bookshelf."
            items={specialItems}
            seeAllTo="/shop"
          />
        </section>
      )}


      {/* MORE BOOKS - infinite, auto-scrolling */}
      <section className="py-12 md:py-20 bg-secondary/30 border-y">
        <div className="container-prose">
          <div className="flex items-end justify-between mb-6 md:mb-8 reveal gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
                More books
              </span>
              <h2 className="font-display text-[28px] md:text-4xl mt-1.5 leading-[1.05]">
                More books
              </h2>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Keep browsing carefully chosen titles from the catalog.
              </p>
            </div>
          </div>
        </div>
        <InfiniteRail items={moreBooks} />
      </section>

      {/* BESTSELLERS */}
      <section className="container-prose pb-12 md:pb-20 pt-12 md:pt-20">
        <div className="flex items-end justify-between mb-6 md:mb-8 reveal">
          <div>
            <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
              Complete the order
            </span>
            <h2 className="font-display text-[28px] md:text-4xl mt-1.5 leading-[1.05]">
              Add-on items
            </h2>
            <p className="text-muted-foreground mt-1.5 text-sm">
              Useful extras and small items customers can add before sending their request.
            </p>
          </div>
          <Link
            to="/shop"
            className="text-sm font-medium underline underline-offset-4 hover:text-accent transition-colors"
          >
            Shop all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
          {addOns.slice(0, 6).map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="bg-secondary/50 border-y">
        <div className="container-prose py-14 md:py-20">
          <div className="text-center mb-10 reveal">
            <div className="inline-flex items-center gap-1 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-current text-accent" />
              ))}
            </div>
            <h2 className="font-display text-3xl md:text-4xl">Built for careful readers</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              Curated titles, clear browsing and personal order support.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                name: "Subject browsing",
                text: "Customers can find books by Quran, Tafsir, Hadith, Aqeedah, Fiqh and more.",
              },
              {
                name: "Order support",
                text: "Availability, payment and delivery details are handled with care.",
              },
              {
                name: "Curated catalog",
                text: "Every section is arranged to make the right title easier to find.",
              },
            ].map((r) => (
              <figure
                key={r.name}
                className="bg-card rounded-lg p-5 border reveal transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
              >
                <div className="flex gap-1 text-accent mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="text-sm leading-relaxed">{r.text}</blockquote>
                <figcaption className="mt-3 text-xs text-muted-foreground">{r.name}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
