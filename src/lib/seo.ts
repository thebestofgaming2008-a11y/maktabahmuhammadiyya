export const SITE_URL = (
  import.meta.env.VITE_PUBLIC_SITE_URL || "https://maktabahmuhammadiya.pages.dev"
).replace(/\/+$/, "");

export const BRAND_NAME = "Maktabah Muhammadiya";
export const BRAND_SEARCH_NAME = "Maktabah Muhammadiya";
export const BRAND_ALTERNATE_NAMES = [
  "Maktabah al-Muhammadiyyah",
  "Maktabah Muhammadiyyah",
  "Maktabah Muhammadiya Islamic Books",
  "Maktabahmuhammadiya",
];

export const DEFAULT_TITLE = `${BRAND_SEARCH_NAME} - Curated Islamic Books`;

export const DEFAULT_DESCRIPTION =
  "Shop curated Islamic books, Arabic and Urdu titles, modest clothing, and selected essentials from Maktabah Muhammadiya. Browse by subject with personal order support and worldwide delivery.";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function titleFromSlug(slug: string) {
  return slug
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function seo({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noIndex = false,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "product" | "article";
  noIndex?: boolean;
} = {}) {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    meta: [
      { title },
      { name: "description", content: description },
      {
        name: "robots",
        content: noIndex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      {
        name: "googlebot",
        content: noIndex
          ? "noindex, nofollow"
          : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
      },
      { property: "og:site_name", content: BRAND_NAME },
      { property: "og:locale", content: "en_IN" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: url },
      { property: "og:image", content: imageUrl },
      { property: "og:image:secure_url", content: imageUrl },
      { property: "og:image:type", content: "image/png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Maktabah Muhammadiya Islamic bookshop" },
      {
        name: "keywords",
        content:
          "Maktabah Muhammadiya, Maktabah al-Muhammadiyyah, Maktabah Muhammadiyyah, Islamic books, Arabic books, Urdu books, Islamic bookshop",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: imageUrl },
      { name: "twitter:image:alt", content: "Maktabah Muhammadiya Islamic bookshop" },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
