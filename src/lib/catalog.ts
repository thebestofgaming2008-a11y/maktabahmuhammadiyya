import { useEffect, useMemo, useState } from "react";
import {
  getProductBySlug as fetchServiceProductBySlug,
  listActiveProducts,
} from "@/services/productService";
import { products as fallbackProducts, type Product } from "./products";
import { normalizeBookSubject, productSubjectKeys } from "@/data/products";

type BackendProduct = Record<string, any>;
const CATALOG_CACHE_KEY = "maktabah-catalog-v6";
const OLD_CATALOG_CACHE_KEYS = ["maktabah-catalog-v4", "maktabah-catalog-v5"];
const CATALOG_TTL_MS = 15 * 1000;
let memoryCatalog: { expiresAt: number; products: Product[] } | null = null;
let inFlightCatalog: Promise<Product[]> | null = null;

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.map((value) => String(value ?? "").trim()).filter(Boolean)));
}

const BOOK_SUBJECTS = new Set([
  "aqeedah",
  "arabic",
  "character-development",
  "family-marriage",
  "fiqh",
  "hadith",
  "islamic-history",
  "purification",
  "quran",
  "seerah",
  "tafsir",
  "urdu",
  "womens-issues",
]);

function cleanKey(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function normalizedSubjectKey(value: unknown) {
  const subject = normalizeBookSubject(String(value ?? ""));
  return subject === "dua-adhkar" ? "purification" : subject;
}

function getTopCategory(category: unknown, categoryId: unknown) {
  const top = cleanKey(category);
  const id = cleanKey(categoryId);
  if (top === "clothing" || id === "clothing") return "clothing";
  if (top === "children" || id === "children" || top === "essentials" || id === "essentials") {
    return "children";
  }
  if (top === "books" || id === "books" || BOOK_SUBJECTS.has(id) || BOOK_SUBJECTS.has(top)) {
    return "books";
  }
  return top || id || "books";
}

function productImageUrl(url: string | null | undefined) {
  if (!url) return "";
  return String(url)
    .replace(
      "/product-images/maktaba/01-final-shop-jpg/",
      "/product-images/maktaba/06-professional-staged-jpg/",
    )
    .replace(
      "/product-images/maktaba/04-polished-safe-jpg/",
      "/product-images/maktaba/06-professional-staged-jpg/",
    );
}

function readCatalogCache() {
  if (memoryCatalog && memoryCatalog.expiresAt > Date.now() && memoryCatalog.products.length) {
    return memoryCatalog.products;
  }
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CATALOG_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { expiresAt?: number; products?: Product[] };
    if (!parsed.expiresAt || parsed.expiresAt < Date.now() || !Array.isArray(parsed.products)) {
      window.localStorage.removeItem(CATALOG_CACHE_KEY);
      return null;
    }
    const products = parsed.products;
    memoryCatalog = { expiresAt: parsed.expiresAt, products };
    return products.length ? products : null;
  } catch {
    return null;
  }
}

function writeCatalogCache(products: Product[]) {
  if (!products.length) return;
  const expiresAt = Date.now() + CATALOG_TTL_MS;
  memoryCatalog = { expiresAt, products };
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CATALOG_CACHE_KEY, JSON.stringify({ expiresAt, products }));
  } catch {
    // Cache is only for perceived speed.
  }
}

export function clearCatalogCache() {
  memoryCatalog = null;
  inFlightCatalog = null;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(CATALOG_CACHE_KEY);
    OLD_CATALOG_CACHE_KEYS.forEach((key) => window.localStorage.removeItem(key));
  } catch {
    // Ignore storage failures.
  }
}

