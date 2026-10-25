import { describe, expect, test } from "bun:test";
import {
  frequencyBenchmarks,
  traditionalFrequencyBenchmarks,
} from "../../src/compositions/benchmarks/Frequency.ts";
import { traditionalizeCharacter } from "../../frontend/src/api/characterScripts.ts";

describe("frequency benchmarks", () => {
  test("Traditional ranges preserve Simplified ranks and contain unique characters", () => {
    expect(traditionalFrequencyBenchmarks).toHaveLength(
      frequencyBenchmarks.length,
    );

    for (const [index, simplified] of frequencyBenchmarks.entries()) {
      const traditional = traditionalFrequencyBenchmarks[index];
      const range = simplified.name.replace(/ \(Simplified\)$/u, "");
      expect(simplified.name).toMatch(/^Most Common \d+-\d+ \(Simplified\)$/u);
      expect(traditional.name).toBe(`${range} (Traditional)`);
      expect(traditional.start).toBe(simplified.start);
      expect(traditional.end).toBe(simplified.end);
      expect(traditional.items).toHaveLength(simplified.items.length);
      expect(new Set(traditional.items).size).toBe(traditional.items.length);
      expect(traditional.items).toEqual(
        simplified.items.map(traditionalizeCharacter),
      );
    }
  });
});
