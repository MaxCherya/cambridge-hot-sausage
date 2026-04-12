import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Rye } from "next/font/google";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { Navbar } from "./_components/navbar";
import { Footer } from "./_components/footer";
import { SmoothScroll } from "./_components/smooth-scroll";
import { CustomCursor } from "./_components/custom-cursor";
import { RevealOnScroll } from "./_components/reveal-on-scroll";
import { QueryProvider } from "./_components/query-provider";
import { CartProvider } from "@/lib/cart/context";
import { CartDrawer } from "./_components/cart-drawer";
import "../globals.css";

const rye = Rye({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-rye",
});

export const metadata: Metadata = {
  title: {
    default: "Cambridge Hot Sausage",
    template: "%s · Cambridge Hot Sausage",
  },
  description:
    "Serving Cambridge's famous hot sausages since 1986 — Victorian-style barrow on Fitzroy Street.",
  metadataBase: new URL("https://www.hotsausagecompany.com"),
};

export const viewport: Viewport = {
  themeColor: "#5A1F1F",
  width: "device-width",
  initialScale: 1,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  return (
    <html lang={locale} className={rye.variable} suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        <NextIntlClientProvider>
          <QueryProvider>
            <CartProvider>
              <SmoothScroll />
              <RevealOnScroll />
              <CustomCursor />
              <Navbar />
              <CartDrawer />
              {children}
              <Footer />
            </CartProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
