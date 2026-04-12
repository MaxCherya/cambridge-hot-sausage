"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";

interface CategoryOption {
  id: number;
  name: string;
  slug: string;
  children: CategoryOption[];
}

export default function NewProductPage() {
  const router = useRouter();
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);

  const { data: categories } = useQuery({
    queryKey: adminKeys.categories(),
    queryFn: () => adminFetch<{ count: number; results: CategoryOption[] }>("/admin/categories"),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      adminFetch<{ id: number }>("/admin/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (result) => router.push(`/admin/products/${result.id}`),
  });

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description"),
      categories: selectedCategories,
      is_active: form.get("is_active") === "on",
      is_featured: form.get("is_featured") === "on",
    });
  }

  // Flatten categories for checkbox list
  const allCats: { id: number; name: string; depth: number }[] = [];
  for (const cat of categories?.results ?? []) {
    allCats.push({ id: cat.id, name: cat.name, depth: 0 });
    for (const child of cat.children ?? []) {
      allCats.push({ id: child.id, name: child.name, depth: 1 });
    }
  }

  return (
    <div>
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#5A1F1F]">
        <ArrowLeft size={14} /> Back to products
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">New Product</h1>

      <form onSubmit={handleSubmit} className="mt-6 max-w-2xl space-y-5 rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Name</label>
            <input id="name" name="name" required className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10" />
          </div>
          <div>
            <label htmlFor="slug" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Slug</label>
            <input id="slug" name="slug" className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10" placeholder="Auto-generated if empty" />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-gray-400">Description</label>
          <textarea id="description" name="description" rows={4} className="w-full resize-none rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-[#5A1F1F] focus:outline-none focus:ring-4 focus:ring-[#5A1F1F]/10" />
        </div>

        <div>
          <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-400">Categories</span>
          <div className="flex flex-wrap gap-2">
            {allCats.map((cat) => (
              <label key={cat.id} className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                selectedCategories.includes(cat.id) ? "border-[#5A1F1F] bg-[#5A1F1F]/5 text-[#5A1F1F]" : "border-gray-200 text-gray-600 hover:bg-gray-50"
              } ${cat.depth > 0 ? "ml-4" : ""}`}>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={selectedCategories.includes(cat.id)}
                  onChange={() => {
                    setSelectedCategories((prev) =>
                      prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                    );
                  }}
                />
                {cat.name}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_active" defaultChecked className="rounded border-gray-300 text-[#5A1F1F] focus:ring-[#5A1F1F]" />
            Active
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_featured" className="rounded border-gray-300 text-[#ECD691] focus:ring-[#ECD691]" />
            Featured
          </label>
        </div>

        {createMutation.isError && (
          <p className="text-sm text-red-600">Failed to create product. Check your inputs.</p>
        )}

        <button
          type="submit"
          disabled={createMutation.isPending}
          className="rounded-lg bg-[#5A1F1F] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#4a1919] disabled:opacity-50"
        >
          {createMutation.isPending ? "Creating..." : "Create product"}
        </button>
      </form>
    </div>
  );
}
