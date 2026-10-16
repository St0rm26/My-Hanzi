import { type Collection, type Db, MongoServerError } from "mongodb";

export class SharedItemNotFound extends Error {}
export class SharedItemsNotDistinct extends Error {}

interface SharedItemDocument {
  author: string;
  item: string;
  sharedUser: string;
}

/** Lets authors grant and revoke other users' access to their items. */
export class SharingConcept<User extends string, Item extends string> {
  private readonly sharedItems: Collection<SharedItemDocument>;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "Sharing") {
    this.sharedItems = database.collection(`${name.toLowerCase()}.sharedItems`);
  }

  /**
   * Creates the uniqueness and query indexes once per concept instance. If
   * creation fails, the next operation tries again.
   */
  #ready() {
    this.indexes ??= this.sharedItems
      .createIndexes([
        {
          key: { author: 1, item: 1, sharedUser: 1 },
          unique: true,
        },
        { key: { sharedUser: 1, item: 1 } },
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
