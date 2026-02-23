'use client';

import Link from "next/link";
import { User } from "@/types/user";
import DarkModeToggle from "./DarkModeToggle";

interface NavBarProps {
  user: User | null;
}

export default function NavBar({ user }: NavBarProps) {
  return (
    <nav className="w-full px-6 py-4 flex justify-between items-center bg-background border-b border-border transition-colors" role="navigation" aria-label="메인 네비게이션">
      <Link
        href="/"
        className="focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded transition-all"
      >
        <h1 className="text-sm font-bold tracking-tight text-muted-foreground uppercase">
          Daily <span className="text-foreground">Time Box</span>
        </h1>
      </Link>

      <div className="flex items-center gap-3">
        <DarkModeToggle />
        {user ? (
          <Link href="/mypage" >
            <span className="text-sm text-muted-foreground">{user.email}</span>
          </Link>
        ) : (
          <Link href="/login" className="text-sm text-primary hover:text-blue-700 dark:hover:text-blue-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded transition-all">
            로그인
          </Link>
        )}
      </div>
    </nav>
  );
}