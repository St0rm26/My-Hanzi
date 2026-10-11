import { describe, expect, test } from "bun:test";
import {
  AlreadyRated,
  PersonalRatingConcept,
  PersonalRatingNotFound,
  RatingNotDefined,
} from "../../src/concepts/PersonalRating/PersonalRating.ts";
import { testDatabase } from "../support/mongo.ts";

async function setup() {
  const database = await testDatabase();
  return {
    personalRating: new PersonalRatingConcept<string, string, string>(database),
    database,
  };
}

describe("PersonalRating", () => {
  test("addDefinedRatings unions new definitions, tolerates repeats, and returns the supplied list", async () => {
    const { personalRating, database } = await setup();

    expect(
      await personalRating.addDefinedRatings({
        ratings: new Set(["easy", "hard", "easy"]),
      }),
    ).toEqual({ ratings: new Set(["easy", "hard", "easy"]) });
    expect(
      await personalRating.addDefinedRatings({
        ratings: new Set(["hard", "medium"]),
      }),
    ).toEqual({
      ratings: new Set(["hard", "medium"]),
    });
    expect(
      await personalRating.addDefinedRatings({ ratings: new Set() }),
    ).toEqual({
      ratings: new Set(),
    });

    const definitions = await database
      .collection<{ _id: string }>("personalrating.definedRatings")
      .find({}, { projection: { _id: 1 } })
      .sort({ _id: 1 })
      .toArray();
    expect(definitions.map(({ _id }) => _id)).toEqual([
      "easy",
      "hard",
      "medium",
    ]);
  });

  test("addRating refuses an undefined rating without creating a personal rating", async () => {
    const { personalRating, database } = await setup();

    expect(
      personalRating.addRating({
        user: "maya",
        item: "item-1",
        rating: "easy",
      }),
    ).rejects.toBeInstanceOf(RatingNotDefined);
    expect(
      await database
        .collection("personalrating.personalRatings")
        .countDocuments(),
    ).toBe(0);
  });

  test("addRating stores one defined rating per user and item and _rating returns it", async () => {
    const { personalRating } = await setup();

    await personalRating.addDefinedRatings({
      ratings: new Set(["easy", "hard"]),
    });
    await personalRating.addRating({
      user: "maya",
      item: "item-1",
      rating: "easy",
    });
    await personalRating.addRating({
      user: "maya",
      item: "item-2",
      rating: "hard",
    });
    await personalRating.addRating({
      user: "leo",
      item: "item-1",
      rating: "hard",
    });

    expect(
      await personalRating._rating({ user: "maya", item: "item-1" }),
    ).toEqual({
      rating: "easy",
    });
    expect(
      await personalRating._rating({ user: "maya", item: "item-2" }),
    ).toEqual({
      rating: "hard",
    });
    expect(
      await personalRating._rating({ user: "leo", item: "item-1" }),
    ).toEqual({
      rating: "hard",
    });
  });

  test("the user-item index rejects a second rating even if its value differs", async () => {
    const { personalRating } = await setup();

    await personalRating.addDefinedRatings({
      ratings: new Set(["easy", "hard"]),
    });
    await personalRating.addRating({
      user: "maya",
      item: "item-1",
      rating: "easy",
    });

    expect(
      personalRating.addRating({
        user: "maya",
        item: "item-1",
        rating: "hard",
      }),
    ).rejects.toBeInstanceOf(AlreadyRated);
    expect(
      personalRating.addRating({
        user: "maya",
        item: "item-1",
        rating: "easy",
      }),
    ).rejects.toBeInstanceOf(AlreadyRated);
    expect(
      await personalRating._rating({ user: "maya", item: "item-1" }),
    ).toEqual({
      rating: "easy",
    });
  });

  test("changeRating refuses an undefined new rating and leaves the old one intact", async () => {
    const { personalRating } = await setup();

    await personalRating.addDefinedRatings({ ratings: new Set(["easy"]) });
    await personalRating.addRating({
      user: "maya",
      item: "item-1",
      rating: "easy",
    });

    expect(
      personalRating.changeRating({
        user: "maya",
        item: "item-1",
        rating: "hard",
      }),
    ).rejects.toBeInstanceOf(RatingNotDefined);
    expect(
      await personalRating._rating({ user: "maya", item: "item-1" }),
    ).toEqual({
      rating: "easy",
    });
  });

  test("changeRating refuses a missing pair", async () => {
    const { personalRating } = await setup();

    await personalRating.addDefinedRatings({
      ratings: new Set(["easy", "hard"]),
    });
    expect(
      personalRating.changeRating({
        user: "maya",
        item: "item-1",
        rating: "hard",
      }),
    ).rejects.toBeInstanceOf(PersonalRatingNotFound);
  });

  test("changeRating changes only the requested user's item", async () => {
    const { personalRating } = await setup();

    await personalRating.addDefinedRatings({
      ratings: new Set(["easy", "hard"]),
    });
    await personalRating.addRating({
      user: "maya",
      item: "item-1",
      rating: "easy",
    });
    await personalRating.addRating({
      user: "leo",
      item: "item-1",
      rating: "easy",
    });
    await personalRating.addRating({
      user: "maya",
      item: "item-2",
      rating: "easy",
    });

    await personalRating.changeRating({
      user: "maya",
      item: "item-1",
      rating: "hard",
    });
    expect(
      await personalRating._rating({ user: "maya", item: "item-1" }),
    ).toEqual({
      rating: "hard",
    });
    expect(
      await personalRating._rating({ user: "leo", item: "item-1" }),
    ).toEqual({
      rating: "easy",
    });
    expect(
      await personalRating._rating({ user: "maya", item: "item-2" }),
    ).toEqual({
      rating: "easy",
    });
  });

  test("deleteRating removes exactly one pair and refuses a missing pair", async () => {
    const { personalRating } = await setup();

    await personalRating.addDefinedRatings({ ratings: new Set(["easy"]) });
    await personalRating.addRating({
      user: "maya",
      item: "item-1",
      rating: "easy",
    });
    await personalRating.addRating({
      user: "leo",
      item: "item-1",
      rating: "easy",
    });

    expect(
      await personalRating.deleteRating({ user: "maya", item: "item-1" }),
    ).toEqual({});
    expect(
      personalRating._rating({ user: "maya", item: "item-1" }),
    ).rejects.toBeInstanceOf(PersonalRatingNotFound);
    expect(
      personalRating.deleteRating({ user: "maya", item: "item-1" }),
    ).rejects.toBeInstanceOf(PersonalRatingNotFound);
    expect(
      await personalRating._rating({ user: "leo", item: "item-1" }),
    ).toEqual({
      rating: "easy",
    });
  });

  test("removeDefinedRating removes the definition and every use of it", async () => {
    const { personalRating } = await setup();

    await personalRating.addDefinedRatings({
      ratings: new Set(["easy", "hard"]),
    });
    await personalRating.addRating({
      user: "maya",
      item: "item-1",
      rating: "easy",
    });
    await personalRating.addRating({
      user: "leo",
      item: "item-2",
      rating: "easy",
    });
    await personalRating.addRating({
      user: "maya",
      item: "item-3",
      rating: "hard",
    });

    await personalRating.removeDefinedRating({ rating: "easy" });
    for (const [user, item] of [
      ["maya", "item-1"],
      ["leo", "item-2"],
    ]) {
      expect(personalRating._rating({ user, item })).rejects.toBeInstanceOf(
        PersonalRatingNotFound,
      );
    }
    expect(
      await personalRating._rating({ user: "maya", item: "item-3" }),
    ).toEqual({
      rating: "hard",
    });
    expect(
      personalRating.addRating({
        user: "maya",
        item: "item-4",
        rating: "easy",
      }),
    ).rejects.toBeInstanceOf(RatingNotDefined);
    expect(
      personalRating.removeDefinedRating({ rating: "easy" }),
    ).rejects.toBeInstanceOf(RatingNotDefined);
  });
});
