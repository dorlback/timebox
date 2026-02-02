'use client';

import { useContext } from 'react';
import { ThemeContext } from '@/app/providers';

export function useDarkMode() {
  const context = useContext(ThemeContext);

  if (context === undefined) {
    throw new Error('useDarkMode must be used within a ThemeProvider');
  }

  return context;
}
