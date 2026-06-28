export type Product = {
  id?: string;
  slug: string;
  title: string;
  author?: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  category: string;
  categoryId?: string;
  topCategory?: string;
  badge?: string;
  colors: { name: string; hex: string }[];
  sizes?: string[];
  images: string[];
  description: string;
  features: string[];
  inStock: boolean;
  language?: string;
  tags?: string[];
  isFeatured?: boolean;
  isBestseller?: boolean;
  isNewArrival?: boolean;
  showInCategorySection?: boolean;
};

export const products: Product[] = [];

export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const collections = [
  { slug: "quran", title: "Qur'an" },
  { slug: "tafsir", title: "Tafsir" },
  { slug: "hadith", title: "Hadith" },
  { slug: "aqeedah", title: "Aqeedah" },
  { slug: "fiqh", title: "Fiqh" },
  { slug: "seerah", title: "Seerah" },
];
