/**
 * Shared fetch utility. Used by both server and client callers.
 *
 * Server-side (SSR): must use absolute URL → INTERNAL_API_URL
 * Client-side (browser): uses relative URL → Next.js rewrite proxy
 */

const INTERNAL_API_URL = process.env.INTERNAL_API_URL || "http://localhost:8000";

function getBase(): string {
  const isServer = typeof window === "undefined";
  return isServer ? `${INTERNAL_API_URL}/api/v1/shop` : "/api/v1/shop";
}

export async function fetchAPI<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${getBase()}${path}`;

  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  return res.json() as Promise<T>;
}
