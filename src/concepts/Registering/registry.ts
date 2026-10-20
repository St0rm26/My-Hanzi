import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Registering.md" with { type: "text" };
import type { Db } from "mongodb";
import {
  InvalidUsername,
  RegisteringConcept,
  UsernameTaken,
} from "./Registering.ts";

class Registering extends RegisteringConcept {}

export const registering = registerConcept({
  class: Registering,
  spec,
  refusals: {
    INVALID_USERNAME: InvalidUsername,
    USERNAME_TAKEN: UsernameTaken,
  },
  floors: {
    mongo: ({ database }: { database: Db }, name: string) =>
      new Registering(database, name),
  },
});
