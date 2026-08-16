import { useLanguage } from "./LanguageContext";
import type { MatchingText, TextMap } from "./textMap";

export function useText<T extends Record<string, string>>(textMap: TextMap<T>): MatchingText<T> {
  const { language } = useLanguage();
  return textMap[language];
}
