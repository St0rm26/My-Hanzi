import { beforeEach, describe, expect, test } from "bun:test";
import {
  BenchmarkAlreadyExists,
  type Benchmark,
  BenchmarkingConcept,
  BenchmarkItemAlreadyFinished,
  BenchmarkItemNotFinished,
  BenchmarkItemNotFound,
  BenchmarkNotFound,
  BenchmarkRequiresDistinctItems,
  BenchmarkRequiresItems,
} from "../../src/concepts/Benchmarking/Benchmarking.ts";
import { testDatabase } from "../support/mongo.ts";

describe("Benchmarking", () => {
  let database: Awaited<ReturnType<typeof testDatabase>>;
  let benchmarking: BenchmarkingConcept<string, string>;

  beforeEach(async () => {
    database = await testDatabase();
    benchmarking = new BenchmarkingConcept(database);
  });

  async function createBenchmark(
    user = "alice",
    name = "Hanzi basics",
    items: Iterable<string> = ["你", "好", "我"],
  ) {
    return (
      await benchmarking.createBenchmark({
        user,
        name,
        items: [...items],
      })
    ).benchmark;
  }

  test("creates uniquely named benchmarks and starts all items unfinished", async () => {
    const first = await createBenchmark();
    const second = await createBenchmark("alice", "Travel");
    const anotherUser = await createBenchmark("bob");

    expect(first).not.toBe(second);
    expect(first).not.toBe(anotherUser);
    expect(await benchmarking._items({ benchmark: first })).toHaveLength(3);
    expect(await benchmarking._finishedItems({ benchmark: first })).toEqual([]);
    expect(
      await benchmarking._unfinishedItems({ benchmark: first }),
    ).toHaveLength(3);
    await expect(createBenchmark()).rejects.toBeInstanceOf(
      BenchmarkAlreadyExists,
    );
    expect(await benchmarking._benchmarks({ user: "alice" })).toHaveLength(2);
  });

  test("ensures benchmarks without resetting existing progress", async () => {
    const ensured = await benchmarking.ensureBenchmark({
      user: "alice",
      name: "Frequency",
      items: ["你", "好"],
    });

    expect(await benchmarking._finishedItems(ensured)).toEqual([]);
    expect(await benchmarking._unfinishedItems(ensured)).toEqual([
      { item: "你" },
      { item: "好" },
    ]);

    await benchmarking.checkBenchmarkItem({ ...ensured, item: "好" });
    const existing = await benchmarking.ensureBenchmark({
      user: "alice",
      name: "Frequency",
      items: ["你", "好"],
    });
    expect(existing).toEqual(ensured);
    expect(await benchmarking._finishedItems(ensured)).toEqual([
      { item: "好" },
    ]);
  });

  test("_benchmarks returns only the user's benchmarks unordered", async () => {
    const travel = await createBenchmark("alice", "Travel");
    const basics = await createBenchmark("alice", "Basics");
    await createBenchmark("bob", "Private");

    const aliceBenchmarks = await benchmarking._benchmarks({ user: "alice" });
    expect(aliceBenchmarks).toHaveLength(2);
    expect(
      aliceBenchmarks.sort((left, right) =>
        left.name.localeCompare(right.name),
      ),
    ).toEqual([
      { benchmark: basics, name: "Basics" },
      { benchmark: travel, name: "Travel" },
    ]);
    expect(await benchmarking._benchmarks({ user: "nobody" })).toEqual([]);
  });

  test("does not create a benchmark without items", async () => {
    await expect(
      createBenchmark("alice", "Empty", new Set()),
    ).rejects.toBeInstanceOf(BenchmarkRequiresItems);
    expect(
      await database.collection("benchmarking.benchmarks").countDocuments(),
    ).toBe(0);
  });

  test("does not create a benchmark when items are not distinct", async () => {
    await expect(
      createBenchmark("alice", "Duplicates", ["你", "好", "你"]),
    ).rejects.toBeInstanceOf(BenchmarkRequiresDistinctItems);
    expect(
      await database.collection("benchmarking.benchmarks").countDocuments(),
    ).toBe(0);
    expect(
      await database
        .collection("benchmarking.benchmarkedItems")
        .countDocuments(),
    ).toBe(0);
  });

  test("checks and unchecks items and exposes the changed state in queries", async () => {
    const benchmark = await createBenchmark();

    expect(
      await benchmarking.checkBenchmarkItem({ benchmark, item: "你" }),
    ).toEqual({});
    expect(await benchmarking._finishedItems({ benchmark })).toEqual([
      { item: "你" },
    ]);
    expect(
      (await benchmarking._unfinishedItems({ benchmark }))
        .map(({ item }) => item)
        .sort(),
    ).toEqual(["好", "我"].sort());

    expect(
      await benchmarking.uncheckBenchmarkItem({ benchmark, item: "你" }),
    ).toEqual({});
    expect(await benchmarking._finishedItems({ benchmark })).toEqual([]);
    expect(await benchmarking._unfinishedItems({ benchmark })).toHaveLength(3);
  });

  test("refuses checking an already finished item and unchecking an unfinished item", async () => {
    const benchmark = await createBenchmark();
    await benchmarking.checkBenchmarkItem({ benchmark, item: "你" });

    await expect(
      benchmarking.checkBenchmarkItem({ benchmark, item: "你" }),
    ).rejects.toBeInstanceOf(BenchmarkItemAlreadyFinished);
    await expect(
      benchmarking.uncheckBenchmarkItem({ benchmark, item: "好" }),
    ).rejects.toBeInstanceOf(BenchmarkItemNotFinished);
    expect(await benchmarking._finishedItems({ benchmark })).toEqual([
      { item: "你" },
    ]);
    expect(await benchmarking._unfinishedItems({ benchmark })).toEqual([
      { item: "好" },
      { item: "我" },
    ]);
  });

  test("refuses changes to missing benchmarks and items", async () => {
    const benchmark = await createBenchmark();

    await expect(
      benchmarking.checkBenchmarkItem({
        benchmark: "missing" as Benchmark,
        item: "你",
      }),
    ).rejects.toBeInstanceOf(BenchmarkNotFound);
    await expect(
      benchmarking.uncheckBenchmarkItem({ benchmark, item: "missing" }),
    ).rejects.toBeInstanceOf(BenchmarkItemNotFound);
    expect(await benchmarking._finishedItems({ benchmark })).toEqual([]);
    expect(await benchmarking._unfinishedItems({ benchmark })).toHaveLength(3);
  });

  test("deletes a benchmark and all its items", async () => {
    const benchmark = await createBenchmark();

    expect(await benchmarking.deleteBenchmark({ benchmark })).toEqual({});
    expect(await benchmarking._items({ benchmark })).toEqual([]);
    expect(
      await database
        .collection("benchmarking.benchmarkedItems")
        .countDocuments({ benchmark }),
    ).toBe(0);
    await expect(
      benchmarking.deleteBenchmark({ benchmark }),
    ).rejects.toBeInstanceOf(BenchmarkNotFound);
  });
});
