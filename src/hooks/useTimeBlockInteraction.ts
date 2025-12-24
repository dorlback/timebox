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

  const handleBlockMouseDown = useCallback((e: React.MouseEvent, block: TimeBlock) => {
    if ((e.target as HTMLElement).closest('.edit-button')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const offsetY = e.clientY - rect.top;
    const blockHeight = rect.height;

    // 상단 10px 또는 하단 10px 영역이면 리사이즈 모드
    if (offsetY <= 10) {
      e.preventDefault();
      e.stopPropagation();
      setResizingBlock(block.id);
      setResizeEdge('top');
      return;
    } else if (offsetY >= blockHeight - 10) {
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

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (resizingBlock !== null) {
      const timeGridElement = document.getElementById('time-grid');
      if (!timeGridElement) return;

      const rect = timeGridElement.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
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

    if (draggingBlock === null) return;

    const timeGridElement = document.getElementById('time-grid');
    if (!timeGridElement) return;

    const rect = timeGridElement.getBoundingClientRect();
    const relativeY = e.clientY - rect.top - dragOffset;

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
  }, [draggingBlock, dragOffset, resizingBlock, resizeEdge, timeBlocks, updateBlockTime]);

  const handleMouseUp = useCallback(() => {
    setDraggingBlock(null);
    setDragOffset(0);
    setResizingBlock(null);
    setResizeEdge(null);
  }, []);

  useEffect(() => {
    if (draggingBlock !== null || resizingBlock !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingBlock, resizingBlock, handleMouseMove, handleMouseUp]);

  return {
    draggingBlock,
    resizingBlock,
    handleBlockMouseDown
  };
};