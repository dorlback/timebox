import React from "react";
import Sidebar from "@/components/Sidebar";

// Centralizing static resources outside of component scope
const AVATAR_LARGE = `url('https://lh3.googleusercontent.com/aida-public/AB6AXuDxkF_Bq35f1zHlWJhQxWgoiHACz4Z5yY8lS-W63w0Y4_EQmfBqInU3OoRE3jggnm9TzJVxWyitSPgiJF6AsWrvkw4e4FibGF2nPsHKo88m-dg_L3Rgvw6Gv0kdrLHMV6KunLF5VJkmVdyLvLtJtqa5ryxKa18rveI_jt9c6X_rSQbdmrtMMUm9lRdIYv1JAbh0S8KXBBYMI9Lp8uQPlmoKz-xXQ_VEsAyB6nflQMaLR1dMgHqkhBwZ6uBIUZ6g6fY4U1R6x8OmVhE')`;
const PRICING_IMG = `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBrOsvVD__AInquK5Tjo0F6W4xVIhQBwmDSxfDBpRjZ4yzcuhJr7P6Jg9qVHcYbmt9NiW1LwsNbBOEGUeVaJdz3C_EUwrI1D9J8FjxEejb_jRtjqTmIYaML4xe8jCqUw6oacd0ecDJzjctn1WiF1Kq3_ulpGg9V30I0XSNTde4_Y57a1wz3280bLlkmprxdCXA-9n-RYSYajfsigRCHlECCcWimT2tlbgZ_1aBZnBAD9mLl_LtMO9s5tiCMmTAqPNlSE6eAfow53zI')`;
const TOS_IMG = `url('https://lh3.googleusercontent.com/aida-public/AB6AXuBbnKYjzZk2YSbN-jYwsYhPFdeggjANvMe_juZoF_urhfkX1oHp71BSvjyjALn_AlMLFEGYRhMeIwYZnSUZqsYr7LMhLB8OsP9O9H-Rd0q5cGqj2OZjKlYUy1z4Nkl1Tl-xEIvxOsJHNIzBnynAST4fn92kLTJ7ZvaluOW7o-Dbot8RLi-bsXR4Ft43lwyKtXtLc45r09qAQ-EqGX5tsHDmholRB2aXbEsxWgX05o6paK7FsYAZXWC3t-tr-TqSZoBDVb-Sxoi7x8I')`;

export default function MyPage() {
  return (
    <div
      className="bg-background text-foreground min-h-screen antialiased transition-colors"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <div className="flex h-screen overflow-hidden">
        {/* Shared Sidebar Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto w-full p-4 sm:p-8 lg:p-12">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Profile Header */}
            <header className="bg-card rounded-xl p-6 sm:p-8 border border-border flex flex-col md:flex-row items-center gap-6 sm:gap-8 shadow-sm transition-colors">
              <div className="relative shrink-0">
                <div
                  className="w-32 h-32 rounded-full bg-muted bg-cover bg-center border-4 border-background shadow-md"
                  style={{ backgroundImage: AVATAR_LARGE }}
                ></div>
                <button className="absolute bottom-1 right-1 bg-primary text-primary-foreground p-2 rounded-full shadow-lg border-2 border-background hover:scale-105 transition-transform flex items-center justify-center">
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-card-foreground">Alex Johnson</h1>
                  <span className="px-3 py-1 bg-primary/10 text-primary text-xs sm:text-sm font-bold rounded-full uppercase tracking-wider">
                    Pro Member
                  </span>
                </div>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto md:mx-0">
                  Product Designer based in San Francisco. Passionate about creating clean interfaces and user experiences.
                </p>
                <div className="mt-4 flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <span className="material-symbols-outlined text-base">location_on</span>
                    <span>San Francisco, CA</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                    <span className="material-symbols-outlined text-base">calendar_month</span>
                    <span>Joined January 2023</span>
                  </div>
                </div>
              </div>
              <div className="shrink-0 w-full md:w-auto mt-4 md:mt-0">
                <button className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-md shadow-primary/20">
                  Edit Profile
                </button>
              </div>
            </header>

            {/* Account & Billing Section */}
            <section>
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-primary">payments</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Account & Billing</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pricing Card */}
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
                  <div
                    className="h-32 bg-muted bg-cover bg-center"
                    style={{ backgroundImage: PRICING_IMG }}
                  ></div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-1 text-card-foreground">Pricing</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Manage your subscription, view invoices, and change payment methods.
                    </p>
                    <button className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                      Manage Subscription
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>

                {/* Terms of Service Card */}
                <div className="bg-card rounded-xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div
                    className="h-32 bg-muted bg-cover bg-center"
                    style={{ backgroundImage: TOS_IMG }}
                  ></div>
                  <div className="p-6">
                    <h3 className="font-bold text-lg mb-1 text-card-foreground">Terms of Service</h3>
                    <p className="text-muted-foreground text-sm mb-4">
                      Read our legal guidelines, privacy policy, and user agreement documentation.
                    </p>
                    <button className="flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                      View Documents
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Danger Zone Section */}
            <section>
              <div className="flex items-center gap-2 mb-4 mt-8">
                <span className="material-symbols-outlined text-red-500">warning</span>
                <h2 className="text-xl font-bold tracking-tight text-foreground">Danger Zone</h2>
              </div>
              <div className="bg-card rounded-xl border border-red-900/10 dark:border-red-900/30 overflow-hidden shadow-sm">
                <div className="divide-y divide-border">
                  {/* Logout */}
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-muted p-2 rounded-lg text-muted-foreground shrink-0">
                        <span className="material-symbols-outlined">logout</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-foreground">Logout</h3>
                        <p className="text-muted-foreground text-sm">Safely sign out of your account on this device.</p>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto px-4 py-2 text-foreground font-semibold hover:bg-muted rounded-lg transition-colors border border-border sm:border-transparent">
                      Sign Out
                    </button>
                  </div>

                  {/* Delete Account */}
                  <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-lg text-red-500 shrink-0">
                        <span className="material-symbols-outlined">delete_forever</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-red-600 dark:text-red-400">Delete Account</h3>
                        <p className="text-muted-foreground text-sm">Permanently delete your data and cancel subscription.</p>
                      </div>
                    </div>
                    <button className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white font-semibold hover:bg-red-600 rounded-lg transition-colors shadow-sm shadow-red-500/20">
                      Delete Forever
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>
          <footer className="max-w-4xl mx-auto mt-12 pb-8 text-center text-muted-foreground text-sm">
            <p>© 2024 Day Mode Dashboard. All rights reserved.</p>
          </footer>
        </main>
      </div>
    </div>
  );
}
