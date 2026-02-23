'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/contexts/LanguageContext';
import { useUser } from '@/hooks/useUser';
import { fetchAllPlannerData } from '@/lib/api/planner';
import { DailyData } from '@/types/planner';
import { getDateKey } from '@/utils/dateUtils';

interface SearchResult {
  date: string;
  matches: string[];
}

export function DashboardSearch() {
  const { t, locale } = useTranslation();
  const { user } = useUser();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [allData, setAllData] = useState<{ planned_date: string; payload: DailyData }[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFocus = async () => {
    if (allData.length === 0 && user?.id) {
      setLoading(true);
      const data = await fetchAllPlannerData(user.id);
      setAllData(data);
      setLoading(false);
    }
    if (query.length > 0) {
      setIsOpen(true);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length === 0) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const filtered = allData.reduce((acc: SearchResult[], item) => {
      const matches: string[] = [];

      // Search in brainDump
      item.payload.brainDump?.forEach(dump => {
        if (dump.text.toLowerCase().includes(val.toLowerCase())) {
          matches.push(dump.text);
        }
      });

      // Search in todoList
      item.payload.todoList?.forEach(todo => {
        if (todo.text.toLowerCase().includes(val.toLowerCase())) {
          matches.push(todo.text);
        }
      });

      if (matches.length > 0) {
        acc.push({
          date: item.planned_date,
          matches: Array.from(new Set(matches)).slice(0, 3) // Unique and max 3 matches
        });
      }
      return acc;
    }, []);

    setResults(filtered.slice(0, 10)); // Max 10 dates
    setIsOpen(true);
  };

  const handleResultClick = (date: string) => {
    router.push(`/timebox?date=${date}`);
    setIsOpen(false);
    setQuery('');
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  return (
    <div className="relative max-w-md hidden md:block" ref={dropdownRef}>
      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">search</span>
      <input
        className="w-64 pl-10 pr-4 py-2 bg-muted text-foreground border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all placeholder:text-muted-foreground"
        placeholder={t('dashboard.searchPlaceholder') || "Search tasks, goals..."}
        type="text"
        value={query}
        onChange={handleSearch}
        onFocus={handleFocus}
      />

      {isOpen && (results.length > 0 || loading) && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[400px] overflow-y-auto p-2">
            {loading ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <div className="animate-spin mb-2 flex justify-center">
                  <span className="material-symbols-outlined">sync</span>
                </div>
                <p className="text-xs font-medium">{t('common.loading')}</p>
              </div>
            ) : results.length > 0 ? (
              results.map((result) => (
                <button
                  key={result.date}
                  onClick={() => handleResultClick(result.date)}
                  className="w-full text-left px-4 py-3 hover:bg-muted/50 group flex flex-col gap-1 border-b border-border/50 last:border-0"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary">{formatDate(result.date)}</span>
                    <span className="material-symbols-outlined text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
                  </div>
                  <div className="space-y-0.5">
                    {result.matches.map((match, i) => (
                      <p key={i} className="text-sm text-card-foreground truncate max-w-full">
                        • {match}
                      </p>
                    ))}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <p className="text-sm">{t('dashboard.noResults') || "No matches found"}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
