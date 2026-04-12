/**
 * Review data model — intentionally mirrors the Google Places API
 * `PlaceReview` shape so switching from mock data to live Google
 * reviews requires only changing the data-fetching layer.
 *
 * @see https://developers.google.com/maps/documentation/places/web-service/details#PlaceReview
 */
export interface Review {
  /** Display name of the review author. */
  author_name: string;

  /** URL to the author's Google Maps profile (empty string for mock). */
  author_url: string;

  /** Language code the review was written in. */
  language: string;

  /** URL of the author's Google profile photo (empty string for mock). */
  profile_photo_url: string;

  /** Star rating, 1–5. */
  rating: number;

  /** Human-readable relative time, e.g. "2 months ago". */
  relative_time_description: string;

  /** Full review body. */
  text: string;

  /** Unix epoch timestamp (seconds) when the review was submitted. */
  time: number;
}

/**
 * Aggregate summary matching the shape returned by Google Places
 * `place.rating` and `place.user_ratings_total`.
 */
export interface ReviewSummary {
  /** Weighted average rating (1-digit precision, e.g. 4.8). */
  averageRating: number;

  /** Total number of ratings. */
  totalRatings: number;

  /** Count per star bucket: index 0 → 1-star, index 4 → 5-star. */
  distribution: [number, number, number, number, number];
}
