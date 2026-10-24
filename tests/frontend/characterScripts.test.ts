import { describe, expect, test } from "bun:test";
import {
  buildTraditionalDictionary,
  unavailableCharacterInformation,
} from "../../frontend/src/api/characterDictionaries.ts";
import {
  isSimplifiedDictionaryCharacter,
  scriptForCharacter,
  traditionalizeCharacter,
} from "../../frontend/src/api/characterScripts.ts";

describe("character scripts", () => {
  test("converts simplified characters to their Traditional forms", () => {
    expect(traditionalizeCharacter("发")).toBe("發");
    expect(traditionalizeCharacter("人")).toBe("人");
  });

  test("identifies characters shared by both scripts", () => {
    expect(scriptForCharacter("人")).toBe("simplified-and-traditional");
    expect(scriptForCharacter("著")).toBe("simplified-and-traditional");
  });

  test("distinguishes script-specific characters", () => {
    expect(scriptForCharacter("发")).toBe("simplified");
    expect(scriptForCharacter("發")).toBe("traditional");
    expect(isSimplifiedDictionaryCharacter("么")).toBe(true);
  });

  test("uses an exact Traditional dictionary entry when one exists", () => {
    const traditional = buildTraditionalDictionary([
      {
        character: "爱",
        pinyin: "ài",
        meaning: "simplified meaning",
        radical: "爫",
        strokeCount: 10,
      },
      {
        character: "愛",
        pinyin: "ài",
        meaning: "traditional meaning",
        radical: "心",
        strokeCount: 13,
      },
    ]);

    expect(traditional.find(({ character }) => character === "愛")).toEqual({
      character: "愛",
      pinyin: "ài",
      meaning: "traditional meaning",
      radical: "心",
      strokeCount: 13,
      simplifiedFallback: {
        pinyin: "ài",
        meaning: "simplified meaning",
        radical: "爫",
        strokeCount: 10,
      },
    });
  });

  test("marks unavailable Traditional radical and stroke data without an exact record", () => {
    const traditional = buildTraditionalDictionary([
      {
        character: "发",
        pinyin: "fā",
        meaning: "simplified meaning",
        radical: "又",
        strokeCount: 5,
      },
    ]);
    const entry = traditional.find(({ character }) => character === "發");

    expect(entry).toMatchObject({
      character: "發",
      pinyin: "fā",
      meaning: "simplified meaning",
      radical: unavailableCharacterInformation,
      strokeCount: unavailableCharacterInformation,
      traditionalFallback: true,
    });
  });
});
