import { type Collection, type Db, MongoServerError } from "mongodb";

export class SharedItemNotFound extends Error {}
export class SharedItemsNotDistinct extends Error {}
export class PublicItemsEmpty extends Error {}
export class TagNotPublic extends Error {}

interface SharedItemDocument {
  author: string;
  item: string;
  sharedUser: string;
}

interface PublicItemDocument<
  User extends string,
  Item extends string,
  Tag extends string,
> {
  author: User;
  tag: Tag;
  item: Item;
}

/** Lets authors grant and revoke other users' access to their items. */
export class SharingConcept<
  User extends string,
  Item extends string,
  Tag extends string,
> {
  private readonly sharedItems: Collection<SharedItemDocument>;
  private readonly publicItems: Collection<PublicItemDocument<User, Item, Tag>>;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "Sharing") {
    const namespace = name.toLowerCase();
    this.sharedItems = database.collection(`${namespace}.sharedItems`);
    this.publicItems = database.collection(`${namespace}.publicItems`);
  }

  /**
   * Creates the uniqueness and query indexes once per concept instance. If
   * creation fails, the next operation tries again.
   */
  #ready() {
    this.indexes ??= Promise.all([
      this.sharedItems.createIndexes([
        {
          key: { author: 1, item: 1, sharedUser: 1 },
          unique: true,
        },
        { key: { sharedUser: 1, item: 1 } },
      ]),
      this.publicItems.createIndex(
        { author: 1, tag: 1, item: 1 },
        { unique: true },
      ),
      this.publicItems.createIndex({ tag: 1 }),
    ])
      .catch((error: unknown) => {
        this.indexes = undefined;
        throw error;
      });
    return this.indexes;
  }

  async shareItem({
    author,
    item,
    audience,
  }: {
    author: User;
    item: Item;
    audience: User[];
  }) {
    await this.#ready();

    for (const sharedUser of new Set(audience)) {
      try {
        await this.sharedItems.updateOne(
          { author, item, sharedUser },
          { $setOnInsert: { author, item, sharedUser } },
          { upsert: true },
        );
      } catch (error) {
        // A concurrent call may create the same share after this call checks.
        // The desired shared item then exists, so sharing remains idempotent.
        if (!isDuplicateSharedItem(error)) throw error;
      }
    }

    return {};
  }

  async shareItems({
    author,
    items,
    audience,
  }: {
    author: User;
    items: Item[];
    audience: User[];
  }) {
    await this.#ready();
    const sharedUsers = [...new Set(audience)];

    for (const item of new Set(items)) {
      for (const sharedUser of sharedUsers) {
        try {
          await this.sharedItems.updateOne(
            { author, item, sharedUser },
            { $setOnInsert: { author, item, sharedUser } },
            { upsert: true },
          );
        } catch (error) {
          if (!isDuplicateSharedItem(error)) throw error;
        }
      }
    }
    return {};
  }

  async setPublic({
    author,
    tag,
    items,
  }: {
    author: User;
    tag: Tag;
    items: Item[];
  }) {
    await this.#ready();
    if (items.length === 0) {
      throw new PublicItemsEmpty(
        "Add at least one item before making this collection public.",
      );
    }
    await this.#insertPublicItems(author, tag, items);
    return {};
  }

  async setPrivate({
    author,
    tag,
  }: {
    author: User;
    tag: Tag;
  }) {
    await this.#ready();
    await this.publicItems.deleteMany({ author, tag });
    return {};
  }

  async addPublicItems({
    author,
    tag,
    items,
  }: {
    author: User;
    tag: Tag;
    items: Item[];
  }) {
    await this.#ready();
    await this.#requirePublicTag(author, tag);
    await this.#insertPublicItems(author, tag, items);
    return {};
  }

  async #insertPublicItems(author: User, tag: Tag, items: Item[]) {
    for (const item of new Set(items)) {
      await this.publicItems.updateOne(
        { author, tag, item },
        { $setOnInsert: { author, tag, item } },
        { upsert: true },
      );
    }
  }

  async addPublicItem({
    author,
    tag,
    item,
  }: {
    author: User;
    tag: Tag;
    item: Item;
  }) {
    await this.#ready();
    await this.#requirePublicTag(author, tag);
    await this.publicItems.updateOne(
      { author, tag, item },
      { $setOnInsert: { author, tag, item } },
      { upsert: true },
    );
    return {};
  }

  async #requirePublicTag(author: User, tag: Tag) {
    const exists = await this.publicItems.findOne(
      { author, tag },
      { projection: { _id: 1 } },
    );
    if (exists === null) {
      throw new TagNotPublic("The tag is not public.");
    }
  }

  async removePublicItems({
    author,
    tag,
    items,
  }: {
    author: User;
    tag: Tag;
    items: Item[];
  }) {
    await this.#ready();
    for (const item of new Set(items)) {
      await this.publicItems.deleteOne({ author, tag, item });
    }
    return {};
  }

  async _publicItems({
    tag,
  }: {
    tag: Tag;
  }): Promise<{ author: User; item: Item }[]> {
    await this.#ready();
    const items = await this.publicItems
      .find(
        { tag },
        { projection: { _id: 0, author: 1, item: 1 } },
      )
      .sort({ item: 1 })
      .toArray();
    return items;
  }

  async _publicCollections({}: { user: User }): Promise<
    { author: User; tag: Tag }[]
  > {
    await this.#ready();
    const items = await this.publicItems
      .find({}, { projection: { _id: 0, author: 1, tag: 1 } })
      .sort({ tag: 1 })
      .toArray();
    const collections = new Map<string, { author: User; tag: Tag }>();
    for (const { author, tag } of items) {
      collections.set(
        JSON.stringify([author, tag]),
        { author, tag },
      );
    }
    return [...collections.values()];
  }

  async _publicStatus({
    author,
    tag,
  }: {
    author: User;
    tag: Tag;
  }): Promise<{ isPublic: boolean }[]> {
    await this.#ready();
    const count = await this.publicItems.countDocuments({ author, tag });
    return [{ isPublic: count > 0 }];
  }

  async revokeItem({
    author,
    item,
    audience,
  }: {
    author: User;
    item: Item;
    audience: User[];
  }) {
    await this.#ready();
    const users = [...new Set(audience)];
    const existing = await this.sharedItems
      .find(
        { author, item, sharedUser: { $in: users } },
        { projection: { _id: 0, sharedUser: 1 } },
      )
      .toArray();
    const existingUsers = new Set(existing.map(({ sharedUser }) => sharedUser));

    if (users.some((user) => !existingUsers.has(user))) {
      throw new SharedItemNotFound(
        "The item is not shared with every user in the audience.",
      );
    }

    if (users.length > 0) {
      await this.sharedItems.deleteMany({
        author,
        item,
        sharedUser: { $in: users },
      });
    }
    return {};
  }

  async revokeItems({
    author,
    items,
    audience,
  }: {
    author: User;
    items: Item[];
    audience: User[];
  }) {
    await this.#ready();
    const uniqueItems = requireDistinctItems(items);
    const users = [...new Set(audience)];
    const existing = await this.sharedItems
      .find(
        { author, item: { $in: uniqueItems }, sharedUser: { $in: users } },
        { projection: { _id: 0, item: 1, sharedUser: 1 } },
      )
      .toArray();
    const existingPairs = new Set(
      existing.map(({ item, sharedUser }) => JSON.stringify([item, sharedUser])),
    );

    if (
      uniqueItems.some((item) =>
        users.some((user) => !existingPairs.has(JSON.stringify([item, user]))),
      )
    ) {
      throw new SharedItemNotFound(
        "Every item must be shared with every user in the audience.",
      );
    }

    if (uniqueItems.length > 0 && users.length > 0) {
      await this.sharedItems.deleteMany({
        author,
        item: { $in: uniqueItems },
        sharedUser: { $in: users },
      });
    }
    return {};
  }

  async deleteItem({ author, item }: { author: User; item: Item }) {
    await this.#ready();
    const { deletedCount } = await this.sharedItems.deleteMany({
      author,
      item,
    });
    if (deletedCount === 0) {
      throw new SharedItemNotFound("The author does not have the shared item.");
    }
    return {};
  }

  async deleteItems({ author, items }: { author: User; items: Item[] }) {
    await this.#ready();
    const uniqueItems = requireDistinctItems(items);
    const existing = await this.sharedItems
      .find(
        { author, item: { $in: uniqueItems } },
        { projection: { _id: 0, item: 1 } },
      )
      .toArray();
    const existingItems = new Set(existing.map(({ item }) => item));

    if (uniqueItems.some((item) => !existingItems.has(item))) {
      throw new SharedItemNotFound(
        "The author does not have every requested shared item.",
      );
    }

    if (uniqueItems.length > 0) {
      await this.sharedItems.deleteMany({
        author,
        item: { $in: uniqueItems },
      });
    }
    return {};
  }

  async _sharedItems({ user }: { user: User }): Promise<{ item: Item }[]> {
    await this.#ready();
    const sharedItems = await this.sharedItems
      .find({ sharedUser: user }, { projection: { _id: 0, item: 1 } })
      .sort({ item: 1 })
      .toArray();

    return [...new Set(sharedItems.map(({ item }) => item))].map((item) => ({
      item: item as Item,
    }));
  }
}

/** 11000 is MongoDB's code for a write that violates a unique index. */
const isDuplicateSharedItem = (error: unknown) =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?.author === 1 &&
  error.keyPattern?.item === 1 &&
  error.keyPattern?.sharedUser === 1;

const requireDistinctItems = <Item>(items: readonly Item[]): Item[] => {
  const uniqueItems = [...new Set(items)];
  if (uniqueItems.length !== items.length) {
    throw new SharedItemsNotDistinct("All items must be distinct.");
  }
  return uniqueItems;
};
