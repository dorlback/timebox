'use client';

import React, { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';
import { useUserList } from '@/hooks/useUser';
import { useAnnouncements } from '@/hooks/useAdmin';
import { useTranslation } from '@/contexts/LanguageContext';

// Dynamic import for React Quill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface AnnouncementEditorProps {
  onClose: () => void;
  announcement?: any;
}

export function AnnouncementEditor({ onClose, announcement }: AnnouncementEditorProps) {
  const { t } = useTranslation();
  const { createAnnouncement, isCreating, updateAnnouncement } = useAnnouncements();
  const { users } = useUserList();

  const [category, setCategory] = useState(announcement?.category || 'notice');
  const [title, setTitle] = useState(announcement?.title || '');
  const [content, setContent] = useState(announcement?.content || '');
  const [targetUserIds, setTargetUserIds] = useState<string[]>(announcement?.target_user_ids || []);
  const [isSourceMode, setIsSourceMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    return users.filter(u =>
      u.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [users, searchQuery]);

  const toggleUser = (userId: string) => {
    setTargetUserIds(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSave = async () => {
    if (!title || !content) {
      alert(t('dashboard.noResults')); // Using existing or should I use new error? Let's use generic for now if not defined.
      return;
    }

    try {
      if (announcement?.id) {
        await updateAnnouncement({
          id: announcement.id,
          data: {
            category,
            title,
            content,
            target_user_ids: category === 'user_notice' ? targetUserIds : null,
          }
        });
      } else {
        await createAnnouncement({
          category,
          title,
          content,
          target_user_ids: category === 'user_notice' ? targetUserIds : undefined,
        });
      }
      onClose();
    } catch (error) {
      console.error('Failed to save announcement:', error);
    }
  };

  const categories = [
    { value: 'notice', label: t('announcements.categories.notice') },
    { value: 'user_notice', label: t('announcements.categories.user_notice') },
    { value: 'patch_note', label: t('announcements.categories.patch_note') },
    { value: 'others', label: t('announcements.categories.others') },
  ];

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-4xl max-h-[90vh] rounded-3xl border border-border shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        <header className="px-8 py-6 border-b border-border flex items-center justify-between bg-muted/30">
          <div>
            <h2 className="text-xl font-black text-card-foreground">
              {announcement ? t('announcements.editor.editTitle') : t('announcements.editor.createTitle')}
            </h2>
            <p className="text-xs text-muted-foreground font-medium">
              {announcement ? t('announcements.editor.editSubtitle') : t('announcements.editor.createSubtitle')}
            </p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">{t('announcements.editor.category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              >
                {categories.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs font-black uppercase text-muted-foreground tracking-widest pl-1">{t('announcements.editor.title')}</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('announcements.editor.titlePlaceholder')}
                className="w-full bg-muted/50 border border-border rounded-xl px-4 py-2 text-sm font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          {category === 'user_notice' && (
            <div className="space-y-3 p-6 bg-primary/5 rounded-2xl border border-primary/10">
              <label className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">person_search</span>
                {t('announcements.editor.targetUsers')}
              </label>

              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('announcements.editor.searchUsers')}
                  className="w-full bg-card border border-border rounded-xl pl-4 pr-10 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">search</span>

                {filteredUsers.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                    {filteredUsers.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          toggleUser(u.id);
                          setSearchQuery('');
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-muted text-sm flex items-center justify-between group"
                      >
                        <div className="flex flex-col">
                          <span className="font-bold">{u.displayName}</span>
                          <span className="text-[10px] text-muted-foreground">{u.email}</span>
                        </div>
                        {targetUserIds.includes(u.id) && (
                          <span className="material-symbols-outlined text-primary text-sm">check_circle</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {targetUserIds.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {targetUserIds.map(id => {
                    const user = users.find(u => u.id === id);
                    return (
                      <span key={id} className="bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm">
                        {user?.displayName || 'Unknown'}
                        <button onClick={() => toggleUser(id)} className="hover:opacity-80 transition-opacity">
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="space-y-3 h-[450px] flex flex-col">
            <div className="flex items-center justify-between pl-1">
              <label className="text-xs font-black uppercase text-muted-foreground tracking-widest">{t('announcements.editor.content')}</label>
              <button
                onClick={() => setIsSourceMode(!isSourceMode)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black transition-all ${isSourceMode
                  ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
              >
                <span className="material-symbols-outlined text-xs">
                  {isSourceMode ? 'wysiwyg' : 'code'}
                </span>
                {isSourceMode ? t('announcements.editor.editorMode') : t('announcements.editor.sourceMode')}
              </button>
            </div>

            <div className="flex-1 bg-card rounded-2xl border border-border overflow-hidden flex flex-col shadow-inner">
              {isSourceMode ? (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('announcements.editor.htmlPlaceholder')}
                  className="w-full h-full p-6 text-sm font-mono bg-stone-50 dark:bg-stone-900/40 text-foreground resize-none focus:outline-none leading-relaxed"
                />
              ) : (
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  className="h-full flex flex-col"
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'color': [] }, { 'background': [] }],
                      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                      ['link', 'image', 'video'],
                      ['clean']
                    ],
                  }}
                />
              )}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium italic pl-1">
              {isSourceMode
                ? t('announcements.editor.sourceHint')
                : t('announcements.editor.editorHint')}
            </p>
          </div>
        </div>

        <footer className="px-8 py-6 border-t border-border bg-muted/30 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={isCreating}
            className="bg-primary text-primary-foreground px-8 py-2 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isCreating ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                {announcement ? t('announcements.editor.updating') : t('announcements.editor.publishing')}
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  {announcement ? 'save' : 'rocket_launch'}
                </span>
                {announcement ? t('announcements.editor.updateNow') : t('announcements.editor.publishNow')}
              </>
            )}
          </button>
        </footer>
      </div>

      <style jsx global>{`
        .quill {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .ql-container {
          flex: 1;
          overflow-y: auto;
          font-family: inherit;
        }
        .ql-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          background: rgba(var(--muted), 0.3);
        }
        .ql-editor {
           font-size: 14px;
           line-height: 1.6;
        }
      `}</style>
    </div>
  );
}
