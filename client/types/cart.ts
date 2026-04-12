export interface CartItem {
  /** ProductVariant ID — unique key in the cart. */
  variantId: number;
  /** Product slug — for linking back to the product page. */
  productSlug: string;
  /** Product name. */
  productName: string;
  /** Variant label, e.g. "Large", "Spicy + Onions". */
  variantName: string;
  /** SKU for Stripe line item reference. */
  sku: string;
  /** Unit price as string (decimal), e.g. "7.50". */
  price: string;
  /** Quantity in cart. */
  quantity: number;
  /** Primary image URL or null. */
  image: string | null;
}
