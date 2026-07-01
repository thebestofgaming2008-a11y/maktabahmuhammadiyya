import "./lib/error-capture";

import { ConvexHttpClient } from "convex/browser";
import { api } from "../convex/_generated/api";
import { LOCAL_PRODUCTS } from "./data/products.generated";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

type RuntimeEnv = Record<string, unknown>;
type R2ObjectBody = {
  body: ReadableStream<Uint8Array> | null;
  httpMetadata?: { contentType?: string };
  writeHttpMetadata?: (headers: Headers) => void;
};
type R2BucketLike = {
  put: (
    key: string,
    value: ReadableStream<Uint8Array> | ArrayBuffer,
    options?: {
      httpMetadata?: { contentType?: string; cacheControl?: string };
      customMetadata?: Record<string, string>;
    },
  ) => Promise<unknown>;
  get: (key: string) => Promise<R2ObjectBody | null>;
};

const CATALOG_CACHE_HEADERS = {
  "cache-control": "public, max-age=15, s-maxage=30, stale-while-revalidate=60",
};
const PRODUCT_DETAIL_CACHE_HEADERS = {
  "cache-control": "no-store, max-age=0",
};
const GOOGLE_SITE_VERIFICATIONS = new Map([
  ["/googleac71228db148e3b2.html", "google-site-verification: googleac71228db148e3b2.html"],
  ["/googleac71228db148e3b2", "google-site-verification: googleac71228db148e3b2.html"],
  ["/google274c7c0c15971512.html", "google-site-verification: google274c7c0c15971512.html"],
  ["/google274c7c0c15971512", "google-site-verification: google274c7c0c15971512.html"],
]);

function jsonResponse(body: unknown, status = 200, extraHeaders?: HeadersInit) {
  const headers = new Headers(extraHeaders);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(body), {
    status,
    headers,
  });
}

