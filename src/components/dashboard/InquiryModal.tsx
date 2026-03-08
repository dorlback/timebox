'use client';

import React, { useState } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { createInquiry, InquiryData } from '@/lib/api/inquiry';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

export function InquiryModal({ isOpen, onClose, userEmail = '', userName = '' }: InquiryModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<InquiryData>({
    name: userName,
    content: '',
    email: userEmail,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (!formData.name || !formData.content || !formData.email) {
        throw new Error('All fields are required');
      }
      await createInquiry(formData);
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setFormData({
      name: userName,
      content: '',
      email: userEmail,
    });
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div className="bg-card w-full max-w-lg border border-border rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-in zoom-in-95 fade-in duration-300">
        <header className="p-6 border-b border-border bg-muted/10 flex items-center justify-between">
          <h3 className="text-xl font-black tracking-tight text-card-foreground">
            {isSuccess ? t('inquiry.successTitle') : t('inquiry.modalTitle')}
          </h3>
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="p-8">
          {isSuccess ? (
            <div className="flex flex-col items-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-4xl">check_circle</span>
              </div>
              <p className="text-muted-foreground font-medium leading-relaxed max-w-xs">
                {t('inquiry.successDescription')}
              </p>
              <button
                onClick={handleClose}
                className="mt-8 px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg hover:opacity-90 active:scale-95 transition-all"
              >
                {t('inquiry.close')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider px-1">
                  {t('inquiry.nameLabel')}
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('inquiry.namePlaceholder')}
                  className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider px-1">
                  {t('inquiry.emailLabel')}
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('inquiry.emailPlaceholder')}
                  className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider px-1">
                  {t('inquiry.contentLabel')}
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder={t('inquiry.contentPlaceholder')}
                  rows={5}
                  className="w-full bg-muted/30 border border-border rounded-2xl px-5 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                  required
                />
              </div>

              {error && (
                <p className="text-xs font-bold text-red-500 px-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm shadow-xl hover:opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {t('inquiry.submitting')}
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-md">send</span>
                    {t('inquiry.submit')}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
