"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import type {
  PaginatedResponse,
  ProductListItem,
  ReviewSubmission,
} from "@/types/shop";

const BASE = "/api/v1/shop";

async function shopFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, init);
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json();
}

export const shopKeys = {
  products: (params: Record<string, string>) => ["shop", "products", params] as const,
};

export function useFilteredProducts(
  params: Record<string, string>,
  initialData?: PaginatedResponse<ProductListItem>,
) {
  return useQuery({
    queryKey: shopKeys.products(params),
    queryFn: () => {
      const qs = new URLSearchParams(params).toString();
      return shopFetch<PaginatedResponse<ProductListItem>>(
        qs ? `/products?${qs}` : "/products",
      );
    },
    initialData,
    staleTime: 1000 * 60 * 2,
  });
}

export function useSubmitReview(productSlug: string) {
  return useMutation({
    mutationFn: (data: ReviewSubmission) =>
      shopFetch<{ detail: string }>(`/products/${productSlug}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website: "" }),
      }),
  });
}
