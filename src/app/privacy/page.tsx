'use client';

import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';

export default function PrivacyPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/mypage"
            className="inline-flex items-center gap-2 text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg font-medium transition-all"
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            {t('legal.backToMyPage')}
          </Link>
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest sm:block hidden">
            {t('legal.title')}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col md:flex-row gap-8 p-4 sm:p-6 lg:p-8 pb-32 md:pb-8">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-24 space-y-2">
            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-4 mb-4">{t('legal.documentList')}</h3>
            <Link
              href="/terms"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-muted font-medium transition-all border border-transparent"
            >
              <span className="material-symbols-outlined">description</span>
              {t('legal.terms')}
            </Link>
            <Link
              href="/privacy"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-bold transition-all border border-primary/20 shadow-sm"
            >
              <span className="material-symbols-outlined">shield_lock</span>
              {t('legal.privacy')}
            </Link>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <article className="prose prose-neutral dark:prose-invert max-w-none bg-card p-6 sm:p-12 rounded-2xl border border-border shadow-sm">
            <h1 className="text-2xl sm:text-3xl font-bold mb-8 text-card-foreground">{t('legal.privacyPolicy.title')}</h1>

            <div className="space-y-12">
              <section className="font-serif leading-relaxed space-y-4 text-muted-foreground">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">01</span>
                  {t('legal.privacyPolicy.s1.title')}
                </h2>
                <p>{t('legal.privacyPolicy.s1.c1')}</p>
                <p>{t('legal.privacyPolicy.s1.c2')}</p>
              </section>

              <section className="font-serif leading-relaxed space-y-4 text-muted-foreground">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">02</span>
                  {t('legal.privacyPolicy.s2.title')}
                </h2>
                <p>{t('legal.privacyPolicy.s2.c1')}</p>

                <div className="bg-muted/50 p-4 rounded-xl space-y-2">
                  <p><strong>{t('legal.privacyPolicy.s2.sub1')}</strong></p>
                  <ul className="list-disc ml-5 space-y-1">
                    <li>{t('legal.privacyPolicy.s2.i1')}</li>
                    <li>{t('legal.privacyPolicy.s2.i2')}</li>
                    <li>{t('legal.privacyPolicy.s2.i3')}</li>
                  </ul>
                </div>

                <p>{t('legal.privacyPolicy.s2.c2')}</p>
              </section>

              <section className="font-serif leading-relaxed space-y-4 text-muted-foreground">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">03</span>
                  {t('legal.privacyPolicy.s3.title')}
                </h2>
                <p>{t('legal.privacyPolicy.s3.c1')}</p>
                <ul className="list-disc ml-5 space-y-2">
                  <li>{t('legal.privacyPolicy.s3.i1')}</li>
                  <li>{t('legal.privacyPolicy.s3.i2')}</li>
                  <li>{t('legal.privacyPolicy.s3.i3')}</li>
                </ul>
              </section>

              <section className="font-serif leading-relaxed space-y-4 text-muted-foreground">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">04</span>
                  {t('legal.privacyPolicy.s4.title')}
                </h2>
                <p>{t('legal.privacyPolicy.s4.c1')}</p>
                <p>{t('legal.privacyPolicy.s4.c2')}</p>
              </section>

              <section className="font-serif leading-relaxed space-y-4 text-muted-foreground">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">05</span>
                  {t('legal.privacyPolicy.s5.title')}
                </h2>
                <p>{t('legal.privacyPolicy.s5.c1')}</p>
                <p>{t('legal.privacyPolicy.s5.c2')}</p>
              </section>

              <section className="font-serif leading-relaxed space-y-4 text-muted-foreground">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">06</span>
                  {t('legal.privacyPolicy.s6.title')}
                </h2>
                <p>{t('legal.privacyPolicy.s6.c1')}</p>
              </section>

              <section className="font-serif leading-relaxed space-y-4 text-muted-foreground">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">07</span>
                  {t('legal.privacyPolicy.s7.title')}
                </h2>
                <ul className="list-disc ml-5 space-y-2">
                  <li>{t('legal.privacyPolicy.s7.i1')}</li>
                  <li>{t('legal.privacyPolicy.s7.i2')}</li>
                </ul>
              </section>

              <section className="font-serif leading-relaxed space-y-4 text-muted-foreground">
                <h2 className="text-xl font-bold text-card-foreground flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm">08</span>
                  {t('legal.privacyPolicy.s8.title')}
                </h2>
                <p>{t('legal.privacyPolicy.s8.c1')}</p>
                <p>{t('legal.privacyPolicy.s8.c2')}</p>
              </section>
            </div>
          </article>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background/90 backdrop-blur-lg border-t border-border z-40 pb-safe">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/terms"
            className="flex flex-col items-center justify-center flex-1 gap-1 text-muted-foreground"
          >
            <span className="material-symbols-outlined text-xl">description</span>
            <span className="text-[10px] font-medium">{t('legal.terms')}</span>
          </Link>
          <Link
            href="/privacy"
            className="flex flex-col items-center justify-center flex-1 gap-1 text-primary"
          >
            <span className="material-symbols-outlined text-xl">shield_lock</span>
            <span className="text-[10px] font-bold">{t('legal.privacy')}</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
