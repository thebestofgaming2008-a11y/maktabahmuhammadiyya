import { LOCAL_PRODUCTS } from "@/data/products.generated";
import type { Product } from "./productService";

export const PRODUCT_BUCKET = "local-product-images";

export interface ProductInput extends Partial<Product> {
  name: string;
  price_inr: number;
}

let productRows: Product[] = LOCAL_PRODUCTS.map((product) => ({ ...product }));

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

export async function listAllProducts(): Promise<Product[]> {
  return productRows;
}

export async function createProduct(input: ProductInput): Promise<Product | null> {
  const product = {
    id: `local-${Date.now()}`,
    slug: input.slug || slugify(input.name),
    short_description: input.short_description ?? "",
    description: input.description ?? input.short_description ?? "",
    author: input.author ?? null,
    publisher: input.publisher ?? null,
    language: input.language ?? "English",
    pages: input.pages ?? null,
    isbn: input.isbn ?? null,
    binding: input.binding ?? null,
    edition: input.edition ?? null,
    weight_g: input.weight_g ?? null,
    length_cm: input.length_cm ?? null,
    width_cm: input.width_cm ?? null,
    height_cm: input.height_cm ?? null,
    shipping_class: input.shipping_class ?? null,
    weight_source_url: input.weight_source_url ?? null,
    weight_confidence: input.weight_confidence ?? null,
    price: input.price ?? input.price_inr,
    sale_price: input.sale_price ?? null,
    sale_price_inr: input.sale_price_inr ?? null,
    sku: input.sku ?? null,
    stock_quantity: input.stock_quantity ?? 999,
    category: input.category ?? "books",
    category_id: input.category_id ?? input.category ?? "books",
    tags: input.tags ?? ["Books"],
    cover_image_url: input.cover_image_url ?? null,
    images: input.images ?? [input.cover_image_url].filter(Boolean) as string[],
    linked_product_ids: input.linked_product_ids ?? [],
    variant_label: input.variant_label ?? null,
    color_options: input.color_options ?? [],
    size_options: input.size_options ?? [],
    option_types: input.option_types ?? [],
    badge: input.badge ?? null,
    rating: input.rating ?? null,
    reviews_count: input.reviews_count ?? 0,
    is_active: input.is_active ?? true,
    is_featured: input.is_featured ?? false,
    show_in_category_section: input.show_in_category_section ?? false,
    is_new_arrival: input.is_new_arrival ?? false,
    is_bestseller: input.is_bestseller ?? false,
    is_on_sale: input.is_on_sale ?? false,
    in_stock: input.in_stock ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    search_text: null,
    name: input.name,
    price_inr: input.price_inr,
  } satisfies Product;
  productRows = [product, ...productRows];
  return product;
}

export async function updateProduct(
  id: string,
  patch: Partial<ProductInput>,
): Promise<Product | null> {
  let updated: Product | null = null;
  productRows = productRows.map((product) => {
    if (product.id !== id) return product;
    updated = { ...product, ...patch, updated_at: new Date().toISOString() } as Product;
    return updated;
  });
  return updated;
}

export async function deleteProduct(id: string): Promise<boolean> {
  productRows = productRows.filter((product) => product.id !== id);
  return true;
}

export async function refreshPublicCatalog(_product?: unknown) {
  return;
}

export async function uploadProductImage(file: File): Promise<string | null> {
  return URL.createObjectURL(file);
}

export interface ShippingRate {
  id: string;
  carrier: string;
  zone: string;
  method: string;
  base_fee: number;
  per_item_fee: number;
  per_weight_fee: number;
  is_active: boolean;
  updated_at: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  body: string;
  section: string;
}

export interface AdminShippingAddress {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  country?: string | null;
}

export async function listShippingRates(): Promise<ShippingRate[]> {
  return [
    {
      id: "local-worldwide",
      carrier: "WhatsApp confirmation",
      zone: "Worldwide",
      method: "Manual quote",
      base_fee: 0,
      per_item_fee: 0,
      per_weight_fee: 0,
      is_active: true,
      updated_at: new Date().toISOString(),
    },
  ];
}

export async function updateShippingRate(
  id: string,
  patch: Partial<ShippingRate>,
): Promise<ShippingRate | null> {
  return { ...(await listShippingRates())[0], id, ...patch };
}

export async function getStoreSettings(): Promise<Record<string, unknown>> {
  return {
    brandName: "Maktabah Muhammadiya",
    whatsappOnly: true,
    redesignExport: true,
  };
}

export async function saveStoreSettings(): Promise<boolean> {
  return true;
}

