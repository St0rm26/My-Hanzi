import { describe, expect, test } from "bun:test";
import {
  PublicItemsEmpty,
  SharedItemNotFound,
  SharedItemsNotDistinct,
  SharingConcept,
  TagNotPublic,
} from "../../src/concepts/Sharing/Sharing.ts";
import { testDatabase } from "../support/mongo.ts";

async function setup() {
  const database = await testDatabase();
  return {
    sharing: new SharingConcept<string, string, string>(database),
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
      audience: ["bob", "bob"],
    });
    await sharing.shareItem({
      author: "alice",
      item: "book",
      audience: ["bob", "carol"],
    });
    await sharing.shareItem({
      author: "erin",
      item: "book",
      audience: ["bob"],
    });
    await sharing.shareItem({
      author: "alice",
      item: "article",
      audience: ["bob"],
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
      audience: ["bob", "carol", "bob"],
    });
    await sharing.shareItems({
      author: "alice",
      items: ["book"],
      audience: ["bob"],
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
      audience: ["bob", "carol"],
    });
    await sharing.shareItem({
      author: "erin",
      item: "book",
      audience: ["bob"],
    });

    expect(
      sharing.revokeItem({
        author: "alice",
        item: "book",
        audience: ["carol", "missing"],
      }),
    ).rejects.toBeInstanceOf(SharedItemNotFound);
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([
      { item: "book" },
    ]);

    await sharing.revokeItem({
      author: "alice",
      item: "book",
      audience: ["bob", "bob"],
    });
    expect(await sharing._sharedItems({ user: "bob" })).toEqual([
      { item: "book" },
    ]);
    await sharing.revokeItem({
      author: "alice",
      item: "book",
      audience: ["carol"],
    });
    expect(await sharing._sharedItems({ user: "carol" })).toEqual([]);
  });

  test("deleteItem removes all of one author's shares but leaves other items and authors", async () => {
    const { sharing } = await setup();

    await sharing.shareItem({
      author: "alice",
      item: "book",
      audience: ["bob", "carol"],
    });
    await sharing.shareItem({
      author: "alice",
      item: "article",
      audience: ["bob"],
    });
    await sharing.shareItem({
      author: "erin",
      item: "book",
      audience: ["carol"],
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
      audience: ["bob", "carol"],
    });
    await sharing.shareItem({
      author: "erin",
      item: "book",
      audience: ["bob"],
    });

    expect(
      sharing.revokeItems({
        author: "alice",
        items: ["book", "article"],
        audience: ["bob", "missing"],
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
        audience: ["bob", "carol"],
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
      audience: ["bob", "carol"],
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
        audience: ["bob"],
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
          audience: ["bob"],
        }),
      ),
    );
    expect(
      await database.collection("sharing.sharedItems").countDocuments(),
    ).toBe(1);
  });

  test("public collections are derived from public items and clear when made private", async () => {
    const { sharing } = await setup();

    expect(
      await sharing._publicStatus({
        author: "alice",
        tag: "collection",
      }),
    ).toEqual([{ isPublic: false }]);
    expect(
      sharing.setPublic({
        author: "alice",
        tag: "collection",
        items: [],
      }),
    ).rejects.toBeInstanceOf(PublicItemsEmpty);
    expect(
      sharing.addPublicItems({
        author: "alice",
        tag: "collection",
        items: ["item-1"],
      }),
    ).rejects.toBeInstanceOf(TagNotPublic);
    expect(
      sharing.addPublicItem({
        author: "alice",
        tag: "collection",
        item: "item-1",
      }),
    ).rejects.toBeInstanceOf(TagNotPublic);
    await sharing.setPublic({
      author: "alice",
      tag: "collection",
      items: ["item-1", "item-2", "item-1"],
    });
    expect(
      await sharing._publicStatus({
        author: "alice",
        tag: "collection",
      }),
    ).toEqual([{ isPublic: true }]);
    expect(await sharing._publicCollections({ user: "bob" })).toEqual([
      { author: "alice", tag: "collection" },
    ]);
    expect(await sharing._publicItems({ tag: "collection" })).toEqual([
      { author: "alice", item: "item-1" },
      { author: "alice", item: "item-2" },
    ]);
    await sharing.addPublicItems({
      author: "alice",
      tag: "collection",
      items: ["item-3"],
    });
    await sharing.addPublicItem({
      author: "alice",
      tag: "collection",
      item: "item-4",
    });
    expect(await sharing._publicItems({ tag: "collection" })).toEqual([
      { author: "alice", item: "item-1" },
      { author: "alice", item: "item-2" },
      { author: "alice", item: "item-3" },
      { author: "alice", item: "item-4" },
    ]);

    await sharing.removePublicItems({
      author: "alice",
      tag: "collection",
      items: ["item-1"],
    });
    expect(await sharing._publicItems({ tag: "collection" })).toEqual([
      { author: "alice", item: "item-2" },
      { author: "alice", item: "item-3" },
      { author: "alice", item: "item-4" },
    ]);
    expect(
      await sharing._publicStatus({
        author: "alice",
        tag: "collection",
      }),
    ).toEqual([{ isPublic: true }]);

    await sharing.removePublicItems({
      author: "alice",
      tag: "collection",
      items: ["item-2", "item-3", "item-4"],
    });
    expect(
      await sharing._publicStatus({
        author: "alice",
        tag: "collection",
      }),
    ).toEqual([{ isPublic: false }]);
    expect(await sharing._publicCollections({ user: "bob" })).toEqual([]);
    expect(await sharing._publicItems({ tag: "collection" })).toEqual([]);

    await sharing.setPublic({
      author: "alice",
      tag: "collection",
      items: ["item-3"],
    });
    await sharing.setPrivate({ author: "alice", tag: "collection" });
    expect(await sharing._publicItems({ tag: "collection" })).toEqual([]);
  });
});
