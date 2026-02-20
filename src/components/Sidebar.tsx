"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import DarkModeToggle from "@/components/DarkModeToggle";

interface SidebarProps {
  userName?: string;
  userType?: string;
  userAvatar?: string;
  planName?: string;
  defaultExpanded?: boolean;
}

export default function Sidebar({
  userName = "Alex Johnson",
  userType = "Pro Member",
  userAvatar = "https://lh3.googleusercontent.com/aida-public/AB6AXuDtju3C_Ol36H8MSHEVmRaGPvqbKdm8zS5IVUYW1PsOEu3H_23VwqeQ2wii9kysrpmALEFdCSNzwAYUSC1A0OZ3D8GNGrzULFMqQKsbyEJQT3_MSjG0SJ-gd5OPli2ndmMnCynLM4Cq0sF5QtN0uuA2hafU0McIESxVyt3C26SggpzVGpW0YrItW44b1fN879wavE2-A2ATfH00fqFZ0RpRx_YDQ-CPPvwXsGtjZ9-DnQtXtyp-OtoFLFIiiltviSXCou4jMBlQvpg",
  planName = "Premium Plan",
  defaultExpanded = true
}: SidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const navItems = [
    { name: "Dash", href: "/dashboard", icon: "dashboard" },
    { name: "Profile", href: "/mypage", icon: "person" },
    { name: "Planner", href: "/timebox", icon: "calendar_today" },
  ];

  return (
    <aside
      className={`bg-card border-r border-border hidden md:flex flex-col shrink-0 z-50 transition-all duration-300 ease-in-out relative ${isExpanded ? "w-64" : "w-16"
        }`}
    >
      {/* Toggle Expand/Collapse Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-7 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary shadow-sm z-50 transition-colors"
        aria-label={isExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
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
          <h1 className="text-lg font-bold leading-tight tracking-tight text-card-foreground">Productivity Pro</h1>
          <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">{planName}</p>
        </div>
      </div>

      <nav className={`flex-1 overflow-y-auto space-y-2 py-4 ${isExpanded ? "px-4" : "px-3"}`}>
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

      <div className={`p-4 mt-auto border-t border-border flex flex-col gap-4 ${!isExpanded ? "items-center px-2" : ""}`}>

        {/* User Profile Section */}
        <div className={`rounded-xl flex items-center gap-3 ${isExpanded ? "bg-muted/30 p-4" : "p-2 bg-transparent justify-center"}`}>
          <div
            className="w-10 h-10 rounded-full bg-cover bg-center border-2 border-background shrink-0 shadow-sm"
            style={{ backgroundImage: `url('${userAvatar}')` }}
            title={!isExpanded ? userName : undefined}
          />
          <div className={`flex-1 min-w-0 transition-all duration-300 whitespace-nowrap overflow-hidden ${isExpanded ? "opacity-100 max-w-full block" : "opacity-0 max-w-0 hidden"}`}>
            <p className="text-sm font-bold truncate text-card-foreground">{userName}</p>
            <p className="text-xs text-muted-foreground truncate">{userType}</p>
          </div>
          {isExpanded && (
            <button className="text-muted-foreground hover:text-primary transition-colors shrink-0">
              <span className="material-symbols-outlined text-[20px]">settings</span>
            </button>
          )}
        </div>

        {/* Global Dark Mode Toggle */}
        <div className={`flex ${isExpanded ? "justify-center" : "justify-center w-full"}`}>
          <DarkModeToggle />
        </div>
      </div>
    </aside >
  );
}
