"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/context";

interface SessionData {
  customer_name: string;
  customer_email: string;
  amount_total: number;
  currency: string;
  payment_status: string;
  receipt_url: string;
}

export function CheckoutSuccess() {
  const t = useTranslations("cart.success");
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cleared, setCleared] = useState(false);

  // Clear cart once on success
  useEffect(() => {
    if (!cleared && sessionId) {
      clearCart();
      setCleared(true);
    }
  }, [sessionId, clearCart, cleared]);

  // Fetch session details
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      return;
    }

    fetch(`/api/v1/orders/session?session_id=${sessionId}`)
      .then((res) => res.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sessionId]);

  return (
    <section className="relative bg-brand-cream pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="mx-auto max-w-2xl px-6 text-center">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-maroon/20 border-t-brand-maroon" />
          </div>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-sage/10">
              <CheckCircle className="h-10 w-10 text-brand-sage" strokeWidth={1.5} />
            </div>

            <span className="mt-6 block text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs">
              {t("eyebrow")}
            </span>

            <h1 className="mt-3 font-display text-4xl text-brand-maroon sm:text-5xl">
              {t("title")}
            </h1>

            <p className="mt-4 text-base text-brand-ink/60 sm:text-lg">
              {t("subtitle")}
            </p>

            {data && (
              <div className="mx-auto mt-10 max-w-sm rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 text-left backdrop-blur-sm">
                {data.customer_name && (
                  <p className="text-sm text-brand-ink/70">
                    <span className="font-semibold text-brand-ink">{data.customer_name}</span>
                  </p>
                )}
                {data.customer_email && (
                  <p className="mt-1 text-xs text-brand-ink/45">{data.customer_email}</p>
                )}
                <div className="mt-4 flex items-center justify-between border-t border-brand-maroon/5 pt-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-brand-ink/50">
                    {t("total")}
                  </span>
                  <span className="font-display text-2xl text-brand-maroon">
                    £{data.amount_total.toFixed(2)}
                  </span>
                </div>

                {data.receipt_url && (
                  <a
                    href={data.receipt_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-maroon transition-colors hover:text-brand-maroon/70"
                  >
                    <ExternalLink size={14} />
                    {t("viewReceipt")}
                  </a>
                )}
              </div>
            )}

            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-maroon px-6 py-3 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_10px_25px_-8px_rgba(90,31,31,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_35px_-8px_rgba(90,31,31,0.55)]"
            >
              {t("backToShop")}
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
