import { setRequestLocale } from "next-intl/server";
import { HeroIntro } from "./_components/hero-intro";
import { Certifications } from "./_components/certifications";
import { Moments } from "./_components/moments";
import { EventBookingCta } from "./_components/event-booking-cta";
import { LocateUs } from "./_components/locate-us";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative">
      <section className="sticky top-0 z-0 h-dvh">
        <HeroIntro />
      </section>
      <Certifications />
      <EventBookingCta />
      <Moments />
      <LocateUs />
    </main>
  );
}
