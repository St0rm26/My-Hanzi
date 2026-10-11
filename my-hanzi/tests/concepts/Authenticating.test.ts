import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { password as passwordHash } from "bun";
import {
  AuthenticatingConcept,
  InvalidCredentials,
  PasswordSet,
} from "../../src/concepts/Authenticating/Authenticating.ts";
import { createTestDatabase } from "../support/mongo.ts";
import { expectOneWinner } from "../support/race.ts";

describe("Authenticating", () => {
  let database: Awaited<ReturnType<typeof createTestDatabase>>;

  beforeEach(async () => {
    database = await createTestDatabase();
  });

  afterEach(async () => {
    if (database) await database.close();
  });

  test("register returns the user and the same credentials authenticate", async () => {
    const concept = new AuthenticatingConcept<string>(database.db);

    expect(
      await concept.register({ user: "alice", password: "swordfish" }),
    ).toEqual({
      user: "alice",
    });
    expect(
      await concept.authenticate({ user: "alice", password: "swordfish" }),
    ).toEqual({ user: "alice" });
  });

  test("register refuses an existing user without changing their password", async () => {
    const concept = new AuthenticatingConcept<string>(database.db);
    await concept.register({ user: "alice", password: "original" });

    await expect(
      concept.register({ user: "alice", password: "replacement" }),
    ).rejects.toBeInstanceOf(PasswordSet);
    await expect(
      concept.authenticate({ user: "alice", password: "replacement" }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
    expect(
      await concept.authenticate({ user: "alice", password: "original" }),
    ).toEqual({ user: "alice" });
  });

  test("two simultaneous registrations for one user create one account", async () => {
    const concept = new AuthenticatingConcept<string>(database.db);
    await expectOneWinner(
      [
        concept.register({ user: "alice", password: "first" }),
        concept.register({ user: "alice", password: "second" }),
      ],
      PasswordSet,
    );
    expect(
      await database.db.collection("authenticating.users").countDocuments(),
    ).toBe(1);
  }, 20_000);

  test("authenticate rejects an unknown user and an incorrect password", async () => {
    const concept = new AuthenticatingConcept<string>(database.db);
    await concept.register({ user: "alice", password: "correct" });

    await expect(
      concept.authenticate({ user: "missing", password: "correct" }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
    await expect(
      concept.authenticate({ user: "alice", password: "incorrect" }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
  });

  test("usernames and passwords are case sensitive", async () => {
    const concept = new AuthenticatingConcept<string>(database.db);
    await concept.register({ user: "Alice", password: "Secret" });
    await concept.register({ user: "alice", password: "Secret" });

    await expect(
      concept.authenticate({ user: "Alice", password: "secret" }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
    expect(
      await concept.authenticate({ user: "Alice", password: "Secret" }),
    ).toEqual({ user: "Alice" });
    expect(
      await concept.authenticate({ user: "alice", password: "Secret" }),
    ).toEqual({ user: "alice" });
  });

  test("stores salted password verifiers rather than passwords", async () => {
    const concept = new AuthenticatingConcept<string>(database.db);
    await concept.register({ user: "alice", password: "shared-secret" });
    await concept.register({ user: "bob", password: "shared-secret" });

    const users = database.db.collection<{
      _id: string;
      verifier: string;
    }>("authenticating.users");
    const alice = await users.findOne({ _id: "alice" });
    const bob = await users.findOne({ _id: "bob" });

    expect(alice).not.toBeNull();
    expect(bob).not.toBeNull();
    expect(alice?.verifier.startsWith("$argon2id$")).toBe(true);
    expect(bob?.verifier.startsWith("$argon2id$")).toBe(true);
    expect(alice?.verifier).not.toBe("shared-secret");
    expect(alice?.verifier).not.toBe(bob?.verifier);
    expect(await passwordHash.verify("shared-secret", alice!.verifier)).toBe(
      true,
    );
    expect(Object.keys(alice ?? {}).sort()).toEqual(["_id", "verifier"]);
  });
});
