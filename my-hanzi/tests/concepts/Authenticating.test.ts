import { describe, expect, test } from "bun:test";
import { password as passwordHash } from "bun";
import {
  AuthenticatingConcept,
  InvalidCredentials,
  PasswordSet,
} from "../../src/concepts/Authenticating/Authenticating.ts";
import { testDatabase } from "../support/mongo.ts";
import { expectOneWinner } from "../support/race.ts";

async function setup() {
  const database = await testDatabase();
  return {
    authenticating: new AuthenticatingConcept<string>(database),
    database,
  };
}

describe("Authenticating", () => {
  test("register returns the user and the same credentials authenticate", async () => {
    const { authenticating } = await setup();

    expect(
      await authenticating.register({ user: "alice", password: "swordfish" }),
    ).toEqual({
      user: "alice",
    });
    expect(
      await authenticating.authenticate({
        user: "alice",
        password: "swordfish",
      }),
    ).toEqual({ user: "alice" });
  });

  test("register refuses an existing user without changing their password", async () => {
    const { authenticating } = await setup();
    await authenticating.register({ user: "alice", password: "original" });

    expect(
      authenticating.register({ user: "alice", password: "replacement" }),
    ).rejects.toBeInstanceOf(PasswordSet);
    expect(
      authenticating.authenticate({ user: "alice", password: "replacement" }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
    expect(
      await authenticating.authenticate({
        user: "alice",
        password: "original",
      }),
    ).toEqual({ user: "alice" });
  });

  test("two simultaneous registrations for one user create one account", async () => {
    const { authenticating, database } = await setup();
    await expectOneWinner(
      [
        authenticating.register({ user: "alice", password: "first" }),
        authenticating.register({ user: "alice", password: "second" }),
      ],
      PasswordSet,
    );
    expect(
      await database.collection("authenticating.users").countDocuments(),
    ).toBe(1);
  }, 20_000);

  test("authenticate rejects an unknown user and an incorrect password", async () => {
    const { authenticating } = await setup();
    await authenticating.register({ user: "alice", password: "correct" });

    expect(
      authenticating.authenticate({ user: "missing", password: "correct" }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
    expect(
      authenticating.authenticate({ user: "alice", password: "incorrect" }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
  });

  test("usernames and passwords are case sensitive", async () => {
    const { authenticating } = await setup();
    await authenticating.register({ user: "Alice", password: "Secret" });
    await authenticating.register({ user: "alice", password: "Secret" });

    expect(
      authenticating.authenticate({ user: "Alice", password: "secret" }),
    ).rejects.toBeInstanceOf(InvalidCredentials);
    expect(
      await authenticating.authenticate({ user: "Alice", password: "Secret" }),
    ).toEqual({ user: "Alice" });
    expect(
      await authenticating.authenticate({ user: "alice", password: "Secret" }),
    ).toEqual({ user: "alice" });
  });

  test("stores salted password verifiers rather than passwords", async () => {
    const { authenticating, database } = await setup();
    await authenticating.register({ user: "alice", password: "shared-secret" });
    await authenticating.register({ user: "bob", password: "shared-secret" });

    const users = database.collection<{
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
