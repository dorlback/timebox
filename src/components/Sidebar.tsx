"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DarkModeToggle from "@/components/DarkModeToggle";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "@/contexts/LanguageContext";

interface SidebarProps {
  defaultExpanded?: boolean;
}

export default function Sidebar({
  defaultExpanded = true
}: SidebarProps) {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { user, isLoading: isUserLoading } = useUser();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const navItems = [
    { name: t('sidebar.planner'), href: "/timebox", icon: "calendar_today" },
    { name: t('sidebar.dashboard'), href: "/dashboard", icon: "dashboard" },
    { name: t('sidebar.profile'), href: "/mypage", icon: "person" },
  ];

  const userName = user?.displayName || t('common.anonymous');
  const userType = user?.isAdmin ? t('common.admin') : t('common.proMember');
  const userAvatar = user?.avatarUrl || "";

  return (
    <aside
      className={`bg-card border-r border-border hidden md:flex flex-col shrink-0 z-50 transition-all duration-300 ease-in-out relative ${isExpanded ? "w-64" : "w-16"
        }`}
    >
      {/* Toggle Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-7 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary shadow-sm z-50 transition-colors"
        aria-label={isExpanded ? t('sidebar.collapse') : t('sidebar.expand')}
      >
        <span className="material-symbols-outlined text-[14px]">
          {isExpanded ? "chevron_left" : "chevron_right"}
        </span>
      </button>

      <div className={`p-6 flex items-center ${isExpanded ? "gap-3" : "justify-center px-0"} overflow-hidden h-20 shrink-0`}>
        <div className="bg-primary w-10 h-10 rounded-lg flex items-center justify-center text-primary-foreground shrink-0 shadow-sm">
          <span className="material-symbols-outlined">bolt</span>
        </div>

        <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? "opacity-100 max-w-full block" : "opacity-0 max-w-0 hidden"}`}>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-card-foreground">TimeBox</h1>
          {/* <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{t('common.premium')}</p> */}
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto space-y-2 py-4 ${isExpanded ? "px-4" : "px-2"}`}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              title={!isExpanded ? item.name : undefined}
              className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${isActive
                ? "bg-primary/10 text-primary border-transparent"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border-transparent"
                } ${!isExpanded ? "justify-center" : ""}`}
            >
              <span className={`material-symbols-outlined ${isActive && !isExpanded ? "scale-110" : ""} transition-transform`}>{item.icon}</span>
              <span className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? "opacity-100 max-w-[150px] block" : "opacity-0 max-w-0 hidden"
                }`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={`p-4 mt-auto border-t border-border flex flex-col gap-4 ${!isExpanded ? "items-center px-1" : ""}`}>

        <Link href="/mypage" className="relative block group">
          <div className={`rounded-xl flex items-center gap-3 transition-colors ${isExpanded ? "bg-muted/30 p-3 group-hover:bg-muted/50" : "p-1 bg-transparent justify-center group-hover:bg-muted/30"}`}>
            <div
              className={`w-10 h-10 rounded-full bg-cover bg-center border-2 border-background shrink-0 shadow-sm ${isUserLoading ? 'animate-pulse bg-muted' : ''}`}
              style={userAvatar ? { backgroundImage: `url('${userAvatar}')` } : {}}
              title={!isExpanded ? userName : undefined}
            />
            <div className={`flex-1 min-w-0 transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? "opacity-100 max-w-full block" : "opacity-0 max-w-0 hidden"}`}>
              <p className="text-sm font-bold truncate text-card-foreground">{isUserLoading ? t('common.loading') : userName}</p>
              {/* <p className="text-[10px] text-muted-foreground truncate font-medium">{userType}</p> */}
            </div>
          </div>
        </Link>

        {/* Global Dark Mode Toggle */}
        <div className={`flex ${isExpanded ? "justify-center" : "justify-center w-full"}`}>
          <DarkModeToggle />
        </div>
      </div>
    </aside >
  );
}
