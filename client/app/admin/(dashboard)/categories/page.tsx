"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../_components/status-badge";

interface Category {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  order: number;
  product_count: number;
  children: Category[];
}

function CategoryRows({
  categories,
  depth,
  toggleMutation,
}: {
  categories: Category[];
  depth: number;
  toggleMutation: ReturnType<typeof useMutation<unknown, Error, { id: number; is_active: boolean }>>;
}) {
  return (
    <>
      {categories.map((cat) => (
        <CategoryRow key={cat.id} category={cat} depth={depth} toggleMutation={toggleMutation} />
      ))}
    </>
  );
}

function CategoryRow({
  category,
  depth,
  toggleMutation,
}: {
  category: Category;
  depth: number;
  toggleMutation: ReturnType<typeof useMutation<unknown, Error, { id: number; is_active: boolean }>>;
}) {
  return (
    <>
      <tr className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
        <td className="px-4 py-3 font-medium text-gray-800">
          {depth > 0 && (
            <span className="text-gray-300" style={{ paddingLeft: `${depth * 20}px` }}>
              &#x2514;{" "}
            </span>
          )}
          {category.name}
        </td>
        <td className="px-4 py-3 font-mono text-xs text-gray-500">{category.slug}</td>
        <td className="px-4 py-3">
          <button
            type="button"
            onClick={() => toggleMutation.mutate({ id: category.id, is_active: !category.is_active })}
            disabled={toggleMutation.isPending}
            className="cursor-pointer"
          >
            <StatusBadge status={category.is_active ? "active" : "inactive"} />
          </button>
        </td>
        <td className="px-4 py-3 text-gray-600">{category.order}</td>
        <td className="px-4 py-3 text-gray-600">{category.product_count}</td>
      </tr>
      {category.children.length > 0 && (
        <CategoryRows categories={category.children} depth={depth + 1} toggleMutation={toggleMutation} />
      )}
    </>
  );
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.categories(),
    queryFn: async () => {
      const res = await adminFetch<{ count: number; results: Category[] } | Category[]>("/admin/categories");
      return Array.isArray(res) ? res : res.results;
    },
  });

  const toggleMutation = useMutation<unknown, Error, { id: number; is_active: boolean }>({
    mutationFn: ({ id, is_active }) =>
      adminFetch(`/admin/categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "categories"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Categories</h1>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Slug</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Order</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Products</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No categories found</td></tr>
            ) : (
              <CategoryRows categories={data} depth={0} toggleMutation={toggleMutation} />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
