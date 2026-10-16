import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Sharing.md" with { type: "text" };
import type { Db } from "mongodb";
import {
  SharedItemNotFound,
  SharedItemsNotDistinct,
  SharingConcept,
} from "./Sharing.ts";

class Sharing extends SharingConcept<string, string> {}

export const sharing = registerConcept({
  class: Sharing,
  spec,
  refusals: {
    SHARED_ITEMS_NOT_DISTINCT: SharedItemsNotDistinct,
  },
  floors: {
    mongo: ({ database }: { database: Db }, name: string) =>
      new Sharing(database, name),
  },
});
