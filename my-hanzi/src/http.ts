import { httpPolicy } from "@mit-sdg/sync-engine-http/policy";
import { accountsHttp } from "./compositions/accounts.ts";
import { benchmarksHttp } from "./compositions/benchmarks.ts";
import { commonsHttp } from "./compositions/commons.ts";
import { informationHttp } from "./compositions/information.ts";
import { passwordsHttp } from "./compositions/passwords.ts";
import { tagsHttp } from "./compositions/tags.ts";

export const policy = httpPolicy({
  publicOrigin: process.env.APP_ORIGIN ?? "http://localhost:8080",
  basePath: "/api",
  publicErrors: {
    ...accountsHttp.publicErrors,
    ...benchmarksHttp.publicErrors,
    ...passwordsHttp.publicErrors,
    ...commonsHttp.publicErrors,
    ...informationHttp.publicErrors,
    ...tagsHttp.publicErrors,
  },
  cookies: {
    session: accountsHttp.sessionCookie("my-hanzi-session", [
      ...passwordsHttp.startingSessions,
      ...commonsHttp.startingSessions,
    ]),
    commonsAttempt: commonsHttp.signInCookie("my-hanzi-commons-attempt"),
  },
});
