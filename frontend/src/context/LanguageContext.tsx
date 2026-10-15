import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Language, translate, translateError, TranslationKey, TranslationValues } from '@/lib/i18n';

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey, values?: TranslationValues) => string;
  errorText: (message: string) => string;
};
const LanguageContext = createContext<LanguageContextValue | null>(null);
const storageKey = 'hr-manager-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setCurrentLanguage] = useState<Language>('th');
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === 'th' || saved === 'en') setCurrentLanguage(saved);
    } catch { /* Language switching still works when browser storage is unavailable. */ }
  }, []);
  useEffect(() => {
    if (Platform.OS === 'web') document.documentElement.lang = language;
  }, [language]);
  const setLanguage = useCallback((next: Language) => {
    setCurrentLanguage(next);
    if (Platform.OS === 'web') {
      try { window.localStorage.setItem(storageKey, next); } catch { /* Keep the current session preference. */ }
    }
  }, []);
  const t = useCallback((key: TranslationKey, values?: TranslationValues) => translate(language, key, values), [language]);
  const errorText = useCallback((message: string) => translateError(language, message), [language]);
  return <LanguageContext.Provider value={{ language, setLanguage, t, errorText }}>{children}</LanguageContext.Provider>;
}
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider.');
  return context;
}
