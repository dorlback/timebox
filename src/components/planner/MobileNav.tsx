'use client';

import Link from "next/link";
import DarkModeToggle from "@/components/DarkModeToggle";

interface MobileNavProps {
  onSave: () => void;
}

export function MobileNav({ onSave }: MobileNavProps) {
  return (
    <nav className="sticky top-0 z-50 w-full px-4 py-3 bg-card/95 backdrop-blur-md border-b border-border shadow-ios transition-colors md:hidden">
      <div className="flex items-center justify-between">
        <Link href="/" className="focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded transition-all">
          <h1 className="text-xs font-bold tracking-tight text-muted-foreground uppercase">
            Daily <span className="text-foreground">Time Box</span>
          </h1>
        </Link>

        <div className="flex items-center gap-2">
          <DarkModeToggle />
          <button
            onClick={onSave}
            className="flex items-center gap-1.5 bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-4 py-2 rounded-full transition-all shadow-ios active:scale-95"
            aria-label="저장"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            저장
          </button>
        </div>
      </div>
    </nav>
  );
}
