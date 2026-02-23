'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/contexts/LanguageContext';
import { User } from '@/types/user';

interface EditProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    display_name: string;
    location: string;
    birthday: string;
    description: string;
    avatar_url: string;
  }) => void;
  isSaving: boolean;
}

export function EditProfileModal({ user, isOpen, onClose, onSave, isSaving }: EditProfileModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    display_name: '',
    location: '',
    birthday: '',
    description: '',
    avatar_url: ''
  });

  useEffect(() => {
    if (user && isOpen) {
      setFormData({
        display_name: user.displayName || '',
        location: user.location || '',
        birthday: user.birthday || '',
        description: user.description || '',
        avatar_url: user.avatarUrl || ''
      });
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-card w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl border-x-0 border-t-0 sm:border border-border shadow-2xl overflow-y-auto sm:overflow-hidden animate-scale-in flex flex-col">
        {/* Header - Hidden on mobile as per request */}
        <header className="px-6 py-4 border-b border-border hidden sm:flex items-center justify-between bg-muted/30 shrink-0">
          <h3 className="text-lg font-bold text-foreground">{t('profile.editProfile')}</h3>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground sm:w-8 sm:h-8"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleSubmit} className="p-6 pt-10 sm:pt-6 space-y-6 flex-1 overflow-y-auto">
          <div className="flex flex-col items-center mb-8">
            <div
              className="w-28 h-28 sm:w-24 sm:h-24 rounded-full bg-muted bg-cover bg-center border-4 border-background shadow-md mb-3"
              style={{ backgroundImage: formData.avatar_url ? `url(${formData.avatar_url})` : 'none' }}
            >
              {!formData.avatar_url && (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <span className="material-symbols-outlined text-4xl">person</span>
                </div>
              )}
            </div>
            <div className="w-full max-w-xs space-y-1.5 text-center">
              <label className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('profile.avatarUrl')}</label>
              <input
                type="text"
                placeholder={t('profile.avatarUrl')}
                className="text-xs w-full px-3 py-2 bg-muted border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
                value={formData.avatar_url}
                onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('profile.displayName')}</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 sm:py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('profile.location')}</label>
              <input
                type="text"
                placeholder={t('profile.locationPlaceholder')}
                className="w-full px-4 py-3 sm:py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('profile.birthday')}</label>
            <input
              type="date"
              className="w-full px-4 py-3 sm:py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{t('profile.description')}</label>
            <textarea
              rows={4}
              className="w-full px-4 py-3 sm:py-2 bg-muted border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-foreground resize-none"
              placeholder={t('profile.descriptionPlaceholder')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Fixed bottom actions on mobile maybe? Or just enough space */}
          <div className="pt-6 flex gap-3 pb-8 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 sm:py-2.5 px-4 bg-muted text-foreground font-bold rounded-xl hover:bg-muted/80 transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 py-3.5 sm:py-2.5 px-4 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
              ) : (
                t('common.save')
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
