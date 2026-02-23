'use client';

import React from 'react';

export function MyPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-pulse">
      {/* Profile Header Skeleton */}
      <header className="bg-card rounded-xl p-4 md:p-8 border border-border flex flex-col md:flex-row items-center gap-4 md:gap-8 shadow-sm">
        <div className="w-32 h-32 rounded-full bg-muted shrink-0"></div>
        <div className="flex-1 w-full space-y-4">
          <div className="flex flex-col md:flex-row items-center gap-3">
            <div className="h-8 w-48 bg-muted rounded-lg"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 w-full max-w-md bg-muted rounded"></div>
            <div className="h-4 w-3/4 max-w-md bg-muted rounded"></div>
          </div>
          <div className="flex justify-center md:justify-start gap-4 pt-2">
            <div className="h-4 w-24 bg-muted rounded"></div>
            <div className="h-4 w-24 bg-muted rounded"></div>
          </div>
        </div>
        <div className="w-full md:w-32 h-10 bg-muted rounded-lg mt-4 md:mt-0"></div>
      </header>

      {/* Account & Settings Skeleton */}
      <section>
        <div className="h-6 w-32 bg-muted rounded mb-4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl border border-border p-6 h-48 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-muted rounded-lg"></div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded"></div>
                <div className="h-3 w-32 bg-muted rounded"></div>
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <div className="h-10 w-full bg-muted rounded-lg"></div>
              <div className="h-10 w-full bg-muted rounded-lg"></div>
            </div>
          </div>
          <div className="bg-card rounded-xl border border-border p-6 h-48 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-5 w-24 bg-muted rounded"></div>
              <div className="space-y-2">
                <div className="h-3 w-full bg-muted rounded"></div>
                <div className="h-3 w-2/3 bg-muted rounded"></div>
              </div>
            </div>
            <div className="h-4 w-32 bg-muted rounded"></div>
          </div>
        </div>
      </section>

      {/* Danger Zone Skeleton */}
      <section>
        <div className="h-6 w-32 bg-muted rounded mb-4 mt-8"></div>
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="p-6 h-24 border-b border-border bg-muted/10"></div>
          <div className="p-6 h-24 bg-muted/5"></div>
        </div>
      </section>
    </div>
  );
}
