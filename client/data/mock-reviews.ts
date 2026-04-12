import type { Review, ReviewSummary } from "@/types/review";

/**
 * Mock reviews shaped exactly like the Google Places API response.
 *
 * When you're ready to go live, replace this file with a fetch to:
 *   `https://maps.googleapis.com/maps/api/place/details/json?place_id=YOUR_ID&fields=reviews,rating,user_ratings_total&key=YOUR_KEY`
 *
 * The rest of the UI consumes `Review[]` and `ReviewSummary` —
 * no component changes required.
 */

export const MOCK_REVIEWS: Review[] = [
  {
    author_name: "Eleanor Whitfield",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "2 weeks ago",
    text: "Absolutely the best hot dog I've ever had in Cambridge. The sausage has this incredible smoky flavour and the bun is always perfectly warm. Been coming here since I was a student in the 90s and the quality has never dropped. A proper institution.",
    time: 1742860800,
  },
  {
    author_name: "James Harrington",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "1 month ago",
    text: "Brought my kids here for the first time and they absolutely loved it. There's something special about eating a proper hot dog from a Victorian barrow on a sunny Cambridge afternoon. The gentleman serving was friendly and quick. Will be back every weekend.",
    time: 1741132800,
  },
  {
    author_name: "Sophie Chen",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "3 weeks ago",
    text: "I'm a food blogger and I have to say, this is the most authentic street food experience in the UK. No gimmicks, no pretension — just a perfectly made hot dog with quality ingredients. The Cambridge sausage is genuinely special. Five stars is not enough.",
    time: 1742256000,
  },
  {
    author_name: "Oliver Pemberton",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 4,
    relative_time_description: "2 months ago",
    text: "Great sausages, very tasty. Only reason I'm not giving five stars is because the queue was quite long on a Saturday. But honestly, that just shows how popular they are. Worth the wait.",
    time: 1739318400,
  },
  {
    author_name: "Priya Kapoor",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "1 week ago",
    text: "My colleagues recommended this place when I moved to Cambridge for work and they were absolutely right. The hot dogs are superb — generous portion, fresh toppings, and the sausage itself has a depth of flavour you just don't find elsewhere. Already a regular.",
    time: 1743465600,
  },
  {
    author_name: "Thomas Mueller",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "3 months ago",
    text: "Visiting from Berlin and was told this is a must-try Cambridge experience. Did not disappoint at all. The sausage quality rivals anything back home, and the whole barrow setup has so much character. A real gem.",
    time: 1736726400,
  },
  {
    author_name: "Grace Atkinson",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "1 month ago",
    text: "We hired Cambridge Hot Sausage for our wedding reception and it was the highlight of the evening. Guests are STILL talking about the hot dogs. Professional, punctual, and the food was outstanding. Cannot recommend highly enough for events.",
    time: 1740528000,
  },
  {
    author_name: "Daniel Okafor",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 4,
    relative_time_description: "5 months ago",
    text: "Really solid hot dogs. The sausage is clearly high quality and you can taste the difference compared to the usual street food. Friendly service too. Deducting one star only because I wish they had a veggie option.",
    time: 1731542400,
  },
  {
    author_name: "Emma Richardson",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "2 months ago",
    text: "Forty years in the same spot for a reason! The Cambridge sausage is legendary and they serve it perfectly every single time. My Saturday routine wouldn't be the same without a stop at the barrow. True Cambridge heritage.",
    time: 1738713600,
  },
  {
    author_name: "Kenji Tanaka",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "4 months ago",
    text: "As a tourist from Japan, I was pleasantly surprised by the quality. The sausage had a wonderful texture and the mustard was spot on. The vintage cart makes for fantastic photos too. A unique and delicious Cambridge experience I'll never forget.",
    time: 1734134400,
  },
  {
    author_name: "Charlotte Beaumont",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 5,
    relative_time_description: "6 months ago",
    text: "I've lived in Cambridge my entire life and this barrow is as much a part of the city as King's College Chapel. The recipe hasn't changed, the quality hasn't changed, and the friendly service hasn't changed. Perfection.",
    time: 1728950400,
  },
  {
    author_name: "Liam Gallagher",
    author_url: "",
    language: "en",
    profile_photo_url: "",
    rating: 4,
    relative_time_description: "3 months ago",
    text: "Proper good hot dogs. Simple, done right, no messing about. Exactly what you want from street food. The Cambridge sausage is class. Cash only threw me off a bit but the quality makes up for it.",
    time: 1736121600,
  },
];

function computeSummary(reviews: Review[]): ReviewSummary {
  const distribution: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  let sum = 0;

  for (const review of reviews) {
    sum += review.rating;
    distribution[review.rating - 1] += 1;
  }

  return {
    averageRating: Math.round((sum / reviews.length) * 10) / 10,
    totalRatings: reviews.length,
    distribution,
  };
}

export const MOCK_SUMMARY: ReviewSummary = computeSummary(MOCK_REVIEWS);
