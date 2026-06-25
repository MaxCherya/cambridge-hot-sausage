"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalCount: number;
  pageSize: number;
  onChange: (page: number) => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  className?: string;
}

/**
 * Cursor-style pagination for DRF-paginated admin tables.
 *
 * The backend returns `{ count, next, previous, results }`. We compute the
 * page number client-side from `(count, page, pageSize)` — the server is the
 * source of truth for `count`, and `hasNext`/`hasPrev` flags come from the
 * `next`/`previous` URLs.
 */
export function Pagination({
  page,
  totalCount,
  pageSize,
  onChange,
  hasNext,
  hasPrev,
  className = "",
}: PaginationProps) {
  if (totalCount <= pageSize) return null;

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const startItem = (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, totalCount);

  const canPrev = hasPrev ?? safePage > 1;
  const canNext = hasNext ?? safePage < totalPages;

  return (
    <div className={`flex items-center justify-between border-t border-gray-100 px-4 py-3 ${className}`}>
      <p className="text-xs text-gray-500">
        Showing <span className="font-semibold text-gray-700">{startItem}</span>–<span className="font-semibold text-gray-700">{endItem}</span> of <span className="font-semibold text-gray-700">{totalCount}</span>
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(safePage - 1)}
          disabled={!canPrev}
          aria-label="Previous page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="text-xs font-medium text-gray-600">
          Page <span className="font-semibold text-gray-800">{safePage}</span> / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onChange(safePage + 1)}
          disabled={!canNext}
          aria-label="Next page"
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}

export const ADMIN_PAGE_SIZE = 24;
