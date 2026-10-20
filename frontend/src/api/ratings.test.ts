import { describe, expect, test } from "bun:test";
import { isPersonalRating, ratingOptions } from "./ratings.ts";

describe("personal rating options", () => {
  test("keeps the requested left-to-right order and icon mapping", () => {
    expect(ratingOptions).toEqual([
      { value: "Mastered", icon: "star" },
      { value: "Confident", icon: "thumbs-up" },
      { value: "Medium", icon: "horizontal-line" },
      { value: "Hard", icon: "thumbs-down" },
      { value: "Difficult", icon: "x" },
    ]);
  });

  test("recognizes only defined personal ratings", () => {
    expect(isPersonalRating("Mastered")).toBe(true);
    expect(isPersonalRating("Unknown")).toBe(false);
  });
});
