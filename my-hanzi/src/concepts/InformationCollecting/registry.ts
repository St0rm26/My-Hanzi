import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/InformationCollecting.md" with { type: "text" };
import type { Db } from "mongodb";
import {
  AlreadyCollectedInformation,
  InfoFieldNotFound,
  InformationCollectingConcept,
} from "./InformationCollecting.ts";

class InformationCollecting extends InformationCollectingConcept<
  string,
  string
> {}

export const informationCollecting = registerConcept({
  class: InformationCollecting,
  spec,
  refusals: {
    ALREADY_COLLECTED_INFORMATION: AlreadyCollectedInformation,
    INFO_FIELD_NOT_FOUND: InfoFieldNotFound,
  },
  floors: {
    mongo: ({ database }: { database: Db }, name: string) =>
      new InformationCollecting(database, name),
  },
});
