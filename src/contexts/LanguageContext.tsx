"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Locale } from '../types/i18n';
import { ko } from '../locales/ko';
import { en } from '../locales/en';
import { useUser } from '../hooks/useUser';

type TranslationSchema = typeof ko;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, options?: { returnObjects?: boolean;[key: string]: any }) => any;
  isI18nLoading: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<Locale, TranslationSchema> = { ko, en };

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateProfile } = useUser();
  const [locale, setLocaleState] = useState<Locale>('ko');
  const [isI18nLoading, setIsI18nLoading] = useState(true);

  // Sync with user profile if available
  useEffect(() => {
    if (user?.language) {
      setLocaleState(user.language as Locale);
    } else if (typeof window !== 'undefined') {
      // Fallback to browser language
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en') setLocaleState('en');
    }
    setIsI18nLoading(false);
  }, [user?.language]);

  const setLocale = useCallback(async (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (user) {
      // Persist to Supabase
      updateProfile({ language: newLocale } as any);
    }
  }, [user, updateProfile]);

  const t = useCallback((path: string, options?: { returnObjects?: boolean;[key: string]: any }): any => {
    const keys = path.split('.');
    let current: any = translations[locale];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        console.warn(`Translation key not found: ${path}`);
        return path;
      }
    }

    // Handle returnObjects
    if (options?.returnObjects) {
      return current;
    }

    // Handle strings and interpolation
    if (typeof current === 'string') {
      let result = current;
      if (options) {
        Object.entries(options).forEach(([key, value]) => {
          if (key !== 'returnObjects') {
            result = result.replace(new RegExp(`{${key}}`, 'g'), String(value));
          }
        });
      }
      return result;
    }

    return path;
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t, isI18nLoading }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
