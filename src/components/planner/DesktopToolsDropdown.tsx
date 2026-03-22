'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Calendar, CheckSquare, Book } from 'lucide-react';

export const DesktopToolsDropdown = ({ onOpenDiary }: { onOpenDiary: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tools = [
    { id: '1', icon: <Calendar size={16} />, label: '달력', disabled: true },
    { id: '2', icon: <CheckSquare size={16} />, label: '할일', disabled: true },
    { id: '3', icon: <Book size={16} />, label: '일기장', disabled: false, action: onOpenDiary },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center px-3 py-2 rounded-xl border transition-colors shadow-sm text-sm font-bold tracking-tight 
          ${isOpen ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-card border-border/80 hover:bg-muted/80 text-muted-foreground hover:text-foreground'
          }`}
        title="아티펙트 메뉴"
      >
        <span>아티펙트</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1.5 flex flex-col gap-0.5">
            {tools.map((tool) => (
              <button
                key={tool.id}
                disabled={tool.disabled}
                onClick={() => {
                  if (tool.action) tool.action();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-sm font-medium ${tool.disabled
                  ? 'opacity-40 cursor-not-allowed text-muted-foreground'
                  : 'hover:bg-muted/80 text-foreground active:scale-[0.98]'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={tool.disabled ? '' : 'text-primary'}>{tool.icon}</div>
                  <span>{tool.label}</span>
                </div>
                {tool.disabled && (
                  <span className="text-[9px] uppercase font-black tracking-widest bg-muted-foreground/10 px-1.5 py-0.5 rounded-full">
                    Soon
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
