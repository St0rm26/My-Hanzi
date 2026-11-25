import { afterAll, describe, expect, mock, test } from "bun:test";

let completedResponse: { items: { item: string }[] } | { error: string } = {
  items: [],
};
const completed = mock(async (_input: { benchmark: string }) => completedResponse);

mock.module("../../frontend/src/api/client.ts", () => ({
  api: {
    "/benchmarks/completed": completed,
    "/benchmarks/items": async () => ({ items: [{ item: "你" }, { item: "好" }] }),
  },
}));

const { useBenchmarks } = await import("../../frontend/src/useBenchmarks.ts");
const benchmark = { benchmark: "benchmark-1", name: "Test" };

afterAll(() => {
  mock.restore();
});

describe("benchmark progress", () => {
  test("reloads completed items after studied membership changes", async () => {
    const { getBenchmarkItems, getCompletedItems } = useBenchmarks();
    completedResponse = { items: [] };
    expect(await getBenchmarkItems(benchmark)).toEqual({
      items: ["你", "好"],
      studiedItems: [],
    });

    completedResponse = { items: [{ item: "你" }] };
    expect(await getCompletedItems(benchmark)).toEqual({
      items: ["你"],
      error: null,
    });
    expect(completed).toHaveBeenLastCalledWith({ benchmark: "benchmark-1" });
  });

  test("reports a completed-items refresh failure", async () => {
    completedResponse = { error: "NETWORK_ERROR" };
    expect(await useBenchmarks().getCompletedItems(benchmark)).toEqual({
      items: null,
      error: "Could not connect to the service.",
    });
  });
});
