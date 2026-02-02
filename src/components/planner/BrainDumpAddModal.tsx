'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface BrainDumpAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (text: string) => void;
}

export const BrainDumpAddModal: React.FC<BrainDumpAddModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [text, setText] = useState('');

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // 모달이 열릴 때 body 스크롤 방지
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 모달이 닫힐 때 입력 초기화
  useEffect(() => {
    if (!isOpen) {
      setText('');
    }
  }, [isOpen]);

  const handleAdd = () => {
    if (text.trim()) {
      onAdd(text.trim());
      setText('');
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAdd();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 배경 오버레이 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fadeIn"
        onClick={onClose}
      />

      {/* 모달 컨텐츠 */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-slideUp">
        <div className="bg-card rounded-t-[20px] shadow-ios-xl border-t border-border p-6 max-h-[80vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground">새 항목 추가</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
              aria-label="닫기"
            >
              <X size={20} className="text-muted-foreground" />
            </button>
          </div>

          {/* 입력 영역 */}
          <div className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Brain Dump에 추가할 내용을 입력하세요..."
              className="w-full px-4 py-3 border border-input rounded-ios-lg text-sm bg-background text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              rows={4}
              autoFocus
            />

            {/* 버튼 그룹 */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-ios-lg border border-border text-foreground font-medium hover:bg-muted transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAdd}
                disabled={!text.trim()}
                className="flex-1 px-4 py-3 rounded-ios-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
