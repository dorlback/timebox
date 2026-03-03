'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/Sidebar';
import { useUser, useUserList } from '@/hooks/useUser';
import { useAdminFeedback, useAnnouncements } from '@/hooks/useAdmin';
import { useTranslation } from '@/contexts/LanguageContext';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { AnnouncementEditor } from '@/components/admin/AnnouncementEditor';
import { AnnouncementsBoardModal } from '@/components/dashboard/AnnouncementsBoardModal';

type TabType = 'users' | 'feedback' | 'announcements';

export default function AdminPage() {
  const { t, locale } = useTranslation();
  const { user, isLoading: isUserLoading } = useUser();
  const { users, isLoading: isUsersLoading, forceDelete, isDeleting } = useUserList();
  const { feedback, isLoading: isFeedbackLoading } = useAdminFeedback();
  const { announcements, isLoading: isAnnouncementsLoading, deleteAnnouncement } = useAnnouncements();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('users');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);
  const [previewId, setPreviewId] = useState<string | null>(null);

  // Guard: Redirect if not admin
  useEffect(() => {
    if (!isUserLoading && (!user || !user.isAdmin)) {
      router.push('/');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading || !user || !user.isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const formatDate = (date: any) => {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-background text-foreground min-h-screen antialiased transition-colors">
      <div className="flex h-screen overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8 lg:p-12 pb-24 md:pb-12">
          <div className="max-w-6xl mx-auto space-y-8">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-card-foreground">Admin System</h1>
                <p className="text-muted-foreground text-sm font-medium">Manage users, feedback, and announcements.</p>
              </div>

              <div className="flex bg-muted/50 p-1.5 rounded-2xl border border-border">
                {(['users', 'feedback', 'announcements'] as TabType[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab
                      ? 'bg-card text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                      }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </header>

            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden transition-all">
              {activeTab === 'users' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">User</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Email</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Role</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Joined At</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Status</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isUsersLoading ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading users...</td>
                        </tr>
                      ) : users.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No users found.</td>
                        </tr>
                      ) : (
                        users.map((u) => (
                          <tr key={u.id} className="hover:bg-muted/10 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full bg-muted bg-cover bg-center border border-border shrink-0"
                                  style={{ backgroundImage: u.avatarUrl ? `url('${u.avatarUrl}')` : 'none' }}
                                />
                                <span className="font-bold text-sm truncate max-w-[120px]">{u.displayName}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-muted-foreground">{u.email}</span>
                            </td>
                            <td className="px-6 py-4">
                              {u.isAdmin ? (
                                <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-lg uppercase tracking-wider">Admin</span>
                              ) : (
                                <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-black rounded-lg uppercase tracking-wider">User</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs text-muted-foreground">{formatDate(u.createdAt)}</span>
                            </td>
                            <td className="px-6 py-4">
                              {u.deletedAt ? (
                                <span className="text-red-500 text-xs font-bold animate-pulse">Deletion Scheduled</span>
                              ) : (
                                <span className="text-green-500 text-xs font-bold">Active</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  if (confirm('Are you sure you want to PERMANENTLY delete this user? This cannot be undone.')) {
                                    forceDelete(u.id);
                                  }
                                }}
                                disabled={isDeleting}
                                className="text-red-500 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/10 p-2 rounded-xl border border-red-500/10 opacity-0 group-hover:opacity-100 disabled:opacity-50"
                              >
                                <span className="material-symbols-outlined text-sm">delete_forever</span>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'feedback' && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-muted/30 border-b border-border">
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Date</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">User Email</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Reason</th>
                        <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Feedback</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {isFeedbackLoading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">Loading feedback...</td>
                        </tr>
                      ) : feedback.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground">No feedback yet.</td>
                        </tr>
                      ) : (
                        feedback.map((f: any) => (
                          <tr key={f.id} className="hover:bg-muted/10 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-xs text-muted-foreground font-medium">{formatDate(f.created_at)}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm font-bold">{f.email || 'Anonymous'}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-[10px] font-black rounded-lg uppercase tracking-wider">
                                {f.reason}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-card-foreground line-clamp-2 max-w-md">{f.feedback || '-'}</p>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'announcements' && (
                <div className="flex flex-col">
                  <div className="p-6 border-b border-border bg-muted/10 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-card-foreground">Announcements</h3>
                      <p className="text-xs text-muted-foreground font-medium">Create and manage global or targeted updates.</p>
                    </div>
                    <button
                      onClick={() => setIsEditorOpen(true)}
                      className="bg-primary text-primary-foreground px-5 py-2 rounded-xl text-xs font-bold shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      New Announcement
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-muted/30 border-b border-border">
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Category</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Title</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Author</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Target</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Date</th>
                          <th className="px-6 py-4 text-xs font-black uppercase tracking-wider text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {isAnnouncementsLoading ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">Loading announcements...</td>
                          </tr>
                        ) : announcements.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No announcements yet.</td>
                          </tr>
                        ) : (
                          announcements.map((a: any) => (
                            <tr key={a.id} className="hover:bg-muted/10 transition-colors group">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-[10px] font-black rounded-lg uppercase tracking-wider ${a.category === 'notice' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                                  a.category === 'user_notice' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' :
                                    a.category === 'patch_note' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                                      'bg-muted text-muted-foreground'
                                  }`}>
                                  {a.category}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm font-bold truncate max-w-xs block">{a.title}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="text-sm text-card-foreground font-medium">{a.author?.display_name || 'Admin'}</span>
                              </td>
                              <td className="px-6 py-4">
                                {a.category === 'user_notice' ? (
                                  <span className="text-[10px] font-bold text-muted-foreground italic">
                                    {a.target_user_ids?.length || 0} Targeted
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">Global</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => setPreviewId(a.id)}
                                    className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/10 text-blue-500 hover:text-blue-600 border border-blue-500/10 transition-colors"
                                    title="Preview"
                                  >
                                    <span className="material-symbols-outlined text-sm">visibility</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingAnnouncement(a);
                                      setIsEditorOpen(true);
                                    }}
                                    className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 text-orange-500 hover:text-orange-600 border border-orange-500/10 transition-colors"
                                    title="Edit"
                                  >
                                    <span className="material-symbols-outlined text-sm">edit</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm('Are you sure you want to delete this announcement?')) {
                                        deleteAnnouncement(a.id);
                                      }
                                    }}
                                    className="p-2 rounded-lg bg-red-50 dark:bg-red-900/10 text-red-500 hover:text-red-600 border border-red-500/10 transition-colors"
                                    title="Delete"
                                  >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      <MobileBottomNav />

      {isEditorOpen && (
        <AnnouncementEditor
          announcement={editingAnnouncement}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingAnnouncement(null);
          }}
        />
      )}

      {previewId && (
        <AnnouncementsBoardModal
          isOpen={!!previewId}
          onClose={() => setPreviewId(null)}
          initialAnnouncementId={previewId}
        />
      )}
    </div>
  );
}
