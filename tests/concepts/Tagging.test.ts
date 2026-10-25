import { beforeEach, describe, expect, test } from "bun:test";
import {
  DefaultTagCannotBeDeleted,
  CollectionEmpty,
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
    await expect(
      tagging.createTag({ user: "alice", name: "studied" }),
    ).rejects.toBeInstanceOf(TagAlreadyExists);
    expect(await tagging._tags({ user: "alice" })).toHaveLength(2);
    const bobTag = await createTag("bob", "studied");
    expect(bobTag).not.toBe(studied);
  });

  test("tags start with an empty audience and updateAudience replaces it", async () => {
    const tag = await createTag();

    expect(await tagging._audience({ user: "alice", tag })).toEqual([]);
    expect(await tagging._audienceList({ user: "alice", tag })).toEqual([
      { audience: [] },
    ]);
    expect(
      await tagging.updateAudience({
        user: "alice",
        tag,
        audience: ["bob", "carol", "bob"],
      }),
    ).toEqual({});
    expect(await tagging._audience({ user: "alice", tag })).toEqual([
      { audience: "bob" },
      { audience: "carol" },
    ]);
    expect(await tagging._audienceList({ user: "alice", tag })).toEqual([
      { audience: ["bob", "carol"] },
    ]);

    await tagging.updateAudience({
      user: "alice",
      tag,
      audience: ["dave"],
    });
    expect(await tagging._audience({ user: "alice", tag })).toEqual([
      { audience: "dave" },
    ]);
    expect(await tagging._audienceList({ user: "alice", tag })).toEqual([
      { audience: ["dave"] },
    ]);
    await expect(
      tagging.updateAudience({
        user: "bob",
        tag,
        audience: ["mallory"],
      }),
    ).rejects.toBeInstanceOf(TagNotFound);
    expect(await tagging._audienceList({ user: "alice", tag })).toEqual([
      { audience: ["dave"] },
    ]);
    await expect(
      tagging._audience({ user: "bob", tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
  });

  test("_audience returns distinct users only for the tag owner", async () => {
    const tag = await createTag();
    await tagging.updateAudience({
      user: "alice",
      tag,
      audience: ["bob", "carol", "bob"],
    });

    expect(await tagging._audience({ user: "alice", tag })).toEqual([
      { audience: "bob" },
      { audience: "carol" },
    ]);
    await expect(
      tagging._audience({ user: "bob", tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
    await expect(
      tagging._audienceList({ user: "bob", tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
  });

  test("_tags returns only the user's tags sorted by name", async () => {
    const pinyin = await createTag("alice", "Pinyin");
    const studied = await createTag("alice", "Studied");
    await createTag("bob", "Private");

    expect(await tagging._tags({ user: "alice" })).toEqual([
      { tag: pinyin, name: "Pinyin" },
      { tag: studied, name: "Studied" },
    ]);
    expect(await tagging._tags({ user: "nobody" })).toEqual([]);
  });

  test("_tagsContainingItem returns only the user's collections containing the item", async () => {
    const studied = await createTag("alice", "Studied");
    const favorites = await createTag("alice", "Favorites");
    const bobTag = await createTag("bob", "Shared name");
    await tagging.addItemTag({ user: "alice", tag: studied, item: "你", date });
    await tagging.addItemTag({ user: "bob", tag: bobTag, item: "你", date });

    expect(
      await tagging._tagsContainingItem({ user: "alice", item: "你" }),
    ).toEqual([{ tag: studied }]);
    expect(
      await tagging._tagsContainingItem({ user: "alice", item: "我" }),
    ).toEqual([]);
    expect(favorites).not.toBe(studied);
  });

  test("_taggedItems returns a user's collection items newest first", async () => {
    const tag = await createTag("alice", "Favorites");
    const bobTag = await createTag("bob", "Private");
    const older = new Date("2026-01-01T00:00:00.000Z");
    const newer = new Date("2026-01-03T00:00:00.000Z");
    await tagging.addItemTag({
      user: "alice",
      tag,
      item: "你",
      date: older,
    });
    await tagging.addItemTag({
      user: "alice",
      tag,
      item: "我",
      date: newer,
    });
    await tagging.addItemTag({
      user: "bob",
      tag: bobTag,
      item: "她",
      date: newer,
    });

    expect(await tagging._taggedItems({ user: "alice", tag })).toEqual([
      { item: "我", addedDate: newer },
      { item: "你", addedDate: older },
    ]);
    await expect(
      tagging._taggedItems({ user: "bob", tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
  });

  test("_taggedItemsByName resolves the user's tag and returns its items newest first", async () => {
    const studied = await createTag("alice", "Studied");
    const bobStudied = await createTag("bob", "Studied");
    const older = new Date("2026-01-01T00:00:00.000Z");
    const newer = new Date("2026-01-03T00:00:00.000Z");
    await tagging.addItemTag({
      user: "alice",
      tag: studied,
      item: "你",
      date: older,
    });
    await tagging.addItemTag({
      user: "alice",
      tag: studied,
      item: "我",
      date: newer,
    });
    await tagging.addItemTag({
      user: "bob",
      tag: bobStudied,
      item: "她",
      date: newer,
    });

    expect(
      await tagging._taggedItemsByName({ user: "alice", tagName: "Studied" }),
    ).toEqual([
      { item: "我", addedDate: newer },
      { item: "你", addedDate: older },
    ]);
    expect(
      await tagging._taggedItemsByName({ user: "alice", tagName: "Missing" }),
    ).toEqual([]);
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
    await expect(
      tagging.renameTag({ user: "alice", tag, newName: "favorites" }),
    ).rejects.toBeInstanceOf(TagAlreadyExists);
    expect(
      await database.collection("tagging.tags").findOne({ _id: tag }),
    ).toMatchObject({ author: "alice", name: "review" });
    expect(
      await tagging.renameTag({ user: "alice", tag, newName: "review" }),
    ).toEqual({ tag });
    expect(
      await database.collection("tagging.tags").findOne({ _id: tag }),
    ).toMatchObject({ author: "alice", name: "review" });
  });

  test("can only rename or delete a tag if the tag exists under the user", async () => {
    const tag = await createTag();
    await expect(
      tagging.renameTag({ user: "bob", tag, newName: "stolen" }),
    ).rejects.toBeInstanceOf(TagNotFound);
    await expect(
      tagging.deleteTag({ user: "bob", tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
    await expect(
      tagging.deleteTag({ user: "alice", tag: "missing" as Tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
    expect(
      await database.collection("tagging.tags").findOne({ _id: tag }),
    ).toMatchObject({ author: "alice", name: "studied", audience: [] });
  });

  test("deleteTag refuses the default Studied tag and preserves its tagged items", async () => {
    const studied = await createTag("alice", "Studied");
    await tagging.addItemTag({
      user: "alice",
      tag: studied,
      item: "book",
      date,
    });

    await expect(
      tagging.deleteTag({ user: "alice", tag: studied }),
    ).rejects.toBeInstanceOf(DefaultTagCannotBeDeleted);
    expect(
      await database.collection("tagging.tags").findOne({ _id: studied }),
    ).toMatchObject({ author: "alice", name: "Studied" });
    expect(await tagging._taggedItems({ user: "alice", tag: studied })).toEqual(
      [{ item: "book", addedDate: date }],
    );
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
    await expect(
      tagging._taggedItems({ user: "alice", tag: removed }),
    ).rejects.toBeInstanceOf(TagNotFound);
    expect(
      await database
        .collection("tagging.taggedItems")
        .countDocuments({ tag: removed }),
    ).toBe(0);
    expect(
      await tagging._taggedItems({ user: "alice", tag: retained }),
    ).toEqual([{ item: "book", addedDate: date }]);
    await expect(
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
    await expect(
      tagging.addItemTag({ user: "alice", tag, item: "book", date }),
    ).rejects.toBeInstanceOf(ItemAlreadyTagged);
    expect(await tagging._taggedItems({ user: "alice", tag })).toEqual([
      { item: "book", addedDate: date },
    ]);
    await tagging.addItemTag({ user: "alice", tag: other, item: "book", date });
    expect(await tagging._taggedItems({ user: "alice", tag })).toEqual([
      { item: "book", addedDate: date },
    ]);
  });

  test("removeItemTag removes one item and checks ownership and existence", async () => {
    const tag = await createTag();
    await tagging.updateAudience({ user: "alice", tag, audience: ["bob"] });
    await tagging.addItemTag({ user: "alice", tag, item: "book", date });
    await tagging.addItemTag({ user: "alice", tag, item: "article", date });
    await expect(
      tagging.removeItemTag({ user: "bob", tag, item: "book" }),
    ).rejects.toBeInstanceOf(TagNotFound);
    expect(await tagging._taggedItems({ user: "alice", tag })).toEqual([
      { item: "article", addedDate: date },
      { item: "book", addedDate: date },
    ]);
    await tagging.removeItemTag({ user: "alice", tag, item: "book" });
    expect(await tagging._taggedItems({ user: "alice", tag })).toEqual([
      { item: "article", addedDate: date },
    ]);
    expect(await tagging._audienceList({ user: "alice", tag })).toEqual([
      { audience: ["bob"] },
    ]);
    await tagging.removeItemTag({ user: "alice", tag, item: "article" });
    expect(await tagging._audienceList({ user: "alice", tag })).toEqual([
      { audience: [] },
    ]);
    await expect(
      tagging.removeItemTag({ user: "alice", tag, item: "book" }),
    ).rejects.toBeInstanceOf(TaggedItemNotFound);
  });

  test("sharing snapshots capture audience and IDs before endpoint mutations", async () => {
    const tag = await createTag("alice", "Favorites");
    const studied = await createTag("alice", "Studied");
    await expect(
      tagging.captureTagSharing({ user: "alice", tag }),
    ).rejects.toBeInstanceOf(CollectionEmpty);
    await tagging.updateAudience({
      user: "alice",
      tag,
      audience: ["bob", "carol"],
    });
    await tagging.addItemTag({ user: "alice", tag, item: "book", date });
    const { id } = await tagging.generateTaggedItemID({
      user: "alice",
      tag,
      item: "book",
    });

    expect(await tagging.captureTagSharing({ user: "alice", tag })).toEqual({
      audience: ["bob", "carol"],
      ids: [id],
    });
    expect(await tagging.captureTagForDeletion({ user: "alice", tag })).toEqual(
      {
        audience: ["bob", "carol"],
        ids: [id],
      },
    );
    expect(
      await tagging.captureItemSharing({ user: "alice", tag, item: "book" }),
    ).toEqual({ audience: ["bob", "carol"], ids: [id] });

    await tagging.addItemTag({
      user: "alice",
      tag: studied,
      item: "studied-book",
      date,
    });
    await tagging.addItemTag({
      user: "alice",
      tag,
      item: "book-without-id",
      date,
    });
    await expect(
      tagging.captureTagForDeletion({ user: "alice", tag: studied }),
    ).rejects.toBeInstanceOf(DefaultTagCannotBeDeleted);
    await expect(
      tagging.captureItemSharing({ user: "bob", tag, item: "book" }),
    ).rejects.toBeInstanceOf(TagNotFound);
    await expect(
      tagging.captureItemSharing({ user: "alice", tag, item: "missing" }),
    ).rejects.toBeInstanceOf(TaggedItemNotFound);
    expect(
      await tagging.captureItemSharing({
        user: "alice",
        tag,
        item: "book-without-id",
      }),
    ).toEqual({ audience: ["bob", "carol"], ids: [] });
  });

  test("generated IDs can be found individually and as a set", async () => {
    const tag = await createTag();
    for (const item of ["book", "article", "card"]) {
      await tagging.addItemTag({ user: "alice", tag, item, date });
    }
    await expect(
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
    await expect(
      tagging.generateTaggedItemID({ user: "alice", tag, item: "missing" }),
    ).rejects.toBeInstanceOf(TaggedItemNotFound);
    expect(
      await database
        .collection("tagging.taggedItems")
        .findOne({ tag, item: "book" }),
    ).toMatchObject({ item: "book", identifier: first.id });
    await expect(
      tagging.findTaggedItemsID({ user: "bob", tag }),
    ).rejects.toBeInstanceOf(TagNotFound);
  });

  test("_tagOfItem returns the tag for any existing item identifier", async () => {
    const tag = await createTag("alice", "Favorites");
    const otherUsersTag = await createTag("bob", "Favorites");
    await tagging.addItemTag({ user: "alice", tag, item: "你", date });
    await tagging.addItemTag({
      user: "bob",
      tag: otherUsersTag,
      item: "他",
      date,
    });
    const { id } = await tagging.generateTaggedItemID({
      user: "alice",
      tag,
      item: "你",
    });
    const { id: otherUsersId } = await tagging.generateTaggedItemID({
      user: "bob",
      tag: otherUsersTag,
      item: "他",
    });

    expect(await tagging._tagOfItem({ id })).toEqual([{ tag }]);
    expect(await tagging._tagOfItem({ id: otherUsersId })).toEqual([
      { tag: otherUsersTag },
    ]);
    expect(await tagging._tagOfItem({ id: "unknown-id" })).toEqual([]);
  });

  test("_tagDetails returns the owner and name for existing collection tags", async () => {
    const tag = await createTag("alice", "Favorites");

    expect(await tagging._tagDetails({ tag })).toEqual([
      { author: "alice", name: "Favorites" },
    ]);
    await tagging.deleteTag({ user: "alice", tag });
    expect(await tagging._tagDetails({ tag })).toEqual([]);
  });

  test("_tagDetailsOfItem resolves a shared item to its collection owner and name", async () => {
    const tag = await createTag("alice", "Favorites");
    await tagging.addItemTag({ user: "alice", tag, item: "你", date });
    const { id } = await tagging.generateTaggedItemID({
      user: "alice",
      tag,
      item: "你",
    });

    expect(await tagging._tagDetailsOfItem({ id })).toEqual([
      { tag, author: "alice", name: "Favorites", item: "你", addedDate: date },
    ]);
    expect(await tagging._tagDetailsOfItem({ id: "missing" })).toEqual([]);
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
