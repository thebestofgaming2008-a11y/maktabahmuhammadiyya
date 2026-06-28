import "./lib/error-capture";

import { LOCAL_PRODUCTS } from "./data/products.generated";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
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

async function handleCatalogRequest(
  request: Request,
  _rawEnv: unknown,
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
      const products = LOCAL_PRODUCTS.filter((product) => product.is_active !== false);
      response = jsonResponse(products, 200, CATALOG_CACHE_HEADERS);
    } else {
      const id = url.searchParams.get("id")?.trim();
      const slug = url.searchParams.get("slug")?.trim();
      if (!id && !slug) {
        return jsonResponse({ error: "Product id or slug is required." }, 400);
      }
      const product = LOCAL_PRODUCTS.find((item) => (id ? item.id === id : item.slug === slug));
      response = jsonResponse(product, product ? 200 : 404, PRODUCT_DETAIL_CACHE_HEADERS);
    }

    return response;
  } catch {
    return jsonResponse({ error: "Catalog is temporarily unavailable." }, 502);
  }
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
