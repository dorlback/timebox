'use client';

import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

export default function DarkModeToggle() {
  const { isDark, toggleDark, mounted } = useDarkMode();

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="w-10 h-10 p-2 rounded-lg" aria-hidden="true">
        <div className="w-5 h-5" />
      </div>
    );
  }

  return (
    <button
      onClick={toggleDark}
      className="rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
      title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
    >
      {isDark ? (
        <Sun size={22} className="text-gray-300" aria-hidden="true" />
      ) : (
        <Moon size={22} className="text-gray-700" aria-hidden="true" />
      )}
    </button>
  );
}
