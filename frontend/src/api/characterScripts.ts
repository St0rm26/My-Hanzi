import OpenCCToSimplified from "opencc-js/t2cn";
import OpenCCToTraditional from "opencc-js/cn2t";

export type CharacterSearchScript = "simplified" | "traditional";
export type CharacterScript =
  | CharacterSearchScript
  | "simplified-and-traditional";

const toSimplified = OpenCCToSimplified.Converter({ from: "tw", to: "cn" });
const toTraditional = OpenCCToTraditional.Converter({ from: "cn", to: "tw" });
const simplifiedCharacterExceptions = new Set(["么", "著"]);

export function traditionalizeCharacter(character: string): string {
  const traditional = toTraditional(character);
  return [...traditional].length === 1 ? traditional : character;
}

export function isSimplifiedDictionaryCharacter(character: string): boolean {
  return (
    simplifiedCharacterExceptions.has(character) ||
    toSimplified(character) === character
  );
}

export function scriptForCharacter(character: string): CharacterScript {
  const simplified = isSimplifiedDictionaryCharacter(character);
  const traditional = toTraditional(character) === character;

  if (simplified && traditional) return "simplified-and-traditional";
  if (traditional) return "traditional";
  return "simplified";
}
