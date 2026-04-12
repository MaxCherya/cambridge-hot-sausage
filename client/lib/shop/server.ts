/**
 * Server-side data fetchers for shop pages.
 * Called from server components to pre-render HTML for SEO.
 * Data is passed as props to client components for hydration.
 */

import { fetchAPI } from "@/lib/api";
import type {
  Category,
  PaginatedResponse,
  ProductDetail,
  ProductListItem,
} from "@/types/shop";

export async function getCategories(): Promise<Category[]> {
  const data = await fetchAPI<PaginatedResponse<Category>>("/categories");
  return data.results;
}

export async function getProducts(
  params?: Record<string, string>,
): Promise<PaginatedResponse<ProductListItem>> {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";
  return fetchAPI<PaginatedResponse<ProductListItem>>(`/products${query}`);
}

export async function getProduct(slug: string): Promise<ProductDetail> {
  return fetchAPI<ProductDetail>(`/products/${slug}`);
}
