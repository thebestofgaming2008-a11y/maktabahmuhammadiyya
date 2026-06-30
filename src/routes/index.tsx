import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { useCatalogProducts } from "@/lib/catalog";
import type { Product } from "@/lib/products";
import { productSubjectKeys } from "@/data/products";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  ShoppingBag,
} from "lucide-react";

import niqabHero from "@/assets/niqab-transparent.png.asset.json";
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

type HeroSlide = {
  eyebrow: string;
  title: string;
  sub: string;
  cta: string;
  category: string;
  product: string; // transparent png URL
  bg: "cream" | "brown";
};

const heroSlides: HeroSlide[] = [
  {
    eyebrow: "Modest clothing",
    title: "Niqabs & jilbabs, carefully selected.",
    sub: "Simple, modest pieces alongside a curated Islamic bookshop.",
    cta: "Shop clothing",
    category: "clothing",
    product: niqabHero.url,
    bg: "cream",
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

type BannerTone = "cream" | "brown";

function ProductBanner({
  products,
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaTo,
  ctaSearch,
  tone = "cream",
  imageSrc,
}: {
  products: Product[];
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaTo: string;
  ctaSearch?: Record<string, string>;
  tone?: BannerTone;
  imageSrc?: string;
}) {
  const covers = products
    .map((p) => p.images?.[0])
    .filter((src): src is string => Boolean(src))
    .slice(0, 4);

  const isBrown = tone === "brown";
  const panel = isBrown
    ? "bg-primary text-primary-foreground"
    : "bg-secondary/50 text-foreground";
  const ruleColor = isBrown ? "bg-primary-foreground/40" : "bg-foreground/30";
  const ctaClass = isBrown
    ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
    : "bg-foreground text-background hover:bg-foreground/90";
  const subColor = isBrown ? "text-primary-foreground/80" : "text-muted-foreground";

  return (
    <div className={`w-full ${panel}`}>
      <div className="container-prose grid md:grid-cols-2 items-center gap-10 md:gap-16 py-14 md:py-24">
        {/* TEXT */}
        <div className="order-2 md:order-1 max-w-lg">
          <div className="flex items-center gap-3">
            <span className={`h-px w-8 ${ruleColor}`} />
            <span className="text-[11px] uppercase tracking-[0.28em] font-medium">
              {eyebrow}
            </span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl mt-5 leading-[1.04] tracking-[-0.01em]">
            {title}
          </h2>
          <p className={`mt-5 text-[15px] leading-relaxed ${subColor}`}>
            {description}
          </p>
          <Link
            to={ctaTo}
            search={ctaSearch as never}
            className={`mt-8 inline-flex items-center gap-2 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${ctaClass}`}
          >
            {ctaLabel}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* PRODUCT COMPOSITION — transparent product images */}
        <div className="order-1 md:order-2 relative h-[280px] sm:h-[340px] md:h-[440px] lg:h-[480px] min-w-0 overflow-hidden">
          {imageSrc ? (
            <img
              src={imageSrc}
              alt=""
              aria-hidden
              loading="lazy"
              className="absolute inset-0 m-auto h-full w-full object-contain"
            />
          ) : covers.length > 0 ? (
            <div className="absolute inset-0 flex items-end justify-center gap-2 sm:gap-4 px-2">
              {covers.map((src, i) => {
                const total = covers.length;
                // center one bigger, side ones smaller (staggered shelf)
                const isCenter = i === Math.floor(total / 2);
                return (
                  <img
                    key={`${src}-${i}`}
                    src={src}
                    alt=""
                    aria-hidden
                    loading="lazy"
                    className={`min-w-0 object-contain ${
                      isCenter ? "h-full" : "h-[78%] md:h-[82%]"
                    }`}
                    style={{ maxWidth: `calc(${100 / total}% - 0.75rem)` }}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function isStoreProcessCopy(value?: string | null) {
  return /\b(whatsapp|admin|order\s+(request|support|through|via|on)|ordered?\s+(through|via|on)|availability|payment(?:\s+details)?|shipping(?:\s+details)?|confirmation|confirmed before|dispatch)\b/i.test(
    String(value ?? ""),
  );
}

function cleanFeaturedDescription(value?: string | null) {
  const raw = String(value ?? "")
    .replace(/\s+/g, " ")
    .replace(/\s*,?\s*prepared for WhatsApp ordering through Maktabah Muhammadiya\.?/gi, ".")
    .replace(/\bA selected (English|Arabic|Urdu|Hindi) title covering\b/gi, "A $1 title covering")
    .replace(/\s+([.,!?])/g, "$1")
    .replace(/\.{2,}/g, ".")
    .trim();
  if (!raw) return "";
  const cleaned = raw
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence && !isStoreProcessCopy(sentence))
    .join(" ")
    .trim();
  return cleaned || (isStoreProcessCopy(raw) ? "" : raw);
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
  const { add, setOpen, fmt } = useCart();
  const booksOnly = products.filter((product) => product.topCategory === "books");
  const featuredPool = products.filter(
    (product) => product.isNewArrival || product.isFeatured || product.showInCategorySection,
  );
  const featured = (featuredPool.length ? featuredPool : products).slice(0, 8);
  const [slide, setSlide] = useState(0);
  const [specialFilter, setSpecialFilter] = useState<(typeof SPECIAL_FILTERS)[number]["key"]>("all");
  const [languageFilter, setLanguageFilter] = useState<"all" | "english" | "arabic" | "urdu" | "other">("all");
  const [selectedSetSlug, setSelectedSetSlug] = useState<string | null>(null);
  const [featuredSetOpen, setFeaturedSetOpen] = useState<string | null>(null);
  const collectionsRef = useRef<HTMLDivElement>(null);
  const libraryRef = useRef<HTMLDivElement>(null);

  // Hero is static; slide is user-controlled via dots only — no auto-rotation, no animations.


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
  const setCandidates = products
    .filter((p) => {
      const haystack = [p.title, p.category, p.categoryId ?? "", ...(p.tags ?? [])]
        .join(" ")
        .toLowerCase();
      return /\b(set|sets|bundle|collection set|volumes?|vol\.?|\d\s*[-x]\s*books?|box ?set|pack)\b/.test(
        haystack,
      );
    })
    .slice(0, 8);
  const setPrioritySlug = "tafseer-as-sadi-10-volume-set";
  const setProducts = [...setCandidates].sort((a, b) =>
    a.slug === setPrioritySlug ? -1 : b.slug === setPrioritySlug ? 1 : a.title.localeCompare(b.title),
  );
  const selectedSet =
    setProducts.find((product) => product.slug === selectedSetSlug) ?? setProducts[0] ?? null;
  const selectedSetIndex = Math.max(
    0,
    setProducts.findIndex((product) => product.slug === selectedSet?.slug),
  );

  useEffect(() => {
    if (!setProducts.length) return;
    if (!selectedSetSlug || !setProducts.some((product) => product.slug === selectedSetSlug)) {
      setSelectedSetSlug(setProducts[0].slug);
    }
  }, [selectedSetSlug, setProducts]);

  const addSelectedSet = () => {
    if (!selectedSet) return;
    add({
      slug: selectedSet.slug,
      product: selectedSet,
      color: selectedSet.colors[0]?.name ?? "Default",
      size: selectedSet.sizes?.[0],
      qty: 1,
    });
    setOpen(true);
  };
  const selectSetByOffset = (offset: number) => {
    if (!setProducts.length) return;
    const nextIndex = (selectedSetIndex + offset + setProducts.length) % setProducts.length;
    setSelectedSetSlug(setProducts[nextIndex].slug);
    setFeaturedSetOpen(null);
  };
  const featuredSetDescription =
    cleanFeaturedDescription(selectedSet?.description) ||
    "A complete Tafseer set for building a serious home library.";
  const featuredSetDetails = selectedSet
    ? [
        selectedSet.language ? `Language: ${selectedSet.language}` : null,
        selectedSet.badge ? `Format: ${selectedSet.badge}` : null,
        selectedSet.tags?.length ? `Subjects: ${selectedSet.tags.join(", ")}` : null,
      ]
        .filter(Boolean)
        .join("\n")
    : "";
  const featuredSetSections = [
    { id: "description", title: "Description", body: featuredSetDescription },
    { id: "details", title: "Product details", body: featuredSetDetails || "Details coming soon." },
    {
      id: "reviews",
      title: "Reviews",
      body:
        selectedSet && selectedSet.reviews > 0
          ? `${Number(selectedSet.rating || 0).toFixed(1)} out of 5 stars from ${selectedSet.reviews} customer ${
              selectedSet.reviews === 1 ? "review" : "reviews"
            }.`
          : "No reviews yet.",
    },
  ];


  return (
    <div>
      {/* HERO — static, simple, transparent product on a cream/brown panel */}
      {(() => {
        const bookCovers = booksOnly
          .slice(0, 3)
          .map((p) => p.images?.[0])
          .filter((src): src is string => Boolean(src));
        const whereIsAllahCover = booksOnly.find((product) => product.slug === "where-is-allah")?.images?.[0];
        const dynamicSlides: Array<HeroSlide & { covers?: string[] }> = [
          ...heroSlides,
          {
            eyebrow: "Islamic books",
            title: "Build a library you can return to.",
            sub: "Aqeedah, Tafsir, Hadith, Seerah and carefully chosen study titles.",
            cta: "Browse books",
            category: "books",
            product: whereIsAllahCover ?? bookCovers[0] ?? "",
            bg: "cream",
            covers: whereIsAllahCover ? [whereIsAllahCover] : bookCovers,
          },
        ];
        const s = dynamicSlides[slide % dynamicSlides.length] ?? dynamicSlides[0];
        const isBrown = s.bg === "brown";
        const panel = isBrown
          ? "bg-primary text-primary-foreground"
          : "bg-secondary/50 text-foreground";
        const rule = isBrown ? "bg-primary-foreground/40" : "bg-foreground/30";
        const ctaClass = isBrown
          ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          : "bg-foreground text-background hover:bg-foreground/90";
        const subColor = isBrown ? "text-primary-foreground/80" : "text-muted-foreground";
        const covers = s.covers ?? [s.product].filter(Boolean);

        return (
          <section className={`relative ${panel}`}>
            <div className="container-prose grid md:grid-cols-2 items-center gap-10 md:gap-12 py-12 md:py-20 lg:py-24">
              {/* TEXT */}
              <div className="order-2 md:order-1 max-w-xl">
                <div className="flex items-center gap-3">
                  <span className={`h-px w-8 ${rule}`} />
                  <span className="text-[11px] uppercase tracking-[0.28em] font-medium">
                    {s.eyebrow}
                  </span>
                </div>
                <h1 className="font-display text-[36px] md:text-6xl lg:text-[64px] mt-5 leading-[1.02] tracking-[-0.01em]">
                  {s.title}
                </h1>
                <p className={`mt-5 text-[15px] md:text-base leading-relaxed max-w-md ${subColor}`}>
                  {s.sub}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    to="/shop"
                    search={{ c: s.category } as never}
                    className={`inline-flex items-center gap-2 px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] transition ${ctaClass}`}
                  >
                    {s.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* PRODUCT */}
              <div className="order-1 md:order-2 relative h-[320px] sm:h-[400px] md:h-[480px] lg:h-[540px] min-w-0 overflow-hidden">
                {covers.length > 1 ? (
                  <div className="absolute inset-0 flex items-end justify-center gap-2 sm:gap-4 px-2">
                    {covers.slice(0, 3).map((src, i) => {
                      const isCenter = i === 1;
                      return (
                        <img
                          key={`${src}-${i}`}
                          src={src}
                          alt=""
                          aria-hidden
                          className={`min-w-0 max-w-[31%] object-contain ${
                            isCenter ? "h-full" : "h-[80%]"
                          }`}
                        />
                      );
                    })}
                  </div>
                ) : covers[0] ? (
                  <img
                    src={covers[0]}
                    alt={s.title}
                    className="absolute inset-0 m-auto h-full w-full object-contain"
                  />
                ) : null}
              </div>
            </div>

            {/* Slide dots */}
            {dynamicSlides.length > 1 && (
              <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {dynamicSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setSlide(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1 rounded-full transition-all ${
                      i === (slide % dynamicSlides.length)
                        ? `w-8 ${isBrown ? "bg-primary-foreground" : "bg-foreground"}`
                        : `w-4 ${isBrown ? "bg-primary-foreground/40" : "bg-foreground/30"} hover:opacity-80`
                    }`}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })()}


      {/* Guarantee strip — cream, no dividers */}
      <section className="border-b border-border/60 bg-background">
        <div className="container-prose grid grid-cols-2 md:grid-cols-4 gap-y-4">
          {[
            { t: "Curated", d: "Hand-picked titles" },
            { t: "Authentic", d: "Trusted publishers" },
            { t: "Worldwide", d: "Careful packing" },
            { t: "Support", d: "Personal order help" },
          ].map((f) => (
            <div key={f.t} className="px-4 py-6 text-center">
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
          className="rail-prose flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
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
        <ProductBanner
          products={libraryAll.slice(0, 8)}
          eyebrow="The library"
          title="Books by language"
          description="English, Arabic, Urdu and beyond — filter to find your edition."
          ctaLabel="Shop the library"
          ctaTo="/shop"
          tone="cream"
          imageSrc="/product-images/maktaba/banners/language-books-cropped.png"
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
          className="rail-prose mt-6 md:mt-8 flex gap-3 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
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

      {/* SETS / BUNDLES - compact set inspector */}
      {selectedSet && (
        <section className="pb-12 md:pb-20 border-t border-border/60">
          <div className="bg-secondary/50">
            <div className="container-prose grid items-center gap-8 py-12 md:grid-cols-[0.95fr_1.05fr] md:gap-12 md:py-20">
              <div className="order-2 max-w-xl md:order-1">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-foreground/30" />
                  <span className="text-[11px] font-medium uppercase tracking-[0.28em]">
                    Sets & bundles
                  </span>
                </div>
                <h2 className="mt-5 font-display text-3xl leading-[1.04] tracking-[-0.01em] md:text-5xl">
                  {selectedSet.title}
                </h2>
                {selectedSet.author ? (
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-muted-foreground md:text-sm">
                    {selectedSet.author}
                  </p>
                ) : null}
                <div className="mt-5 text-2xl font-semibold tabular-nums">
                  {fmt(selectedSet.price)}
                </div>
                <button
                  type="button"
                  onClick={addSelectedSet}
                  disabled={!selectedSet.inStock}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-foreground px-8 py-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {selectedSet.inStock ? "Add to cart" : "Sold out"}
                </button>
                <div className="mt-7 divide-y border-y border-border/80">
                  {featuredSetSections.map((section) => (
                    <div key={section.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setFeaturedSetOpen(featuredSetOpen === section.id ? null : section.id)
                        }
                        className="flex w-full items-center justify-between py-4 text-left text-sm font-medium"
                      >
                        {section.title}
                        <ChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${
                            featuredSetOpen === section.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      <div
                        className={`grid transition-all duration-300 ${
                          featuredSetOpen === section.id
                            ? "grid-rows-[1fr] pb-4 opacity-100"
                            : "grid-rows-[0fr] opacity-0"
                        }`}
                      >
                        <div className="overflow-hidden whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                          {section.body}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 md:order-2">
                <div className="relative h-[300px] overflow-hidden rounded-lg bg-background md:h-[500px]">
                  <img
                    src={selectedSet.images[0]}
                    alt={selectedSet.title}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-contain p-7 transition duration-500"
                  />
                  {setProducts.length > 1 ? (
                    <>
                      <button
                        type="button"
                        onClick={() => selectSetByOffset(-1)}
                        className="absolute left-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-sm transition hover:bg-foreground hover:text-background"
                        aria-label="Previous set"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => selectSetByOffset(1)}
                        className="absolute right-3 top-1/2 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-border/80 bg-background/90 text-foreground shadow-sm transition hover:bg-foreground hover:text-background"
                        aria-label="Next set"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  ) : null}
                </div>
                {setProducts.length > 1 ? (
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {selectedSetIndex + 1} / {setProducts.length}
                    </p>
                    <div className="flex items-center gap-2" aria-label="Choose a set">
                      {setProducts.map((product, index) => {
                        const active = product.slug === selectedSet.slug;
                        return (
                          <button
                            key={product.slug}
                            type="button"
                            onClick={() => {
                              setSelectedSetSlug(product.slug);
                              setFeaturedSetOpen(null);
                            }}
                            className={`h-1.5 rounded-full transition-all ${
                              active ? "w-8 bg-foreground" : "w-3 bg-foreground/25 hover:bg-foreground/50"
                            }`}
                            aria-label={`View set ${index + 1}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </section>
      )}


      {/* SPECIAL ITEMS — brown contrast + image banner */}
      {baseSpecial.length > 0 && (
        <section className="bg-primary text-primary-foreground pb-14 md:pb-20">
          <ProductBanner
            products={baseSpecial.slice(0, 8)}
            eyebrow="Special items"
            title="Niqab, jilbab, kufi & pens"
            description="A small, considered selection beyond the bookshelf."
            ctaLabel="Shop all special"
            ctaTo="/shop"
            ctaSearch={{ c: "clothing" }}
            tone="brown"
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
              className="rail-prose mt-6 md:mt-8 flex gap-3 md:gap-5 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-2"
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



      {/* WHATSAPP SUPPORT */}
      <section className="bg-secondary/40 border-y">
        <div className="container-prose py-14 md:py-20">
          <div className="grid md:grid-cols-2 gap-10 items-center reveal">
            <div>
              <span className="text-[11px] uppercase tracking-[0.22em] text-accent font-medium">
                Talk to us
              </span>
              <h2 className="font-display text-3xl md:text-5xl mt-2 leading-[1.05]">
                Need help choosing a book?
              </h2>
              <p className="text-muted-foreground mt-4 text-sm md:text-base leading-relaxed max-w-md">
                Ask about availability, editions, shipping or recommendations. We reply personally
                on WhatsApp — usually within a few hours.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a
                  href="https://whatsapp.com/channel/0029VbB3VMzCBtx88CK0Hm3Y"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 bg-[#25D366] text-white px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] hover:brightness-95 transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 border border-foreground/20 px-7 py-3.5 text-[12px] font-semibold uppercase tracking-[0.14em] hover:bg-foreground hover:text-background transition"
                >
                  All contact options
                </Link>
              </div>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { t: "Replies in hours", d: "Real person, not a bot" },
                { t: "Order help", d: "Availability & shipping" },
                { t: "Recommendations", d: "By subject or level" },
                { t: "Worldwide", d: "We ship globally" },
              ].map((b) => (
                <li key={b.t} className="bg-card border rounded-lg p-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] font-semibold">{b.t}</p>
                  <p className="text-sm text-muted-foreground mt-1">{b.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

