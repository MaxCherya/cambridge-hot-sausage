import type { MetadataRoute } from "next";

const BASE = "https://www.hotsausagecompany.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = [
    "",
    "/about",
    "/shop",
    "/locations",
    "/events",
    "/reviews",
    "/contact",
    "/legal/privacy",
    "/legal/terms",
    "/legal/cookies",
  ];

  return staticPages.map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/shop" ? 0.9 : 0.7,
  }));
}
