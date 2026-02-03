import { useState, useEffect, useCallback } from 'react';
import { TimeBlock } from '../types/planner';
import { checkTimeConflict } from '../utils/timeUtils';

export const useTimeBlockInteraction = (
  timeBlocks: TimeBlock[],
  updateBlockTime: (blockId: number, newStart: number, newEnd: number) => void
) => {
  const [draggingBlock, setDraggingBlock] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [resizingBlock, setResizingBlock] = useState<number | null>(null);
  const [resizeEdge, setResizeEdge] = useState<'top' | 'bottom' | null>(null);
  const [activeBlockId, setActiveBlockId] = useState<number | null>(null); // 현재 편집 모드인 블록

  const clearActiveBlock = useCallback(() => {
    setActiveBlockId(null);
  }, []);

  const handleBlockMouseDown = useCallback((e: React.MouseEvent, block: TimeBlock) => {
    // 편집 모드 활성화 (모바일 롱프레스 등을 통해 호출될 때)
    setActiveBlockId(block.id);
    if ((e.target as HTMLElement).closest('.edit-button')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const blockHeight = rect.height;

    // 모바일이고 편집 모드인 블록인 경우, 핸들이 보여지므로 리사이즈 감지 영역을 조금 더 넓게 설정(20px)
    const resizeThreshold = (activeBlockId === block.id) ? 20 : 10;

    // 상단 영역 또는 하단 영역이면 리사이즈 모드
    if (offsetY <= resizeThreshold) {
      e.preventDefault();
      e.stopPropagation();
      setResizingBlock(block.id);
      setResizeEdge('top');
      return;
    } else if (offsetY >= blockHeight - resizeThreshold) {
      e.preventDefault();
      e.stopPropagation();
      setResizingBlock(block.id);
      setResizeEdge('bottom');
      return;
    }

    // 그 외 영역이면 드래그 모드
    e.preventDefault();
    e.stopPropagation();
    setDraggingBlock(block.id);
    setDragOffset(offsetY);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (resizingBlock === null && draggingBlock === null) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    if (resizingBlock !== null) {
      const timeGridElement = document.getElementById('time-grid');
      if (!timeGridElement) return;

      const rect = timeGridElement.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const newMinutes = Math.round((relativeY) / 10) * 10;

      const block = timeBlocks.find(b => b.id === resizingBlock);
      if (!block) return;

      if (resizeEdge === 'top') {
        const clampedStart = Math.max(0, Math.min(block.endTime - 10, newMinutes));

        const hasConflict = checkTimeConflict(timeBlocks, resizingBlock, clampedStart, block.endTime);
        if (!hasConflict) {
          updateBlockTime(resizingBlock, clampedStart, block.endTime);
        }
      } else if (resizeEdge === 'bottom') {
        const clampedEnd = Math.min(1440, Math.max(block.startTime + 10, newMinutes));

        const hasConflict = checkTimeConflict(timeBlocks, resizingBlock, block.startTime, clampedEnd);
        if (!hasConflict) {
          updateBlockTime(resizingBlock, block.startTime, clampedEnd);
        }
      }
      return;
    }

    if (draggingBlock !== null) {
      const timeGridElement = document.getElementById('time-grid');
      if (!timeGridElement) return;

      const rect = timeGridElement.getBoundingClientRect();
      const relativeY = clientY - rect.top - dragOffset;

      const newStartMinutes = Math.round((relativeY) / 10) * 10;
      const clampedStart = Math.max(0, Math.min(1440, newStartMinutes));

      const block = timeBlocks.find(b => b.id === draggingBlock);
      if (!block) return;

      const duration = block.endTime - block.startTime;
      const newEnd = clampedStart + duration;

      if (newEnd > 1440) return;

      const hasConflict = checkTimeConflict(timeBlocks, draggingBlock, clampedStart, newEnd);
      if (!hasConflict) {
        updateBlockTime(draggingBlock, clampedStart, newEnd);
      }
    }
  }, [draggingBlock, dragOffset, resizingBlock, resizeEdge, timeBlocks, updateBlockTime]);

  const handleMouseUp = useCallback(() => {
    setDraggingBlock(null);
    setDragOffset(0);
    setResizingBlock(null);
    setResizeEdge(null);
  }, []);

  useEffect(() => {
    if (draggingBlock !== null || resizingBlock !== null) {
      const options = { passive: false };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleMouseMove, options);
      document.addEventListener('touchend', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleMouseMove);
        document.removeEventListener('touchend', handleMouseUp);
      };
    }
  }, [draggingBlock, resizingBlock, handleMouseMove, handleMouseUp]);

  return {
    draggingBlock,
    resizingBlock,
    activeBlockId,
    setActiveBlockId,
    handleBlockMouseDown
  };
};