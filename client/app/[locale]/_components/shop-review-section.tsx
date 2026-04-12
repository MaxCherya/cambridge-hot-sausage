"use client";

import { type FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle, Star } from "lucide-react";
import { useSubmitReview } from "@/lib/shop/hooks";
import type { ProductDetail } from "@/types/shop";

interface ShopReviewSectionProps {
  product: ProductDetail;
}

export function ShopReviewSection({ product }: ShopReviewSectionProps) {
  const t = useTranslations("shop.reviews");
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="relative bg-brand-cream pb-20 sm:pb-28">
      <div className="mx-auto max-w-4xl px-6">
        <h2
          data-reveal
          className="font-display text-2xl text-brand-maroon sm:text-3xl"
        >
          {t("title")} ({product.review_count})
        </h2>

        {/* Review list */}
        {product.reviews.length > 0 ? (
          <div className="mt-8 space-y-4">
            {product.reviews.map((review) => (
              <div
                key={review.id}
                data-reveal
                className="rounded-2xl border border-brand-maroon/8 bg-white/60 p-5 backdrop-blur-sm sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-maroon/10 text-sm font-bold text-brand-maroon">
                      {review.author_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-ink">
                        {review.author_name}
                      </p>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            size={12}
                            strokeWidth={1.6}
                            className={i < review.rating ? "text-brand-gold" : "text-brand-ink/15"}
                            fill={i < review.rating ? "currentColor" : "none"}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-brand-ink/35">
                    <CheckCircle size={11} className="mr-1 inline text-brand-sage" />
                    Verified
                  </span>
                </div>
                {review.title && (
                  <p className="mt-3 text-sm font-semibold text-brand-ink">
                    {review.title}
                  </p>
                )}
                <p className="mt-2 text-sm leading-relaxed text-brand-ink/65">
                  {review.text}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-6 text-brand-ink/40">{t("noReviews")}</p>
        )}

        {/* Write review toggle */}
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            data-reveal
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-brand-maroon/15 px-6 py-3 text-sm font-medium text-brand-ink transition-all duration-300 hover:border-brand-maroon/40 hover:bg-brand-maroon/5"
          >
            <Star size={16} />
            {t("writeReview")}
          </button>
        )}

        {/* Review form */}
        {showForm && (
          <ReviewForm
            productSlug={product.slug}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </section>
  );
}

/* ─── Review form ──────────────────────────────────────────── */

interface ReviewFormProps {
  productSlug: string;
  onClose: () => void;
}

function ReviewForm({ productSlug, onClose }: ReviewFormProps) {
  const t = useTranslations("shop.reviews.form");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const mutation = useSubmitReview(productSlug);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    // Honeypot check — if the hidden field is filled, silently "succeed"
    if (form.get("website")) {
      mutation.reset();
      return;
    }

    mutation.mutate({
      author_name: form.get("author_name") as string,
      author_email: form.get("author_email") as string,
      rating,
      title: (form.get("title") as string) || "",
      text: form.get("text") as string,
    });
  }

  if (mutation.isSuccess) {
    return (
      <div className="mt-8 rounded-2xl border border-brand-sage/20 bg-brand-sage/5 p-6 text-center">
        <CheckCircle className="mx-auto h-8 w-8 text-brand-sage" />
        <p className="mt-3 text-sm font-medium text-brand-sage">{t("success")}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-2xl border border-brand-maroon/8 bg-white/60 p-6 backdrop-blur-sm sm:p-8"
    >
      {/* Honeypot — hidden from real users, bots will fill it */}
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input type="url" id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* Star rating */}
      <div className="mb-6">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
          {t("rating")}
        </span>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => {
            const starValue = i + 1;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform duration-150 hover:scale-110"
              >
                <Star
                  size={28}
                  strokeWidth={1.6}
                  className={
                    starValue <= (hoverRating || rating) ? "text-brand-gold" : "text-brand-ink/15"
                  }
                  fill={starValue <= (hoverRating || rating) ? "currentColor" : "none"}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="author_name" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
            {t("name")}
          </label>
          <input
            id="author_name"
            name="author_name"
            type="text"
            required
            maxLength={150}
            className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
          />
        </div>
        <div>
          <label htmlFor="author_email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
            {t("email")}
          </label>
          <input
            id="author_email"
            name="author_email"
            type="email"
            required
            className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
          />
        </div>
      </div>

      <div className="mt-4">
        <label htmlFor="title" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
          {t("reviewTitle")}
        </label>
        <input
          id="title"
          name="title"
          type="text"
          maxLength={200}
          className="w-full rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
        />
      </div>

      <div className="mt-4">
        <label htmlFor="text" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.2em] text-brand-ink/50">
          {t("text")}
        </label>
        <textarea
          id="text"
          name="text"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="w-full resize-none rounded-xl border border-brand-maroon/10 bg-white/70 px-4 py-3 text-sm text-brand-ink placeholder:text-brand-ink/30 transition-[border-color,box-shadow] duration-300 focus:border-brand-maroon/30 focus:outline-none focus:ring-4 focus:ring-brand-maroon/5"
        />
      </div>

      {mutation.isError && (
        <p className="mt-3 text-sm text-red-600">{t("error")}</p>
      )}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex items-center gap-2 rounded-full bg-brand-maroon px-6 py-3 text-sm font-semibold uppercase tracking-wider text-brand-cream shadow-[0_10px_25px_-8px_rgba(90,31,31,0.4)] transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_15px_35px_-8px_rgba(90,31,31,0.55)] active:scale-100 disabled:opacity-50"
        >
          {mutation.isPending ? t("submitting") : t("submit")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-brand-ink/40 transition-colors hover:text-brand-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
