"use client";

import { type FormEvent, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ChevronRight, ChevronDown, Edit2, Plus, Trash2, X } from "lucide-react";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string;
  parent: number | null;
  is_active: boolean;
  order: number;
  children: Category[];
  product_count: number;
}

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [createParentId, setCreateParentId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.categories(),
    queryFn: async () => {
      const res = await adminFetch<{ results: Category[] } | Category[]>("/admin/categories");
      return Array.isArray(res) ? res : res.results;
    },
  });

  const createMutation = useMutation({
    mutationFn: (d: Record<string, unknown>) => adminFetch("/admin/categories", { method: "POST", body: JSON.stringify(d) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category created");
      setShowCreate(false);
      setCreateParentId(null);
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }: { id: number } & Record<string, unknown>) => adminFetch(`/admin/categories/${id}`, { method: "PATCH", body: JSON.stringify(d) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category updated");
      setEditingId(null);
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => adminFetch(`/admin/categories/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
      toast.success("Category deleted");
    },
    onError: () => toast.error("Failed to delete category"),
  });

  function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    createMutation.mutate({
      name: form.get("name"),
      slug: form.get("slug") || "",
      description: form.get("description") || "",
      parent: createParentId,
      is_active: true,
      order: 0,
    });
  }

  function handleUpdate(e: FormEvent<HTMLFormElement>, id: number) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    updateMutation.mutate({
      id,
      name: form.get("name"),
      slug: form.get("slug"),
      description: form.get("description") || "",
      is_active: form.get("is_active") === "on",
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <button
          type="button"
          onClick={() => { setShowCreate(true); setCreateParentId(null); }}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#5A1F1F] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#4a1919]"
        >
          <Plus size={16} /> Add category
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <form onSubmit={handleCreate} className="mt-4 rounded-xl border border-dashed border-[#5A1F1F]/30 bg-[#5A1F1F]/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">
              New {createParentId ? "subcategory" : "category"}
            </span>
            <button type="button" onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
          </div>
          <div className="flex gap-3">
            <input name="name" required placeholder="Name" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            <input name="slug" placeholder="Slug (auto)" className="w-40 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            <input name="description" placeholder="Description" className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            <button type="submit" disabled={createMutation.isPending} className="rounded-lg bg-[#5A1F1F] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4a1919] disabled:opacity-50">
              Create
            </button>
          </div>
        </form>
      )}

      {/* Category tree */}
      <div className="mt-6 space-y-1">
        {isLoading ? (
          <div className="py-12 text-center text-gray-400">Loading...</div>
        ) : !data || data.length === 0 ? (
          <div className="py-12 text-center text-gray-400">No categories</div>
        ) : (
          data.map((cat) => (
            <CategoryNode
              key={cat.id}
              category={cat}
              depth={0}
              editingId={editingId}
              setEditingId={setEditingId}
              onUpdate={handleUpdate}
              onDelete={(id) => { if (confirm("Delete this category and all its children?")) deleteMutation.mutate(id); }}
              onAddChild={(parentId) => { setCreateParentId(parentId); setShowCreate(true); }}
            />
          ))
        )}
      </div>
    </div>
  );
}

function CategoryNode({
  category: cat,
  depth,
  editingId,
  setEditingId,
  onUpdate,
  onDelete,
  onAddChild,
}: {
  category: Category;
  depth: number;
  editingId: number | null;
  setEditingId: (id: number | null) => void;
  onUpdate: (e: FormEvent<HTMLFormElement>, id: number) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentId: number) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const isEditing = editingId === cat.id;
  const hasChildren = cat.children.length > 0;

  return (
    <div style={{ paddingLeft: depth * 24 }}>
      <div className="group flex items-center gap-2 rounded-lg border border-gray-100 bg-white px-3 py-2.5 shadow-sm transition-colors hover:bg-gray-50/50">
        {/* Expand toggle */}
        {hasChildren ? (
          <button type="button" onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-[14px]" />
        )}

        {isEditing ? (
          <form onSubmit={(e) => onUpdate(e, cat.id)} className="flex flex-1 items-center gap-2">
            <input name="name" defaultValue={cat.name} required className="w-40 rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            <input name="slug" defaultValue={cat.slug} className="w-40 rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            <input name="description" defaultValue={cat.description} className="flex-1 rounded border border-gray-200 px-2 py-1 text-sm focus:border-[#5A1F1F] focus:outline-none" />
            <label className="flex items-center gap-1 text-xs"><input type="checkbox" name="is_active" defaultChecked={cat.is_active} className="rounded border-gray-300" /> Active</label>
            <button type="submit" className="rounded bg-[#5A1F1F] px-2 py-1 text-xs font-semibold text-white">Save</button>
            <button type="button" onClick={() => setEditingId(null)} className="text-xs text-gray-400">Cancel</button>
          </form>
        ) : (
          <>
            <span className={`flex-1 text-sm font-medium ${cat.is_active ? "text-gray-800" : "text-gray-400 line-through"}`}>
              {cat.name}
            </span>
            <span className="text-xs text-gray-400">{cat.slug}</span>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">{cat.product_count} products</span>
            <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              <button type="button" onClick={() => onAddChild(cat.id)} title="Add subcategory" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Plus size={13} /></button>
              <button type="button" onClick={() => setEditingId(cat.id)} title="Edit" className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"><Edit2 size={13} /></button>
              <button type="button" onClick={() => onDelete(cat.id)} title="Delete" className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"><Trash2 size={13} /></button>
            </div>
          </>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="mt-1 space-y-1">
          {cat.children.map((child) => (
            <CategoryNode
              key={child.id}
              category={child}
              depth={depth + 1}
              editingId={editingId}
              setEditingId={setEditingId}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddChild={onAddChild}
            />
          ))}
        </div>
      )}
    </div>
  );
}
