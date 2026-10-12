import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Tagging.md" with { type: "text" };
import type { Db } from "mongodb";
import {
  ItemAlreadyTagged,
  TagAlreadyExists,
  TaggedItemIDNotFound,
  TaggedItemNotFound,
  TaggingConcept,
  TagNotFound,
} from "./Tagging.ts";

class Tagging extends TaggingConcept<string, string, string> {}

export const tagging = registerConcept({
  class: Tagging,
  spec,
  floors: {
    mongo: ({ database }: { database: Db }, name: string) =>
      new Tagging(database, name),
  },
});
