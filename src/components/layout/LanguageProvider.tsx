import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { LanguageContext } from "@/lib/language-context";
import { DEFAULT_LANGUAGE } from "@/lib/siteData";
import { LANGUAGE_STORAGE_KEY, normalizeLanguage, type SupportedLanguage } from "@/lib/language";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [language, setLanguageState] = useState<SupportedLanguage>(DEFAULT_LANGUAGE);

  const direction: "ltr" | "rtl" = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    setLanguageState(normalizeLanguage(window.localStorage.getItem(LANGUAGE_STORAGE_KEY)));
  }, []);

  useEffect(() => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = direction;
  }, [direction, language]);

  const value = useMemo(
    () => ({
      language,
      direction,
      setLanguage: (nextLanguage: SupportedLanguage) => {
        setLanguageState(nextLanguage);
        void queryClient.invalidateQueries();
      },
      toggleLanguage: () =>
        setLanguageState((current) => {
          void queryClient.invalidateQueries();
          return current === "en" ? "ar" : "en";
        }),
    }),
    [direction, language, queryClient],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
