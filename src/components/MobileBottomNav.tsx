'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Moon, Sun, LayoutDashboard, User, Calendar, Clock } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useTranslation } from '@/contexts/LanguageContext';

interface MobileBottomNavProps {
  activeView?: 'left' | 'right';
  onViewToggle?: () => void;
}

export function MobileBottomNav({ activeView, onViewToggle }: MobileBottomNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isDark, toggleDark, mounted } = useDarkMode();

  const isPlanner = pathname === '/timebox';

  const navItems = [
    {
      href: '/timebox',
      icon: Calendar,
      label: t('sidebar.planner'),
      active: pathname === '/timebox'
    },
    {
      href: '/dashboard',
      icon: LayoutDashboard,
      label: t('sidebar.dashboard'),
      active: pathname === '/dashboard'
    },
    {
      href: '/mypage',
      icon: User,
      label: t('sidebar.profile'),
      active: pathname === '/mypage'
    }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-[64px] bg-card/95 backdrop-blur-md border-t border-border z-50 md:hidden pb-safe">
      <div className="relative flex items-center justify-around h-16 px-2">
        {/* Nav Items */}
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all ${item.active ? 'text-primary' : 'text-muted-foreground hover:text-primary'
              }`}
          >
            <item.icon size={20} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}

        {/* Center Toggle Button (Only for Planner) */}
        {isPlanner && onViewToggle && (
          <div className="absolute left-1/2 -translate-x-1/2 -top-7 pointer-events-none">
            <button
              onClick={onViewToggle}
              className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center z-20 pointer-events-auto"
              style={{ boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)' }}
            >
              {activeView === 'left' ? (
                <Calendar size={28} strokeWidth={2.5} />
              ) : (
                <Clock size={28} strokeWidth={2.5} />
              )}
            </button>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleDark}
          className="flex flex-col items-center justify-center gap-0.5 px-3 pb-1 transition-all text-muted-foreground hover:text-primary"
        >
          {mounted ? (isDark ? <Sun size={20} /> : <Moon size={20} />) : <div className="w-5 h-5" />}
          <span className="text-[10px] font-medium">{t('common.theme')}</span>
        </button>
      </div>
    </nav>
  );
}
