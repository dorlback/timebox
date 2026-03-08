'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/contexts/LanguageContext';
// import { AnnouncementsBoardModal } from './AnnouncementsBoardModal'; // Removed internal import

interface NotificationBellProps {
  onViewAll: (id?: string) => void;
}

export function NotificationBell({ onViewAll }: NotificationBellProps) {
  const { t, locale } = useTranslation();
  const { user } = useUser();
  const { unreadCount, announcements, markAsRead, markAllAsRead } = useNotifications(user?.id);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadAnnouncements = announcements.filter(a => !a.isRead).slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => setIsOpen(!isOpen);

  const handleViewAll = () => {
    setIsOpen(false);
    onViewAll();
  };

  const handleMarkAllAsRead = () => {
    const unreadIds = announcements.filter(a => !a.isRead).map(a => a.id);
    if (unreadIds.length > 0) {
      markAllAsRead(unreadIds);
    }
  };

  const handleSelectAnnouncement = (id: string) => {
    markAsRead(id);
    setIsOpen(false);
    onViewAll(id);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'notice': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
      case 'user_notice': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400';
      case 'patch_note': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className={`w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-primary transition-all relative group ${isOpen ? 'ring-2 ring-primary/20 bg-muted/80' : ''}`}
      >
        <span className={`material-symbols-outlined transition-all ${unreadCount > 0 ? 'text-primary fill-1' : 'group-hover:text-foreground'}`}>
          {unreadCount > 0 ? 'notifications_active' : 'notifications'}
        </span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-primary text-[10px] font-black text-primary-foreground px-1 flex items-center justify-center rounded-full border-2 border-card animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-card border border-border rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <header className="px-6 py-4 border-b border-border bg-muted/10 flex items-center justify-between">
            <h3 className="text-sm font-black tracking-tight text-card-foreground">{t('announcements.notifications.title')}</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[10px] font-bold text-primary hover:underline"
              >
                {t('announcements.notifications.markAllRead')}
              </button>
            )}
          </header>

          <div className="max-h-[400px] overflow-y-auto">
            {unreadAnnouncements.length === 0 ? (
              <div className="px-6 py-12 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center opacity-30">
                  <span className="material-symbols-outlined text-3xl">notifications_off</span>
                </div>
                <p className="text-xs font-bold text-muted-foreground">{t('announcements.notifications.empty')}</p>
              </div>
            ) : (
              <div className="divide-y divide-border/50">
                {unreadAnnouncements.map((ann) => (
                  <button
                    key={ann.id}
                    onClick={() => handleSelectAnnouncement(ann.id)}
                    className="w-full text-left px-6 py-4 hover:bg-muted/50 transition-colors group flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${getCategoryColor(ann.category)}`}>
                        {t(`announcements.categories.${ann.category}`)}
                      </span>
                      <span className="w-2 h-2 bg-primary rounded-full" />
                    </div>
                    <p className="text-sm font-bold text-card-foreground line-clamp-2 leading-relaxed">
                      {ann.title}
                    </p>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {new Date(ann.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US')}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <footer className="p-3 bg-muted/10 border-t border-border">
            <button
              onClick={handleViewAll}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {t('announcements.notifications.viewAll')}
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}
