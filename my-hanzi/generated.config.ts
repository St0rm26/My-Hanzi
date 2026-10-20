import { httpWire } from "@mit-sdg/sync-engine-http/tooling";
import { assembleApplication } from "./src/assembly.ts";
import { policy } from "./src/http.ts";

export default {
  assemble: assembleApplication,
  title: "My Hanzi",
  wireName: "MyHanziWire",
  design: {
    version: 1,
    documents: [
      new URL("./design/types.md", import.meta.url),
      new URL("./design/compositions/accounts.md", import.meta.url),
      new URL("./design/compositions/passwords.md", import.meta.url),
      new URL("./design/compositions/commons.md", import.meta.url),
      new URL("./design/compositions/information.md", import.meta.url),
      new URL("./design/compositions/ratings.md", import.meta.url),
      new URL("./design/compositions/shares.md", import.meta.url),
      new URL("./design/compositions/tags.md", import.meta.url),
      new URL("./design/compositions/benchmarks.md", import.meta.url),
    ],
  },
  projections: [httpWire({ policy, name: "MyHanziWireHttp" })],
};
