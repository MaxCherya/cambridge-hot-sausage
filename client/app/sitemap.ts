import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/shop/server";
import { canonicalFor } from "@/lib/seo";

interface PageEntry {
  path: string;
  priority: number;
  changeFrequency: "weekly" | "monthly" | "daily" | "yearly";
}

// Public, indexable pages. `/cart`, `/checkout/*` and the event-success page
// are deliberately omitted (they're noindex at the page level).
const STATIC_PAGES: PageEntry[] = [
  { path: "/", priority: 1, changeFrequency: "weekly" },
  { path: "/shop", priority: 0.9, changeFrequency: "daily" },
  { path: "/locations", priority: 0.85, changeFrequency: "monthly" },
  { path: "/events", priority: 0.85, changeFrequency: "weekly" },
  { path: "/about", priority: 0.75, changeFrequency: "monthly" },
  { path: "/reviews", priority: 0.75, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" },
  { path: "/chilli-challenge", priority: 0.7, changeFrequency: "monthly" },
  { path: "/legal/privacy", priority: 0.3, changeFrequency: "yearly" },
  { path: "/legal/terms", priority: 0.3, changeFrequency: "yearly" },
  { path: "/legal/cookies", priority: 0.3, changeFrequency: "yearly" },
];

// Force fresh rendering daily so newly added products land in the sitemap.
export const revalidate = 86400;

function buildEntry(path: string, lastModified: Date, priority: number, changeFrequency: PageEntry["changeFrequency"]): MetadataRoute.Sitemap[number] {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = canonicalFor(path, locale);
  }
  return {
    url: canonicalFor(path, routing.defaultLocale),
    lastModified,
    changeFrequency,
    priority,
    alternates: {
      languages,
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const entries: MetadataRoute.Sitemap = STATIC_PAGES.map(({ path, priority, changeFrequency }) =>
    buildEntry(path, now, priority, changeFrequency),
  );

  // Pull every active product slug from the backend so search engines can
  // discover product pages without crawling the listing page first.
  try {
    let nextUrl: string | null = "/products?page=1";
    while (nextUrl) {
      const params = new URLSearchParams(nextUrl.split("?")[1] || "");
      const data = await getProducts(Object.fromEntries(params));
      for (const product of data.results) {
        const lastModified = product.created_at ? new Date(product.created_at) : now;
        entries.push(buildEntry(`/shop/${product.slug}`, lastModified, 0.8, "weekly"));
      }
      // DRF returns absolute URLs; we only need the page number.
      if (data.next) {
        const url = new URL(data.next);
        const page = url.searchParams.get("page");
        nextUrl = page ? `/products?page=${page}` : null;
      } else {
        nextUrl = null;
      }
      // Safety bound — never iterate forever if the API misbehaves.
      if (entries.length > 5000) break;
    }
  } catch {
    // Backend unavailable at build/runtime — return only static entries.
    // Sitemap revalidates daily so this self-heals on the next run.
  }

  // sitemap.ts is auto-served at /sitemap.xml; SITE_URL is used implicitly
  // via canonicalFor() above.
  return entries;
}

