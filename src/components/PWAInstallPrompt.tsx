'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Share } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Service Worker Registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('SW registered'))
        .catch((err) => console.log('SW register error', err));
    }

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
      return;
    }

    // Show FAB by default on mobile/tablet or for testing
    setIsVisible(true);

    // iOS detection
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) return; // iOS uses manual instructions

    if (!deferredPrompt) {
      // If we don't have the prompt yet, show alert or instructions for manual install
      alert('브라우저 메뉴의 "설치" 또는 "앱 설치" 버튼을 직접 눌러주세요.');
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsVisible(false);
        setShowInfo(false);
      }
    } catch (err) {
      console.error('Installation failed', err);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="fixed left-4 md:left-auto md:right-4 bottom-20 w-12 h-12 bg-white dark:bg-card border border-border rounded-full shadow-lg flex items-center justify-center text-primary z-[60] active:scale-95 transition-all text-xs"
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        aria-label="App Download"
      >
        <div className="flex flex-col items-center justify-center">
          <Download size={20} />
          <span className="text-[8px] font-bold">APP</span>
        </div>
      </button>

      {/* Info Card (Non-modal) */}
      {showInfo && (
        <div
          className="fixed bottom-36 left-4 right-4 md:left-auto md:right-4 md:w-80 z-[60] animate-fade-in-up"
        >
          <div className="bg-card/90 backdrop-blur-xl border border-border p-5 rounded-2xl shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowInfo(false)}
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white rounded-xl border border-border shadow-sm flex items-center justify-center shrink-0">
                <img src="/logo.png" alt="App Icon" className="w-10 h-10 object-contain" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Time Box</h3>
                <p className="text-xs text-muted-foreground">더 효율적인 하루를 위한 시간 관리 앱</p>
              </div>
            </div>

            <p className="text-sm text-foreground/80 mb-5 leading-relaxed">
              앱을 설치하면 홈 화면에서 바로 접속하실 수 있습니다.
            </p>

            {isIOS ? (
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-3">
                <Share size={18} className="text-primary mt-0.5 shrink-0" />
                <p className="text-xs text-secondary-foreground font-medium">
                  하단 메뉴의 <span className="font-bold whitespace-nowrap">'공유'</span> 아이콘을 누른 후 <span className="font-bold whitespace-nowrap">'홈 화면에 추가'</span>를 눌러주세요.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleInstall}
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all shadow-md"
                >
                  <Download size={18} />
                  Time Box 앱 설치하기
                </button>
                {!deferredPrompt && (
                  <p className="text-[10px] text-muted-foreground text-center">
                    설치 버튼이 작동하지 않는 경우, 브라우저 메뉴의 <br />
                    <span className="font-bold">'홈 화면에 추가'</span> 또는 <span className="font-bold">'앱 설치'</span>를 선택해 주세요.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
