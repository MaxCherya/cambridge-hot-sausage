"use client";

import { useTranslations } from "next-intl";
import { ArrowRight, Lock, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/context";

export function CartView() {
  const t = useTranslations("cart.page");
  const { items, totalItems, subtotal, removeItem, updateQuantity } = useCart();

  if (totalItems === 0) {
    return (
      <section className="relative bg-brand-cream pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-brand-maroon/5">
            <ShoppingBag className="h-12 w-12 text-brand-maroon/20" strokeWidth={1.2} />
          </div>
          <h1 className="mt-8 font-display text-3xl text-brand-maroon sm:text-4xl">
            {t("title")}
          </h1>
          <p className="mt-4 text-base text-brand-ink/50">{t("empty")}</p>
          <Link
            href="/shop"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_15px_35px_-12px_rgba(90,31,31,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_20px_45px_-12px_rgba(90,31,31,0.65)]"
          >
            {t("continueShopping")}
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-brand-cream pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="mx-auto max-w-5xl px-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-brand-sage sm:text-xs">
              {t("eyebrow")}
            </span>
            <h1 className="mt-2 font-display text-3xl text-brand-maroon sm:text-4xl lg:text-5xl">
              {t("title")}
            </h1>
          </div>
          <span className="text-sm text-brand-ink/40">
            {totalItems} {totalItems === 1 ? t("item") : t("item") + "s"}
          </span>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          {/* Items column */}
          <div className="space-y-3 lg:col-span-2">
            {items.map((item) => (
              <div
                key={item.variantId}
                className="group flex gap-4 rounded-2xl border border-brand-maroon/6 bg-white/70 p-4 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-brand-maroon/15 hover:shadow-[0_8px_30px_-10px_rgba(90,31,31,0.08)] sm:gap-5 sm:p-5"
              >
                {/* Image */}
                <Link
                  href={`/shop/${item.productSlug}`}
                  className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-brand-cream/80 transition-transform duration-500 group-hover:scale-[1.03] sm:h-28 sm:w-28"
                >
                  {item.image ? (
                    <img src={item.image} alt={item.productName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-3xl text-brand-maroon/10">
                        {item.productName.charAt(0)}
                      </span>
                    </div>
                  )}
                </Link>

                {/* Info */}
                <div className="flex min-w-0 flex-1 flex-col justify-between">
                  <div>
                    <Link
                      href={`/shop/${item.productSlug}`}
                      className="text-sm font-semibold text-brand-ink transition-colors hover:text-brand-maroon sm:text-base"
                    >
                      {item.productName}
                    </Link>
                    <p className="mt-0.5 text-xs text-brand-ink/40">{item.variantName}</p>
                  </div>

                  <div className="mt-3 flex items-end justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-1.5 rounded-full border border-brand-maroon/10 bg-brand-cream/50 px-1">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-brand-ink/50 transition-colors hover:bg-brand-maroon/10 hover:text-brand-maroon"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums text-brand-ink">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-brand-ink/50 transition-colors hover:bg-brand-maroon/10 hover:text-brand-maroon"
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Price + remove */}
                    <div className="flex items-center gap-4">
                      <span className="font-display text-xl text-brand-maroon">
                        £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(item.variantId)}
                        className="text-brand-ink/20 transition-colors hover:text-red-500"
                        aria-label={t("remove")}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue shopping */}
            <Link
              href="/shop"
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand-ink/40 transition-colors hover:text-brand-maroon"
            >
              {t("continueShopping")}
            </Link>
          </div>

          {/* Summary column — sticky */}
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl border border-brand-maroon/8 bg-white/70 p-6 backdrop-blur-sm sm:p-8">
              <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-ink/50">
                {t("subtotal")}
              </h2>

              <div className="mt-4 space-y-3 border-t border-brand-maroon/5 pt-4">
                {items.map((item) => (
                  <div key={item.variantId} className="flex items-center justify-between text-xs">
                    <span className="truncate text-brand-ink/50">
                      {item.productName} <span className="text-brand-ink/30">x{item.quantity}</span>
                    </span>
                    <span className="ml-2 tabular-nums text-brand-ink/70">
                      £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-brand-maroon/5 pt-4">
                <span className="text-sm font-medium text-brand-ink/60">{t("total")}</span>
                <span className="font-display text-3xl text-brand-maroon">
                  £{subtotal.toFixed(2)}
                </span>
              </div>
              <p className="mt-1 text-right text-[10px] text-brand-ink/30">{t("shipping")}</p>

              <button
                type="button"
                onClick={async () => {
                  const res = await fetch("/api/v1/orders/checkout", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      items: items.map((i) => ({
                        variant_id: i.variantId,
                        quantity: i.quantity,
                      })),
                    }),
                  });
                  const data = await res.json();
                  if (data.url) window.location.href = data.url;
                }}
                className="group mt-6 flex w-full items-center justify-center gap-2.5 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_15px_35px_-12px_rgba(90,31,31,0.5)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_20px_45px_-12px_rgba(90,31,31,0.65)] active:scale-100"
              >
                {t("checkout")}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              <p className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-brand-ink/25">
                <Lock size={10} />
                {t("secureBadge")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
