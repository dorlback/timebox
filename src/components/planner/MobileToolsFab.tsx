'use client';

import React, { useState } from 'react';
import { Menu, X, Calendar, CheckSquare, Book } from 'lucide-react';

export const MobileToolsFab = ({ onOpenDiary }: { onOpenDiary?: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 3가지 도구 아이콘 구성 (기능은 임시로 막아둠)
  const tools = [
    { id: '1', icon: <Calendar size={20} />, label: '달력' },
    { id: '2', icon: <CheckSquare size={20} />, label: '할일' },
    { id: '3', icon: <Book size={20} />, label: '일기장' },
  ];

  return (
    <>
      {/* 배경 오버레이 (열렸을 때 바깥 영역 클릭시 닫힘) */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-[55] bg-background/50 backdrop-blur-sm transition-all" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* FAB 컨테이너 */}
      <div className="md:hidden fixed right-4 bottom-20 z-[60] w-14 h-14 flex items-center justify-center">
        
        {/* 도구 메뉴 아이콘들 (곰발바닥 부채꼴 형태) */}
        {tools.map((tool, index) => {
          let translateX = '0px';
          let translateY = '0px';
          
          if (isOpen) {
            if (index === 0) {
              translateY = '-90px'; // 위
            } else if (index === 1) {
              translateX = '-66px'; // 좌상단 대각선
              translateY = '-66px';
            } else if (index === 2) {
              translateX = '-90px'; // 좌측
            }
          }

          return (
            <div
              key={tool.id}
              className="absolute w-12 h-12 z-10"
              style={{
                transform: `translate(${translateX}, ${translateY}) scale(${isOpen ? 1 : 0.3})`,
                opacity: isOpen ? 1 : 0,
                pointerEvents: isOpen ? 'auto' : 'none',
                transitionDelay: isOpen ? `${index * 40}ms` : '0ms',
                transitionProperty: 'transform, opacity',
                transitionDuration: '300ms',
                transitionTimingFunction: 'cubic-bezier(0.34,1.56,0.64,1)',
              }}
            >
              <button
                onClick={() => {
                  if (index === 2 && onOpenDiary) {
                    onOpenDiary();
                  }
                  setIsOpen(false);
                }}
                className={`group relative w-full h-full bg-card border border-border rounded-full shadow-lg flex items-center justify-center text-foreground transition-all
                  ${index < 2 ? 'opacity-40 cursor-not-allowed hover:opacity-80' : 'hover:bg-muted active:scale-95'}
                `}
                aria-label={tool.label}
                title={tool.label}
              >
                {tool.icon}
                <div 
                  className={`absolute -bottom-6 left-1/2 -translate-x-1/2 text-[9px] font-black whitespace-nowrap px-2 py-0.5 rounded-full backdrop-blur-md bg-background/90 shadow-sm border border-border/50 transition-all duration-300 pointer-events-none 
                  ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
                  ${index < 2 ? 'text-muted-foreground/80' : 'text-primary'}
                  `}
                >
                  {index < 2 ? 'Coming Soon' : tool.label}
                </div>
              </button>
            </div>
          );
        })}

        {/* 메인 FAB */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="absolute inset-0 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-95 z-20"
          aria-label="도구 모음 열기"
        >
          <div className={`transition-transform duration-300 ${isOpen ? 'rotate-90' : 'rotate-0'}`}>
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </div>
        </button>
      </div>
    </>
  );
};
