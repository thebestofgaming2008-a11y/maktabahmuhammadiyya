import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  MessageCircle,
  Minus,
  Plus,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { useCatalogProduct, useCatalogProducts } from "@/lib/catalog";
import { BOOK_SUBJECTS, CATEGORIES } from "@/data/products";
import { absoluteUrl, BRAND_SEARCH_NAME, seo, titleFromSlug } from "@/lib/seo";

export const Route = createFileRoute("/product/$slug")({
  loader: ({ params }) => {
    return { slug: params.slug };
  },
  head: ({ params }) => {
    const productTitle = titleFromSlug(params.slug);
    return {
      ...seo({
        title: `${productTitle} - Maktabah Muhammadiya`,
        description: `View ${productTitle} at Maktabah Muhammadiya with price, product details, related titles and customer reviews.`,
        path: `/product/${params.slug}`,
        type: "product",
      }),
    };
  },
  notFoundComponent: () => (
    <div className="container-prose py-20 text-center">
      <h1 className="font-display text-3xl">Product not found</h1>
      <Link to="/shop" className="mt-4 inline-block underline">
        Back to shop
      </Link>
    </div>
  ),
  errorComponent: ({ reset }) => (
    <div className="container-prose py-20 text-center">
      <h1 className="font-display text-3xl">Something went wrong</h1>
      <button type="button" onClick={reset} className="mt-4 underline">
        Try again
      </button>
    </div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { slug } = Route.useLoaderData() as { slug: string };
  const { product, loading } = useCatalogProduct(slug);
  const { products } = useCatalogProducts();
  const { add, setOpen, fmt } = useCart();
  const [activeImg, setActiveImg] = useState(0);
  const [color, setColor] = useState("");
  const [size, setSize] = useState<string | undefined>(undefined);
  const [qty, setQty] = useState(1);
  const [openSection, setOpenSection] = useState<string | null>("description");
  const [added, setAdded] = useState(false);
  const [showStickyCart, setShowStickyCart] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const mainAddRef = useRef<HTMLButtonElement>(null);
  const publishedReviews: Array<{
    _id: string;
    rating: number;
    title?: string | null;
    body: string;
    author_name?: string | null;
    created_at?: number | null;
  }> = [];

  useEffect(() => {
    if (!product) return;
    setActiveImg(0);
    setColor(product.colors[0]?.name ?? "Default");
    setSize(product.sizes?.[0]);
    setQty(1);
    setAdded(false);
  }, [product?.slug]);

  useEffect(() => {
    const button = mainAddRef.current;
    if (!button) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyCart(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.1 },
    );

    observer.observe(button);
    return () => observer.disconnect();
  }, [product?.slug]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(([entry]) => setFooterVisible(entry.isIntersecting), {
      rootMargin: "0px 0px 140px 0px",
      threshold: 0,
    });

    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  if (loading && !product) {
    return (
      <div className="container-prose grid gap-8 py-8 md:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] md:py-12">
        <div className="aspect-square rounded-lg bg-muted/70 animate-pulse md:aspect-[4/5]" />
        <div className="space-y-4">
          <div className="h-9 w-4/5 rounded bg-muted/70 animate-pulse" />
          <div className="h-6 w-1/3 rounded bg-muted/70 animate-pulse" />
          <div className="h-32 rounded bg-muted/70 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-prose py-20 text-center">
        <h1 className="font-display text-3xl">Product not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This product is not active or has not been added yet.
        </p>
        <Link to="/shop" className="mt-4 inline-block underline">
          Back to shop
        </Link>
      </div>
    );
  }

  const activeImage = product.images[activeImg] ?? product.images[0];
  const onSale = product.compareAt && product.compareAt > product.price;
  const hasColorChoices =
    product.colors.length > 1 || (product.colors[0]?.name && product.colors[0].name !== "Default");
  const hasSizeChoices = Boolean(product.sizes?.length);
  const related = products
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 4);
  const relatedFallback = related.length
    ? related
    : products.filter((item) => item.slug !== product.slug).slice(0, 4);
  const shouldShowStickyCart = showStickyCart && !footerVisible;
  const categoryLabel = labelForCategory(product.topCategory ?? product.category);
  const subjectLabels = labelsForProductSubjects(product);
  const reviewRows = Array.isArray(publishedReviews) ? publishedReviews : [];
  const reviewCount = reviewRows.length || product.reviews;
  const rating = reviewRows.length
    ? reviewRows.reduce((sum, review: any) => sum + Number(review.rating ?? 0), 0) /
      reviewRows.length
    : product.rating;
  const publicDescription = cleanBookDescription(product.description);
  const productDetails = [
    categoryLabel ? `Category: ${categoryLabel}` : null,
    subjectLabels.length ? `Subjects: ${subjectLabels.join(", ")}` : null,
    product.author ? `Author: ${product.author}` : null,
    ...product.features.filter((feature) => !isStoreProcessCopy(feature)),
  ]
    .filter(Boolean)
    .join("\n");
  const productUrl = absoluteUrl(`/product/${product.slug}`);
  const productSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    additionalType: product.topCategory === "books" ? "https://schema.org/Book" : undefined,
    name: product.title,
    description: publicDescription || product.title,
    image: product.images.map((image) => absoluteUrl(image)),
    url: productUrl,
    brand: {
      "@type": "Brand",
      name: BRAND_SEARCH_NAME,
    },
    category: [categoryLabel, ...subjectLabels].filter(Boolean).join(" > "),
    sku: product.id || product.slug,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "INR",
      price: String(product.price),
      availability: `https://schema.org/${product.inStock ? "InStock" : "OutOfStock"}`,
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: BRAND_SEARCH_NAME,
      },
    },
  };
  if (product.author) {
    productSchema.author = {
      "@type": "Person",
      name: product.author,
    };
  }
  if (rating > 0 && reviewCount > 0) {
    productSchema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(rating).toFixed(1),
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: absoluteUrl("/"),
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Shop",
        item: absoluteUrl("/shop"),
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.title,
        item: productUrl,
      },
    ],
  };

  const addToCart = () => {
    if (!product.inStock || (hasSizeChoices && !size)) return;
    add({
      slug: product.slug,
      product,
      color: color || product.colors[0]?.name || "Default",
      size,
      qty,
    });
    setAdded(true);
    setOpen(true);
    window.setTimeout(() => setAdded(false), 1200);
  };

  const sections = [
    {
      id: "description",
      title: "Description",
      body: publicDescription || "Details coming soon.",
    },
    {
      id: "details",
      title: "Product details",
      body: productDetails,
    },
    {
      id: "reviews",
      title: "Reviews",
      body: reviewCount
        ? `${Number(rating || 0).toFixed(1)} out of 5 stars from ${reviewCount} customer ${
            reviewCount === 1 ? "review" : "reviews"
          }.`
        : "No reviews yet.",
    },
  ];

  return (
    <div className="page-soft-enter pb-28 md:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([productSchema, breadcrumbSchema]) }}
      />
      <div className="container-prose py-3 text-xs text-muted-foreground md:py-5">
        <Link to="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link to="/shop" className="hover:text-foreground transition-colors">
          Shop
        </Link>
        <span className="px-2">/</span>
        <span className="text-foreground">{product.title}</span>
      </div>

      <main className="container-prose grid gap-8 md:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] md:gap-12">
        <section className="md:sticky md:top-24 md:self-start">
          <div className="overflow-hidden rounded-lg border border-border/80 bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]">
            <img
              src={activeImage}
              alt={product.title}
              className="aspect-square w-full object-contain p-4 md:aspect-[4/5] md:p-8"
            />
          </div>

          {product.images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {product.images.map((src, index) => (
                <button
                  key={`${src}-${index}`}
                  type="button"
                  onClick={() => setActiveImg(index)}
                  className={`h-20 w-16 shrink-0 overflow-hidden rounded-md border bg-white transition md:h-24 md:w-20 ${
                    index === activeImg
                      ? "border-foreground shadow-sm"
                      : "border-border/80 opacity-75 hover:opacity-100"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-contain p-1.5" />
                </button>
              ))}
            </div>
          ) : null}
        </section>

        <section>
          {product.badge ? (
            <span className="inline-flex rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground">
              {product.badge}
            </span>
          ) : null}

          <h1 className="mt-3 font-display text-[2rem] leading-[1.05] text-foreground md:text-5xl">
            {product.title}
          </h1>

          {product.author ? (
            <p className="mt-2 text-sm text-muted-foreground">By {product.author}</p>
          ) : null}

          {reviewCount > 0 ? (
            <a
              href="#reviews"
              className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-0.5 text-accent">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.round(rating) ? "fill-current" : "text-muted-foreground/30"
                    }`}
                  />
                ))}
              </span>
              {Number(rating || 0).toFixed(1)} ({reviewCount.toLocaleString()} reviews)
            </a>
          ) : null}

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-2xl font-semibold tabular-nums text-foreground md:text-3xl">
              {fmt(product.price)}
            </span>
            {onSale ? (
              <>
                <span className="text-sm text-muted-foreground line-through">
                  {fmt(product.compareAt!)}
                </span>
                <span className="rounded-full bg-sale/10 px-2 py-1 text-xs font-semibold text-sale">
                  Sale
                </span>
              </>
            ) : null}
          </div>

          <div className="mt-6 space-y-5 border-y py-5">
            {hasColorChoices ? (
              <div>
                <div className="mb-2 text-sm font-medium">Colour</div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((option) => (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setColor(option.name)}
                      className={`rounded-md border px-3.5 py-2 text-sm transition ${
                        color === option.name
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:border-foreground/60"
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {hasSizeChoices ? (
              <div>
                <div className="mb-2 text-sm font-medium">Size</div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes?.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setSize(option)}
                      className={`min-w-12 rounded-md border px-3.5 py-2 text-sm transition ${
                        size === option
                          ? "border-foreground bg-foreground text-background"
                          : "border-border bg-background hover:border-foreground/60"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-4">
              <div className="inline-flex h-11 items-center rounded-md border border-border bg-background">
                <button
                  type="button"
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="grid h-11 w-11 place-items-center rounded-l-md transition-colors hover:bg-muted"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
                <button
                  type="button"
                  onClick={() => setQty(qty + 1)}
                  className="grid h-11 w-11 place-items-center rounded-r-md transition-colors hover:bg-muted"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Check className="h-3.5 w-3.5 text-success" />
                Ready to order
              </span>
            </div>

            <button
              ref={mainAddRef}
              type="button"
              onClick={addToCart}
              disabled={!product.inStock}
              className="btn-cta flex h-12 w-full items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition disabled:cursor-not-allowed disabled:opacity-60 md:h-14"
            >
              {!product.inStock
                ? "Out of stock"
                : added
                  ? "Added to bag"
                  : `Add to cart - ${fmt(product.price * qty)}`}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 border-b py-5 text-[11px] text-muted-foreground sm:text-sm">
            <div className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap sm:justify-start sm:gap-2">
              <Truck className="h-4 w-4 text-accent" />
              <span>Worldwide delivery</span>
            </div>
            <div className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap sm:justify-start sm:gap-2">
              <MessageCircle className="h-4 w-4 text-accent" />
              <span>Order support</span>
            </div>
            <div className="flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap sm:justify-start sm:gap-2">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span>Curated titles</span>
            </div>
          </div>

          <div className="divide-y border-b">
            {sections.map((section) => (
              <div key={section.id} id={section.id === "reviews" ? "reviews" : undefined}>
                <button
                  type="button"
                  onClick={() => setOpenSection(openSection === section.id ? null : section.id)}
                  className="flex w-full items-center justify-between py-4 text-left text-sm font-medium"
                >
                  {section.title}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-300 ${
                      openSection === section.id ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${
                    openSection === section.id
                      ? "grid-rows-[1fr] pb-4 opacity-100"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  {section.id === "reviews" ? (
                    <ReviewsTabContent
                      reviewRows={reviewRows}
                      reviewCount={reviewCount}
                      rating={Number(rating || 0)}
                    />
                  ) : (
                    <div className="overflow-hidden whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {section.body}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {relatedFallback.length ? (
        <section className="container-prose pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl md:text-3xl">You may also like</h2>
              <p className="mt-1 text-sm text-muted-foreground">More titles from the collection.</p>
            </div>
            <Link to="/shop" className="hidden text-sm underline-offset-4 hover:underline md:block">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">
            {relatedFallback.map((item) => (
              <ProductCard key={item.slug} product={item} />
            ))}
          </div>
        </section>
      ) : null}

      {shouldShowStickyCart ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-3 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2.5 shadow-[0_-12px_34px_-18px_rgba(86,56,24,0.32)] backdrop-blur md:hidden animate-in slide-in-from-bottom-3 fade-in duration-200">
          <div className="mx-auto flex max-w-lg items-center gap-3">
            <img
              src={activeImage}
              alt=""
              className="h-11 w-10 shrink-0 rounded-md border bg-white object-contain p-1"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{product.title}</p>
              <p className="text-xs tabular-nums text-muted-foreground">
                {fmt(product.price * qty)}
              </p>
            </div>
            <button
              type="button"
              onClick={addToCart}
              disabled={!product.inStock}
              className="btn-cta flex h-11 shrink-0 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              {product.inStock ? "Add" : "Out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ReviewsTabContent({
  reviewRows,
  reviewCount,
  rating,
}: {
  reviewRows: any[];
  reviewCount: number;
  rating: number;
}) {
  return (
    <div className="overflow-hidden text-sm leading-relaxed text-muted-foreground">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-0.5 text-accent">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`h-4 w-4 ${
                index < Math.round(rating) ? "fill-current" : "text-muted-foreground/30"
              }`}
            />
          ))}
        </span>
        <span className="font-medium text-foreground">
          {reviewCount ? `${rating.toFixed(1)} / 5` : "No ratings yet"}
        </span>
      </div>

      {reviewRows.length ? (
        <div className="divide-y">
          {reviewRows.map((review: any) => (
            <article key={review.id} className="py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-foreground">
                    {review.customer_name || "Customer"}
                  </p>
                  {review.title ? (
                    <p className="mt-1 text-sm font-medium text-primary">{review.title}</p>
                  ) : null}
                </div>
                <span className="flex items-center gap-0.5 text-accent">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className={`h-4 w-4 ${
                        index < Math.round(Number(review.rating ?? 0))
                          ? "fill-current"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </span>
              </div>
              {review.body ? <p className="mt-3 leading-6">{review.body}</p> : null}
            </article>
          ))}
        </div>
      ) : (
        <p>No customer reviews yet.</p>
      )}
    </div>
  );
}

function isStoreProcessCopy(value?: string | null) {
  return /\b(whatsapp|admin|order\s+(request|support|through|via|on)|ordered?\s+(through|via|on)|availability|payment(?:\s+details)?|shipping(?:\s+details)?|confirmation|confirmed before|dispatch)\b/i.test(
    String(value ?? ""),
  );
}

function cleanBookDescription(value?: string | null) {
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

function labelForCategory(value?: string | null) {
  const key = String(value ?? "").trim();
  if (!key) return "";
  return CATEGORIES.find((category) => category.key === key)?.label ?? titleCase(key);
}

function labelsForProductSubjects(product: {
  category?: string;
  categoryId?: string;
  tags?: string[];
}) {
  const subjectByKey = new Map(BOOK_SUBJECTS.map((subject) => [subject.key, subject.label]));
  const subjectByLabel = new Map(
    BOOK_SUBJECTS.map((subject) => [subject.label.toLowerCase(), subject.label]),
  );
  const labels = new Set<string>();
  [product.category, product.categoryId].forEach((value) => {
    const key = String(value ?? "").trim();
    const label = subjectByKey.get(key);
    if (label) labels.add(label);
  });
  (product.tags ?? []).forEach((tag) => {
    const normalized = tag.trim().toLowerCase();
    const label = subjectByLabel.get(normalized) ?? subjectByKey.get(normalized);
    if (label) labels.add(label);
  });
  return [...labels];
}

function titleCase(value: string) {
  return value.replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
