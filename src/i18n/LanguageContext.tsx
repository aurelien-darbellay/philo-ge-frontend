import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { defaultLanguage, languages, type Language } from "./textMap";

const storageKey = "philo-ge-language";

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  cycleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function storedLanguage(): Language {
  const stored = window.localStorage.getItem(storageKey);
  return languages.find((language) => language === stored) ?? defaultLanguage;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(storedLanguage);

  useEffect(() => {
    window.localStorage.setItem(storageKey, language);
    document.documentElement.lang = language;
  }, [language]);

  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(language);
    setLanguage(languages[(currentIndex + 1) % languages.length]);
  };

  return <LanguageContext.Provider value={{ language, setLanguage, cycleLanguage }}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside LanguageProvider");
  return context;
}
