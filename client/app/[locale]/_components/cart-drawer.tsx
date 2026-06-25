"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ArrowRight, Lock, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/lib/cart/context";

export function CartDrawer() {
  const t = useTranslations("cart.page");
  const {
    items, totalItems, subtotal, drawerOpen,
    closeDrawer, removeItem, updateQuantity,
  } = useCart();

  const overlayRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<HTMLDivElement>(null);

  // gsap is dynamic-imported so the layout chunk doesn't pay for it.
  // The drawer is closed at first paint anyway, so deferring the animation
  // runtime is invisible to the user.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!overlayRef.current || !popoverRef.current) return;
    let cancelled = false;

    (async () => {
      const { default: gsap } = await import("gsap");
      if (cancelled || !overlayRef.current || !popoverRef.current) return;

      if (drawerOpen) {
        const isMobile = window.innerWidth < 640;
        const slideFrom = isMobile ? 40 : -8;

        gsap.set(overlayRef.current, { display: "block" });
        gsap.to(overlayRef.current, { opacity: 1, duration: 0.25, ease: "power2.out" });
        gsap.fromTo(
          popoverRef.current,
          { opacity: 0, y: slideFrom, scale: 0.97, display: "none" },
          { opacity: 1, y: 0, scale: 1, display: "flex", duration: 0.35, ease: "power3.out" },
        );

        if (itemsRef.current) {
          gsap.fromTo(
            itemsRef.current.children,
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.25, ease: "power3.out", stagger: 0.04, delay: 0.1 },
          );
        }
      } else {
        const isMobile = window.innerWidth < 640;
        const slideTo = isMobile ? 40 : -8;

        gsap.to(popoverRef.current, {
          opacity: 0, y: slideTo, scale: 0.97, duration: 0.2, ease: "power2.in",
          onComplete: () => { if (popoverRef.current) popoverRef.current.style.display = "none"; },
        });
        gsap.to(overlayRef.current, {
          opacity: 0, duration: 0.2, ease: "power2.in",
          onComplete: () => { if (overlayRef.current) overlayRef.current.style.display = "none"; },
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [drawerOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && drawerOpen) closeDrawer();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <>
      {/* Invisible overlay to catch outside clicks */}
      <div
        ref={overlayRef}
        onClick={closeDrawer}
        className="fixed inset-0 z-[90] hidden bg-black/30 backdrop-blur-sm sm:bg-transparent sm:backdrop-blur-none"
        style={{ opacity: 0 }}
      />

      {/* Compact popover — anchored to top-right near the cart icon */}
      <div
        ref={popoverRef}
        onWheel={(e) => e.stopPropagation()}
        className="fixed inset-x-3 bottom-3 top-auto z-[95] hidden max-h-[75vh] flex-col overflow-hidden overscroll-contain rounded-2xl border border-brand-maroon/10 bg-brand-cream shadow-[0_20px_60px_-15px_rgba(90,31,31,0.25)] sm:inset-x-auto sm:bottom-auto sm:right-6 sm:top-16 sm:w-[380px]"
        style={{ display: "none" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-brand-maroon/6 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-brand-maroon" strokeWidth={2} />
            <span className="text-sm font-semibold text-brand-ink">{t("title")}</span>
            {totalItems > 0 && (
              <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-maroon px-1 text-[10px] font-bold text-brand-cream">
                {totalItems}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-brand-ink/40 transition-all duration-200 hover:bg-brand-maroon/10 hover:text-brand-maroon"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        </div>

        {totalItems === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-10">
            <ShoppingBag className="h-10 w-10 text-brand-maroon/10" strokeWidth={1.2} />
            <p className="text-xs text-brand-ink/40">{t("empty")}</p>
          </div>
        ) : (
          <>
            {/* Items — scrollable */}
            <div ref={itemsRef} className="max-h-[320px] space-y-2 overflow-y-auto overscroll-contain px-4 py-3">
              {items.map((item) => (
                <div
                  key={item.variantId}
                  className="flex items-center gap-3 rounded-xl border border-brand-maroon/5 bg-white/60 p-2.5 transition-[border-color] duration-300 hover:border-brand-maroon/12"
                >
                  {/* Thumbnail */}
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-brand-cream/80">
                    {item.image ? (
                      <Image src={item.image} alt={item.productName} fill sizes="48px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <span className="font-display text-sm text-brand-maroon/10">
                          {item.productName.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-brand-ink">{item.productName}</p>
                    <p className="text-[10px] text-brand-ink/35">{item.variantName}</p>
                  </div>

                  {/* Qty controls */}
                  <div className="flex items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-brand-ink/40 hover:bg-brand-maroon/10 hover:text-brand-maroon"
                    >
                      <Minus size={9} />
                    </button>
                    <span className="w-4 text-center text-[10px] font-bold tabular-nums">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded-full text-brand-ink/40 hover:bg-brand-maroon/10 hover:text-brand-maroon"
                    >
                      <Plus size={9} />
                    </button>
                  </div>

                  {/* Price + remove */}
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold tabular-nums text-brand-maroon">
                      £{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeItem(item.variantId)}
                      className="text-brand-ink/15 transition-colors hover:text-red-500"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-brand-maroon/6 px-5 py-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-brand-ink/45">{t("subtotal")}</span>
                <span className="font-display text-xl text-brand-maroon">
                  £{subtotal.toFixed(2)}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                {/* View cart */}
                <Link
                  href="/cart"
                  onClick={closeDrawer}
                  className="flex items-center justify-center rounded-full border border-brand-maroon/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-ink transition-all duration-300 hover:border-brand-maroon/40 hover:bg-brand-maroon/5"
                >
                  {t("viewCart")}
                </Link>

                {/* Checkout */}
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
                  className="group flex items-center justify-center gap-1.5 rounded-full bg-brand-maroon px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-brand-cream shadow-[0_8px_20px_-8px_rgba(90,31,31,0.5)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_28px_-8px_rgba(90,31,31,0.65)]"
                >
                  {t("checkout")}
                  <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>

              <p className="mt-2.5 flex items-center justify-center gap-1 text-[9px] text-brand-ink/20">
                <Lock size={8} />
                {t("secureBadge")}
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
}
