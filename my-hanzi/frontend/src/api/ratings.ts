export const ratingOptions = [
  { value: "Mastered", icon: "star" },
  { value: "Confident", icon: "thumbs-up" },
  { value: "Medium", icon: "horizontal-line" },
  { value: "Hard", icon: "thumbs-down" },
  { value: "Difficult", icon: "x" },
] as const;

export type PersonalRating = (typeof ratingOptions)[number]["value"];

export function isPersonalRating(value: string): value is PersonalRating {
  return ratingOptions.some((option) => option.value === value);
}
