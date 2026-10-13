import { type Collection, type Db, MongoServerError } from "mongodb";

export class AlreadyCollectedInformation extends Error {}
export class InfoFieldNotFound extends Error {}

export type InfoField = string & { readonly __brand: "InfoField" };

interface InformationDocument<Item, Information> {
  _id: InfoField;
  item: Item;
  name: string;
  description: Information;
}

/** Lets each item to be given a detailed and concise description across different fields */
export class InformationCollectingConcept<
  Item extends string,
  Information extends string,
> {
  private readonly infoFields: Collection<
    InformationDocument<Item, Information>
  >;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "InformationCollecting") {
    this.infoFields = database.collection(`${name.toLowerCase()}.infoFields`);
  }

  /** Establishes the per-item field-name constraint once per instance. */
  #ready() {
    this.indexes ??= this.infoFields
      .createIndex({ item: 1, name: 1 }, { unique: true })
      .catch((error: unknown) => {
        this.indexes = undefined;
        throw error;
      });
    return this.indexes;
  }

  async addInfoField({
    item,
    fieldName,
    description,
  }: {
    item: Item;
    fieldName: string;
    description: Information;
  }) {
    await this.#ready();
    const infoField = crypto.randomUUID() as InfoField;

    try {
      await this.infoFields.insertOne({
        _id: infoField,
        item,
        name: fieldName,
        description,
      });
    } catch (error) {
      if (isDuplicateItemFieldName(error))
        throw new AlreadyCollectedInformation(
          "This item already has an info field with that name. Edit it instead.",
        );
      throw error;
    }
    return { infoField };
  }

  async editInfoField({
    item,
    infoField,
    description,
  }: {
    item: Item;
    infoField: InfoField;
    description: Information;
  }) {
    await this.#ready();
    const { matchedCount } = await this.infoFields.updateOne(
      { _id: infoField, item },
      { $set: { description } },
    );
    if (matchedCount === 0)
      throw new InfoFieldNotFound("This item does not have that info field.");
    return { infoField };
  }

  async deleteInfoField({
    item,
    infoField,
  }: {
    item: Item;
    infoField: InfoField;
  }) {
    await this.#ready();
    const { deletedCount } = await this.infoFields.deleteOne({
      item,
      _id: infoField,
    });
    if (deletedCount === 0)
      throw new InfoFieldNotFound("This item does not have that info field.");
    return {};
  }

  async _allInformation({
    item,
  }: {
    item: Item;
  }): Promise<{ information: Record<string, Information> }> {
    await this.#ready();
    const itemInformation = await this.infoFields
      .find({ item })
      .sort({ name: 1 })
      .toArray();

    return {
      information: Object.fromEntries(
        itemInformation.map(({ name, description }) => [name, description]),
      ),
    };
  }

  async _infoField({
    item,
    fieldName,
  }: {
    item: Item;
    fieldName: string;
  }): Promise<{ infoField: InfoField }[]> {
    await this.#ready();
    const infoField = await this.infoFields.findOne({ item, name: fieldName });
    return infoField === null ? [] : [{ infoField: infoField._id }];
  }

  async _information({
    item,
    fieldName,
  }: {
    item: Item;
    fieldName: string;
  }): Promise<{ information: Information }> {
    await this.#ready();
    const itemInformation = await this.infoFields.findOne({
      item,
      name: fieldName,
    });

    if (itemInformation === null)
      throw new InfoFieldNotFound(
        "This item does not have an info field with that name.",
      );
    return { information: itemInformation.description };
  }
}

/** The unique `{ item, name }` index permits only one field name per item. */
const isDuplicateItemFieldName = (error: unknown) =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?.item === 1 &&
  error.keyPattern?.name === 1;
