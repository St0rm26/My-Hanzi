import { conceptSet } from "@mit-sdg/sync-engine/assembly";
import { authenticating } from "./concepts/Authenticating/registry.ts";
import { commonsFederating } from "./concepts/Federating/registry.ts";
import { informationCollecting } from "./concepts/InformationCollecting/registry.ts";
import { personalRating } from "./concepts/PersonalRating/registry.ts";
import { registering } from "./concepts/Registering/registry.ts";
import { sessioning } from "./concepts/Sessioning/registry.ts";
import { sharing } from "./concepts/Sharing/registry.ts";
import { tagging } from "./concepts/Tagging/registry.ts";

export const applicationConceptSet = conceptSet({
  Registering: registering,
  Authenticating: authenticating,
  CommonsFederating: commonsFederating,
  InformationCollecting: informationCollecting,
  PersonalRating: personalRating,
  Sessioning: sessioning,
  Sharing: sharing,
  Tagging: tagging,
});

export const { concepts } = applicationConceptSet;
