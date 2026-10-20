import { ref } from "vue";
import type { MyHanziWireHttp } from "../../generated/wire.ts";
import { api } from "./api/client.ts";
import { preferDictionaryInformation } from "./api/characterInformation.ts";
import type { CharacterEntry } from "./api/characters.ts";
import { messageFor } from "./api/errors.ts";
import { useSession } from "./session.ts";

type Wire = MyHanziWireHttp;
type Path = keyof Wire;
type ErrorResult = { error: string; detail?: string; code?: string };

const { sessionEnded } = useSession();
const loading = ref(false);
const error = ref<string | null>(null);
let requestSequence = 0;

async function call<T extends object>(
  path: Path,
  request: Promise<T | ErrorResult>,
): Promise<T | ErrorResult> {
  try {
    const result = await request;
    if ("error" in result && result.error === "UNAUTHORIZED") sessionEnded();
    return "error" in result
      ? { error: messageFor(path, result.error), code: result.error }
      : result;
  } catch (cause) {
    return {
      error:
        cause instanceof Error
          ? cause.message
          : "Could not load character information.",
    };
  }
}

function fieldsFor(character: CharacterEntry): Record<string, string> {
  return {
    pinyin: character.pinyin,
    meaning: character.meaning,
    radical: character.radical,
    strokeCount:
      character.strokeCount === null ? "" : String(character.strokeCount),
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
  if ("error" in result) {
    if (sequence === requestSequence) error.value = result.error;
    return null;
  }
  return result.information.information ?? {};
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
    ),
    meaning: preferDictionaryInformation(
      fields.meaning,
      dictionaryFields.meaning,
      "No definition available.",
    ),
    radical: preferDictionaryInformation(
      fields.radical,
      dictionaryFields.radical,
      "Not listed",
    ),
    strokeCount: preferDictionaryInformation(
      fields.strokeCount,
      dictionaryFields.strokeCount,
      "",
    ),
  };
  const strokeCountText = currentFields.strokeCount;
  let strokeCount = character.strokeCount;
  if (strokeCountText !== undefined) {
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
      if (
        "error" in result &&
        (!("code" in result) || result.code !== "CONFLICT")
      ) {
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
