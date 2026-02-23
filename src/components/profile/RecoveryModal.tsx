'use client'
import React from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

interface RecoveryModalProps {
  isOpen: boolean;
  onRecover: () => void;
  onLogout: () => void;
  isRecovering: boolean;
}

export function RecoveryModal({
  isOpen,
  onRecover,
  onLogout,
  isRecovering
}: RecoveryModalProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop - darker for gravity */}
      <div className="absolute inset-0 bg-background/95 backdrop-blur-md" />

      {/* Modal */}
      <div className="relative bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-300">
        <div className="p-8 text-center">
          <div className="inline-flex bg-primary/10 p-4 rounded-full text-primary mb-6">
            <span className="material-symbols-outlined text-4xl">celebration</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4 tracking-tight">
            {t('profile.recovery.title')}
          </h2>

          <p className="text-muted-foreground mb-8 leading-relaxed max-w-sm mx-auto">
            {t('profile.recovery.description')}
          </p>

          <div className="flex flex-col gap-4">
            <button
              onClick={onRecover}
              disabled={isRecovering}
              className="w-full py-4 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined">restore</span>
              {isRecovering ? t('common.loading') : t('profile.recovery.action')}
            </button>
            <button
              onClick={onLogout}
              className="w-full py-3 text-muted-foreground font-medium hover:text-foreground transition-colors"
            >
              {t('profile.recovery.stayLoggedOut')}
            </button>
          </div>
        </div>

        {/* Subtle timer hint */}
        <div className="bg-primary/5 py-3 px-6 text-xs text-primary/70 font-semibold border-t border-primary/10 uppercase tracking-widest text-center">
          30 Days Recovery Window Active
        </div>
      </div>
    </div>
  );
}
