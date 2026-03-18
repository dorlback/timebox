'use client'
import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { useTranslation } from "@/contexts/LanguageContext";
import { useUser } from "@/hooks/useUser";
import { Locale, LANGUAGE_NAMES } from "@/types/i18n";
import { EditProfileModal } from "@/components/profile/EditProfileModal";
import { WithdrawConfirmationModal } from "@/components/profile/WithdrawConfirmationModal";
import { RecoveryModal } from "@/components/profile/RecoveryModal";
import { MyPageSkeleton } from "@/components/profile/MyPageSkeleton";
import { createClient } from "@/lib/supabase/client";
import { withdrawAccount, reactivateAccount, saveWithdrawalFeedback } from "@/lib/api/user";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Centralizing static resources outside of component scope
const AVATAR_LARGE = `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxkF_Bq35f1zHlWJhQxWgoiHACz4Z5yY8lS-W63w0Y4_EQmfBqInU3OoRE3jggnm9TzJVxWyitSPgiJF6AsWrvkw4e4FibGF2nPsHKo88m-dg_L3Rgvw6Gv0kdrLHMV6KunLF5VJkmVdyLvLtJtqa5ryxKa18rveI_jt9c6X_rSQbdmrtMMUm9lRdIYv1JAbh0S8KXBBYMI9Lp8uQPlmoKz-xXQ_VEsAyB6nflQMaLR1dMgHqkhBwZ6uBIUZ6g6fY4U1R6x8OmVhE')`;
const PRICING_IMG = `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrOsvVD__AInquK5Tjo0F6W4xVIhQBwmDSxfDBpRjZ4yzcuhJr7P6Jg9qVHcYbmr9NiW1LwsNbBOEGUeVaJdz3C_EUwrI1D9J8FjxEejb_jRtjqTmIYaML4xe8jCqUw6oacd0ecDJzjctn1WiF1Kq3_ulpGg9V30I0XSNTde4_Y57a1wz3280bLlkmprxdCXA-9n-RYSYajfsigRCHlECCcWimT2tlbgZ_1aBZnBAD9mLl_LtMO9s5tiCMnTAqPNlSE6eAfow53zI')`;
const TOS_IMG = `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbnKYjzZk2YSbN-jYwsYhPFdeggjANvMe_juZoF_urhfkX1oHp71BSvjyjALn_AlMLFEGYRhMeIwYZnSUZqsYr7LMhLB8OsP9O9H-Rd0q5cGqj2OZjKlYUy1z4Nkl1Tl-xEIvxOsJHNIzBnynAST4fn92kLTJ7ZvaluOW7o-Dbot8RLi-bsXR4Ft43lwyKtXtLc45r09qAQ-EqGX5tsHDmholRB2aXbEsxWgX05o6paK7FsYAZXWC3t-tr-TqSZoBDVb-Sxoi7x8I')`;

