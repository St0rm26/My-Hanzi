import OpenCC from "opencc-js/t2cn";
import dictionaryUrl from "../dictionary.txt?url";

export interface CharacterEntry {
  character: string;
  pinyin: string;
  meaning: string;
  radical: string;
  strokeCount: number | null;
}

interface DictionaryRecord {
  character?: unknown;
  pinyin?: unknown;
  definition?: unknown;
  radical?: unknown;
  matches?: unknown;
}

const toSimplified = OpenCC.Converter({ from: "tw", to: "cn" });
const simplifiedCharacterExceptions = new Set(["么", "著"]);
let dictionaryPromise: Promise<CharacterEntry[]> | undefined;

function isSimplified(character: string) {
  return (
    simplifiedCharacterExceptions.has(character) ||
    toSimplified(character) === character
  );
}

export function normalizePinyin(value: string) {
  return value
    .replace(/[üǖǘǚǜ]/gu, "v")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[1-5]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "");
}

async function loadDictionary(): Promise<CharacterEntry[]> {
  dictionaryPromise ??= fetch(dictionaryUrl)
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
          [...record.character].length !== 1 ||
          !isSimplified(record.character)
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
      dictionaryPromise = undefined;
      throw error;
    });
  return dictionaryPromise;
}

export async function lookupCharacters(
  characters: string[],
): Promise<Map<string, CharacterEntry>> {
  const wanted = new Set(characters);
  const dictionary = await loadDictionary();
  return new Map(
    dictionary
      .filter((entry) => wanted.has(entry.character))
      .map((entry) => [entry.character, entry]),
  );
}

export async function searchSimplifiedCharacters(
  query: string,
): Promise<CharacterEntry[]> {
  const term = query.trim();
  if (!term) return [];

  const dictionary = await loadDictionary();
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
