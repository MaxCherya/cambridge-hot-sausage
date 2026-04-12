"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { adminFetch } from "@/lib/admin/api";
import { adminKeys } from "@/lib/admin/query-keys";
import { StatusBadge } from "../../_components/status-badge";

interface MessageListItem {
  id: number;
  name: string;
  email: string;
  subject: string;
  status: string;
  created_at: string;
}

const STATUSES = ["", "new", "read", "replied", "archived"];

export default function MessagesPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  const params: Record<string, string> = {};
  if (statusFilter) params.status = statusFilter;

  const { data, isLoading } = useQuery({
    queryKey: adminKeys.messages(params),
    queryFn: () => {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      return adminFetch<{ count: number; results: MessageListItem[] }>(`/admin/messages${qs}`);
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      adminFetch(`/admin/messages/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "messages"] }),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Contact Messages</h1>

      <div className="mt-4 flex gap-1.5">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-[#5A1F1F] text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {s || "All"}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/50">
              <th className="px-4 py-3 font-semibold text-gray-500">Name</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Email</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Subject</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
              <th className="px-4 py-3 font-semibold text-gray-500">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">Loading...</td></tr>
            ) : !data || data.results.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-gray-400">No messages found</td></tr>
            ) : (
              data.results.map((msg) => (
                <tr key={msg.id} className="border-b border-gray-50 transition-colors hover:bg-gray-50/50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/messages/${msg.id}`} className="font-medium text-[#5A1F1F] hover:underline">
                      {msg.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{msg.email}</td>
                  <td className="px-4 py-3 text-gray-800">{msg.subject}</td>
                  <td className="px-4 py-3">
                    <select
                      value={msg.status}
                      onChange={(e) => statusMutation.mutate({ id: msg.id, status: e.target.value })}
                      className="rounded-md border-0 bg-transparent py-0 text-xs font-semibold focus:ring-2 focus:ring-[#5A1F1F]/20"
                    >
                      {STATUSES.filter(Boolean).map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(msg.created_at).toLocaleDateString()}
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
