"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";

interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  is_featured: boolean;
  variant_count: number;
  category_names: string[];
  created_at: string;
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (search) params.search = search;

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.products(Object.keys(params).length > 0 ? params : undefined),
    queryFn: () => {
      const qs = new URLSearchParams();
      if (search) qs.set("search", search);
      const queryString = qs.toString();
      return adminFetch<{ count: number; results: ProductListItem[] }>(
        `/admin/products${queryString ? `?${queryString}` : ""}`,
      );
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: number; field: string; value: boolean }) =>
      adminFetch(`/admin/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ [field]: value }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product updated");
    },
    onError: () => toast.error("Failed to update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminFetch(`/admin/products/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      toast.success("Product deleted");
    },
    onError: () => toast.error("Failed to delete product"),
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-500">{data?.count ?? 0} products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5A1F1F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a1919]"
        >
          <Plus size={16} /> Add product
        </Link>
      </div>

      {/* Search input */}
      <div className="mt-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full max-w-xs rounded-lg border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">Product</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Categories</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Variants</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Active</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Featured</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.results.length === 0 ? (
              <tr><td colSpan={6} className="py-12 text-center text-gray-400">No products</td></tr>
            ) : (
              data.results.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/products/${p.id}`} className="font-medium text-[#5A1F1F] hover:underline">
                      {p.name}
                    </Link>
                    <p className="text-xs text-gray-400">{p.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.category_names.map((c) => (
                        <span key={c} className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">{c}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.variant_count}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate({ id: p.id, field: "is_active", value: !p.is_active })}
                      className={`h-5 w-9 rounded-full transition-colors ${p.is_active ? "bg-green-500" : "bg-gray-300"}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${p.is_active ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => toggleMutation.mutate({ id: p.id, field: "is_featured", value: !p.is_featured })}
                      className={`h-5 w-9 rounded-full transition-colors ${p.is_featured ? "bg-[#ECD691]" : "bg-gray-300"}`}
                    >
                      <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform ${p.is_featured ? "translate-x-4" : "translate-x-0.5"}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/products/${p.id}`} className="text-xs font-medium text-[#5A1F1F] hover:underline">
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(p.id); }}
                        className="text-xs font-medium text-red-500 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
