'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, LayoutDashboard, User, Calendar, Save, RefreshCw } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

interface MobileBottomNavProps {
  onSave?: () => void;
  activeView?: 'left' | 'right';
  onViewToggle?: () => void;
}

export function MobileBottomNav({ onSave, activeView, onViewToggle }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { isDark, toggleDark, mounted } = useDarkMode();

  const isPlanner = pathname === '/timebox';

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-card/95 backdrop-blur-md border-t border-border z-50 md:hidden pb-safe">
      <div className="relative flex items-center justify-around h-16 px-2">

        {/* Left Side Items */}
        {isPlanner ? (
          <>
            <Link href="/dashboard" className="flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all text-muted-foreground hover:text-primary">
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-medium">대시보드</span>
            </Link>
            <Link href="/mypage" className="flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all text-muted-foreground hover:text-primary">
              <User size={20} />
              <span className="text-[10px] font-medium">프로필</span>
            </Link>
          </>
        ) : (
          <>
            <Link href="/timebox" className="flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all text-muted-foreground hover:text-primary">
              <Calendar size={20} />
              <span className="text-[10px] font-medium">플래너</span>
            </Link>
            <Link href="/dashboard" className={`flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all ${pathname === '/dashboard' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <LayoutDashboard size={20} />
              <span className="text-[10px] font-medium">대시보드</span>
            </Link>
          </>
        )}

        {/* Center Toggle Button (Only for Planner) */}
        {isPlanner && onViewToggle && (
          <button
            onClick={onViewToggle}
            className="absolute left-1/2 -translate-x-1/2 -top-7 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center z-20"
            style={{ boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)' }}
          >
            {activeView === 'left' ? (
              <Calendar size={28} strokeWidth={2.5} />
            ) : (
              <Save size={28} strokeWidth={2.5} />
            )}
          </button>
        )}

        {/* Right Side Items */}
        {isPlanner ? (
          <>
            <button
              onClick={toggleDark}
              className="flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all text-muted-foreground hover:text-primary"
            >
              {mounted ? (isDark ? <Sun size={20} /> : <Moon size={20} />) : <div className="w-5 h-5" />}
              <span className="text-[10px] font-medium">테마</span>
            </button>
            <button
              onClick={onSave}
              className="flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all text-muted-foreground hover:text-primary"
            >
              <Save size={20} />
              <span className="text-[10px] font-medium">저장</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/mypage" className={`flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all ${pathname === '/mypage' ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}>
              <User size={20} />
              <span className="text-[10px] font-medium">프로필</span>
            </Link>
            <button
              onClick={toggleDark}
              className="flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all text-muted-foreground hover:text-primary"
            >
              {mounted ? (isDark ? <Sun size={20} /> : <Moon size={20} />) : <div className="w-5 h-5" />}
              <span className="text-[10px] font-medium">테마</span>
            </button>
          </>
        )}

      </div>
    </nav>
  );
}
