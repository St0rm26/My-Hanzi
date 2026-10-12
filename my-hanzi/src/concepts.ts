import { conceptSet, registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Reserving.md" with { type: "text" };
import type { Db } from "mongodb";
import { authenticating } from "./concepts/Authenticating/registry.ts";
import { commonsFederating } from "./concepts/Federating/registry.ts";
import { informationCollecting } from "./concepts/InformationCollecting/registry.ts";
import { personalRating } from "./concepts/PersonalRating/registry.ts";
import { registering } from "./concepts/Registering/registry.ts";
import {
  ReservingConcept,
  AlreadyReserved,
  NoSuchReservation,
} from "./concepts/Reserving.ts";
import { sessioning } from "./concepts/Sessioning/registry.ts";
import { sharing } from "./concepts/Sharing/registry.ts";
import { tagging } from "./concepts/Tagging/registry.ts";

class Reserving extends ReservingConcept<string, string> {}

export const reserving = registerConcept({
  class: Reserving,
  spec,
  refusals: {
    ALREADY_RESERVED: AlreadyReserved,
    NO_SUCH_RESERVATION: NoSuchReservation,
  },
  floors: {
    mongo: ({ database }: { database: Db }, name: string) =>
      new Reserving(database, name),
  },
});

export const applicationConceptSet = conceptSet({
  Registering: registering,
  Authenticating: authenticating,
  CommonsFederating: commonsFederating,
  InformationCollecting: informationCollecting,
  PersonalRating: personalRating,
  Sessioning: sessioning,
  Sharing: sharing,
  Tagging: tagging,
  Reserving: reserving,
});

export const { concepts } = applicationConceptSet;
