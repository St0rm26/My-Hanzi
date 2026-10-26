import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { messageFor } from "./api/errors.ts";
import { useSession } from "./session.ts";

type Wire = MyHanziWireHttp;
export type Benchmark =
  Wire["/benchmarks/list"]["output"]["benchmarks"][number];

const { sessionEnded } = useSession();
const benchmarks = ref<Benchmark[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

async function loadBenchmarks(): Promise<boolean> {
  loading.value = true;
  error.value = null;
  try {
    const result = await api["/benchmarks/list"]();
    if ("error" in result) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      error.value = messageFor("/benchmarks/list", result.error);
      return false;
    }
    benchmarks.value = [...result.benchmarks].sort((left, right) => {
      const leftRange = left.name.match(/^Most Common (\d+)-/u);
      const rightRange = right.name.match(/^Most Common (\d+)-/u);
      if (leftRange && rightRange) {
        return Number(leftRange[1]) - Number(rightRange[1]);
      }
      if (leftRange) return 1;
      if (rightRange) return -1;
      return (
        Number(left.name.match(/\d+/u)?.[0] ?? Number.MAX_SAFE_INTEGER) -
          Number(right.name.match(/\d+/u)?.[0] ?? Number.MAX_SAFE_INTEGER) ||
        left.name.localeCompare(right.name)
      );
    });
    return true;
  } catch (cause) {
    error.value =
      cause instanceof Error ? cause.message : "Could not load benchmarks.";
    return false;
  } finally {
    loading.value = false;
  }
}

async function getBenchmarkItems(
  benchmark: Benchmark,
): Promise<{ items: string[]; studiedItems: string[] } | null> {
  error.value = null;
  try {
    const [itemsResult, completedResult] = await Promise.all([
      api["/benchmarks/items"]({ benchmark: benchmark.benchmark }),
      api["/benchmarks/completed"]({ benchmark: benchmark.benchmark }),
    ]);
    if ("error" in itemsResult) {
      if (itemsResult.error === "UNAUTHORIZED") sessionEnded();
      error.value = messageFor("/benchmarks/items", itemsResult.error);
      return null;
    }
    if ("error" in completedResult) {
      if (completedResult.error === "UNAUTHORIZED") sessionEnded();
      error.value = messageFor("/benchmarks/completed", completedResult.error);
      return null;
    }
    return {
      items: itemsResult.items.map(
        (row: Wire["/benchmarks/items"]["output"]["items"][number]) => row.item,
      ),
      studiedItems: completedResult.items.map(
        (row: Wire["/benchmarks/completed"]["output"]["items"][number]) =>
          row.item,
      ),
    };
  } catch (cause) {
    error.value =
      cause instanceof Error
        ? cause.message
        : "Could not load benchmark characters.";
    return null;
  }
}

export function useBenchmarks() {
  return { benchmarks, loading, error, loadBenchmarks, getBenchmarkItems };
}
