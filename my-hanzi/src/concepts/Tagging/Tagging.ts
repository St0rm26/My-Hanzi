import { type Collection, type Db, MongoServerError } from "mongodb";

export class TagAlreadyExists extends Error {}
export class TagNotFound extends Error {}
export class DefaultTagCannotBeDeleted extends Error {}
export class ItemAlreadyTagged extends Error {}
export class TaggedItemNotFound extends Error {}
export class TaggedItemIDNotFound extends Error {}

export type Tag = string & { readonly __brand: "Tag" };

interface TagDocument<User> {
  _id: Tag;
  author: User;
  name: string;
  audience: User[];
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
      await this.tags.insertOne({ _id: tag, author: user, name, audience: [] });
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
      name: { $ne: "Studied" },
    });
    if (deleted === null) {
      const protectedTag = await this.tags.findOne({
        _id: tag,
        author: user,
        name: "Studied",
      });
      if (protectedTag !== null) {
        throw new DefaultTagCannotBeDeleted(
          'The default "Studied" tag cannot be deleted.',
        );
      }
      throw new TagNotFound("There is no such tag.");
    }

    await this.taggedItems.deleteMany({ tag });
    return {};
  }

  async captureTagForDeletion({ user, tag }: { user: User; tag: Tag }) {
    await this.#ready();
    const found = await this.tags.findOne(
      { _id: tag, author: user },
      { projection: { _id: 0, name: 1, audience: 1 } },
    );
    if (found === null) throw new TagNotFound("There is no such tag.");
    if (found.name === "Studied") {
      throw new DefaultTagCannotBeDeleted(
        'The default "Studied" tag cannot be deleted.',
      );
    }
    return {
      audience: [...new Set(found.audience)],
      ids: await this.#taggedItemIDs(tag),
    };
  }

  async captureTagSharing({ user, tag }: { user: User; tag: Tag }) {
    await this.#ready();
    const found = await this.tags.findOne(
      { _id: tag, author: user },
      { projection: { _id: 0, audience: 1 } },
    );
    if (found === null) throw new TagNotFound("There is no such tag.");
    return {
      audience: [...new Set(found.audience)],
      ids: await this.#taggedItemIDs(tag),
    };
  }

  async captureItemSharing({
    user,
    tag,
    item,
  }: {
    user: User;
    tag: Tag;
    item: Item;
  }) {
    await this.#ready();
    const foundTag = await this.tags.findOne(
      { _id: tag, author: user },
      { projection: { _id: 0, audience: 1 } },
    );
    if (foundTag === null) throw new TagNotFound("There is no such tag.");

    const taggedItem = await this.taggedItems.findOne({ tag, item });
    if (taggedItem === null) {
      throw new TaggedItemNotFound("This item does not have the given tag.");
    }
    return {
      audience: [...new Set(foundTag.audience)],
      ids: taggedItem.identifier === undefined ? [] : [taggedItem.identifier],
    };
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

    return {};
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
    return {};
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

    return { ids: await this.#taggedItemIDs(tag) };
  }

  async updateAudience({
    user,
    tag,
    audience,
  }: {
    user: User;
    tag: Tag;
    audience: User[];
  }) {
    await this.#ready();
    await this.#requireTag(user, tag);
    await this.tags.updateOne(
      { _id: tag, author: user },
      { $set: { audience: [...new Set(audience)] } },
    );
    return {};
  }

  async _tags({ user }: { user: User }): Promise<{ tag: Tag; name: string }[]> {
    await this.#ready();
    const tags = await this.tags
      .find({ author: user })
      .sort({ name: 1 })
      .toArray();
    return tags.map(({ _id: tag, name }) => ({ tag, name }));
  }

  async _tagsContainingItem({
    user,
    item,
  }: {
    user: User;
    item: Item;
  }): Promise<{ tag: Tag }[]> {
    await this.#ready();
    const tags = await this.tags
      .find({ author: user }, { projection: { _id: 1 } })
      .toArray();
    if (tags.length === 0) return [];

    const containing = new Set(
      await this.taggedItems.distinct("tag", {
        tag: { $in: tags.map(({ _id }) => _id) },
        item,
      }),
    );
    return tags
      .filter(({ _id }) => containing.has(_id))
      .map(({ _id: tag }) => ({ tag }));
  }

  async _taggedItems({
    user,
    tag,
  }: {
    user: User;
    tag: Tag;
  }): Promise<{ item: Item; addedDate: Date }[]> {
    await this.#ready();
    await this.#requireTag(user, tag);

    const taggedItems = await this.taggedItems
      .find({ tag })
      .sort({ addedDate: -1 })
      .toArray();
    return taggedItems.map(({ item, addedDate }) => ({ item, addedDate }));
  }

  async _tagOfItem({
    id,
  }: {
    id: ID;
  }): Promise<{ tag: Tag }[]> {
    await this.#ready();
    const taggedItem = await this.taggedItems.findOne({ identifier: id });
    if (taggedItem === null) return [];
    return [{ tag: taggedItem.tag }];
  }

  async _audience({
    user,
    tag,
  }: {
    user: User;
    tag: Tag;
  }): Promise<{ audience: User }[]> {
    await this.#ready();
    const found = await this.tags.findOne(
      { _id: tag, author: user },
      { projection: { _id: 0, audience: 1 } },
    );
    if (found === null) throw new TagNotFound("There is no such tag.");
    return [...new Set(found.audience)].map((audience) => ({ audience }));
  }

  async _audienceList({
    user,
    tag,
  }: {
    user: User;
    tag: Tag;
  }): Promise<{ audience: User[] }[]> {
    await this.#ready();
    const found = await this.tags.findOne(
      { _id: tag, author: user },
      { projection: { _id: 0, audience: 1 } },
    );
    if (found === null) throw new TagNotFound("There is no such tag.");
    return [{ audience: [...new Set(found.audience)] }];
  }

  async #requireTag(user: User, tag: Tag) {
    const found = await this.tags.findOne(
      { _id: tag, author: user },
      { projection: { _id: 1 } },
    );
    if (found === null) throw new TagNotFound("There is no such tag.");
  }

  async #taggedItemIDs(tag: Tag): Promise<ID[]> {
    const ids = await this.taggedItems.distinct("identifier", {
      tag,
      identifier: { $exists: true },
    });
    return ids as ID[];
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
