// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState } from 'react'
import { LanguageProvider } from '@/contexts/LanguageContext'

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
  mounted: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            staleTime: 60 * 1000 * 5,
          },
        },
      })
  )

  // Initialize dark mode state synchronously to avoid hydration mismatch
  const [isDark, setIsDark] = useState(() => {
    // During SSR, return false to match server rendering
    if (typeof window === 'undefined') return false;

    // On client, read from localStorage immediately
    const stored = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return stored === 'true' || (!stored && prefersDark);
  });
  const [mounted, setMounted] = useState(false);

  // Apply dark class on mount and when isDark changes
  useEffect(() => {
    setMounted(true);

    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(isDark));
  }, [isDark]);

  const toggleDark = () => setIsDark(!isDark);

  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeContext.Provider value={{ isDark, toggleDark, mounted }}>
          {children}
        </ThemeContext.Provider>
      </LanguageProvider>
    </QueryClientProvider>
  )
}