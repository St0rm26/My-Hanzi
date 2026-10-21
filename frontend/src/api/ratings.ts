export const ratingOptions = [
  { value: "Mastered", icon: "star" },
  { value: "Confident", icon: "thumbs-up" },
  { value: "Medium", icon: "horizontal-line" },
  { value: "Hard", icon: "thumbs-down" },
  { value: "Difficult", icon: "x" },
] as const;

export type PersonalRating = (typeof ratingOptions)[number]["value"];

const ratingColors: Record<PersonalRating, string> = {
  Mastered: "var(--color-rating-mastered)",
  Confident: "var(--color-rating-confident)",
  Medium: "var(--color-rating-medium)",
  Hard: "var(--color-rating-hard)",
  Difficult: "var(--color-rating-difficult)",
};

export function personalRatingColor(rating: PersonalRating) {
  return ratingColors[rating];
}

export function isPersonalRating(value: string): value is PersonalRating {
  return ratingOptions.some((option) => option.value === value);
}
