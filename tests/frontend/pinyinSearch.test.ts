import { describe, expect, test } from "bun:test";
import {
  normalizePinyinForSearch,
  pinyinMatchesQuery,
} from "../../frontend/src/api/characters.ts";

describe("Pinyin search", () => {
  test("normalizes each marked tone to its numeric form", () => {
    expect(normalizePinyinForSearch("mā")).toBe("ma1");
    expect(normalizePinyinForSearch("má")).toBe("ma2");
    expect(normalizePinyinForSearch("mǎ")).toBe("ma3");
    expect(normalizePinyinForSearch("mà")).toBe("ma4");
    expect(normalizePinyinForSearch("ma3")).toBe("ma3");
  });

  test("filters marked and numeric queries by tone", () => {
    expect(pinyinMatchesQuery("mǎ", "mǎ")).toBe(true);
    expect(pinyinMatchesQuery("mǎ", "ma3")).toBe(true);
    expect(pinyinMatchesQuery("mā", "mǎ")).toBe(false);
    expect(pinyinMatchesQuery("mà", "mǎ")).toBe(false);
    expect(pinyinMatchesQuery("mǎ", "ma")).toBe(true);
  });

  test("supports neutral-tone numeric queries", () => {
    expect(pinyinMatchesQuery("ma", "ma5")).toBe(true);
    expect(pinyinMatchesQuery("mǎ", "ma5")).toBe(false);
  });
});
