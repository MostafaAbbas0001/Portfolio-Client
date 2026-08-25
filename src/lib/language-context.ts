import { createContext } from "react";
import type { SupportedLanguage } from "@/lib/language";

export interface LanguageContextValue {
  language: SupportedLanguage;
  direction: "ltr" | "rtl";
  setLanguage: (language: SupportedLanguage) => void;
  toggleLanguage: () => void;
}

export const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
