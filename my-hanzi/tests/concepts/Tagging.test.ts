import { beforeEach, describe, expect, test } from "bun:test";
import {
  ItemAlreadyTagged,
  type Tag,
  TagAlreadyExists,
  TaggedItemIDNotFound,
  TaggedItemNotFound,
  TaggingConcept,
  TagNotFound,
} from "../../src/concepts/Tagging/Tagging.ts";
import { testDatabase } from "../support/mongo.ts";

const date = new Date("2026-01-02T03:04:05.000Z");

describe("Tagging", () => {
  let database: Awaited<ReturnType<typeof testDatabase>>;
  let tagging: TaggingConcept<string, string, string>;

  beforeEach(async () => {
    database = await testDatabase();
    tagging = new TaggingConcept(database);
  });

  async function createTag(user = "alice", name = "studied") {
    return (await tagging.createTag({ user, name })).tag;
  }

  test("tag names are unique per user and tags have distinct identities", async () => {
    const studied = await createTag();
    const favorites = await createTag("alice", "favorites");
    expect(studied).not.toBe(favorites);
    expect(
      tagging.createTag({ user: "alice", name: "studied" }),
    ).rejects.toBeInstanceOf(TagAlreadyExists);
    const bobTag = await createTag("bob", "studied");
    expect(bobTag).not.toBe(studied);
  });

  test("renameTag preserves identity, permits its current name, and rejects another tag's name", async () => {
    const tag = await createTag();
    await createTag("alice", "favorites");
    await createTag("bob", "review");

    expect(
      await tagging.renameTag({ user: "alice", tag, newName: "review" }),
    ).toEqual({ tag });
    expect(
      await database.collection("tagging.tags").findOne({ _id: tag }),
    ).toMatchObject({ author: "alice", name: "review" });
    expect(
      tagging.renameTag({ user: "alice", tag, newName: "favorites" }),
    ).rejects.toBeInstanceOf(TagAlreadyExists);
    expect(
      await tagging.renameTag({ user: "alice", tag, newName: "review" }),
    ).toEqual({ tag });
    expect(
      await database.collection("tagging.tags").findOne({ _id: tag }),
    ).toMatchObject({ author: "alice", name: "review" });
  });

  test("can only rename or delete a tag if the tag exists under the user", async () => {
    const tag = await createTag();
    expect(
      tagging.renameTag({ user: "bob", tag, newName: "stolen" }),
    ).rejects.toBeInstanceOf(TagNotFound);
    expect(tagging.deleteTag({ user: "bob", tag })).rejects.toBeInstanceOf(
      TagNotFound,
    );
    expect(
      tagging.deleteTag({ user: "alice", tag: "missing" as Tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
  });

  test("deleteTag removes its tagged items but leaves other tags intact", async () => {
    const removed = await createTag();
    const retained = await createTag("alice", "favorites");
    await tagging.addItemTag({
      user: "alice",
      tag: removed,
      item: "book",
      date,
    });
    await tagging.addItemTag({
      user: "alice",
      tag: retained,
      item: "book",
      date,
    });

    await tagging.deleteTag({ user: "alice", tag: removed });
    expect(await tagging._getTaggedItems({ tag: removed })).toEqual([]);
    expect(await tagging._getTaggedItems({ tag: retained })).toEqual([
      { item: "book" },
    ]);
    expect(
      tagging.addItemTag({ user: "alice", tag: removed, item: "other", date }),
    ).rejects.toBeInstanceOf(TagNotFound);
  });

  test("addItemTag stores the date and refuses a repeated tag and item pair", async () => {
    const tag = await createTag();
    const other = await createTag("alice", "favorites");
    await tagging.addItemTag({ user: "alice", tag, item: "book", date });
    expect(
      await database
        .collection("tagging.taggedItems")
        .findOne({ tag, item: "book" }),
    ).toMatchObject({ addedDate: date });
    expect(
      tagging.addItemTag({ user: "alice", tag, item: "book", date }),
    ).rejects.toBeInstanceOf(ItemAlreadyTagged);
    await tagging.addItemTag({ user: "alice", tag: other, item: "book", date });
    expect(await tagging._getTaggedItems({ tag })).toEqual([{ item: "book" }]);
  });

  test("removeItemTag removes one item and checks ownership and existence", async () => {
    const tag = await createTag();
    await tagging.addItemTag({ user: "alice", tag, item: "book", date });
    await tagging.addItemTag({ user: "alice", tag, item: "article", date });
    expect(
      tagging.removeItemTag({ user: "bob", tag, item: "book" }),
    ).rejects.toBeInstanceOf(TagNotFound);
    await tagging.removeItemTag({ user: "alice", tag, item: "book" });
    expect(await tagging._getTaggedItems({ tag })).toEqual([
      { item: "article" },
    ]);
    expect(
      tagging.removeItemTag({ user: "alice", tag, item: "book" }),
    ).rejects.toBeInstanceOf(TaggedItemNotFound);
  });

  test("generated IDs can be found individually and as a set", async () => {
    const tag = await createTag();
    for (const item of ["book", "article", "card"]) {
      await tagging.addItemTag({ user: "alice", tag, item, date });
    }
    expect(
      tagging.findTaggedItemID({ user: "alice", tag, item: "card" }),
    ).rejects.toBeInstanceOf(TaggedItemIDNotFound);
    const first = await tagging.generateTaggedItemID({
      user: "alice",
      tag,
      item: "book",
    });
    const second = await tagging.generateTaggedItemID({
      user: "alice",
      tag,
      item: "article",
    });

    expect(
      await tagging.findTaggedItemID({ user: "alice", tag, item: "book" }),
    ).toEqual(first);
    expect(
      (await tagging.findTaggedItemsID({ user: "alice", tag })).ids.sort(),
    ).toEqual([first.id, second.id].sort());
    expect(
      tagging.generateTaggedItemID({ user: "alice", tag, item: "missing" }),
    ).rejects.toBeInstanceOf(TaggedItemNotFound);
    expect(
      tagging.findTaggedItemsID({ user: "bob", tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
  });

  test("generated ID collisions are retried across tags", async () => {
    const values = ["tag-one", "tag-two", "same-id", "same-id", "new-id"];
    const deterministic = new TaggingConcept<string, string, string>(
      database,
      "deterministicTagging",
      () => {
        const value = values.shift();
        if (value === undefined) throw new Error("No generated IDs remain");
        return value;
      },
    );
    const first = (
      await deterministic.createTag({ user: "alice", name: "one" })
    ).tag;
    const second = (
      await deterministic.createTag({ user: "alice", name: "two" })
    ).tag;
    await deterministic.addItemTag({
      user: "alice",
      tag: first,
      item: "book",
      date,
    });
    await deterministic.addItemTag({
      user: "alice",
      tag: second,
      item: "article",
      date,
    });

    expect(
      await deterministic.generateTaggedItemID({
        user: "alice",
        tag: first,
        item: "book",
      }),
    ).toEqual({ id: "same-id" });
    expect(
      await deterministic.generateTaggedItemID({
        user: "alice",
        tag: second,
        item: "article",
      }),
    ).toEqual({ id: "new-id" });
  });
});
