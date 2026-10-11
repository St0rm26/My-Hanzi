import { randomUUID } from "node:crypto";
import { MongoClient } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";

let shared: Promise<{ client: MongoClient; server: MongoMemoryServer }> | undefined;

async function connect() {
  const server = await MongoMemoryServer.create();
  try {
    const client = await new MongoClient(server.getUri()).connect();
    return { client, server };
  } catch (error) {
    await server.stop();
    throw error;
  }
}

/** Give each test a fresh database on one in-memory MongoDB. */
export async function createTestDatabase() {
  shared ??= connect().catch((error: unknown) => {
    shared = undefined;
    throw error;
  });
  const { client } = await shared;
  const db = client.db(`my_hanzi_test_${randomUUID().replaceAll("-", "")}`);
  let closed = false;

  return {
    db,
    async close() {
      if (closed) return;
      closed = true;
      await db.dropDatabase();
    },
  };
}
