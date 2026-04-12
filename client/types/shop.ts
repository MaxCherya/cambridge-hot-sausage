/** Matches DRF CategoryListSerializer. */
export interface CategoryCompact {
  id: number;
  name: string;
  slug: string;
  image: string | null;
}

/** Matches DRF CategorySerializer (recursive tree). */
export interface Category extends CategoryCompact {
  description: string;
  parent: number | null;
  children: Category[];
  product_count: number;
}

/** Matches DRF ProductImageSerializer. */
export interface ProductImage {
  id: number;
  image: string | null;
  alt_text: string;
  is_primary: boolean;
  order: number;
}

/** Matches DRF ProductVariantSerializer. */
export interface ProductVariant {
  id: number;
  name: string;
  sku: string;
  price: string;
  compare_at_price: string | null;
  stock: number;
  in_stock: boolean;
  order: number;
}

/** Matches DRF ReviewReadSerializer. */
export interface Review {
  id: number;
  author_name: string;
  rating: number;
  title: string;
  text: string;
  created_at: string;
}

/** Matches DRF ProductListSerializer. */
export interface ProductListItem {
  id: number;
  name: string;
  slug: string;
  description: string;
  categories: CategoryCompact[];
  primary_image: ProductImage | null;
  min_price: string | null;
  max_price: string | null;
  average_rating: number | null;
  review_count: number;
  is_featured: boolean;
  created_at: string;
}

/** Matches DRF ProductDetailSerializer. */
export interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  description: string;
  categories: CategoryCompact[];
  variants: ProductVariant[];
  images: ProductImage[];
  reviews: Review[];
  average_rating: number | null;
  review_count: number;
  is_featured: boolean;
  created_at: string;
}

/** DRF paginated response wrapper. */
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

/** Payload for POST /products/<slug>/reviews/. */
export interface ReviewSubmission {
  author_name: string;
  author_email: string;
  rating: number;
  title?: string;
  text: string;
  /** Honeypot — must always be empty string. */
  website?: string;
}
