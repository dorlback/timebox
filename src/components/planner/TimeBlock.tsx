import React from 'react';
import { TimeBlock as TimeBlockType } from '@/types/planner';
import { getColorByIndex } from '@/utils/colorUtils';
import { formatTimeDisplay } from '@/utils/timeUtils';

interface TimeBlockProps {
  block: TimeBlockType;
  isDragging: boolean;
  isResizing: boolean;
  onMouseDown: (e: React.MouseEvent, block: TimeBlockType) => void;
  onEdit: (block: TimeBlockType) => void;
  isMobile?: boolean;
  activeBlockId?: number | null;
}

export const TimeBlock: React.FC<TimeBlockProps> = React.memo(({
  block,
  isDragging,
  isResizing,
  onMouseDown,
  onEdit,
  isMobile = false,
  activeBlockId = null
}) => {
  const top = block.startTime * 1;
  const height = (block.endTime - block.startTime) * 1;
  const color = getColorByIndex(block.colorIndex);
  const isCompleted = block.completed;

  // 텍스트 노출 로직 고도화 (v2)
  const duration = block.endTime - block.startTime;
  const showFullContent = duration > 40; // 40분 초과일 때만 전체 노출
  const showTitleOnly = duration >= 20 && duration <= 40; // 20~40분은 제목만
  const showContent = duration >= 20;

  // 20분~40분 구간에서 제목 폰트 크기 동적 계산 (8px ~ 12px)
  const dynamicFontSize = showTitleOnly
    ? Math.max(8, Math.min(12, 8 + ((duration - 20) / 20) * 4))
    : 12;

  let touchTimer: NodeJS.Timeout;
  const handleTouchStart = (e: React.TouchEvent) => {
    // 이미 편집 모드이면 롱프레스 필요 없음 (즉시 onMouseDown 트리거)
    if (isMobile && activeBlockId === block.id) {
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
    const target = e.target;

    touchTimer = setTimeout(() => {
      const touch = e.touches[0];
      const simulatedEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY,
        button: 0,
        target: target,
        currentTarget: currentTarget,
        stopPropagation: () => { },
        preventDefault: () => { },
      } as unknown as React.MouseEvent;

      onMouseDown(simulatedEvent, block);
    }, 600);
  };

  const handleTouchEnd = () => {
    clearTimeout(touchTimer);
  };

  const isActive = isMobile && activeBlockId === block.id;

  const interactionStyles: React.CSSProperties = isMobile ? {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    WebkitTouchCallout: 'none',
    touchAction: isActive ? 'none' : 'pan-y'
  } : {};

  return (
    <div
      className={`time-block-container absolute ${isMobile ? 'left-8 right-1' : 'left-12 right-0'} rounded px-2 py-1 transition-all ${isCompleted
        ? 'bg-gray-200 border-2 border-gray-400'
        : `${color.bg} border-2 ${color.border}`
        } ${isDragging ? 'opacity-70 shadow-lg cursor-move z-40 scale-[1.02]' : ''} ${isResizing ? 'opacity-70 shadow-lg z-40' : ''
        } ${isActive ? 'opacity-85 shadow-2xl z-40 ring-2 ring-blue-500 ring-offset-1' : ''} ${isCompleted ? '' : 'hover:brightness-95'}`}
      style={{
        top: `${top}px`,
        height: `${height}px`,
        cursor: isDragging ? 'move' : 'default',
        zIndex: (isDragging || isResizing || isActive) ? 50 : 1,
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
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd} // 움직이면 롱프레스 취소
      onMouseMove={(e) => {
        if (isDragging || isResizing) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const offsetY = e.clientY - rect.top;
        const blockHeight = rect.height;
        if (offsetY <= 10 || offsetY >= blockHeight - 10) {
          e.currentTarget.style.cursor = 'ns-resize';
        } else {
          e.currentTarget.style.cursor = showContent ? 'move' : 'pointer';
        }
      }}
      onMouseLeave={(e) => {
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
          {showFullContent && (
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
    </div>
  );
});