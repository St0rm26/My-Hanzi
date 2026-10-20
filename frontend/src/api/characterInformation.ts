export function preferDictionaryInformation(
  storedValue: string | undefined,
  dictionaryValue: string,
  placeholder: string,
): string {
  if (
    storedValue === undefined ||
    (storedValue === placeholder && dictionaryValue !== placeholder)
  ) {
    return dictionaryValue;
  }
  return storedValue;
}
