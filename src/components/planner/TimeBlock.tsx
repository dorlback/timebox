import React, { useState } from 'react';
import { TimeBlock as TimeBlockType } from '@/types/planner';
import { getColorByIndex } from '@/utils/colorUtils';
import { formatTimeDisplay } from '@/utils/timeUtils';
import { NotebookPen } from 'lucide-react';

interface TimeBlockProps {
  block: TimeBlockType;
  isDragging: boolean;
  isResizing: boolean;
  dragPreviewOffset?: { blockId: number; offsetY: number; type: 'drag' | 'resize-top' | 'resize-bottom' } | null;
  onMouseDown: (e: React.MouseEvent, block: TimeBlockType) => void;
  onEdit: (block: TimeBlockType) => void;
  isMobile?: boolean;
  activeBlockId?: number | null;
}

export const TimeBlock: React.FC<TimeBlockProps> = React.memo(({
  block,
  isDragging,
  isResizing,
  dragPreviewOffset,
  onMouseDown,
  onEdit,
  isMobile = false,
  activeBlockId = null
}) => {
  const [isResizeHover, setIsResizeHover] = useState(false);
  const top = block.startTime * 1;
  const height = (block.endTime - block.startTime) * 1;
  const color = getColorByIndex(block.colorIndex);
  const isCompleted = block.completed;

  // 드래그 프리뷰 transform 계산
  let transformY = 0;
  let previewHeight = height;

  if (dragPreviewOffset && dragPreviewOffset.blockId === block.id) {
    if (dragPreviewOffset.type === 'drag') {
      // 드래그: 시작 위치 이동
      transformY = dragPreviewOffset.offsetY - block.startTime;
    } else if (dragPreviewOffset.type === 'resize-top') {
      // 상단 리사이즈: 시작 위치 변경
      const newStart = dragPreviewOffset.offsetY;
      transformY = newStart - block.startTime;
      previewHeight = block.endTime - newStart;
    } else if (dragPreviewOffset.type === 'resize-bottom') {
      // 하단 리사이즈: 높이 변경
      previewHeight = dragPreviewOffset.offsetY - block.startTime;
    }
  }

  // 텍스트 노출 로직 고도화 (v2/v5)
  const isInteracting = isDragging || isResizing;
  const duration = block.endTime - block.startTime;

  // 드래그 중이 아닐 때의 기본 노출 기준
  const showFullContent = !isInteracting && duration > 40;
  const showTitleOnly = isInteracting || (duration >= 20 && duration <= 40);
  const showContent = duration >= 20 || isInteracting;

  // 20분~40분 구간에서 제목 폰트 크기 동적 계산 (8px ~ 12px)
  const dynamicFontSize = showTitleOnly
    ? Math.max(8, Math.min(12, 8 + ((duration - 20) / 20) * 4))
    : 12;

  let touchTimer: NodeJS.Timeout;
  const handleTouchStart = (e: React.TouchEvent) => {
    // 이미 편집 모드이면 롱프레스 필요 없음 (즉시 onMouseDown 트리거)
    if (isMobile && activeBlockId === block.id) {
      e.stopPropagation(); // 부모 스크롤 등 간섭 방지
      const touch = e.touches[0];
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        target: e.target,
        currentTarget: e.currentTarget,
        stopPropagation: () => { },
        preventDefault: () => { },
      } as unknown as React.MouseEvent;
      onMouseDown(simulatedEvent, block);
      return;
    }

    // 롱프레스 타이머: 600ms 동안 누르고 있으면 편집 모드 활성화 및 드래그 시작
    const currentTarget = e.currentTarget;

    touchTimer = setTimeout(() => {
      const touch = e.touches[0];
      // 롱프레스 완료 시점의 최신 터치 좌표 전달
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        target: e.target,
        currentTarget: currentTarget,
        stopPropagation: () => { },
        preventDefault: () => { },
      } as unknown as React.MouseEvent;

      // 롱프레스 성공 시 시각적으로 진동 효과나 소리 등을 주면 좋으나 여기서는 즉시 드래그 활성화
      onMouseDown(simulatedEvent, block);
    }, 300);
  };

  const handleTouchEnd = () => {
    clearTimeout(touchTimer);
  };

  const isActive = isMobile && activeBlockId === block.id;

  const interactionStyles: React.CSSProperties = isMobile ? {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    touchAction: (isActive || isDragging || isResizing) ? 'none' : 'pan-y'
  } : {};

  return (
    <div
      className={`time-block-container group absolute ${isMobile ? 'left-8 right-1' : 'left-12 right-0'} rounded px-2 py-1 ${isCompleted
        ? 'bg-gray-200 border-2 border-gray-400'
        : `${color.bg} border-2 ${color.border}`
        } ${isDragging ? 'opacity-80 shadow-2xl cursor-move z-40 backdrop-blur-[2px]' : ''} ${isResizing ? 'opacity-70 shadow-lg z-40' : ''
        } ${isActive ? 'opacity-85 shadow-2xl z-40 ring-2 ring-blue-500 ring-offset-1' : ''} ${isCompleted ? '' : 'hover:brightness-95'} ${isResizeHover ? 'ring-[6px] ring-blue-100/50 border-blue-200 shadow-xl z-50 transition-all duration-700' : ''}`}
      style={{
        top: `${top}px`,
        height: `${previewHeight}px`,
        transform: `translateY(${transformY}px)`,
        // 릴리즈 시 부드럽게 붙는 애니메이션이 '바운스'로 느껴지므로 완전히 제거
        // 즉각적으로 딱딱 끊기며 제자리를 찾아가도록 함
        transition: 'none',
        willChange: (isDragging || isResizing) ? 'transform, height' : 'auto',
        cursor: isDragging ? 'move' : 'default',
        zIndex: (isDragging || isResizing || isActive || isResizeHover) ? 50 : 1,
        ...interactionStyles
      }}
      onMouseDown={(e) => {
        // PC에서는 즉시 드래그 시작, 모바일에서는 롱프레스로 처리하므로 무시
        if (!isMobile) {
          onMouseDown(e, block);
        }
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onEdit(block);
      }}
      onContextMenu={(e) => isMobile && e.preventDefault()}
      onWheel={(e) => {
        // 드래그나 리사이즈 중에는 블록 위의 개별 스크롤 기능 차단
        if (isDragging || isResizing) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd} // 움직이면 롱프레스 취소
      onMouseMove={(e) => {
        if (isDragging || isResizing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const blockHeight = rect.height;
        const threshold = activeBlockId === block.id ? 6 : 4;

        if (offsetY <= threshold || offsetY >= blockHeight - threshold) {
          e.currentTarget.style.cursor = 'ns-resize';
          if (!isResizeHover) setIsResizeHover(true);
        } else {
          e.currentTarget.style.cursor = showContent ? 'move' : 'pointer';
          if (isResizeHover) setIsResizeHover(false);
        }
      }}
      onMouseLeave={(e) => {
        setIsResizeHover(false);
        if (!isDragging && !isResizing) {
          e.currentTarget.style.cursor = 'default';
        }
      }}
      title={
        !showContent
          ? `${block.text}\n${formatTimeDisplay(block.startTime)} - ${formatTimeDisplay(
            block.endTime
          )} (${duration}분)`
          : ''
      }
    >
      {/* 모바일 사이즈 조절 핸들 (편집 모드 활성화 시 계속 표시) */}
      {isActive && !isCompleted && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[3px] border-blue-600 rounded-full z-50 shadow-lg active:scale-125 transition-transform" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white border-[3px] border-blue-600 rounded-full z-50 shadow-lg active:scale-125 transition-transform" />
        </>
      )}

      {showContent && (
        <div className={`flex flex-col h-full ${showTitleOnly ? 'justify-center items-center' : 'justify-start'}`}>
          <div
            className={`font-semibold flex truncate pointer-events-none w-full ${showTitleOnly ? 'text-center' : ''} ${isCompleted ? 'text-gray-600 line-through' : color.text
              }`}
            style={{ fontSize: showTitleOnly ? `${dynamicFontSize}px` : undefined }}
          >
            {block.text}
          </div>
          {showFullContent && !isInteracting && (
            <div
              className={`text-xs mt-1 flex justify-between items-center ${isCompleted
                ? 'text-gray-500'
                : color.subtext
                }`}
            >
              <span className="pointer-events-none">
                {formatTimeDisplay(block.startTime)} -{' '}
                {formatTimeDisplay(block.endTime)}
                <span className="ml-2">({duration}분)</span>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Edit Button - Always visible indicator */}
      {!isInteracting && duration >= 25 && (
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(block); }}
          onMouseDown={(e) => e.stopPropagation()}
          className="edit-button absolute top-1 right-1 p-1 rounded-full bg-white/20 hover:bg-white/40 text-current transition-colors"
          style={{ color: isCompleted ? '#4b5563' : 'inherit' }}
          title="상세 수정"
        >
          <NotebookPen size={16} />
        </button>
      )}
    </div>
  );
});