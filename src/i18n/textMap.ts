export const languages = ["fr", "de", "it", "en"] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = "fr";

export const languageLocales: Record<Language, string> = {
  fr: "fr-CH",
  de: "de-CH",
  it: "it-CH",
  en: "en-CH",
};

type TextValues = Record<string, string>;
export type MatchingText<T extends TextValues> = { [K in keyof T]: string };

export type TextMap<T extends TextValues> = {
  fr: T;
  de: MatchingText<T>;
  it: MatchingText<T>;
  en: MatchingText<T>;
};

export function defineTextMap<const T extends TextValues>(map: TextMap<T>): TextMap<T> {
  return map;
}

export function defaultText<T extends TextValues>(map: TextMap<T>): T {
  return map.fr;
}
