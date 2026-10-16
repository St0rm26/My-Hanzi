import { type Collection, type Db, MongoServerError } from "mongodb";

export class BenchmarkAlreadyExists extends Error {}
export class BenchmarkNotFound extends Error {}
export class BenchmarkRequiresItems extends Error {}
export class BenchmarkItemNotFound extends Error {}
export class BenchmarkItemAlreadyFinished extends Error {}
export class BenchmarkItemNotFinished extends Error {}

export type Benchmark = string;

interface BenchmarkDocument<User> {
  _id: Benchmark;
  user: User;
  name: string;
}

interface BenchmarkedItemDocument<Item> {
  benchmark: Benchmark;
  item: Item;
  finished: boolean;
}

/** Tracks a user's progress on named benchmarks. */
export class BenchmarkingConcept<User extends string, Item extends string> {
  private readonly benchmarks: Collection<BenchmarkDocument<User>>;
  private readonly benchmarkedItems: Collection<BenchmarkedItemDocument<Item>>;
  private indexes: Promise<unknown> | undefined;

  constructor(database: Db, name?: string) {
    const namespace = (name ?? "Benchmarking").toLowerCase();
    this.benchmarks = database.collection(`${namespace}.benchmarks`);
    this.benchmarkedItems = database.collection(
      `${namespace}.benchmarkedItems`,
    );
  }

  /** Creates storage constraints once per concept instance. */
  #ready() {
    this.indexes ??= Promise.all([
      this.benchmarks.createIndex(
        { user: 1, name: 1 },
        { unique: true },
      ),
      this.benchmarkedItems.createIndex(
        { benchmark: 1, item: 1 },
        { unique: true },
      ),
    ]).catch((error: unknown) => {
      this.indexes = undefined;
      throw error;
    });
    return this.indexes;
  }

  async createBenchmark({
    user,
    items,
    name,
  }: {
    user: User;
    items: Set<Item>;
    name: string;
  }) {
    await this.#ready();
    if (items.size === 0) {
      throw new BenchmarkRequiresItems(
        "A benchmark must contain at least one item.",
      );
    }

    const benchmark: Benchmark = crypto.randomUUID();

    try {
      await this.benchmarks.insertOne({ _id: benchmark, user, name });
    } catch (error) {
      if (isDuplicateUserAndName(error)) {
        throw new BenchmarkAlreadyExists(
          "This user already has a benchmark with that name.",
        );
      }
      throw error;
    }

    try {
      await this.benchmarkedItems.insertMany(
        [...items].map((item) => ({
          benchmark,
          item,
          finished: false,
        })),
      );
    } catch (error) {
      try {
        await Promise.all([
          this.benchmarks.deleteOne({ _id: benchmark }),
          this.benchmarkedItems.deleteMany({ benchmark }),
        ]);
      } catch (cleanupError) {
        throw new AggregateError(
          [error, cleanupError],
          "Could not create the benchmark or clean up its partial records.",
        );
      }
      throw error;
    }

    return { benchmark };
  }

  async deleteBenchmark({ benchmark }: { benchmark: Benchmark }) {
    await this.#ready();
    const deleted = await this.benchmarks.findOneAndDelete({ _id: benchmark });
    if (deleted === null) {
      throw new BenchmarkNotFound("There is no such benchmark.");
    }
    await this.benchmarkedItems.deleteMany({ benchmark });
    return {};
  }

  async checkBenchmarkItem({
    benchmark,
    item,
  }: {
    benchmark: Benchmark;
    item: Item;
  }) {
    await this.#ready();
    const updated = await this.benchmarkedItems.updateOne(
      { benchmark, item, finished: false },
      { $set: { finished: true } },
    );
    if (updated.matchedCount > 0) return {};

    const state = await this.#itemState(benchmark, item);
    if (state === "missing-benchmark") {
      throw new BenchmarkNotFound("There is no such benchmark.");
    }
    if (state === "missing-item") {
      throw new BenchmarkItemNotFound(
        "There is no such item in this benchmark.",
      );
    }
    throw new BenchmarkItemAlreadyFinished("This item is already finished.");
  }

  async uncheckBenchmarkItem({
    benchmark,
    item,
  }: {
    benchmark: Benchmark;
    item: Item;
  }) {
    await this.#ready();
    const updated = await this.benchmarkedItems.updateOne(
      { benchmark, item, finished: true },
      { $set: { finished: false } },
    );
    if (updated.matchedCount > 0) return {};

    const state = await this.#itemState(benchmark, item);
    if (state === "missing-benchmark") {
      throw new BenchmarkNotFound("There is no such benchmark.");
    }
    if (state === "missing-item") {
      throw new BenchmarkItemNotFound(
        "There is no such item in this benchmark.",
      );
    }
    throw new BenchmarkItemNotFinished("This item is not finished.");
  }

  async _items({
    benchmark,
  }: {
    benchmark: Benchmark;
  }): Promise<{ item: Item }[]> {
    await this.#ready();
    const items = await this.benchmarkedItems
      .find({ benchmark }, { projection: { _id: 0, item: 1 } })
      .toArray();
    return items.map(({ item }) => ({ item }));
  }

  async _finishedItems({
    benchmark,
  }: {
    benchmark: Benchmark;
  }): Promise<{ item: Item }[]> {
    await this.#ready();
    const items = await this.benchmarkedItems
      .find(
        { benchmark, finished: true },
        { projection: { _id: 0, item: 1 } },
      )
      .toArray();
    return items.map(({ item }) => ({ item }));
  }

  async _unfinishedItems({
    benchmark,
  }: {
    benchmark: Benchmark;
  }): Promise<{ item: Item }[]> {
    await this.#ready();
    const items = await this.benchmarkedItems
      .find(
        { benchmark, finished: false },
        { projection: { _id: 0, item: 1 } },
      )
      .toArray();
    return items.map(({ item }) => ({ item }));
  }

  async #itemState(benchmark: Benchmark, item: Item) {
    const foundBenchmark = await this.benchmarks.findOne(
      { _id: benchmark },
      { projection: { _id: 1 } },
    );
    if (foundBenchmark === null) return "missing-benchmark";

    const foundItem = await this.benchmarkedItems.findOne(
      { benchmark, item },
      { projection: { finished: 1 } },
    );
    return foundItem === null ? "missing-item" : foundItem.finished;
  }
}

const isDuplicateUserAndName = (error: unknown): boolean =>
  error instanceof MongoServerError &&
  error.code === 11000 &&
  error.keyPattern?.user === 1 &&
  error.keyPattern?.name === 1;