export default function MyPage() {
  const { t, locale, setLocale } = useTranslation();
  const { user, updateProfile, isUpdating, isLoading } = useUser();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isDangerZoneOpen, setIsDangerZoneOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const displayName = user?.displayName || "Alex Johnson";
  const userRole = user?.isAdmin ? t('common.admin') : t('common.proMember');
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long' }) : "January 2023";

  // Check if account is in deactivated state
  const isDeactivated = !!user?.deletedAt;

  const handleUpdateProfile = (data: any) => {
    updateProfile(data, {
      onSuccess: () => {
        setIsEditModalOpen(false);
      }
    });
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        alert(t('common.error') || '로그아웃 중 오류가 발생했습니다.');
        return;
      }
      router.push('/');
      router.refresh();
    } catch (err) {
      console.error('Logout unexpected error:', err);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleWithdraw = async (feedbackData: { reason: string; feedback: string }) => {
    try {
      setIsWithdrawing(true);

      // 1. 피드백 저장
      await saveWithdrawalFeedback({
        email: user?.email,
        reason: feedbackData.reason,
        feedback: feedbackData.feedback
      });

      // 2. 계정 탈퇴(비활성화) 처리
      await withdrawAccount();
      // Logic handled in api function redirects to /
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('탈퇴 처리 중 오류가 발생했습니다.');
    } finally {
      setIsWithdrawing(false);
      setIsWithdrawModalOpen(false);
    }
  };

  const handleReactivate = async () => {
    try {
      setIsRecovering(true);
      await reactivateAccount();
      // Refresh to update useUser data
      window.location.reload();
    } catch (error) {
      console.error('Reactivation failed:', error);
      alert('계정 복구 중 오류가 발생했습니다.');
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <div
      className="bg-background text-foreground 100dvh antialiased transition-colors"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="flex h-[calc(var(--vh,1vh)*100)] overflow-hidden">
        {/* Shared Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8 lg:p-12 pb-20 md:pb-12">
          {isLoading ? (
            <MyPageSkeleton />
          ) : (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Profile Header */}
              <header className="bg-card rounded-xl p-4 md:p-8 border border-border flex flex-col md:flex-row items-center gap-4 md:gap-8 shadow-sm transition-colors relative overflow-hidden">
                {isDeactivated && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg uppercase tracking-wider animate-pulse">
                    Deletion Scheduled
                  </div>
                )}
                <div className="relative shrink-0">
                  <div
                    className="w-32 h-32 rounded-full bg-muted bg-cover bg-center border-4 border-background shadow-md"
                    style={{ backgroundImage: user?.avatarUrl ? `url(${user.avatarUrl})` : AVATAR_LARGE }}
                  ></div>
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg border-2 border-background hover:scale-105 transition-transform flex items-center justify-center"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                  </button>
                </div>
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2">
                    <h1 className="text-xl md:text-3xl font-bold tracking-tight text-card-foreground">{displayName}</h1>
                  </div>
                  {user?.description && (
                    <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto md:mx-0">
                      {user.description}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <span className="material-symbols-outlined text-base">location_on</span>
                      <span>{user?.location || t('profile.notSpecified')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                      <span className="material-symbols-outlined text-base">calendar_month</span>
                      <span>{t('profile.joined')} {joinedDate}</span>
                    </div>
                    {user?.birthday && (
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <span className="material-symbols-outlined text-base">cake</span>
                        <span>{new Date(user.birthday).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20"
                  >
                    {t('profile.editProfile')}
                  </button>
                </div>
              </header>

              {/* Account & Settings Section */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary">settings</span>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">{t('profile.settings')}</h2>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {/* Pricing Card (Mock) */}
                  <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col justify-between relative">
                    <div className="blur-[2px] opacity-60 flex flex-col h-full pointer-events-none p-6">
                      <h3 className="font-bold text-lg mb-1 text-card-foreground">{t('profile.pricing')}</h3>
                      <p className="text-muted-foreground text-sm">
                        {t('profile.pricingDesc')}
                      </p>
                    </div>
                    <div className="px-6 pb-6 mt-auto">
                      <button disabled className="w-full py-2.5 px-4 bg-muted text-muted-foreground cursor-not-allowed text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                        Coming Soon <span className="material-symbols-outlined text-sm">lock</span>
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Terms & Documents Section */}
              <section>
                <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                  <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div
                        className="w-full sm:w-32 h-32 bg-muted bg-cover bg-center rounded-lg shrink-0"
                        style={{ backgroundImage: TOS_IMG }}
                      ></div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="font-bold text-lg mb-1 text-card-foreground">{t('profile.tos')}</h3>
                        <p className="text-muted-foreground text-sm mb-4">
                          {t('profile.tosDesc')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <Link
                            href="/terms"
                            className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all mx-auto sm:mx-0"
                          >
                            {t('profile.viewDocuments')}
                            <span className="material-symbols-outlined text-sm">arrow_forward</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Simple Logout Button */}
              <div className="flex justify-end mt-8 border-t border-border/40 pt-6">
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-1.5 text-sm text-muted-foreground/60 hover:text-muted-foreground transition-colors disabled:opacity-50 px-3 py-1.5 rounded-md hover:bg-muted/30"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  {isLoggingOut ? t('common.loading') : t('profile.logout')}
                </button>
              </div>

              {/* Danger Zone Section */}
              <section className="mt-8">
                <button
                  onClick={() => setIsDangerZoneOpen(!isDangerZoneOpen)}
                  className="w-full flex items-center justify-between gap-2 p-4 bg-red-50 dark:bg-red-900/10 rounded-xl text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">warning</span>
                    <h2 className="text-xl font-bold tracking-tight text-red-600 dark:text-red-500">{t('profile.dangerZone')}</h2>
                  </div>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isDangerZoneOpen ? "rotate-180" : ""}`}>
                    expand_more
                  </span>
                </button>

                <div
                  className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${isDangerZoneOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0 mt-0"
                    }`}
                >
                  <div className="overflow-hidden">
                    <div className="bg-card rounded-xl border border-red-900/10 dark:border-red-900/30 shadow-sm">
                      <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-500 shrink-0">
                            <span className="material-symbols-outlined">delete_forever</span>
                          </div>
                          <div>
                            <h3 className="font-bold text-red-600 dark:text-red-400">{t('profile.withdraw')}</h3>
                            <p className="text-muted-foreground text-sm">{t('profile.withdrawDesc')}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsWithdrawModalOpen(true)}
                          className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20"
                        >
                          {t('profile.deleteForever')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          )}
          <footer className="max-w-4xl mx-auto mt-12 pb-8 text-center text-muted-foreground text-sm">
            <p>© 2024 Day Mode Dashboard. All rights reserved.</p>
          </footer>
        </main>
      </div>
      <MobileBottomNav />

      {/* Modals */}
      <EditProfileModal
        user={user || null}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleUpdateProfile}
        isSaving={isUpdating}
      />

      <WithdrawConfirmationModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdraw}
        isWithdrawing={isWithdrawing}
      />

      <RecoveryModal
        isOpen={isDeactivated}
        onRecover={handleReactivate}
        onLogout={handleLogout}
        isRecovering={isRecovering}
      />
    </div>
  );
}
