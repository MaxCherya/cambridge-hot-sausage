import { Suspense } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { EventBookingSuccess } from "../../_components/event-booking-success";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events.success" });
  return {
    ...pageMetadata({
      title: t("title"),
      description: "Your event booking is confirmed. We'll be in touch shortly.",
      path: "/events/success",
      locale,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function EventSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative overflow-hidden">
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-maroon/20 border-t-brand-maroon" />
          </div>
        }
      >
        <EventBookingSuccess />
      </Suspense>
    </main>
  );
}
