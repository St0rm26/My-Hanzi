import {
  isSimplifiedDictionaryCharacter,
  scriptForCharacter,
  traditionalizeCharacter,
} from "./characterScripts.ts";

export interface CharacterDictionaryFields {
  pinyin: string;
  meaning: string;
  radical: string;
  strokeCount: number | string | null;
}

export interface CharacterEntry extends CharacterDictionaryFields {
  character: string;
  traditionalFallback?: boolean;
  simplifiedFallback?: CharacterDictionaryFields;
}

export const unavailableCharacterInformation = "No information available.";

export function buildTraditionalDictionary(
  source: readonly CharacterEntry[],
): CharacterEntry[] {
  const simplifiedEntries = source.filter((entry) =>
    isSimplifiedDictionaryCharacter(entry.character),
  );
  const traditionalEntries = new Map(
    source
      .filter(
        (entry) => scriptForCharacter(entry.character) !== "simplified",
      )
      .map((entry) => [entry.character, entry]),
  );

  for (const entry of simplifiedEntries) {
    const character = traditionalizeCharacter(entry.character);
    if (character === entry.character) continue;

    const simplifiedFallback = {
      pinyin: entry.pinyin,
      meaning: entry.meaning,
      radical: entry.radical,
      strokeCount: entry.strokeCount,
    };
    const exactEntry = traditionalEntries.get(character);
    if (exactEntry) {
      traditionalEntries.set(character, { ...exactEntry, simplifiedFallback });
    } else if (!traditionalEntries.has(character)) {
      traditionalEntries.set(character, {
        ...entry,
        character,
        radical: unavailableCharacterInformation,
        strokeCount: unavailableCharacterInformation,
        traditionalFallback: true,
      });
    }
  }

  return [...traditionalEntries.values()];
}
