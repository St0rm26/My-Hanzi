import { describe, expect, test } from "bun:test";
import {
  AlreadyCollectedInformation,
  InfoFieldNotFound,
  InformationCollectingConcept,
  type InfoField,
} from "../../src/concepts/InformationCollecting/InformationCollecting.ts";
import { testDatabase } from "../support/mongo.ts";
import { expectOneWinner } from "../support/race.ts";

async function setup() {
  const database = await testDatabase();
  return {
    informationCollecting: new InformationCollectingConcept<string, string>(
      database,
    ),
  };
}

describe("InformationCollecting", () => {
  test("adds distinct fields and returns a field-name dictionary", async () => {
    const { informationCollecting } = await setup();

    const pinyin = await informationCollecting.addInfoField({
      item: "你",
      fieldName: "pinyin",
      description: "nǐ",
    });
    const meaning = await informationCollecting.addInfoField({
      item: "你",
      fieldName: "meaning",
      description: "you",
    });

    expect(pinyin.infoField).not.toBe(meaning.infoField);
    expect(await informationCollecting._allInformation({ item: "你" })).toEqual(
      { information: { meaning: "you", pinyin: "nǐ" } },
    );
    expect(
      await informationCollecting._information({
        item: "你",
        fieldName: "pinyin",
      }),
    ).toEqual({ information: "nǐ" });
    expect(
      await informationCollecting._infoField({
        item: "你",
        fieldName: "meaning",
      }),
    ).toEqual([{ infoField: meaning.infoField }]);
    expect(
      await informationCollecting._infoField({
        item: "你",
        fieldName: "unknown",
      }),
    ).toEqual([]);
    expect(
      await informationCollecting._allInformation({ item: "missing" }),
    ).toEqual({ information: {} });
  });

  test("field names are unique per item, regardless of description", async () => {
    const { informationCollecting } = await setup();

    await informationCollecting.addInfoField({
      item: "你",
      fieldName: "meaning",
      description: "you",
    });
    expect(
      informationCollecting.addInfoField({
        item: "你",
        fieldName: "meaning",
        description: "aecond person pronoun",
      }),
    ).rejects.toBeInstanceOf(AlreadyCollectedInformation);
    await informationCollecting.addInfoField({
      item: "我",
      fieldName: "meaning",
      description: "I",
    });
    expect(await informationCollecting._allInformation({ item: "我" })).toEqual(
      { information: { meaning: "I" } },
    );
  });

  test("concurrent additions of the same field produce one winner", async () => {
    const { informationCollecting } = await setup();

    await expectOneWinner(
      ["first", "second"].map((description) =>
        informationCollecting.addInfoField({
          item: "你",
          fieldName: "meaning",
          description,
        }),
      ),
      AlreadyCollectedInformation,
    );
  });

  test("edits only the selected item's field while preserving its identity", async () => {
    const { informationCollecting } = await setup();

    const { infoField } = await informationCollecting.addInfoField({
      item: "你",
      fieldName: "meaning",
      description: "old",
    });
    expect(
      await informationCollecting.editInfoField({
        item: "你",
        infoField,
        description: "you",
      }),
    ).toEqual({ infoField });
    expect(
      await informationCollecting._information({
        item: "你",
        fieldName: "meaning",
      }),
    ).toEqual({ information: "you" });
    expect(
      informationCollecting.editInfoField({
        item: "我",
        infoField,
        description: "I",
      }),
    ).rejects.toBeInstanceOf(InfoFieldNotFound);
  });

  test("deletes a field, permits its name to be reused, and refuses missing fields", async () => {
    const { informationCollecting } = await setup();

    const { infoField } = await informationCollecting.addInfoField({
      item: "你",
      fieldName: "meaning",
      description: "you",
    });
    await informationCollecting.addInfoField({
      item: "你",
      fieldName: "pinyin",
      description: "nǐ",
    });
    expect(
      await informationCollecting.deleteInfoField({ item: "你", infoField }),
    ).toEqual({});
    expect(
      informationCollecting._information({ item: "你", fieldName: "meaning" }),
    ).rejects.toBeInstanceOf(InfoFieldNotFound);
    expect(await informationCollecting._allInformation({ item: "你" })).toEqual(
      { information: { pinyin: "nǐ" } },
    );
    expect(
      informationCollecting.deleteInfoField({ item: "你", infoField }),
    ).rejects.toBeInstanceOf(InfoFieldNotFound);
    await informationCollecting.addInfoField({
      item: "你",
      fieldName: "meaning",
      description: "you",
    });
  });

  test("queries and edits reject unknown fields", async () => {
    const { informationCollecting } = await setup();

    expect(
      informationCollecting._information({ item: "你", fieldName: "missing" }),
    ).rejects.toBeInstanceOf(InfoFieldNotFound);
    expect(
      informationCollecting.editInfoField({
        item: "你",
        infoField: "missing" as InfoField,
        description: "new",
      }),
    ).rejects.toBeInstanceOf(InfoFieldNotFound);
  });
});
