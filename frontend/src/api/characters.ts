import dictionaryUrl from "../dictionary.txt?url";
import {
  type CharacterSearchScript,
  isSimplifiedDictionaryCharacter,
} from "./characterScripts.ts";
import {
  buildTraditionalDictionary,
  type CharacterEntry,
} from "./characterDictionaries.ts";
export type { CharacterEntry } from "./characterDictionaries.ts";

interface DictionaryRecord {
  character?: unknown;
  pinyin?: unknown;
  definition?: unknown;
  radical?: unknown;
  matches?: unknown;
}

let rawDictionaryPromise: Promise<CharacterEntry[]> | undefined;
let simplifiedDictionaryPromise: Promise<CharacterEntry[]> | undefined;
let traditionalDictionaryPromise: Promise<CharacterEntry[]> | undefined;

export function normalizePinyin(value: string) {
  return value
    .replace(/[üǖǘǚǜ]/gu, "v")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[1-5]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

async function loadRawDictionary(): Promise<CharacterEntry[]> {
  rawDictionaryPromise ??= fetch(dictionaryUrl)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(
          `Could not load the local dictionary (HTTP ${response.status}).`,
        );
      }
      return response.text();
    })
    .then((text) => {
      const entries = new Map<string, CharacterEntry>();
      for (const [index, line] of text.split(/\r?\n/u).entries()) {
        if (!line.trim()) continue;

        let record: DictionaryRecord;
        try {
          record = JSON.parse(line) as DictionaryRecord;
        } catch {
          throw new Error(
            `The local dictionary has invalid JSON on line ${index + 1}.`,
          );
        }

        if (
          typeof record.character !== "string" ||
          [...record.character].length !== 1
        ) {
          continue;
        }

        const pronunciations = Array.isArray(record.pinyin)
          ? record.pinyin.filter(
              (value): value is string => typeof value === "string",
            )
          : [];
        const strokeCount = Array.isArray(record.matches)
          ? record.matches.length
          : null;

        entries.set(record.character, {
          character: record.character,
          pinyin: pronunciations.join(", "),
          meaning:
            typeof record.definition === "string"
              ? record.definition
              : "No definition available.",
          radical:
            typeof record.radical === "string" ? record.radical : "Not listed",
          strokeCount,
        });
      }
      return [...entries.values()];
    })
    .catch((error: unknown) => {
      rawDictionaryPromise = undefined;
      throw error;
    });
  return rawDictionaryPromise;
}

async function loadSimplifiedDictionary(): Promise<CharacterEntry[]> {
  simplifiedDictionaryPromise ??= loadRawDictionary()
    .then((entries) =>
      entries.filter((entry) =>
        isSimplifiedDictionaryCharacter(entry.character),
      ),
    )
    .catch((error: unknown) => {
      simplifiedDictionaryPromise = undefined;
      throw error;
    });
  return simplifiedDictionaryPromise;
}

export async function lookupCharacters(
  characters: string[],
): Promise<Map<string, CharacterEntry>> {
  const wanted = new Set(characters);
  const [simplified, traditional] = await Promise.all([
    loadSimplifiedDictionary(),
    loadTraditionalDictionary(),
  ]);
  return new Map(
    [...traditional, ...simplified]
      .filter((entry) => wanted.has(entry.character))
      .map((entry) => [entry.character, entry]),
  );
}

async function loadTraditionalDictionary(): Promise<CharacterEntry[]> {
  traditionalDictionaryPromise ??= loadRawDictionary()
    .then(buildTraditionalDictionary)
    .catch((error: unknown) => {
      traditionalDictionaryPromise = undefined;
      throw error;
    });
  return traditionalDictionaryPromise;
}

export async function searchCharacters(
  query: string,
  script: CharacterSearchScript = "simplified",
): Promise<CharacterEntry[]> {
  const term = query.trim();
  if (!term) return [];

  const dictionary =
    script === "simplified"
      ? await loadSimplifiedDictionary()
      : await loadTraditionalDictionary();
  if (/\p{Script=Han}/u.test(term)) {
    const requested = new Set([...term]);
    return dictionary.filter((entry) => requested.has(entry.character));
  }

  const normalizedQuery = normalizePinyin(term);
  return dictionary
    .filter((entry) =>
      entry.pinyin
        .split(", ")
        .some((pinyin) => normalizePinyin(pinyin).startsWith(normalizedQuery)),
    )
    .sort(
      (left, right) =>
        left.pinyin.localeCompare(right.pinyin) ||
        left.character.localeCompare(right.character),
    );
}
