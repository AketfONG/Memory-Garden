"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from '../translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Start with 'en' so SSR and first client render match, then hydrate from storage on the client
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem('mg_language');
      if (stored === 'en' || stored === 'zh') {
        setLanguageState(stored);
      }
    } catch {
      // ignore storage errors and keep default
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState((prev) => {
      if (prev !== lang && typeof window !== 'undefined') {
        try {
          // Clear all app-related storage when switching language
          window.localStorage.clear();
          window.sessionStorage?.clear?.();
          // Persist chosen language after reset so it survives reloads
          window.localStorage.setItem('mg_language', lang);
        } catch {
          // Non-fatal if storage isn't available
        }
      }
      return lang;
    });
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 