'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { useUser } from '@/hooks/useUser';
import { useTranslation } from '@/contexts/LanguageContext';

interface AnnouncementsBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialAnnouncementId?: string;
}

export function AnnouncementsBoardModal({ isOpen, onClose, initialAnnouncementId }: AnnouncementsBoardModalProps) {
  const { t, locale } = useTranslation();
  const { user } = useUser();
  const { announcements, markAsRead, unreadCount } = useNotifications(user?.id);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(initialAnnouncementId || null);

  // Sync selectedId with initialAnnouncementId when it changes or when modal opens
  useEffect(() => {
    if (initialAnnouncementId) {
      setSelectedId(initialAnnouncementId);
    }
  }, [initialAnnouncementId, isOpen]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const categories = [
    { value: 'all', label: t('announcements.categories.all') },
    { value: 'notice', label: t('announcements.categories.notice') },
    { value: 'user_notice', label: t('announcements.categories.user_notice') },
    { value: 'patch_note', label: t('announcements.categories.patch_note') },
    { value: 'others', label: t('announcements.categories.others') },
  ];

  const filteredAnnouncements = useMemo(() => {
    if (selectedCategory === 'all') return announcements;
    return announcements.filter(a => a.category === selectedCategory);
  }, [announcements, selectedCategory]);

  const selectedAnnouncement = useMemo(() => {
    return announcements.find(a => a.id === selectedId);
  }, [announcements, selectedId]);

  const handleSelectAnnouncement = (id: string) => {
    setSelectedId(id);
    const ann = announcements.find(a => a.id === id);
    if (ann && !ann.isRead) {
      markAsRead(id);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'notice': return 'bg-primary/10 dark:bg-primary/30 text-primary dark:text-primary-foreground';
      case 'user_notice': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400';
      case 'patch_note': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-6xl h-[85vh] sm:h-[90vh] bg-background rounded-[32px] sm:rounded-[40px] border border-border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Header */}
        <header className="px-6 py-6 sm:px-10 sm:py-8 flex items-center justify-between border-b border-border bg-card/30 shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tighter flex items-center gap-3">
              {t('announcements.boardTitle')}
              {unreadCount > 0 && (
                <span className="px-3 py-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full animate-pulse whitespace-nowrap">
                  {t('announcements.newCount').replace('{count}', unreadCount.toString())}
                </span>
              )}
            </h2>
            <p className="text-muted-foreground font-medium text-xs sm:text-sm">{t('announcements.subtitle')}</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-card border border-border flex items-center justify-center hover:bg-muted transition-all active:scale-90"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </header>

        {/* Layout Body */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border">
          {/* List Section */}
          <div className="w-full md:w-[400px] flex flex-col bg-card/10 shrink-0">
            {/* Tabs */}
            <div className="flex p-2 bg-muted/20 overflow-x-auto no-scrollbar gap-1 shrink-0">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all whitespace-nowrap ${selectedCategory === cat.value
                    ? 'bg-card text-primary shadow-sm border border-border'
                    : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {filteredAnnouncements.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground py-20 grayscale opacity-50">
                  <span className="material-symbols-outlined text-5xl mb-4">inbox_customize</span>
                  <p className="font-bold text-xs uppercase tracking-widest">{t('announcements.noEntries')}</p>
                </div>
              ) : (
                filteredAnnouncements.map(ann => (
                  <button
                    key={ann.id}
                    onClick={() => handleSelectAnnouncement(ann.id)}
                    className={`w-full text-left p-4 rounded-3xl transition-all border flex flex-col gap-2 relative group overflow-hidden ${selectedId === ann.id
                      ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/20 shadow-sm'
                      : 'bg-card border-border hover:border-primary/20 hover:bg-muted/30'
                      }`}
                  >
                    {!ann.isRead && (
                      <div className="absolute top-4 right-4 group-hover:scale-110 transition-transform">
                        <div className="w-2 h-2 bg-primary rounded-full animate-ping absolute" />
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${getCategoryColor(ann.category)}`}>
                        {t(`announcements.categories.${ann.category}`)}
                      </span>
                      <span className="text-[10px] font-bold text-muted-foreground">{formatDate(ann.created_at)}</span>
                    </div>
                    <h3 className={`text-sm font-bold transition-all line-clamp-2 ${selectedId === ann.id ? 'text-primary' : 'text-card-foreground leading-snug'}`}>
                      {ann.title}
                    </h3>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Detail Section Container */}
          <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
            {selectedAnnouncement ? (
              <>
                <div className="flex-1 overflow-y-auto flex flex-col">
                  <header className="px-8 py-10 sm:px-12 sm:py-12 space-y-4 shrink-0 border-b border-border/50 bg-muted/5">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 text-[10px] font-black rounded-xl uppercase tracking-widest ${getCategoryColor(selectedAnnouncement.category)} shadow-sm`}>
                        {t(`announcements.categories.${selectedAnnouncement.category}`)}
                      </span>
                      <span className="text-xs font-bold text-muted-foreground">•</span>
                      <span className="text-xs font-bold text-muted-foreground">{formatDate(selectedAnnouncement.created_at)}</span>
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-[1.1] text-foreground">{selectedAnnouncement.title}</h1>
                    {/* <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground pt-2">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[14px]">admin_panel_settings</span>
                      </div>
                      {selectedAnnouncement.author?.display_name || t('common.admin')}
                    </div> */}
                  </header>
                  <div className="flex-1 p-8 sm:p-12 prose prose-sm sm:prose-base dark:prose-invert max-w-none prose-p:leading-8 prose-headings:font-black prose-img:rounded-3xl hover:prose-a:text-primary transition-colors">
                    <div
                      dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                      className="font-medium animate-in fade-in slide-in-from-bottom-2 duration-500"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted-foreground grayscale opacity-20 p-8 text-center">
                <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-8">
                  <span className="material-symbols-outlined text-5xl">description_skeleton</span>
                </div>
                <p className="text-xl font-black tracking-tight">{t('announcements.selectToRead')}</p>
                <p className="text-xs font-medium max-w-[200px] mt-2">{t('announcements.clickToList')}</p>
              </div>
            )}

            {/* Detail Overlay for Mobile (Slide in from right) */}
            {selectedId && (
              <div className="md:hidden absolute inset-0 bg-background z-[110] flex flex-col animate-in slide-in-from-right duration-300">
                {selectedAnnouncement ? (
                  <>
                    <header className="px-4 py-3 border-b border-border flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-10 shrink-0">
                      <button onClick={() => setSelectedId(null)} className="flex items-center gap-1.5 text-xs font-black text-primary px-3 py-2 rounded-xl bg-primary/5">
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        {t('announcements.backToList')}
                      </button>
                      <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted">
                        <span className="material-symbols-outlined text-muted-foreground">close</span>
                      </button>
                    </header>
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-6 border-b border-border bg-muted/5 space-y-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 text-[8px] font-black rounded uppercase tracking-wider ${getCategoryColor(selectedAnnouncement.category)} shadow-sm`}>
                            {selectedAnnouncement.category}
                          </span>
                          <span className="text-[10px] font-bold text-muted-foreground">{formatDate(selectedAnnouncement.created_at)}</span>
                        </div>
                        <h1 className="text-2xl font-black leading-tight tracking-tight text-foreground">{selectedAnnouncement.title}</h1>
                      </div>
                      <div className="p-6 pb-20 prose prose-sm dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{ __html: selectedAnnouncement.content }}
                          className="font-medium leading-relaxed"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
