import React from "react";
import Sidebar from "@/components/Sidebar";
import DarkModeToggle from "@/components/DarkModeToggle";
import { MobileBottomNav } from "@/components/MobileBottomNav";

// Static constants extracted outside of the component to prevent recreation on every render (Vercel best practice)
const HEATMAP_VALUES = [
  20, 40, 60, 90, 30, 70, 50, 80, 10, 100, 60, 40, 70, 20, 90,
  50, 80, 60, 40, 70, 30, 90, 60, 40, 80, 10, 70, 100, 50, 80
];
const AVATAR_IMG = "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDtju3C_Ol36H8MSHEVmRaGPvqbKdm8zS5IVUYW1PsOEu3H_23VwqeQ2wii9kysrpmALEFdCSNzwAYUSC1A0OZ3D8GNGrzULFMqQKsbyEJQT3_MSjG0SJ-gd5OPli2ndmMnCynLM4Cq0sF5QtN0uuA2hafU0McIESxVyt3C26SggpzVGpW0YrItW44b1fN879wavE2-A2ATfH00fqFZ0RpRx_YDQ-CPPvwXsGtjZ9-DnQtXtyp-OtoFLFIiiltviSXCou4jMBlQvpg')";

export default function Dashboard() {
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
              <h2 className="text-lg md:text-xl font-bold text-card-foreground">Dashboard</h2>
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[9px] md:text-[10px] font-bold rounded uppercase tracking-widest hidden sm:inline-block">Live</span>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative max-w-md hidden md:block">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xl">search</span>
                <input
                  className="w-64 pl-10 pr-4 py-2 bg-muted text-foreground border-transparent rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-transparent transition-all placeholder:text-muted-foreground"
                  placeholder="Search tasks, goals..."
                  type="text"
                />
              </div>

              <div className="flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">notifications</span>
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-muted text-muted-foreground hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">chat_bubble</span>
                </button>
              </div>
            </div>
          </header>

          <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
            {/* Heatmap Tracker (Daily Plan Tracker) */}
            <section className="bg-card p-6 rounded-2xl border border-border shadow-sm transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                <div>
                  <h3 className="text-lg font-bold mb-1 text-card-foreground">Daily Plan Tracker</h3>
                  <p className="text-sm text-muted-foreground">Consistency score over the last 30 days</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl font-bold text-primary">85% Average</div>
                  <div className="text-sm text-green-600 dark:text-green-400 font-medium flex items-center sm:justify-end gap-1">
                    <span className="material-symbols-outlined text-sm">trending_up</span>
                    +12% from last month
                  </div>
                </div>
              </div>

              {/* Horizontal 30-day Heatmap Grid */}
              <div className="w-full overflow-x-auto pb-2">
                <div className="grid grid-cols-10 md:grid-cols-15 lg:grid-cols-30 gap-2 mb-4 min-w-[600px]">
                  {HEATMAP_VALUES.map((val, idx) => (
                    <div
                      key={idx}
                      className="aspect-square rounded-md hover:ring-2 ring-primary transition-all cursor-help"
                      style={{ backgroundColor: `rgba(59, 130, 246, ${val / 100})` }}
                      title={`Day ${idx + 1}: ${val}%`}
                    ></div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-2 text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-4">
                  <span>Less productive</span>
                  <div className="flex gap-1">
                    <div className="w-3 h-3 bg-primary/10 rounded-sm"></div>
                    <div className="w-3 h-3 bg-primary/40 rounded-sm"></div>
                    <div className="w-3 h-3 bg-primary/70 rounded-sm"></div>
                    <div className="w-3 h-3 bg-primary rounded-sm"></div>
                  </div>
                  <span>More productive</span>
                </div>
              </div>
            </section>

            <h2 className="text-xl font-bold px-1 text-foreground mt-8 mb-4">Premium Features</h2>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* Routine Management Card */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shrink-0">
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

                <button className="w-full py-2.5 px-4 bg-muted/50 hover:bg-primary/10 text-foreground hover:text-primary transition-colors text-sm font-bold rounded-xl flex items-center justify-center gap-2 mt-auto">
                  Manage Routines <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* Mandalart Goal Card */}
              <div className="bg-card p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shrink-0">
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

                <button className="w-full py-2.5 px-4 bg-muted/50 hover:bg-primary/10 text-foreground hover:text-primary transition-colors text-sm font-bold rounded-xl flex items-center justify-center gap-2 mt-auto">
                  Open Mandalart <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
              </div>

              {/* AI Coach Chatbot Card */}
              <div className="bg-card p-6 rounded-2xl border-2 border-primary/20 shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full relative overflow-hidden">
                {/* decorative background element */}
                <div className="absolute -right-12 -top-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>

                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-primary/30 shrink-0 relative z-10">
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
                  <div className="flex gap-2 justify-end">
                    <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-2 text-[11px] sm:text-xs shadow-sm">
                      Let's focus on deep work.
                    </div>
                    <div
                      className="w-6 h-6 rounded-full bg-cover bg-center flex-shrink-0 border bg-background shrink-0"
                      style={{ backgroundImage: AVATAR_IMG }}
                    ></div>
                  </div>
                </div>

                <button className="w-full py-2.5 px-4 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-bold rounded-xl flex items-center justify-center gap-2 mt-auto shadow-md shadow-primary/20 relative z-10">
                  Start Conversation <span className="material-symbols-outlined text-sm">chat</span>
                </button>
              </div>

            </div>
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div >
  );
}
