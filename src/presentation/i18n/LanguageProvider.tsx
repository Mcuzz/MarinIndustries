"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import es from "./dictionaries/es.json";
import en from "./dictionaries/en.json";

export type Language = "es" | "en";

type Dictionary = typeof es;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  translations: Dictionary;
}

const dictionaries: Record<Language, Dictionary> = {
  es,
  en,
};

const STORAGE_KEY = "marin-language";

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>("es");

  useEffect(() => {
    try {
      const savedLanguage = localStorage.getItem(STORAGE_KEY);

      if (savedLanguage === "es" || savedLanguage === "en") {
        setLanguageState(savedLanguage);
      }
    } catch {
      // Si el almacenamiento no está disponible, se conserva español.
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);

    try {
      localStorage.setItem(STORAGE_KEY, nextLanguage);
    } catch {
      // El cambio de idioma sigue funcionando durante la sesión.
    }
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      translations: dictionaries[language],
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage debe utilizarse dentro de LanguageProvider.");
  }

  return context;
}
