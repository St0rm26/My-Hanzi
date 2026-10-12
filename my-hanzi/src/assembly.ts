import { assemble } from "@mit-sdg/sync-engine/assembly";
import { composition } from "./compositions/Reservations.ts";
import { CommonsProvider } from "./concepts/Federating/provider.ts";
import { ReservingConcept } from "./concepts/Reserving.ts";
import { applicationConceptSet } from "./concepts.ts";
import { db } from "./db.ts";

export function assembleApplication() {
  const commons = new CommonsProvider({
    origin: process.env.COMMONS_ORIGIN ?? "https://class.mit-sdg.dev",
    app: process.env.APP_ORIGIN ?? "http://127.0.0.1:3000",
  });

  return assemble({
    conceptSet: applicationConceptSet,
    instances: {
      ...applicationConceptSet.implementations("mongo", {
        database: db,
        commons,
      }),
    },
    composition: { Reservations: composition },
    // Print what went wrong. Otherwise a failure only shows up as INTERNAL_ERROR.
    rawFaultReporter: ({ error }) => console.error(error),
  });
}
