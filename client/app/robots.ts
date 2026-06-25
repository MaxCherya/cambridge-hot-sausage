import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt — controls how search-engine + LLM crawlers see the site.
 *
 * We explicitly welcome every major web + AI crawler we know about. They
 * already obey `User-agent: *` but naming them removes any ambiguity, and
 * gives us a single place to revoke a specific bot in the future if its
 * policy changes.
 *
 * Public content (everything except /admin, /api, /cart, /checkout) is
 * indexable. The cart and checkout pages also carry `robots: noindex`
 * metadata as a belt-and-braces measure.
 *
 * See also: /llms.txt (curated business summary for LLM agents).
 */
const AI_BOTS = [
  "GPTBot",          // OpenAI / ChatGPT crawler
  "OAI-SearchBot",   // OpenAI search index crawler
  "ChatGPT-User",    // OpenAI on-demand ChatGPT fetcher
  "ClaudeBot",       // Anthropic Claude crawler
  "Claude-Web",      // Anthropic Claude on-demand fetcher
  "anthropic-ai",    // Anthropic legacy UA
  "Google-Extended", // Google Bard / Gemini training opt-in flag
  "PerplexityBot",   // Perplexity AI
  "Perplexity-User", // Perplexity user-triggered fetcher
  "Applebot-Extended",
  "Bytespider",      // ByteDance / Doubao
  "CCBot",           // Common Crawl (used as training data by many models)
  "Amazonbot",
  "Meta-ExternalAgent",
];

export default function robots(): MetadataRoute.Robots {
  const sharedDisallow = ["/admin", "/api", "/cart", "/checkout"];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: sharedDisallow,
      },
      // Explicitly allow each major AI crawler — same scope as humans + Google.
      ...AI_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: sharedDisallow,
      })),
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
