import { type Collection, type Db, MongoServerError } from "mongodb";

export class AlreadyCollectedInformation extends Error {}
export class InfoFieldNotFound extends Error {}

interface InformationDocument<Item, Information> {
  item: Item;
  name: string;
  description: Information;
}

export class InformationCollectingConcept<
  Item extends string,
  Information extends string,
> {
  private readonly infoFields: Collection<
    InformationDocument<Item, Information>
  >;

  constructor(database: Db, name = "InformationCollecting") {
    this.infoFields = database.collection(`${name.toLowerCase()}.infoFields`);
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
    await this.infoFields.createIndex({ item: 1, name: 1 }, { unique: true });

    try {
      await this.infoFields.insertOne({ item, name: fieldName, description });
    } catch (error) {
      if (isDuplicateItemFieldName(error))
        throw new AlreadyCollectedInformation(
          "This item already has an info field with that name. Edit it instead.",
        );
      throw error;
    }
    return { item, fieldName, description };
  }

  async editInfoField({
    item,
    fieldName,
    description,
  }: {
    item: Item;
    fieldName: string;
    description: Information;
  }) {
    const { matchedCount } = await this.infoFields.updateOne(
      { item, name: fieldName },
      { $set: { description } },
    );
    if (matchedCount === 0)
      throw new InfoFieldNotFound(
        "This item does not have an info field with that name.",
      );
    return { item, fieldName, description };
  }

  async deleteInfoField(item: Item, fieldName: string) {
    const { deletedCount } = await this.infoFields.deleteOne({
      item,
      name: fieldName,
    });
    if (deletedCount === 0)
      throw new InfoFieldNotFound(
        "This item does not have an info field with that name.",
      );
    return;
  }

  async _allInformation(
    item: Item,
  ): Promise<{ fieldName: string; description: Information }[]> {
    const itemInformation = await this.infoFields
      .find({
        item,
      })
      .sort({ name: 1 })
      .toArray();

    return itemInformation.map(({ name, description }) => ({
      fieldName: name,
      description,
    }));
  }

  async _information(
    item: Item,
    fieldName: string,
  ): Promise<{ description: Information }> {
    const itemInformation = await this.infoFields.findOne({
      item,
      name: fieldName,
    });

    if (itemInformation === null)
      throw new InfoFieldNotFound(
        "This item does not have an info field with that name.",
      );
    return { description: itemInformation.description };
  }
}

/** The unique `{ item, name }` index permits only one field name per item. */
const isDuplicateItemFieldName = (error: unknown) =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?.item === 1 &&
  error.keyPattern?.name === 1;
