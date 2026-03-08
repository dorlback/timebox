"use client";

import Sidebar from "@/components/Sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { DailyPlanTracker } from "@/components/dashboard/DailyPlanTracker";
import { DashboardSearch } from "@/components/dashboard/DashboardSearch";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { AnnouncementsBoardModal } from "@/components/dashboard/AnnouncementsBoardModal";
import { InquiryModal } from "@/components/dashboard/InquiryModal";
import { useTranslation } from "@/contexts/LanguageContext";
import { useUser } from "@/hooks/useUser";
import { useState } from "react";

const AVATAR_IMG = "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtju3C_Ol36H8MSHEVmRaGPvqbKdm8zS5IVUYW1PsOEu3H_23VwqeQ2wii9kysrpmALEFdCSNzwAYUSC1A0OZ3D8GNGrzULFMqQKsbyEJQT3_MSjG0SJ-gd5OPli2ndmMnCynLM4Cq0sF5QtN0uuA2hafU0McIESxVyt3C26SggpzVGpW0YrItW44b1fN879wavE2-A2ATfH00fqFZ0RpRx_YDQ-CPPvwXsGtjZ9-DnQtXtyp-OtoFLFIiiltviSXCou4jMBlQvpg')";

export default function Dashboard() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [isBoardOpen, setIsBoardOpen] = useState(false);
  const [isInquiryOpen, setIsInquiryOpen] = useState(false);
  const [selectedAnnId, setSelectedAnnId] = useState<string | undefined>(undefined);

  const handleOpenBoard = (id?: string) => {
    setSelectedAnnId(id);
    setIsBoardOpen(true);
  };

  return (
    <div
      className="bg-background text-foreground min-h-screen antialiased transition-colors"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Shared Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full pb-20 md:pb-0">
          {/* Header */}
          <header className="h-14 md:h-20 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 sm:px-8 sticky top-0 z-40 transition-colors">
            <div className="flex items-center gap-4">
              <h2 className="text-lg md:text-xl font-bold text-card-foreground">{t('sidebar.dashboard')}</h2>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] md:text-[10px] font-bold rounded uppercase tracking-widest hidden sm:inline-block">Live</span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <DashboardSearch />

              <div className="flex items-center gap-2">
                <NotificationBell onViewAll={handleOpenBoard} />
                <button
                  onClick={() => setIsInquiryOpen(true)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined">chat_bubble</span>
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Heatmap Tracker (Daily Plan Tracker) */}
            <DailyPlanTracker />

            <h2 className="text-xl font-bold px-1 text-foreground mt-8 mb-4">Premium Features</h2>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Routine Management Card */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm transition-all flex flex-col h-full relative group">
                <div className="blur-[2px] opacity-60 flex flex-col h-full pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 shrink-0">
                    <span className="material-symbols-outlined">event_repeat</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-card-foreground">Routine Management</h4>
                  <p className="text-sm text-muted-foreground mb-6 flex-1">Build lasting habits with recurring daily workflows and progress tracking.</p>

                  <div className="space-y-4 mb-6 shrink-0">
                    <div>
                      <div className="flex items-center justify-between text-xs font-medium mb-1 text-foreground/80">
                        <span>Morning Routine</span>
                        <span className="text-primary font-bold">80%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '80%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-medium mb-1 text-foreground/80">
                        <span>Deep Work Block</span>
                        <span className="text-primary font-bold">45%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 relative z-10">
                  <button disabled className="w-full py-2.5 px-4 bg-muted text-muted-foreground cursor-not-allowed text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                    Coming Soon <span className="material-symbols-outlined text-sm">lock</span>
                  </button>
                </div>
              </div>

              {/* Mandalart Goal Card */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm transition-all flex flex-col h-full relative group">
                <div className="blur-[2px] opacity-60 flex flex-col h-full pointer-events-none">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 shrink-0">
                    <span className="material-symbols-outlined">grid_view</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-card-foreground">Mandalart Goal</h4>
                  <p className="text-sm text-muted-foreground mb-6 flex-1">Visualize your core objectives through a 3x3 strategic expansion grid.</p>

                  <div className="grid grid-cols-3 gap-1.5 mb-6 max-w-[180px] mx-auto w-full shrink-0">
                    <div className="aspect-square bg-muted rounded-md"></div>
                    <div className="aspect-square bg-muted rounded-md"></div>
                    <div className="aspect-square bg-muted rounded-md"></div>
                    <div className="aspect-square bg-muted rounded-md"></div>
                    <div className="aspect-square bg-primary/20 rounded-md flex items-center justify-center text-[10px] sm:text-xs font-bold text-primary">CORE</div>
                    <div className="aspect-square bg-muted rounded-md"></div>
                    <div className="aspect-square bg-muted rounded-md"></div>
                    <div className="aspect-square bg-muted rounded-md"></div>
                    <div className="aspect-square bg-muted rounded-md"></div>
                  </div>
                </div>

                <div className="mt-auto pt-4 relative z-10">
                  <button disabled className="w-full py-2.5 px-4 bg-muted text-muted-foreground cursor-not-allowed text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                    Coming Soon <span className="material-symbols-outlined text-sm">lock</span>
                  </button>
                </div>
              </div>

              {/* AI Coach Chatbot Card */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm transition-all flex flex-col h-full relative group overflow-hidden">
                <div className="blur-[2px] opacity-60 flex flex-col h-full pointer-events-none relative">
                  <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                  <div className="w-12 h-12 rounded-xl bg-primary/20 text-primary flex items-center justify-center mb-6 shrink-0 relative z-10">
                    <span className="material-symbols-outlined">smart_toy</span>
                  </div>
                  <h4 className="text-lg font-bold mb-2 text-card-foreground relative z-10">AI Coach Chatbot</h4>
                  <p className="text-sm text-muted-foreground mb-6 flex-1 relative z-10">Real-time productivity coaching and intelligent task prioritization.</p>

                  <div className="bg-muted/30 rounded-xl p-3 mb-6 shrink-0 relative z-10 border border-border/50">
                    <div className="flex gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[14px] text-primary">smart_toy</span>
                      </div>
                      <div className="bg-card border border-border rounded-lg rounded-tl-none p-2 text-[11px] sm:text-xs shadow-sm text-foreground">
                        Hi Alex! Ready to crush your goals today?
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-4 relative z-10">
                  <button disabled className="w-full py-2.5 px-4 bg-muted text-muted-foreground cursor-not-allowed text-sm font-bold rounded-xl flex items-center justify-center gap-2">
                    Coming Soon <span className="material-symbols-outlined text-sm">lock</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
      <MobileBottomNav />

      {/* Global Modals */}
      <AnnouncementsBoardModal
        isOpen={isBoardOpen}
        onClose={() => setIsBoardOpen(false)}
        initialAnnouncementId={selectedAnnId}
      />

      <InquiryModal
        isOpen={isInquiryOpen}
        onClose={() => setIsInquiryOpen(false)}
        userName={user?.displayName}
        userEmail={user?.email}
      />
    </div >
  );
}
