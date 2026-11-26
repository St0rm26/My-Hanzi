import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import { createGateway } from "@mit-sdg/sync-engine/boundary";
import { createHttpHandler } from "@mit-sdg/sync-engine-http/handler";

let handler: ReturnType<typeof createHttpHandler>;
let closeDatabase: () => Promise<void>;

beforeAll(async () => {
  const previousUrl = process.env.MONGODB_URL;
  process.env.MONGODB_URL = "mongodb://127.0.0.1:27017/information-test";
  try {
    const [{ assembleApplication }, { policy }, { client }] = await Promise.all([
      import("../../src/assembly.ts"),
      import("../../src/http.ts"),
      import("../../src/db.ts"),
    ]);
    closeDatabase = () => client.close();
    const application = assembleApplication();
    handler = createHttpHandler({
      application,
      gateway: createGateway({ application }),
      policy,
    });
  } finally {
    if (previousUrl === undefined) delete process.env.MONGODB_URL;
    else process.env.MONGODB_URL = previousUrl;
  }
});

afterAll(async () => {
  await closeDatabase?.();
});

describe("read-only information HTTP API", () => {
  test("does not expose add-field, with or without a session cookie", async () => {
    for (const cookie of ["", "my-hanzi-session=example"]) {
      const response = await handler(
        new Request("http://localhost/api/information/add-field", {
          method: "POST",
          headers: {
            "content-type": "application/json",
            cookie,
          },
          body: JSON.stringify({
            item: "你",
            fieldName: "meaning",
            description: "incorrect",
          }),
        }),
      );
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "NOT_FOUND" });
    }
  });

});
