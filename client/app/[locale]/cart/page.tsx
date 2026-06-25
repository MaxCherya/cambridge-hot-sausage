import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/seo";
import { CartView } from "../_components/cart-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cart.meta" });
  // Cart is per-user state — exclude from search engines.
  return {
    ...pageMetadata({
      title: t("title"),
      description: "Review the items in your basket and proceed to checkout.",
      path: "/cart",
      locale,
    }),
    robots: { index: false, follow: true },
  };
}

export default async function CartPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="relative overflow-hidden">
      <CartView />
    </main>
  );
}
