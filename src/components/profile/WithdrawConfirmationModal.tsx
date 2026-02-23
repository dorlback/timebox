'use client'
import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';

interface WithdrawConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isWithdrawing: boolean;
}

export function WithdrawConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  isWithdrawing
}: WithdrawConfirmationModalProps) {
  const { t } = useTranslation();
  const [confirmText, setConfirmText] = useState('');
  const [hasAgreed, setHasAgreed] = useState(false);

  const EXPECTED_TEXT = t('profile.withdrawConfirm.inputPlaceholder');
  const isFormValid = confirmText === EXPECTED_TEXT && hasAgreed;

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
      setHasAgreed(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-card border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6 text-red-500">
            <div className="bg-red-500/10 p-3 rounded-xl">
              <span className="material-symbols-outlined text-2xl">warning</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold">{t('profile.withdrawConfirm.title')}</h2>
          </div>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            {t('profile.withdrawConfirm.description')}
          </p>

          <div className="bg-muted/50 rounded-xl p-4 mb-6 space-y-3">
            <div className="flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">error</span>
              <span className="text-card-foreground/80">{t('profile.withdrawConfirm.warning1')}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">error</span>
              <span className="text-card-foreground/80">{t('profile.withdrawConfirm.warning2')}</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="material-symbols-outlined text-red-500 text-sm mt-0.5">error</span>
              <span className="text-card-foreground/80">{t('profile.withdrawConfirm.warning3')}</span>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={hasAgreed}
                onChange={(e) => setHasAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-muted-foreground accent-primary"
              />
              <span className="text-sm font-medium group-hover:text-primary transition-colors">
                {t('profile.withdrawConfirm.action')}
              </span>
            </label>

            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {t('profile.withdrawConfirm.typeConfirm')}
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={EXPECTED_TEXT}
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all font-bold tracking-tight"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-muted/30 p-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl font-bold hover:bg-muted transition-colors border border-border"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={onConfirm}
            disabled={!isFormValid || isWithdrawing}
            className="flex-1 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 disabled:opacity-50 disabled:grayscale transition-all shadow-lg shadow-red-500/20"
          >
            {isWithdrawing ? t('common.loading') : t('profile.withdraw')}
          </button>
        </div>
      </div>
    </div>
  );
}
