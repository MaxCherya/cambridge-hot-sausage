"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeft, Star, ShoppingCart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ProductDetail, ProductVariant } from "@/types/shop";
import { ShopReviewSection } from "./shop-review-section";

interface ShopProductDetailProps {
  product: ProductDetail;
}

export function ShopProductDetail({ product }: ShopProductDetailProps) {
  const t = useTranslations("shop");
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length > 0 ? product.variants[0] : null,
  );

  const currentImage = product.images.find((img) => img.is_primary) || product.images[0];

  return (
    <>
      <section className="relative bg-brand-cream pt-28 pb-20 sm:pt-36 sm:pb-28">
        <div className="mx-auto max-w-6xl px-6">
          {/* Back link */}
          <Link
            href="/shop"
            data-reveal
            className="group mb-8 inline-flex items-center gap-2 text-sm font-medium text-brand-ink/50 transition-colors hover:text-brand-maroon"
          >
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
            {t("detail.backToShop")}
          </Link>

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            {/* Image column */}
            <div>
              <div className="overflow-hidden rounded-3xl border border-brand-maroon/8 bg-white/60 shadow-[0_8px_30px_-10px_rgba(90,31,31,0.1)]">
                <div className="relative aspect-square w-full bg-brand-cream/50">
                  {currentImage?.image ? (
                    <img
                      src={currentImage.image}
                      alt={currentImage.alt_text || product.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-6xl text-brand-maroon/10">
                        {product.name.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip */}
                {product.images.length > 1 && (
                  <div className="flex gap-2 border-t border-brand-maroon/5 p-3">
                    {product.images.map((img) => (
                      <div
                        key={img.id}
                        className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-300 ${
                          img.id === currentImage?.id
                            ? "border-brand-maroon"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        {img.image ? (
                          <img
                            src={img.image}
                            alt={img.alt_text}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-brand-cream/50">
                            <span className="text-xs text-brand-maroon/20">
                              {product.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Info column */}
            <div>
              {/* Categories */}
              {product.categories.length > 0 && (
                <div data-reveal className="mb-3 flex flex-wrap gap-2">
                  {product.categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-sage"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <h1
                data-reveal
                style={{ animationDelay: "100ms" }}
                className="font-display text-3xl leading-tight text-brand-maroon sm:text-4xl lg:text-5xl"
              >
                {product.name}
              </h1>

              {/* Rating */}
              {product.average_rating !== null && (
                <div
                  data-reveal
                  style={{ animationDelay: "150ms" }}
                  className="mt-3 flex items-center gap-2"
                >
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        size={16}
                        strokeWidth={1.6}
                        className={
                          i < Math.round(product.average_rating!)
                            ? "text-brand-gold"
                            : "text-brand-ink/15"
                        }
                        fill={i < Math.round(product.average_rating!) ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-brand-ink/55">
                    {product.average_rating} ({product.review_count})
                  </span>
                </div>
              )}

              {/* Price */}
              {selectedVariant && (
                <div data-reveal style={{ animationDelay: "200ms" }} className="mt-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-3xl text-brand-maroon">
                      £{selectedVariant.price}
                    </span>
                    {selectedVariant.compare_at_price && (
                      <span className="text-lg text-brand-ink/35 line-through">
                        £{selectedVariant.compare_at_price}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-brand-sage">
                    {selectedVariant.in_stock
                      ? selectedVariant.stock < 10
                        ? t("detail.lowStock", { count: selectedVariant.stock })
                        : t("detail.inStock")
                      : t("detail.outOfStock")}
                  </p>
                </div>
              )}

              {/* Variant selector */}
              {product.variants.length > 1 && (
                <div data-reveal style={{ animationDelay: "250ms" }} className="mt-6">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
                    {t("detail.selectVariant")}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        disabled={!variant.in_stock}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300 ${
                          selectedVariant?.id === variant.id
                            ? "border-brand-maroon bg-brand-maroon text-brand-cream shadow-[0_4px_20px_-6px_rgba(90,31,31,0.4)]"
                            : variant.in_stock
                              ? "border-brand-maroon/15 text-brand-ink hover:border-brand-maroon/40 hover:bg-brand-maroon/5"
                              : "border-brand-ink/10 text-brand-ink/25"
                        }`}
                      >
                        {variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add to cart */}
              <div data-reveal style={{ animationDelay: "300ms" }} className="mt-8">
                <button
                  type="button"
                  disabled={!selectedVariant?.in_stock}
                  className="group inline-flex w-full items-center justify-center gap-3 rounded-full bg-brand-maroon px-8 py-4 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_15px_35px_-12px_rgba(90,31,31,0.5)] transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-[0_20px_45px_-12px_rgba(90,31,31,0.65)] active:scale-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-base"
                >
                  <ShoppingCart size={18} strokeWidth={2} />
                  {selectedVariant?.in_stock
                    ? t("detail.addToCart")
                    : t("detail.outOfStock")}
                </button>
              </div>

              {/* Description */}
              <div data-reveal style={{ animationDelay: "350ms" }} className="mt-10">
                <h2 className="text-xs font-semibold uppercase tracking-[0.25em] text-brand-ink/50">
                  {t("detail.description")}
                </h2>
                <p className="mt-3 text-base leading-relaxed text-brand-ink/70">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <ShopReviewSection product={product} />
    </>
  );
}
