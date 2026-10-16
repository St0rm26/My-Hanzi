import { describe, expect, test } from "bun:test";
import {
  SharedItemNotFound,
  SharedItemsNotDistinct,
  SharingConcept,
} from "../../src/concepts/Sharing/Sharing.ts";
import { testDatabase } from "../support/mongo.ts";

async function setup() {
  const database = await testDatabase();
  return {
    sharing: new SharingConcept<string, string>(database),
    database,
  };
}

describe("Sharing", () => {
  test("shares with the audience and lists each visible item once", async () => {
    const { sharing } = await setup();

    expect(await sharing._sharedItems({ user: "bob" })).toEqual([]);
    await sharing.shareItem({
      author: "alice",
      item: "book",
      audience: new Set(["bob", "bob"]),
    });
    await sharing.shareItem({
      author: "alice",
      item: "book",
      audience: new Set(["bob", "carol"]),
    });
    await sharing.shareItem({
      author: "erin",
      item: "book",
      audience: new Set(["bob"]),
    });
    await sharing.shareItem({
      author: "alice",
      item: "article",
      audience: new Set(["bob"]),
    });

    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "article" },
      { item: "book" },
    ]);
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([
      { item: "book" },
    ]);
    expect(await sharing._sharedItems({ user: "dave" })).toEqual([]);
  });

  test("shareItems shares every distinct item with every audience member idempotently", async () => {
    const { sharing, database } = await setup();

    await sharing.shareItems({
      author: "alice",
      items: ["book", "article", "book"],
      audience: new Set(["bob", "carol", "bob"]),
    });
    await sharing.shareItems({
      author: "alice",
      items: ["book"],
      audience: new Set(["bob"]),
    });

    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "article" },
      { item: "book" },
    ]);
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([
      { item: "article" },
      { item: "book" },
    ]);
    expect(
      await database.collection("sharing.sharedItems").countDocuments(),
    ).toBe(4);
  });

  test("revokeItem removes only requested shares and rejects a partly missing audience", async () => {
    const { sharing } = await setup();

    await sharing.shareItem({
      author: "alice",
      item: "book",
      audience: new Set(["bob", "carol"]),
    });
    await sharing.shareItem({
      author: "erin",
      item: "book",
      audience: new Set(["bob"]),
    });

    expect(
      sharing.revokeItem({
        author: "alice",
        item: "book",
        audience: new Set(["carol", "missing"]),
      }),
    ).rejects.toBeInstanceOf(SharedItemNotFound);
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([
      { item: "book" },
    ]);

    await sharing.revokeItem({
      author: "alice",
      item: "book",
      audience: new Set(["bob", "bob"]),
    });
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "book" },
    ]);
    await sharing.revokeItem({
      author: "alice",
      item: "book",
      audience: new Set(["carol"]),
    });
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([]);
  });

  test("deleteItem removes all of one author's shares but leaves other items and authors", async () => {
    const { sharing } = await setup();

    await sharing.shareItem({
      author: "alice",
      item: "book",
      audience: new Set(["bob", "carol"]),
    });
    await sharing.shareItem({
      author: "alice",
      item: "article",
      audience: new Set(["bob"]),
    });
    await sharing.shareItem({
      author: "erin",
      item: "book",
      audience: new Set(["carol"]),
    });

    await sharing.deleteItem({ author: "alice", item: "book" });
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "article" },
    ]);
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([
      { item: "book" },
    ]);
    expect(
      sharing.deleteItem({ author: "alice", item: "book" }),
    ).rejects.toBeInstanceOf(SharedItemNotFound);
  });

  test("revokeItems rejects repeated items and validates all shares before revoking", async () => {
    const { sharing } = await setup();

    await sharing.shareItems({
      author: "alice",
      items: ["book", "article"],
      audience: new Set(["bob", "carol"]),
    });
    await sharing.shareItem({
      author: "erin",
      item: "book",
      audience: new Set(["bob"]),
    });

    expect(
      sharing.revokeItems({
        author: "alice",
        items: ["book", "article"],
        audience: new Set(["bob", "missing"]),
      }),
    ).rejects.toBeInstanceOf(SharedItemNotFound);
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "article" },
      { item: "book" },
    ]);
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([
      { item: "article" },
      { item: "book" },
    ]);

    expect(
      sharing.revokeItems({
        author: "alice",
        items: ["book", "article", "book"],
        audience: new Set(["bob", "carol"]),
      }),
    ).rejects.toBeInstanceOf(SharedItemsNotDistinct);
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "article" },
      { item: "book" },
    ]);
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([
      { item: "article" },
      { item: "book" },
    ]);

    await sharing.revokeItems({
      author: "alice",
      items: ["book", "article"],
      audience: new Set(["bob", "carol"]),
    });
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "book" },
    ]);
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([]);
  });

  test("deleteItems rejects repeated inputs and validates every item before deleting", async () => {
    const { sharing } = await setup();

    for (const item of ["article", "book", "card"]) {
      await sharing.shareItem({
        author: "alice",
        item,
        audience: new Set(["bob"]),
      });
    }
    expect(
      sharing.deleteItems({ author: "alice", items: ["book", "missing"] }),
    ).rejects.toBeInstanceOf(SharedItemNotFound);
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "article" },
      { item: "book" },
      { item: "card" },
    ]);

    expect(
      sharing.deleteItems({
        author: "alice",
        items: ["book", "article", "book"],
      }),
    ).rejects.toBeInstanceOf(SharedItemsNotDistinct);
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "article" },
      { item: "book" },
      { item: "card" },
    ]);

    await sharing.deleteItems({ author: "alice", items: ["book", "article"] });
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "card" },
    ]);
  });

  test("concurrent shares of the same author, item, and user remain unique", async () => {
    const { sharing, database } = await setup();

    await Promise.all(
      Array.from({ length: 4 }, () =>
        sharing.shareItem({
          author: "alice",
          item: "book",
          audience: new Set(["bob"]),
        }),
      ),
    );
    expect(
      await database.collection("sharing.sharedItems").countDocuments(),
    ).toBe(1);
  });
});
