"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { useTranslation } from "@/contexts/LanguageContext";
import { useDarkMode } from "@/hooks/useDarkMode";
import { Locale, LANGUAGE_NAMES } from "@/types/i18n";

interface SidebarProps {
  defaultExpanded?: boolean;
}

export default function Sidebar({
  defaultExpanded = true
}: SidebarProps) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation();
  const { user, isLoading: isUserLoading } = useUser();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const { isDark, toggleDark, mounted } = useDarkMode();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        <div className="w-10 h-10 flex items-center justify-center shrink-0">
          <img src="/logo.png" alt="Logo" className="w-full h-full object-contain border border-border rounded-xl" />
        </div>

        <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? "opacity-100 max-w-full block" : "opacity-0 max-w-0 hidden"}`}>
          <h1 className="text-lg font-bold leading-tight tracking-tight text-card-foreground">TimeBox</h1>
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
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full rounded-xl flex items-center gap-3 transition-colors ${isExpanded ? "bg-muted/30 p-3 hover:bg-muted/50" : "p-1 bg-transparent justify-center hover:bg-muted/30"}`}
            title={!isExpanded ? userName : undefined}
          >
            <div
              className={`w-10 h-10 rounded-full bg-cover bg-center border-2 border-background shrink-0 shadow-sm ${isUserLoading ? 'animate-pulse bg-muted' : ''}`}
              style={userAvatar ? { backgroundImage: `url('${userAvatar}')` } : {}}
            />
            <div className={`flex-1 min-w-0 transition-all duration-300 whitespace-nowrap overflow-hidden text-left ${isExpanded ? "opacity-100 max-w-full block" : "opacity-0 max-w-0 hidden"}`}>
              <p className="text-sm font-bold truncate text-card-foreground">{isUserLoading ? t('common.loading') : userName}</p>
            </div>
            {isExpanded && <span className="material-symbols-outlined text-muted-foreground">more_vert</span>}
          </button>

          {isUserMenuOpen && (
            <div className={`absolute bottom-full left-0 mb-2 ${isExpanded ? 'w-56' : 'w-48'} bg-card border border-border rounded-xl shadow-lg overflow-visible z-50 py-2`}>
              <Link href="/mypage" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                <span className="material-symbols-outlined text-[18px]">person</span>
                {t('sidebar.profile') || 'My Page'}
              </Link>

              {/* Theme Submenu Trigger */}
              <div
                className="relative group w-full"
                onMouseEnter={() => setIsThemeMenuOpen(true)}
                onMouseLeave={() => setIsThemeMenuOpen(false)}
              >
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px]">palette</span>
                    <span>{t('common.theme') || '테마'}</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                {/* Theme Submenu */}
                {isThemeMenuOpen && (
                  <div className="absolute top-0 left-full py-1 w-40 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    <button
                      onClick={() => {
                        if (mounted && isDark) toggleDark();
                        setIsUserMenuOpen(false);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${mounted && !isDark ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted/50'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">light_mode</span>
                        <span>{t('theme.lightText') || '데이 모드'}</span>
                      </div>
                      {mounted && !isDark && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </button>
                    <button
                      onClick={() => {
                        if (mounted && !isDark) toggleDark();
                        setIsUserMenuOpen(false);
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${mounted && isDark ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted/50'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[14px]">dark_mode</span>
                        <span>{t('theme.darkText') || '다크 모드'}</span>
                      </div>
                      {mounted && isDark && <span className="material-symbols-outlined text-[14px]">check</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Language Submenu Trigger */}
              <div
                className="relative group w-full"
                onMouseEnter={() => setIsLangMenuOpen(true)}
                onMouseLeave={() => setIsLangMenuOpen(false)}
              >
                <button className="w-full flex items-center justify-between px-4 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[18px]">language</span>
                    <span>{t('profile.language') || 'Language'}</span>
                  </div>
                  <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                </button>

                {/* Submenu */}
                {isLangMenuOpen && (
                  <div className="absolute bottom-0 left-full py-1 w-40 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50">
                    {(Object.keys(LANGUAGE_NAMES) as Locale[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setLocale(lang);
                          setIsUserMenuOpen(false);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${locale === lang ? 'text-primary bg-primary/5' : 'text-foreground hover:bg-muted/50'
                          }`}
                      >
                        {LANGUAGE_NAMES[lang]}
                        {locale === lang && <span className="material-symbols-outlined text-[14px]">check</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