export async function listAdminNotifications(): Promise<AdminNotification[]> {
  return [
    {
      id: "local-redesign",
      title: "Lovable redesign export",
      body: "This admin is backed by local demo data only.",
      section: "settings",
    },
  ];
}

export interface AdminOrder {
  id: string;
  order_number: string | null;
  user_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  status: string | null;
  payment_status: string | null;
  shipping_payment_status?: string | null;
  shipping_payment_note?: string | null;
  customer_country_type?: string | null;
  shipping_address?: AdminShippingAddress | null;
  shipping_cost?: number | null;
  tracking_carrier?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  total: number;
  total_inr: number | null;
  created_at: string | null;
  items?: Array<{
    id: string;
    product_id?: string | null;
    product_name?: string | null;
    product_image_url?: string | null;
    selected_color?: string | null;
    selected_size?: string | null;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
}

export async function listAllOrders(limit = 100): Promise<AdminOrder[]> {
  const sample = LOCAL_PRODUCTS[0];
  return [
    {
      id: "local-order-1",
      order_number: "#DEMO-001",
      user_id: "local-user",
      customer_email: "customer@example.com",
      customer_name: "Demo Customer",
      customer_phone: "+91 00000 00000",
      status: "requested",
      payment_status: "pending_whatsapp",
      shipping_payment_status: "confirmed_on_whatsapp",
      customer_country_type: "international",
      shipping_address: { country: "India", city: "Demo City", address_line_1: "Demo address" },
      total: sample?.price_inr ?? 0,
      total_inr: sample?.price_inr ?? 0,
      created_at: new Date().toISOString(),
      items: sample
        ? [
            {
              id: "local-item-1",
              product_id: sample.id,
              product_name: sample.name,
              product_image_url: sample.cover_image_url,
              quantity: 1,
              unit_price: sample.price_inr,
              subtotal: sample.price_inr,
            },
          ]
        : [],
    },
  ].slice(0, limit);
}

export interface PaymentRecovery {
  id: string;
  razorpay_order_id: string;
  payment_id: string | null;
  status: string;
  customer: { name?: string; email?: string; phone?: string };
  amount_paise: number;
  error: string | null;
  updated_at: string;
}

export async function listPaymentRecoveries(): Promise<PaymentRecovery[]> {
  return [];
}

export async function updateOrderStatus(_id?: string, _status?: string): Promise<boolean> {
  return true;
}

export async function updateOrderTracking(_id?: string, _patch?: unknown): Promise<AdminOrder | null> {
  return (await listAllOrders(1))[0] ?? null;
}

export interface AdminCustomer {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  total_orders: number | null;
  total_spent: number | null;
  created_at: string | null;
}

export async function listAllCustomers(): Promise<AdminCustomer[]> {
  return [
    {
      id: "local-customer-1",
      user_id: "local-user",
      email: "customer@example.com",
      full_name: "Demo Customer",
      phone: "+91 00000 00000",
      total_orders: 1,
      total_spent: LOCAL_PRODUCTS[0]?.price_inr ?? 0,
      created_at: new Date().toISOString(),
    },
  ];
}

export interface AdminReview {
  id: string;
  product_id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_email: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  media_urls: string[] | null;
  status: string;
  admin_note: string | null;
  created_at: string | null;
}

export async function listAllReviews(): Promise<AdminReview[]> {
  return [
    {
      id: "local-review-1",
      product_id: LOCAL_PRODUCTS[0]?.id ?? "local-product",
      user_id: null,
      customer_name: "Demo Customer",
      customer_email: "customer@example.com",
      rating: 5,
      title: null,
      body: "Beautifully packed and easy to order.",
      media_urls: [],
      status: "published",
      admin_note: null,
      created_at: new Date().toISOString(),
    },
  ];
}

export async function createAdminReview(input: {
  productId: string;
  rating: number;
  customerName?: string | null;
  customerEmail?: string | null;
  title?: string | null;
  body?: string | null;
  status?: "pending" | "published" | "hidden";
}): Promise<AdminReview | null> {
  return {
    id: `local-review-${Date.now()}`,
    product_id: input.productId,
    user_id: null,
    customer_name: input.customerName ?? "Demo Customer",
    customer_email: input.customerEmail ?? null,
    rating: input.rating,
    title: input.title ?? null,
    body: input.body ?? null,
    media_urls: [],
    status: input.status ?? "published",
    admin_note: null,
    created_at: new Date().toISOString(),
  };
}

export async function updateReviewStatus(): Promise<boolean> {
  return true;
}
