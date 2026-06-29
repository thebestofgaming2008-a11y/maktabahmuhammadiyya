import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useCatalogProducts } from "@/lib/catalog";
import type { Product } from "@/lib/products";
import { productSubjectKeys } from "@/data/products";
import { Star, ArrowRight } from "lucide-react";

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

// (Legacy rail helpers removed — homepage rails are plain horizontal scrollers.)

type MosaicTone = "dark" | "brand";

function MosaicBanner({
  products,
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaTo,
  ctaSearch,
  tone = "dark",
}: {
  products: Product[];
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  ctaSearch?: Record<string, string>;
  tone?: MosaicTone;
}) {
  // Pick the strongest single hero cover + one supporting cover for depth.
  const covers = products
    .map((p) => p.images?.[0])
    .filter((src): src is string => Boolean(src));
  const heroCover = covers[0];

  const isBrand = tone === "brand";
  const panelBg = isBrand ? "bg-primary text-primary-foreground" : "bg-foreground text-background";
  const ctaClass = isBrand
    ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
    : "bg-background text-foreground hover:bg-background/90";
  const rule = isBrand ? "bg-primary-foreground/30" : "bg-background/30";

  // Build a strip of covers for the background collage
  const stripCovers = covers.slice(0, 6);

  const overlayClass = isBrand
    ? "bg-[linear-gradient(180deg,rgba(58,32,16,0.55)_0%,rgba(58,32,16,0.78)_60%,rgba(58,32,16,0.92)_100%)]"
    : "bg-[linear-gradient(180deg,rgba(20,12,4,0.45)_0%,rgba(20,12,4,0.72)_60%,rgba(20,12,4,0.88)_100%)]";
  const textColor = isBrand ? "text-primary-foreground" : "text-background";

  return (
    <div className="relative w-full reveal overflow-hidden">
      <div className="relative min-h-[520px] md:min-h-[620px]">
        {/* BACKGROUND — blurred hero cover for color + atmosphere */}
        {heroCover ? (
          <img
            src={heroCover}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover scale-110 blur-2xl"
          />
        ) : (
          <div className={`absolute inset-0 ${panelBg}`} />
        )}

        {/* Mid-layer: subtle floating covers strip behind the text */}
        {stripCovers.length > 0 && (
          <div className="absolute inset-0 flex items-center justify-center gap-4 md:gap-6 px-4 opacity-[0.55] md:opacity-60">
            {stripCovers.map((src, i) => (
              <img
                key={`${src}-${i}`}
                src={src}
                alt=""
                aria-hidden
                className="h-[58%] md:h-[68%] w-auto object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
                style={{
                  transform: `translateY(${(i % 2 === 0 ? -1 : 1) * (6 + i * 2)}px) rotate(${(i - stripCovers.length / 2) * 2}deg)`,
                }}
              />
            ))}
          </div>
        )}

        {/* Dark gradient overlay so text reads clean */}
        <div className={`absolute inset-0 ${overlayClass}`} />

        {/* TEXT — centered over the image */}
        <div className={`relative z-10 flex items-center justify-center min-h-[520px] md:min-h-[620px] ${textColor}`}>
          <div className="w-full max-w-3xl px-6 md:px-10 py-20 md:py-28 text-center">
            <div className="flex items-center justify-center gap-3">
              <span className={`h-px w-8 ${rule}`} />
              <span className="text-[11px] uppercase tracking-[0.32em] font-medium opacity-90">
                {eyebrow}
              </span>
              <span className={`h-px w-8 ${rule}`} />
            </div>
            <h2 className="font-display font-light text-4xl md:text-6xl lg:text-7xl mt-6 leading-[1.02] tracking-[-0.01em]">
              {title}
            </h2>
            <p className="mt-5 text-[14px] md:text-[16px] leading-relaxed opacity-85 max-w-xl mx-auto">
              {description}
            </p>
            <Link
              to={ctaTo}
              search={ctaSearch as never}
              className={`mt-9 inline-flex items-center gap-2 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${ctaClass}`}
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}




const SPECIAL_FILTERS = [
  { key: "all", label: "All", regex: /(niqab|jilbab|jilbāb|khimar|kufi|kufiyya|topi|pen|miswak)/i },
  { key: "niqab", label: "Niqab", regex: /(niqab|khimar)/i },
  { key: "jilbab", label: "Jilbab", regex: /(jilbab|jilbāb|abaya)/i },
  { key: "kufi", label: "Kufi", regex: /(kufi|kufiyya|topi)/i },
  { key: "pen", label: "Pen", regex: /(pen|miswak)/i },
] as const;

function Home() {
  const { products, loading } = useCatalogProducts();
  const booksOnly = products.filter((product) => product.topCategory === "books");
  const featuredPool = products.filter(
    (product) => product.isNewArrival || product.isFeatured || product.showInCategorySection,
  );
  const featured = (featuredPool.length ? featuredPool : products).slice(0, 8);
  const [slide, setSlide] = useState(0);
  const [specialFilter, setSpecialFilter] = useState<(typeof SPECIAL_FILTERS)[number]["key"]>("all");
  const [languageFilter, setLanguageFilter] = useState<"all" | "english" | "arabic" | "urdu" | "other">("all");
  const collectionsRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % heroSlides.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".reveal:not(.is-visible)");
    if (!els.length) return;
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
  }, [products.length, loading]);


  useEffect(() => {
    document.body.classList.add("is-landing");
    return () => document.body.classList.remove("is-landing");
  }, []);


  const byHomepagePriority = (a: Product, b: Product) =>
    Number(Boolean(b.showInCategorySection || b.isFeatured || b.isNewArrival)) -
      Number(Boolean(a.showInCategorySection || a.isFeatured || a.isNewArrival)) ||
    Number(Boolean(b.isBestseller)) - Number(Boolean(a.isBestseller)) ||
    a.title.localeCompare(b.title);
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
  const productLanguage = (product: Product): "english" | "arabic" | "urdu" | "other" => {
    const adminLanguage = String(product.language ?? "").trim().toLowerCase();
    if (adminLanguage.includes("english")) return "english";
    if (adminLanguage.includes("arab")) return "arabic";
    if (adminLanguage.includes("urdu")) return "urdu";
    if (adminLanguage) return "other";

    const subjects = subjectKeysForProduct(product);
    if (subjects.includes("urdu")) return "urdu";
    if (subjects.includes("arabic")) return "arabic";

    const text = [product.title, product.description, ...(product.tags ?? [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    if (/\burdu\b/.test(text)) return "urdu";
    if (/\barabic\b|\bعربي\b/.test(text) || /[\u0600-\u06ff]/.test(product.title)) return "arabic";
    return "english";
  };

  const libraryAll = [...booksOnly].sort(byHomepagePriority);
  const libraryCounts = {
    all: libraryAll.length,
    english: libraryAll.filter((p) => productLanguage(p) === "english").length,
    arabic: libraryAll.filter((p) => productLanguage(p) === "arabic").length,
    urdu: libraryAll.filter((p) => productLanguage(p) === "urdu").length,
    other: libraryAll.filter((p) => productLanguage(p) === "other").length,
  } as const;
  type LanguageKey = keyof typeof libraryCounts;
  const LANGUAGE_FILTERS: ReadonlyArray<{ key: LanguageKey; label: string }> = [
    { key: "all", label: "All books" },
    { key: "english", label: "English" },
    { key: "arabic", label: "Arabic" },
    { key: "urdu", label: "Urdu" },
    { key: "other", label: "Other" },
  ];
  const visibleLanguageFilters = LANGUAGE_FILTERS.filter(
    (f) => f.key === "all" || libraryCounts[f.key] > 0,
  );
  const libraryItems =
    languageFilter === "all"
      ? libraryAll.slice(0, 16)
      : libraryAll.filter((p) => productLanguage(p) === languageFilter).slice(0, 16);

  // Special items pool: niqab, jilbab, kufi, pen
  const baseSpecial = products.filter((p) => {
    const haystack = [p.title, p.category, p.categoryId ?? "", ...(p.tags ?? [])]
      .join(" ")
      .toLowerCase();
    return (
      SPECIAL_FILTERS[0].regex.test(haystack) ||
      p.topCategory === "clothing" ||
      p.topCategory === "children"
    );
  });
  const activeSpecial = SPECIAL_FILTERS.find((f) => f.key === specialFilter)!;
  const specialItems =
    specialFilter === "all"
      ? baseSpecial.slice(0, 12)
      : baseSpecial
          .filter((p) => {
            const haystack = [p.title, p.category, p.categoryId ?? "", ...(p.tags ?? [])]
              .join(" ")
              .toLowerCase();
            return activeSpecial.regex.test(haystack);
          })
          .slice(0, 12);

  // Sets / bundles: any product whose title, tags or category hint at a bundle
  const setsItems = products
    .filter((p) => {
      const haystack = [p.title, p.category, p.categoryId ?? "", ...(p.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return /\b(set|sets|bundle|collection set|volumes?|vol\.?|\d\s*[-x]\s*books?|box ?set|pack)\b/.test(
        haystack,
      );
    })
    .slice(0, 8);


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


      {/* BROWSE COLLECTIONS — horizontal scroll on all formats */}
      <section className="py-12 md:py-20">
        <div className="container-prose">
          <div className="flex items-end justify-between mb-6 md:mb-10 reveal gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
                Collections
              </span>
              <h2 className="font-display text-[28px] md:text-4xl mt-1.5 leading-[1.05]">
                Browse collections
              </h2>
            </div>
            <Link
              to="/shop"
              className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] underline underline-offset-4 hover:text-accent transition-colors"
            >
              View all
            </Link>
          </div>
        </div>
        <div
          ref={collectionsRef}
          className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 px-4 md:px-[max(2rem,calc((100vw-72rem)/2))] scroll-pl-4"
          style={{ direction: "ltr" }}
        >
          {collections.map((s) => (
            <Link
              key={s.slug}
              to="/shop"
              search={{ c: s.slug } as never}
              data-rail-item
              className="group relative shrink-0 snap-start w-[44vw] sm:w-[30vw] md:w-[240px] lg:w-[280px] xl:w-[300px] aspect-[3/4] rounded-xl overflow-hidden"
            >
              <img
                src={s.image}
                alt={s.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-background">
                <div className="font-display text-2xl md:text-3xl leading-tight">{s.title}</div>
                <div className="text-[11px] uppercase tracking-[0.16em] opacity-85 mt-1">
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

      {/* THE LIBRARY — mosaic banner of real book covers + horizontal rail */}
      <section className="pb-12 md:pb-20 border-t border-border/60">
        <MosaicBanner
          products={libraryAll.slice(0, 8)}
          eyebrow="The library"
          title="Books by language"
          description="English, Arabic, Urdu and beyond — filter to find your edition."
          ctaLabel="Shop the library"
          ctaTo="/shop"
          tone="dark"
        />

        <div className="container-prose mt-8 md:mt-10">
          {/* Filter chips */}
          <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
            <div className="flex gap-2 border-b border-border">
              {visibleLanguageFilters.map((f) => {
                const active = languageFilter === f.key;
                const count = libraryCounts[f.key];
                return (
                  <button
                    key={f.key}
                    onClick={() => setLanguageFilter(f.key)}
                    className={`shrink-0 inline-flex items-center gap-2 px-1 pb-3 -mb-px text-[12px] font-semibold uppercase tracking-[0.14em] border-b-2 transition ${
                      active
                        ? "border-foreground text-foreground"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {f.label}
                    <span className={`text-[10px] font-medium normal-case tracking-normal ${active ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          ref={libraryRef}
          className="mt-6 md:mt-8 flex gap-3 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 px-4 md:px-[max(1rem,calc((100vw-72rem)/2))] scroll-pl-4"
          style={{ direction: "ltr" }}
        >
          {libraryItems.length ? (
            <>
              {libraryItems.map((p) => (
                <div
                  key={p.slug}
                  data-rail-item
                  className="shrink-0 snap-start w-[44vw] sm:w-[32vw] md:w-[240px] lg:w-[260px]"
                >
                  <ProductCard product={p} />
                </div>
              ))}
              <Link
                to="/shop"
                data-rail-item
                className="shrink-0 snap-start w-[44vw] sm:w-[32vw] md:w-[240px] lg:w-[260px] aspect-[4/5] rounded-lg bg-secondary/40 flex flex-col items-center justify-center gap-3 text-foreground hover:bg-secondary/70 transition-colors group"
              >
                <span className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-5 w-5" />
                </span>
                <span className="font-display text-lg text-center px-3">See all</span>
              </Link>
              <div className="shrink-0 w-1 md:hidden" />
            </>
          ) : (
            <div className="container-prose py-8 text-sm text-muted-foreground">
              No titles for this language yet — try another filter.
            </div>
          )}
        </div>
      </section>

      {/* SETS / BUNDLES — image banner + rail */}
      {setsItems.length > 0 && (
        <section className="pb-12 md:pb-20 border-t border-border/60">
          <MosaicBanner
            products={setsItems.slice(0, 8)}
            eyebrow="Sets & bundles"
            title="Build a shelf in one order"
            description="Multi-volume sets and curated bundles, ready to ship together."
            ctaLabel="Shop all sets"
            ctaTo="/shop"
            tone="dark"
          />
          <div
            className="mt-6 md:mt-8 flex gap-3 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 px-4 md:px-[max(1rem,calc((100vw-72rem)/2))] scroll-pl-4"
            style={{ direction: "ltr" }}
          >
            {setsItems.map((p) => (
              <div
                key={p.slug}
                data-rail-item
                className="shrink-0 snap-start w-[44vw] sm:w-[32vw] md:w-[240px] lg:w-[260px]"
              >
                <ProductCard product={p} />
              </div>
            ))}
            <div className="shrink-0 w-1 md:hidden" />
          </div>
        </section>
      )}


      {/* SPECIAL ITEMS — brown contrast + image banner */}
      {baseSpecial.length > 0 && (
        <section className="bg-primary text-primary-foreground pb-14 md:pb-20">
          <MosaicBanner
            products={baseSpecial.slice(0, 8)}
            eyebrow="Special items"
            title="Niqab, jilbab, kufi & pens"
            description="A small, considered selection beyond the bookshelf."
            ctaLabel="Shop all special"
            ctaTo="/shop"
            ctaSearch={{ c: "clothing" }}
            tone="brand"
          />

          <div className="container-prose mt-8 md:mt-10">
            {/* Filter chips */}
            <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
              <div className="flex gap-2">
                {SPECIAL_FILTERS.map((f) => {
                  const active = specialFilter === f.key;
                  return (
                    <button
                      key={f.key}
                      onClick={() => setSpecialFilter(f.key)}
                      className={`shrink-0 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] border transition ${
                        active
                          ? "bg-primary-foreground text-primary border-primary-foreground"
                          : "border-primary-foreground/30 text-primary-foreground/85 hover:border-primary-foreground"
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {specialItems.length > 0 ? (
            <div
              className="mt-6 md:mt-8 flex gap-3 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2 px-4 md:px-[max(1rem,calc((100vw-72rem)/2))] scroll-pl-4"
              style={{ direction: "ltr" }}
            >
              {specialItems.map((p) => (
                <div
                  key={p.slug}
                  data-rail-item
                  className="shrink-0 snap-start w-[44vw] sm:w-[32vw] md:w-[240px] lg:w-[260px] bg-background text-foreground rounded-lg p-3 transition-transform duration-300 hover:-translate-y-1"
                >
                  <ProductCard product={p} />
                </div>
              ))}
              <div className="shrink-0 w-1 md:hidden" />
            </div>
          ) : (
            <div className="container-prose mt-6">
              <p className="text-sm opacity-70">
                No items match this filter yet. Try another category.
              </p>
            </div>
          )}
        </section>
      )}



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
