import { type Collection, type Db, MongoServerError } from "mongodb";

export class TagAlreadyExists extends Error {}
export class TagNotFound extends Error {}
export class ItemAlreadyTagged extends Error {}
export class TaggedItemNotFound extends Error {}
export class TaggedItemIDNotFound extends Error {}

export type Tag = string & { readonly __brand: "Tag" };

interface TagDocument<User> {
  _id: Tag;
  author: User;
  name: string;
}

interface TaggedItemDocument<Item, ID> {
  tag: Tag;
  item: Item;
  addedDate: Date;
  identifier?: ID;
}

/** Labels items with user-owned tags and remembers when each label was added. */
export class TaggingConcept<
  User extends string,
  Item extends string,
  ID extends string = string,
> {
  private readonly tags: Collection<TagDocument<User>>;
  private readonly taggedItems: Collection<TaggedItemDocument<Item, ID>>;
  private indexes: Promise<unknown> | undefined;

  constructor(
    database: Db,
    name = "Tagging",
    private readonly freshID: () => string = () => crypto.randomUUID(),
  ) {
    const namespace = name.toLowerCase();
    this.tags = database.collection(`${namespace}.tags`);
    this.taggedItems = database.collection(`${namespace}.taggedItems`);
  }

  /** Creates storage constraints once per concept instance. */
  #ready() {
    this.indexes ??= Promise.all([
      this.tags.createIndex({ author: 1, name: 1 }, { unique: true }),
      this.taggedItems.createIndex({ tag: 1, item: 1 }, { unique: true }),
      this.taggedItems.createIndex(
        { identifier: 1 },
        { unique: true, sparse: true },
      ),
    ]).catch((error: unknown) => {
      this.indexes = undefined;
      throw error;
    });
    return this.indexes;
  }

  async createTag({ user, name }: { user: User; name: string }) {
    await this.#ready();
    const tag = this.freshID() as Tag;

    try {
      await this.tags.insertOne({ _id: tag, author: user, name });
    } catch (error) {
      if (isDuplicateAuthorAndName(error)) {
        throw new TagAlreadyExists(
          "This user already has a tag with that name.",
        );
      }
      throw error;
    }

    return { tag };
  }

  async renameTag({
    user,
    tag,
    newName,
  }: {
    user: User;
    tag: Tag;
    newName: string;
  }) {
    await this.#ready();

    try {
      const renamed = await this.tags.findOneAndUpdate(
        { _id: tag, author: user },
        { $set: { name: newName } },
      );
      if (renamed === null) throw new TagNotFound("There is no such tag.");
    } catch (error) {
      if (isDuplicateAuthorAndName(error)) {
        throw new TagAlreadyExists(
          "This user already has a tag with that name.",
        );
      }
      throw error;
    }

    return { tag };
  }

  async deleteTag({ user, tag }: { user: User; tag: Tag }) {
    await this.#ready();
    const deleted = await this.tags.findOneAndDelete({
      _id: tag,
      author: user,
    });
    if (deleted === null) throw new TagNotFound("There is no such tag.");

    await this.taggedItems.deleteMany({ tag });
    return;
  }

  async addItemTag({
    user,
    tag,
    item,
    date,
  }: {
    user: User;
    tag: Tag;
    item: Item;
    date: Date;
  }) {
    await this.#ready();
    await this.#requireTag(user, tag);

    try {
      await this.taggedItems.insertOne({
        tag,
        item,
        addedDate: date,
      });
    } catch (error) {
      if (isDuplicateTagAndItem(error)) {
        throw new ItemAlreadyTagged("This item already has the given tag.");
      }
      throw error;
    }

    return;
  }

  async removeItemTag({
    user,
    tag,
    item,
  }: {
    user: User;
    tag: Tag;
    item: Item;
  }) {
    await this.#ready();
    await this.#requireTag(user, tag);

    const { deletedCount } = await this.taggedItems.deleteOne({ tag, item });
    if (deletedCount === 0) {
      throw new TaggedItemNotFound("This item does not have the given tag.");
    }
    return;
  }

  async generateTaggedItemID({
    user,
    tag,
    item,
  }: {
    user: User;
    tag: Tag;
    item: Item;
  }): Promise<{ id: ID }> {
    await this.#ready();
    await this.#requireTag(user, tag);

    while (true) {
      const id = this.freshID() as ID;
      try {
        const { matchedCount } = await this.taggedItems.updateOne(
          { tag, item },
          { $set: { identifier: id } },
        );
        if (matchedCount === 0) {
          throw new TaggedItemNotFound(
            "This item does not have the given tag.",
          );
        }
        return { id };
      } catch (error) {
        if (!isDuplicateIdentifier(error)) throw error;
      }
    }
  }

  async findTaggedItemID({
    user,
    tag,
    item,
  }: {
    user: User;
    tag: Tag;
    item: Item;
  }) {
    await this.#ready();
    await this.#requireTag(user, tag);

    const taggedItem = await this.taggedItems.findOne({ tag, item });
    if (taggedItem === null) {
      throw new TaggedItemNotFound("This item does not have the given tag.");
    }
    if (taggedItem.identifier === undefined) {
      throw new TaggedItemIDNotFound(
        "The tagged item does not have an identifier.",
      );
    }
    return { id: taggedItem.identifier };
  }

  async findTaggedItemsID({ user, tag }: { user: User; tag: Tag }) {
    await this.#ready();
    await this.#requireTag(user, tag);

    const ids = await this.taggedItems.distinct("identifier", {
      tag,
      identifier: { $exists: true },
    });
    return { ids: ids as ID[] };
  }

  async _getTaggedItems({ tag }: { tag: Tag }): Promise<{ item: Item }[]> {
    await this.#ready();
    const found = await this.tags.findOne(
      { _id: tag },
      { projection: { _id: 1 } },
    );
    if (found === null) return [];

    const taggedItems = await this.taggedItems.find({ tag }).toArray();
    return taggedItems.map(({ item }) => ({ item }));
  }

  async #requireTag(user: User, tag: Tag) {
    const found = await this.tags.findOne(
      { _id: tag, author: user },
      { projection: { _id: 1 } },
    );
    if (found === null) throw new TagNotFound("There is no such tag.");
  }
}

const isDuplicateAuthorAndName = (error: unknown) =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?.author === 1 &&
  error.keyPattern?.name === 1;

const isDuplicateTagAndItem = (error: unknown) =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?.tag === 1 &&
  error.keyPattern?.item === 1;

const isDuplicateIdentifier = (error: unknown) =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?.identifier === 1;