export function mapBackendProduct(product: BackendProduct): Product {
  const regularPrice = Number(product.price_inr ?? product.price ?? 0);
  const salePrice = product.sale_price_inr == null ? null : Number(product.sale_price_inr);
  const tags = Array.isArray(product.tags) ? product.tags.map(String).filter(Boolean) : [];
  const inferredSubjects = productSubjectKeys({
    name: String(product.name ?? ""),
    slug: String(product.slug ?? ""),
    author: product.author ? String(product.author) : null,
    publisher: product.publisher ? String(product.publisher) : null,
    category: product.category ? String(product.category) : null,
    category_id: product.category_id ? String(product.category_id) : null,
    tags,
    search_text: [product.short_description, product.description, product.language, ...tags]
      .filter(Boolean)
      .join(" "),
  }).map((key) => (key === "dua-adhkar" ? "purification" : key));
  const rawCategoryId = cleanKey(product.category_id ?? product.category ?? "books");
  const topCategory = getTopCategory(product.category, product.category_id);
  const subjectFromCategory = normalizedSubjectKey(rawCategoryId);
  const categoryId =
    topCategory === "books"
      ? subjectFromCategory || inferredSubjects[0] || rawCategoryId || "books"
      : rawCategoryId;
  const cover = productImageUrl(product.cover_image_url);
  const gallery = Array.isArray(product.images) ? product.images.map(productImageUrl) : [];
  const images = unique([cover, ...gallery]);
  const colors = Array.isArray(product.color_options)
    ? product.color_options.map((name: string) => ({ name: String(name), hex: "#d7d1c7" }))
    : [];
  const featureValues = unique([
    product.publisher ? `Publisher: ${product.publisher}` : null,
    product.language ? `Language: ${product.language}` : null,
    product.edition ? `Edition: ${product.edition}` : null,
  ]);

  return {
    id: String(product.id ?? product._id ?? product.slug ?? product.name),
    slug: String(product.slug ?? product.id ?? product._id),
    title: String(product.name ?? "Untitled product"),
    author: product.author ? String(product.author) : undefined,
    price: salePrice && salePrice > 0 ? salePrice : regularPrice,
    compareAt: salePrice && salePrice > 0 && regularPrice > salePrice ? regularPrice : undefined,
    rating: Number(product.rating ?? 0) || 0,
    reviews: Number(product.reviews_count ?? 0) || 0,
    category: categoryId,
    categoryId,
    topCategory,
    badge: product.badge ? (String(product.badge) as Product["badge"]) : undefined,
    colors: colors.length ? colors : [{ name: "Default", hex: "#d7d1c7" }],
    sizes: Array.isArray(product.size_options)
      ? product.size_options.map(String).filter(Boolean)
      : undefined,
    images: images.length ? images : ["/placeholder.svg"],
    description: String(product.description ?? product.short_description ?? ""),
    features: featureValues,
    inStock: product.in_stock !== false && Number(product.stock_quantity ?? 0) > 0,
    language: product.language ? (String(product.language) as Product["language"]) : undefined,
    tags,
    isFeatured: product.is_featured === true,
    isBestseller: product.is_bestseller === true,
    isNewArrival: product.is_new_arrival === true,
    showInCategorySection: product.show_in_category_section === true,
  };
}

async function fetchActiveProducts() {
  if (inFlightCatalog) return inFlightCatalog;
  inFlightCatalog = listActiveProducts()
    .then((rows) => {
      const products = Array.isArray(rows) ? rows.map(mapBackendProduct) : [];
      writeCatalogCache(products);
      return products;
    })
    .finally(() => {
      inFlightCatalog = null;
    });
  return inFlightCatalog;
}

async function fetchProductBySlug(slug: string) {
  const product = await fetchServiceProductBySlug(slug);
  return product ? mapBackendProduct(product as BackendProduct) : null;
}

export function useCatalogProducts() {
  const [remoteProducts, setRemoteProducts] = useState<Product[] | null>(() => readCatalogCache());
  const [loading, setLoading] = useState(remoteProducts === null);

  useEffect(() => {
    let cancelled = false;
    setLoading(remoteProducts === null);
    fetchActiveProducts()
      .then((items) => {
        if (!cancelled) setRemoteProducts(items.length ? items : null);
      })
      .catch(() => {
        if (!cancelled) setRemoteProducts(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const products = useMemo(
    () => (remoteProducts !== null ? remoteProducts : fallbackProducts),
    [remoteProducts],
  );

  return { products, loading, usingFallback: remoteProducts === null };
}

export function useCatalogProduct(slug: string, fallback?: Product | null) {
  const [remoteProduct, setRemoteProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchProductBySlug(slug)
      .then((product) => {
        if (!cancelled) setRemoteProduct(product);
      })
      .catch(() => {
        if (!cancelled) setRemoteProduct(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return { product: remoteProduct ?? fallback ?? null, loading };
}
