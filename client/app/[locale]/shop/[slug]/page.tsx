import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProduct } from "@/lib/shop/server";
import { ShopProductDetail } from "../../_components/shop-product-detail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "shop.meta" });

  try {
    const product = await getProduct(slug);
    return {
      title: t("productTitle", { name: product.name }),
      description: product.description,
    };
  } catch {
    return { title: t("title") };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  let product;
  try {
    product = await getProduct(slug);
  } catch {
    notFound();
  }

  return (
    <main className="relative overflow-hidden">
      <ShopProductDetail product={product} />
    </main>
  );
}
