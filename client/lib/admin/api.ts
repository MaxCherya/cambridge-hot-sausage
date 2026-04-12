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
  const csrfToken = getCsrfToken();

  const headers: Record<string, string> = {
    ...(csrfToken ? { "X-CSRFToken": csrfToken } : {}),
    ...(!isFormData ? { "Content-Type": "application/json" } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }

  if (res.status === 403) {
    // Try to read the error — could be CSRF failure or permission denied
    const body = await res.text();
    // CSRF failures contain "CSRF" in the response
    if (body.includes("CSRF")) {
      throw new Error("CSRF token expired. Please refresh the page.");
    }
    // Actual permission denied → redirect to login
    if (typeof window !== "undefined" && !window.location.pathname.includes("/admin/login")) {
      window.location.href = "/admin/login";
    }
    throw new Error("Forbidden");
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }

  if (res.status === 204) return null as T;
  return res.json() as Promise<T>;
}
