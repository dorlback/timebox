'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from '@/contexts/LanguageContext';

interface DiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  diaryText: string;
  onSave: (text: string) => void;
  isMobile?: boolean;
  date?: Date;
}

export const DiaryModal: React.FC<DiaryModalProps> = ({
  isOpen,
  onClose,
  diaryText,
  onSave,
  isMobile = false,
  date,
}) => {
  const { t, language } = useTranslation() as any;
  const locale = language === 'en' ? 'en-US' : 'ko-KR';
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setEditedText(diaryText || '');
    }
  }, [isOpen, diaryText]);

  if (!isOpen) return null;

  const handleCloseWithSave = () => {
    if (editedText !== (diaryText || '')) {
      onSave(editedText);
    } else {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleCloseWithSave();
        }
      }}
    >
      <div
        className="bg-card w-full max-w-[420px] sm:max-w-[520px] md:max-w-[600px] mx-auto rounded-[2.5rem] shadow-2xl border border-border/50 dark:border-white/10 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 h-[85dvh] max-h-[800px] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <div className="flex flex-col gap-1">
            <span className="px-3 py-1 bg-primary/20 text-primary text-[10px] font-black rounded-full uppercase tracking-widest leading-none self-start">
              일기장
            </span>
            {date && (
              <h2 className="text-2xl font-black text-foreground mt-1.5 px-1 truncate">
                {date.toLocaleDateString(locale, { month: 'long', day: 'numeric', weekday: 'short' })}
              </h2>
            )}
          </div>
          <button
            onClick={handleCloseWithSave}
            className="p-2 flex justify-center items-center rounded-full bg-muted/50 text-muted-foreground hover:bg-muted transition-all active:scale-90"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (Scrollable) */}
        <div className={`${isMobile ? 'p-5' : 'p-8'} pt-2 space-y-6 overflow-y-auto custom-scrollbar flex-1`}>
          <div className="space-y-2 h-full flex flex-col">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              className="w-full flex-1 p-5 rounded-[1.8rem] bg-muted/40 hover:bg-muted/80 dark:bg-white/5 dark:hover:bg-white/10 text-foreground placeholder-muted-foreground/30 outline-none focus:ring-4 focus:ring-primary/10 transition-all resize-none text-base md:text-sm leading-relaxed border border-border/60 dark:border-white/10 focus:border-primary/40 dark:focus:border-primary/50 min-h-[400px] h-full"
              placeholder="오늘 하루는 어땠나요?"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
