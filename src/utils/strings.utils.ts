export function removeLastCharacterFromString(str: string): string {
  const newString = str.slice(0, -1);
  return newString;
}
