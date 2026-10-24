import { describe, expect, test } from "bun:test";
import { preferDictionaryInformation } from "../../frontend/src/api/characterInformation.ts";

describe("preferDictionaryInformation", () => {
  test("replaces stored placeholders when dictionary data is available", () => {
    expect(preferDictionaryInformation("", "me", "")).toBe("me");
    expect(
      preferDictionaryInformation(
        "No definition available.",
        "interrogative particle",
        "No definition available.",
      ),
    ).toBe("interrogative particle");
    expect(preferDictionaryInformation("Not listed", "艹", "Not listed")).toBe(
      "艹",
    );
    expect(preferDictionaryInformation("", "3", "")).toBe("3");
  });

  test("uses dictionary data for missing fields", () => {
    expect(preferDictionaryInformation(undefined, "zhe", "")).toBe("zhe");
  });

  test("replaces previously stored simplified fallback data with Traditional data", () => {
    expect(preferDictionaryInformation("爫", "心", "Not listed", "爫")).toBe(
      "心",
    );
    expect(preferDictionaryInformation("custom", "心", "Not listed", "爫")).toBe(
      "custom",
    );
  });

  test("preserves saved values and placeholders without better dictionary data", () => {
    expect(preferDictionaryInformation("custom meaning", "definition", "")).toBe(
      "custom meaning",
    );
    expect(preferDictionaryInformation("", "", "")).toBe("");
    expect(
      preferDictionaryInformation(
        "No definition available.",
        "No definition available.",
        "No definition available.",
      ),
    ).toBe("No definition available.");
  });
});
