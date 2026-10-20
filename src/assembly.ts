import { assemble } from "@mit-sdg/sync-engine/assembly";
import { composition as accountsComposition } from "./compositions/accounts.ts";
import { composition as benchmarksComposition } from "./compositions/benchmarks.ts";
import { composition as commonsComposition } from "./compositions/commons.ts";
import { composition as informationComposition } from "./compositions/information.ts";
import { composition as passwordsComposition } from "./compositions/passwords.ts";
import { composition as ratingsComposition } from "./compositions/ratings.ts";
import { composition as sharesComposition } from "./compositions/shares.ts";
import { composition as tagsComposition } from "./compositions/tags.ts";
import { CommonsProvider } from "./concepts/Federating/provider.ts";
import { applicationConceptSet } from "./concepts.ts";
import { db } from "./db.ts";

export function assembleApplication() {
  const commons = new CommonsProvider({
    origin: process.env.COMMONS_ORIGIN ?? "https://class.mit-sdg.dev",
    app: process.env.PUBLIC_ORIGIN ?? "http://localhost:8080",
  });

  return assemble({
    conceptSet: applicationConceptSet,
    instances: {
      ...applicationConceptSet.implementations("mongo", {
        database: db,
        commons,
      }),
    },
    composition: {
      accounts: accountsComposition,
      benchmarks: benchmarksComposition,
      commons: commonsComposition,
      information: informationComposition,
      passwords: passwordsComposition,
      ratings: ratingsComposition,
      shares: sharesComposition,
      tags: tagsComposition,
    },
    // Print what went wrong. Otherwise a failure only shows up as INTERNAL_ERROR.
    rawFaultReporter: ({ error }) => console.error(error),
  });
}
