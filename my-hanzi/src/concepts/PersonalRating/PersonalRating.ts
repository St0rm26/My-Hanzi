import { type Collection, type Db, MongoServerError } from "mongodb";

export class RatingNotDefined extends Error {}
export class AlreadyRated extends Error {}
export class PersonalRatingNotFound extends Error {}

interface DefinedRatingDocument<Rating> {
  _id: Rating;
}

interface PersonalRatingDocument<User, Item, Rating> {
  user: User;
  item: Item;
  rating: Rating;
}

/** Lets each user privately assign one defined rating to an item. */
export class PersonalRatingConcept<
  User extends string,
  Item extends string,
  Rating extends string,
> {
  private readonly definedRatings: Collection<DefinedRatingDocument<Rating>>;
  private readonly personalRatings: Collection<
    PersonalRatingDocument<User, Item, Rating>
  >;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name = "PersonalRating") {
    const namespace = name.toLowerCase();
    this.definedRatings = database.collection(`${namespace}.definedRatings`);
    this.personalRatings = database.collection(`${namespace}.personalRatings`);
  }

  /**
   * Creates the indexes once per concept instance. If creation fails, the next
   * operation retries it instead of retaining a rejected promise.
   */
  #ready() {
    this.indexes ??= Promise.all([
      this.personalRatings.createIndex(
        { user: 1, item: 1 },
        { name: "unique_user_item", unique: true },
      ),
      this.personalRatings.createIndex(
        { rating: 1 },
        { name: "ratings_by_definition" },
      ),
    ]).catch((error: unknown) => {
      this.indexes = undefined;
      throw error;
    });
    return this.indexes;
  }

  async addDefinedRatings({ ratings }: { ratings: Rating[] }) {
    const uniqueRatings = [...new Set(ratings)];
    await Promise.all(
      uniqueRatings.map(async (rating) => {
        try {
          await this.definedRatings.updateOne(
            { _id: rating },
            { $setOnInsert: { _id: rating } },
            { upsert: true },
          );
        } catch (error) {
          // A concurrent union may have inserted this same definition first.
          if (!isDuplicateDefinedRating(error)) throw error;
        }
      }),
    );
    return { ratings: uniqueRatings };
  }

  async removeDefinedRating({ rating }: { rating: Rating }) {
    await this.#ready();

    // Remove the definition first so later actions cannot assign it while its
    // existing uses are being removed.
    const removed = await this.definedRatings.findOneAndDelete({ _id: rating });
    if (removed === null)
      throw new RatingNotDefined("This rating is not defined.");

    await this.personalRatings.deleteMany({ rating });
    return {};
  }

  async addRating({
    user,
    item,
    rating,
  }: {
    user: User;
    item: Item;
    rating: Rating;
  }) {
    await this.#ready();
    await this.#requireDefined(rating);

    try {
      await this.personalRatings.insertOne({ user, item, rating });
    } catch (error) {
      if (isDuplicateUserItem(error))
        throw new AlreadyRated(
          "User has already rated this item. Change the rating instead.",
        );
      throw error;
    }
    return {};
  }

  async changeRating({
    user,
    item,
    rating,
  }: {
    user: User;
    item: Item;
    rating: Rating;
  }) {
    await this.#ready();
    await this.#requireDefined(rating);

    const { matchedCount } = await this.personalRatings.updateOne(
      { user, item },
      { $set: { rating } },
    );
    if (matchedCount === 0)
      throw new PersonalRatingNotFound("User has not rated this item.");
    return {};
  }

  async deleteRating({ user, item }: { user: User; item: Item }) {
    await this.#ready();
    const { deletedCount } = await this.personalRatings.deleteOne({
      user,
      item,
    });
    if (deletedCount === 0)
      throw new PersonalRatingNotFound("User has not rated this item.");
    return {};
  }

  async _rating({
    user,
    item,
  }: {
    user: User;
    item: Item;
  }): Promise<{ rating: Rating }[]> {
    await this.#ready();
    const personalRating = await this.personalRatings.findOne({ user, item });
    if (personalRating === null) return [];
    return [{ rating: personalRating.rating }];
  }

  async #requireDefined(rating: Rating) {
    const defined = await this.definedRatings.findOne(
      { _id: rating },
      { projection: { _id: 1 } },
    );
    if (defined === null)
      throw new RatingNotDefined("That rating is not defined.");
  }
}

/** MongoDB uses code 11000 when a write violates a unique index. */
const isDuplicateUserItem = (error: unknown) =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?.user === 1 &&
  error.keyPattern?.item === 1;

const isDuplicateDefinedRating = (error: unknown) =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?._id === 1;
