/**
 * Admin API client with session cookie auth and CSRF token handling.
 * All requests include credentials (cookies) and the CSRF token header.
 */

const BASE = "/api/v1";

function getCsrfToken(): string {
  if (typeof document === "undefined") return "";
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "";
}

export async function adminFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const isFormData = init?.body instanceof FormData;

  const headers: Record<string, string> = {
    "X-CSRFToken": getCsrfToken(),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}
