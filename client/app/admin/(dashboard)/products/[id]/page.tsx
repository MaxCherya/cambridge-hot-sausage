"use client";

import { use, type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";

interface Variant {
  id: number;
  name: string;
  sku: string;
  price: string;
  compare_at_price: string | null;
  stock: number;
  is_active: boolean;
  order: number;
}

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  categories: number[];
  is_active: boolean;
  is_featured: boolean;
  variants: Variant[];
  images: Array<{ id: number; image: string | null; alt_text: string; is_primary: boolean; order: number }>;
}

interface CategoryOption {
  id: number;
  name: string;
  children: CategoryOption[];
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: adminKeys.product(Number(id)),
    queryFn: () => adminFetch<ProductDetail>(`/admin/products/${id}`),
  });

  const { data: categories } = useQuery({
    queryKey: adminKeys.categories(),
    queryFn: () => adminFetch<{ count: number; results: CategoryOption[] }>("/admin/categories"),
  });

  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Sync categories from loaded product
  if (product && !initialized) {
    setSelectedCategories(product.categories);
    setInitialized(true);
  }

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminFetch(`/admin/products/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.product(Number(id)) }),
  });

  const addVariantMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminFetch(`/admin/products/${id}/variants`, { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.product(Number(id)) }),
  });

  const deleteVariantMutation = useMutation({
    mutationFn: (variantId: number) =>
      adminFetch(`/admin/variants/${variantId}`, { method: "DELETE" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.product(Number(id)) }),
  });

  function handleSave(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    updateMutation.mutate({
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      categories: selectedCategories,
      is_active: form.get("is_active") === "on",
      is_featured: form.get("is_featured") === "on",
    });
  }

  function handleAddVariant(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    addVariantMutation.mutate({
      name: form.get("variant_name"),
      price: form.get("variant_price"),
      stock: Number(form.get("variant_stock")),
    });
    e.currentTarget.reset();
  }

  // Flatten categories
  const allCats: { id: number; name: string; depth: number }[] = [];
  for (const cat of categories?.results ?? []) {
    allCats.push({ id: cat.id, name: cat.name, depth: 0 });
    for (const child of cat.children ?? []) {
      allCats.push({ id: child.id, name: child.name, depth: 1 });
    }
  }

  if (isLoading || !product) {
    return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-[#5A1F1F]/20 border-t-[#5A1F1F]" /></div>;
  }

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5A1F1F]">
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Edit: {product.name}</h1>

      {/* Product info form */}
      <form onSubmit={handleSave} className="mt-6 max-w-2xl space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Name</label>
            <input id="name" name="name" defaultValue={product.name} required className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10" />
          </div>
          <div>
            <label htmlFor="slug" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Slug</label>
            <input id="slug" name="slug" defaultValue={product.slug} className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
          <textarea id="description" name="description" defaultValue={product.description} rows={4} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10" />
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Categories</span>
          <div className="flex flex-wrap gap-2">
            {allCats.map((cat) => (
              <label key={cat.id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategories.includes(cat.id) ? "border-[#5A1F1F] bg-[#5A1F1F]/5 text-[#5A1F1F]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              } ${cat.depth > 0 ? "ml-4" : ""}`}>
                <input type="checkbox" className="hidden" checked={selectedCategories.includes(cat.id)} onChange={() => {
                  setSelectedCategories((prev) => prev.includes(cat.id) ? prev.filter((x) => x !== cat.id) : [...prev, cat.id]);
                }} />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked={product.is_active} className="rounded border-gray-300 text-[#5A1F1F] focus:ring-[#5A1F1F]" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" defaultChecked={product.is_featured} className="rounded border-gray-300 text-[#ECD691] focus:ring-[#ECD691]" />
            Featured
          </label>
        </div>

        {updateMutation.isSuccess && <p className="text-sm text-green-600">Saved!</p>}

        <button type="submit" disabled={updateMutation.isPending} className="rounded-lg bg-[#5A1F1F] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a1919] disabled:opacity-50">
          {updateMutation.isPending ? "Saving..." : "Save changes"}
        </button>
      </form>

      {/* Variants */}
      <div className="mt-8 max-w-2xl">
        <h2 className="text-lg font-bold text-gray-900">Variants</h2>

        <div className="mt-4 space-y-2">
          {product.variants.map((v) => (
            <div key={v.id} className="flex items-center justify-between rounded-lg border border-gray-100 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{v.name}</p>
                <p className="text-xs text-gray-400">SKU: {v.sku} · Stock: {v.stock}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-800">£{v.price}</span>
                <button
                  type="button"
                  onClick={() => { if (confirm("Delete this variant?")) deleteVariantMutation.mutate(v.id); }}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add variant form */}
        <form onSubmit={handleAddVariant} className="mt-4 flex items-end gap-3 rounded-lg border border-dashed border-gray-200 bg-gray-50/50 p-4">
          <div className="flex-1">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Name</label>
            <input name="variant_name" required placeholder="e.g. Large" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
          </div>
          <div className="w-24">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Price</label>
            <input name="variant_price" type="number" step="0.01" required placeholder="0.00" className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
          </div>
          <div className="w-20">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-gray-400">Stock</label>
            <input name="variant_stock" type="number" defaultValue={999} className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
          </div>
          <button type="submit" disabled={addVariantMutation.isPending} className="inline-flex items-center gap-1 rounded-lg bg-[#5A1F1F] px-3 py-2 text-xs font-semibold text-white hover:bg-[#4a1919] disabled:opacity-50">
            <Plus size={14} /> Add
          </button>
        </form>
      </div>
    </div>
  );
}
