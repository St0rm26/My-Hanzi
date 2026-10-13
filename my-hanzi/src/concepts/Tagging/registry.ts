import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Tagging.md" with { type: "text" };
import type { Db } from "mongodb";
import {
  DefaultTagCannotBeDeleted,
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
  refusals: {
    DEFAULT_TAG_CANNOT_BE_DELETED: DefaultTagCannotBeDeleted,
    ITEM_ALREADY_TAGGED: ItemAlreadyTagged,
    TAG_ALREADY_EXISTS: TagAlreadyExists,
    TAG_NOT_FOUND: TagNotFound,
  },
  floors: {
    mongo: ({ database }: { database: Db }, name: string) =>
      new Tagging(database, name),
  },
});
