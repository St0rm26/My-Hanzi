import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/PersonalRating.md" with { type: "text" };
import type { Db } from "mongodb";
import {
  AlreadyRated,
  PersonalRatingConcept,
  PersonalRatingNotFound,
  RatingNotDefined,
} from "./PersonalRating.ts";

class PersonalRating extends PersonalRatingConcept<string, string, string> {}

export const personalRating = registerConcept({
  class: PersonalRating,
  spec,
  floors: {
    mongo: ({ database }: { database: Db }, name: string) =>
      new PersonalRating(database, name),
  },
});
