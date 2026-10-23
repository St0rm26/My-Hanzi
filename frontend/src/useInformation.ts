import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { unavailableCharacterInformation } from "./api/characterDictionaries.ts";
import { preferDictionaryInformation } from "./api/characterInformation.ts";
import type { CharacterEntry } from "./api/characters.ts";
import { isApiError, messageFor } from "./api/errors.ts";
import { useSession } from "./session.ts";

type Wire = MyHanziWireHttp;
type Path = keyof Wire;
type CallResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string; code?: string };
type InformationFields = {
  pinyin: string;
  meaning: string;
  radical: string;
  strokeCount: string;
};

const { sessionEnded } = useSession();
const loading = ref(false);
const error = ref<string | null>(null);
let requestSequence = 0;

async function call<P extends Path>(
  path: P,
  request: Promise<unknown>,
): Promise<CallResult<Wire[P]["output"]>> {
  try {
    const result = await request;
    if (isApiError(result)) {
      if (result.error === "UNAUTHORIZED") sessionEnded();
      return {
        ok: false,
        error: messageFor(path, result.error),
        code: result.error,
      };
    }
    return { ok: true, value: result as Wire[P]["output"] };
  } catch (cause) {
    return {
      ok: false,
      error:
        cause instanceof Error
          ? cause.message
          : "Could not load character information.",
    };
  }
}

function fieldsFor(character: CharacterEntry): InformationFields {
  return {
    pinyin: character.pinyin,
    meaning: character.meaning,
    radical: character.radical,
    strokeCount: character.strokeCount?.toString() ?? "",
  };
}

async function readFields(
  character: CharacterEntry,
  sequence: number,
): Promise<Record<string, string> | null> {
  const result = await call(
    "/information/view",
    api["/information/view"]({ item: character.character }),
  );
  if (!result.ok) {
    if (sequence === requestSequence) error.value = result.error;
    return null;
  }
  return result.value.information.information ?? {};
}

function toCharacterEntry(
  character: CharacterEntry,
  fields: Record<string, string>,
): CharacterEntry | null {
  const dictionaryFields = fieldsFor(character);
  const currentFields = {
    pinyin: preferDictionaryInformation(
      fields.pinyin,
      dictionaryFields.pinyin,
      "",
      character.simplifiedFallback?.pinyin,
    ),
    meaning: preferDictionaryInformation(
      fields.meaning,
      dictionaryFields.meaning,
      "No definition available.",
      character.simplifiedFallback?.meaning,
    ),
    radical: character.traditionalFallback
      ? unavailableCharacterInformation
      : preferDictionaryInformation(
          fields.radical,
          dictionaryFields.radical,
          "Not listed",
          character.simplifiedFallback?.radical,
        ),
    strokeCount: preferDictionaryInformation(
      fields.strokeCount,
      dictionaryFields.strokeCount,
      "",
      character.simplifiedFallback?.strokeCount?.toString(),
    ),
  };
  let strokeCount = character.strokeCount;
  if (!character.traditionalFallback) {
    const strokeCountText = currentFields.strokeCount;
    if (strokeCountText === "") {
      strokeCount = null;
    } else {
      const parsed = Number(strokeCountText);
      if (!Number.isInteger(parsed) || parsed < 0) {
        error.value = "The stored stroke count is invalid.";
        return null;
      }
      strokeCount = parsed;
    }
  }

  return {
    ...character,
    pinyin: currentFields.pinyin,
    meaning: currentFields.meaning,
    radical: currentFields.radical,
    strokeCount,
  };
}

async function getCharacterInformation(
  character: CharacterEntry,
): Promise<CharacterEntry | null> {
  const sequence = ++requestSequence;
  loading.value = true;
  error.value = null;
  try {
    let fields = await readFields(character, sequence);
    if (sequence !== requestSequence) return null;
    if (fields === null) return null;

    let seeded = false;
    for (const [fieldName, description] of Object.entries(
      fieldsFor(character),
    )) {
      if (typeof fields[fieldName] === "string") continue;

      const result = await call(
        "/information/add-field",
        api["/information/add-field"]({
          item: character.character,
          fieldName,
          description,
        }),
      );
      if (sequence !== requestSequence) return null;
      if (!result.ok && result.code !== "CONFLICT") {
        error.value = result.error;
        return null;
      }
      seeded = true;
    }

    if (seeded) {
      fields = await readFields(character, sequence);
      if (sequence !== requestSequence) return null;
      if (fields === null) return null;
    }
    return toCharacterEntry(character, fields);
  } finally {
    if (sequence === requestSequence) loading.value = false;
  }
}

export function useInformation() {
  return {
    loading,
    error,
    getCharacterInformation,
  };
}
