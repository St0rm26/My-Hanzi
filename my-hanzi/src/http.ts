import { httpPolicy } from "@mit-sdg/sync-engine-http/policy";
import { accountsHttp } from "./compositions/accounts.ts";
import { commonsHttp } from "./compositions/commons.ts";
import { passwordsHttp } from "./compositions/passwords.ts";
// import { informationHttp } from "./compositions/information.ts";
import { tagsHttp } from "./compositions/tags.ts";

export const policy = httpPolicy({
  publicOrigin: process.env.APP_ORIGIN ?? "http://127.0.0.1:3000",
  basePath: "/api",
  publicErrors: {
    ...accountsHttp.publicErrors,
    ...passwordsHttp.publicErrors,
    ...commonsHttp.publicErrors,
    ...tagsHttp.publicErrors,
    INFO_FIELD_NOT_FOUND: "NOT_FOUND",
    ALREADY_RESERVED: "CONFLICT",
    NO_SUCH_RESERVATION: "NOT_FOUND",
  },
  cookies: {
    session: accountsHttp.sessionCookie("my-hanzi-session", [
      ...passwordsHttp.startingSessions,
      ...commonsHttp.startingSessions,
    ]),
    commonsAttempt: commonsHttp.signInCookie("my-hanzi-commons-attempt"),
  },
});
