import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { ReviewsHero } from "../_components/reviews-hero";
import { ReviewsFeed } from "../_components/reviews-feed";
import { MOCK_REVIEWS, MOCK_SUMMARY } from "@/data/mock-reviews";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews.meta" });
  return pageMetadata({
    title: t("title"),
    description:
      "What Cambridge thinks of us. Real reviews from regulars, students and visitors who have stopped at the Fitzroy Street barrow over the years.",
    path: "/reviews",
    locale,
  });
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  /**
   * Swap point: replace MOCK_REVIEWS / MOCK_SUMMARY with a fetch
   * to the Google Places API when ready. The component contracts
   * (`Review[]` and `ReviewSummary`) are identical to the API shape.
   */
  const reviews = MOCK_REVIEWS;
  const summary = MOCK_SUMMARY;

  return (
    <main className="relative">
      <ReviewsHero summary={summary} />
      <ReviewsFeed reviews={reviews} summary={summary} />
    </main>
  );
}