function envString(env: unknown, name: string) {
  const value = (env as RuntimeEnv | null)?.[name] ?? process.env[name];
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function convexClient(env: unknown) {
  const url =
    envString(env, "VITE_CONVEX_URL") ||
    envString(env, "CONVEX_URL") ||
    import.meta.env.VITE_CONVEX_URL;
  return url ? new ConvexHttpClient(url) : null;
}

function r2Bucket(env: unknown): R2BucketLike | null {
  const runtime = (env ?? {}) as RuntimeEnv;
  const candidates = [
    runtime.PRODUCT_MEDIA_BUCKET,
    runtime.PRODUCT_IMAGES_BUCKET,
    runtime.MEDIA_BUCKET,
    runtime.R2_BUCKET,
    runtime.MAKTABA_MEDIA_BUCKET,
  ];
  return (candidates.find(
    (candidate) =>
      candidate &&
      typeof (candidate as R2BucketLike).put === "function" &&
      typeof (candidate as R2BucketLike).get === "function",
  ) ?? null) as R2BucketLike | null;
}

function safeFileName(value: string | null) {
  const cleaned = String(value ?? "product-media")
    .normalize("NFKD")
    .replace(/[^\w.\-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
  return cleaned || "product-media";
}

function extensionForContentType(contentType: string) {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/avif") return "avif";
  if (contentType === "image/gif") return "gif";
  if (contentType === "video/mp4") return "mp4";
  if (contentType === "video/webm") return "webm";
  return "bin";
}

function mediaUrlForKey(request: Request, env: unknown, key: string) {
  const publicBase = envString(env, "PUBLIC_MEDIA_URL").replace(/\/+$/, "");
  if (publicBase) return `${publicBase}/${key}`;
  const url = new URL(request.url);
  return `${url.origin}/api/media/file/${encodeURIComponent(key)}`;
}

async function liveCatalogProducts(env: unknown) {
  try {
    const client = convexClient(env);
    if (!client) return null;
    return await client.query(api.products.listActiveProducts, {});
  } catch (error) {
    console.error("Live catalog products unavailable", error);
    return null;
  }
}

async function liveCatalogProduct(env: unknown, id: string | null, slug: string | null) {
  try {
    const client = convexClient(env);
    if (!client) return null;
    if (id) return await client.query(api.products.getProductById, { id });
    if (slug) return await client.query(api.products.getProductBySlug, { slug });
    return null;
  } catch (error) {
    console.error("Live catalog product unavailable", error);
    return null;
  }
}

async function handleCatalogRequest(
  request: Request,
  rawEnv: unknown,
  _rawCtx: unknown,
): Promise<Response | null> {
  const url = new URL(request.url);
  if (request.method !== "GET") return null;
  if (url.pathname !== "/api/catalog/products" && url.pathname !== "/api/catalog/product") {
    return null;
  }

  try {
    let response: Response;

    if (url.pathname === "/api/catalog/products") {
      const products =
        (await liveCatalogProducts(rawEnv)) ??
        LOCAL_PRODUCTS.filter((product) => product.is_active !== false);
      response = jsonResponse(products, 200, CATALOG_CACHE_HEADERS);
    } else {
      const id = url.searchParams.get("id")?.trim();
      const slug = url.searchParams.get("slug")?.trim();
      if (!id && !slug) {
        return jsonResponse({ error: "Product id or slug is required." }, 400);
      }
      const product =
        (await liveCatalogProduct(rawEnv, id ?? null, slug ?? null)) ??
        LOCAL_PRODUCTS.find((item) => (id ? item.id === id : item.slug === slug));
      response = jsonResponse(product, product ? 200 : 404, PRODUCT_DETAIL_CACHE_HEADERS);
    }

    return response;
  } catch {
    return jsonResponse({ error: "Catalog is temporarily unavailable." }, 502);
  }
}

async function handleMediaRequest(request: Request, rawEnv: unknown): Promise<Response | null> {
  const url = new URL(request.url);
  const bucket = r2Bucket(rawEnv);

  if (url.pathname === "/api/media/upload") {
    if (request.method !== "POST") return jsonResponse({ error: "Method not allowed." }, 405);

    const expectedToken = envString(rawEnv, "ADMIN_UPLOAD_TOKEN");
    const receivedToken = request.headers.get("x-admin-upload-token")?.trim() ?? "";
    if (!expectedToken || receivedToken !== expectedToken) {
      return jsonResponse({ error: "Upload is not configured or authorized." }, 403);
    }
    if (!bucket) {
      return jsonResponse({ error: "R2 media bucket is not configured." }, 500);
    }

    const contentType = request.headers.get("content-type") || "application/octet-stream";
    const fileName = safeFileName(request.headers.get("x-file-name"));
    const extension = fileName.includes(".")
      ? fileName.split(".").pop()?.toLowerCase() || extensionForContentType(contentType)
      : extensionForContentType(contentType);
    const key = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;
    if (!request.body) return jsonResponse({ error: "No upload body was received." }, 400);

    await bucket.put(key, request.body, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
      customMetadata: { originalName: fileName },
    });

    return jsonResponse(
      { key, url: mediaUrlForKey(request, rawEnv, key) },
      200,
      { "cache-control": "no-store" },
    );
  }

  const mediaPrefix = "/api/media/file/";
  if (url.pathname.startsWith(mediaPrefix)) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return jsonResponse({ error: "Method not allowed." }, 405);
    }
    if (!bucket) return jsonResponse({ error: "R2 media bucket is not configured." }, 500);

    const key = decodeURIComponent(url.pathname.slice(mediaPrefix.length));
    if (!key || key.includes("..")) return jsonResponse({ error: "Invalid media key." }, 400);
    const object = await bucket.get(key);
    if (!object) return jsonResponse({ error: "Media not found." }, 404);

    const headers = new Headers();
    object.writeHttpMetadata?.(headers);
    if (!headers.has("content-type") && object.httpMetadata?.contentType) {
      headers.set("content-type", object.httpMetadata.contentType);
    }
    headers.set("cache-control", "public, max-age=31536000, immutable");
    return new Response(request.method === "HEAD" ? null : object.body, { headers });
  }

  return null;
}

function handleSiteVerificationRequest(request: Request): Response | null {
  const url = new URL(request.url);
  const verificationContent = GOOGLE_SITE_VERIFICATIONS.get(url.pathname);
  if ((request.method !== "GET" && request.method !== "HEAD") || !verificationContent) {
    return null;
  }

  return new Response(request.method === "HEAD" ? null : verificationContent, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "public, max-age=3600",
    },
  });
}

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"}; try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
    return response;
  }

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const verificationResponse = handleSiteVerificationRequest(request);
      if (verificationResponse) return verificationResponse;

      const mediaResponse = await handleMediaRequest(request, env);
      if (mediaResponse) return mediaResponse;

      const catalogResponse = await handleCatalogRequest(request, env, ctx);
      if (catalogResponse) return catalogResponse;

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
