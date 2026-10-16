import { registerConcept } from "@mit-sdg/sync-engine/assembly";
import spec from "@design/concepts/Benchmarking.md" with { type: "text" };
import type { Db } from "mongodb";
import {
  BenchmarkAlreadyExists,
  BenchmarkingConcept,
  BenchmarkItemAlreadyFinished,
  BenchmarkItemNotFinished,
  BenchmarkItemNotFound,
  BenchmarkNotFound,
  BenchmarkRequiresDistinctItems,
  BenchmarkRequiresItems,
} from "./Benchmarking.ts";

class Benchmarking extends BenchmarkingConcept<string, string> {}

export const benchmarking = registerConcept({
  class: Benchmarking,
  spec,
  refusals: {
    BENCHMARK_ALREADY_EXISTS: BenchmarkAlreadyExists,
    BENCHMARK_ITEM_ALREADY_FINISHED: BenchmarkItemAlreadyFinished,
    BENCHMARK_ITEM_NOT_FINISHED: BenchmarkItemNotFinished,
    BENCHMARK_ITEM_NOT_FOUND: BenchmarkItemNotFound,
    BENCHMARK_NOT_FOUND: BenchmarkNotFound,
    BENCHMARK_REQUIRES_DISTINCT_ITEMS: BenchmarkRequiresDistinctItems,
    BENCHMARK_REQUIRES_ITEMS: BenchmarkRequiresItems,
  },
  floors: {
    mongo: ({ database }: { database: Db }, name: string) =>
      new Benchmarking(database, name),
  },
});