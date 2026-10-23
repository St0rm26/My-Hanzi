export function preferDictionaryInformation(
  storedValue: string | undefined,
  dictionaryValue: string,
  placeholder: string,
  previousDictionaryValue?: string,
): string {
  if (
    storedValue === undefined ||
    storedValue === previousDictionaryValue ||
    (storedValue === placeholder && dictionaryValue !== placeholder)
  ) {
    return dictionaryValue;
  }
  return storedValue;
}
