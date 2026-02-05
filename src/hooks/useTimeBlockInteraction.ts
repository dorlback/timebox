import { useState, useEffect, useCallback, useRef } from 'react';
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

  const scrollIntervalRef = useRef<number | null>(null);
  const lastClientYRef = useRef<number>(0);
  const initialScrollTopRef = useRef<number>(0);
  const gridTopAbsoluteRef = useRef<number>(0);

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

    // 드래그 시작 시점의 절대 좌표 정보 캐싱
    const timeGrid = document.getElementById('time-grid');
    const scrollContainer = document.getElementById('planner-scroll-container');
    if (timeGrid && scrollContainer) {
      gridTopAbsoluteRef.current = timeGrid.getBoundingClientRect().top + scrollContainer.scrollTop;
      initialScrollTopRef.current = scrollContainer.scrollTop;
    }

    setDraggingBlock(block.id);
    setDragOffset(offsetY);
  }, [activeBlockId]);

  // 통합 위치 업데이트 로직 (절대 좌표 기반)
  const updatePosition = useCallback((clientY: number) => {
    if (resizingBlock === null && draggingBlock === null) return;

    const scrollContainer = document.getElementById('planner-scroll-container');
    if (!scrollContainer) return;

    // 현재 스크롤 위치를 고려한 절대 Y 좌표 계산 (스크롤 중 지터 방지)
    const absoluteY = clientY + scrollContainer.scrollTop - gridTopAbsoluteRef.current;

    if (resizingBlock !== null) {
      const newMinutes = Math.round(absoluteY / 10) * 10;
      const block = timeBlocks.find(b => b.id === resizingBlock);
      if (!block) return;

      if (resizeEdge === 'top') {
        const clampedStart = Math.max(0, Math.min(block.endTime - 10, newMinutes));
        const hasConflict = checkTimeConflict(timeBlocks, resizingBlock, clampedStart, block.endTime);
        if (!hasConflict) updateBlockTime(resizingBlock, clampedStart, block.endTime);
      } else if (resizeEdge === 'bottom') {
        const clampedEnd = Math.min(1440, Math.max(block.startTime + 10, newMinutes));
        const hasConflict = checkTimeConflict(timeBlocks, resizingBlock, block.startTime, clampedEnd);
        if (!hasConflict) updateBlockTime(resizingBlock, block.startTime, clampedEnd);
      }
    } else if (draggingBlock !== null) {
      const relativeY = absoluteY - dragOffset;
      const newStartMinutes = Math.round(relativeY / 10) * 10;
      const clampedStart = Math.max(0, Math.min(1440, newStartMinutes));

      const block = timeBlocks.find(b => b.id === draggingBlock);
      if (!block) return;

      const duration = block.endTime - block.startTime;
      const newEnd = clampedStart + duration;
      if (newEnd > 1440) return;

      const hasConflict = checkTimeConflict(timeBlocks, draggingBlock, clampedStart, newEnd);
      if (!hasConflict) updateBlockTime(draggingBlock, clampedStart, newEnd);
    }
  }, [resizingBlock, draggingBlock, timeBlocks, dragOffset, resizeEdge, updateBlockTime]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (resizingBlock === null && draggingBlock === null) return;

    // 기본 스크롤 동작 방지 (자동 스크롤 제어를 위해)
    if (e.cancelable) {
      e.preventDefault();
    }

    const clientY = 'touches' in e
      ? (e as TouchEvent).touches[0]?.clientY
      : (e as MouseEvent).clientY;

    if (clientY === undefined) return;
    lastClientYRef.current = clientY;

    // 현재 마우스 위치에 따른 즉시 업데이트
    updatePosition(clientY);

    // 자동 스크롤 여부 판단
    const scrollContainer = document.getElementById('planner-scroll-container');
    if (scrollContainer) {
      const scrollRect = scrollContainer.getBoundingClientRect();
      const threshold = 60; // 감지 영역 소폭 확장 (40 -> 60)

      const isNearTop = clientY < scrollRect.top + threshold;
      const isNearBottom = clientY > scrollRect.bottom - threshold;

      if (isNearTop || isNearBottom) {
        if (!scrollIntervalRef.current) {
          const scrollStep = () => {
            const container = document.getElementById('planner-scroll-container');
            if (!container) return;

            const currentY = lastClientYRef.current;
            const sRect = container.getBoundingClientRect();

            let speed = 0;
            if (currentY < sRect.top + threshold) {
              const dist = sRect.top + threshold - currentY;
              // 지수 가속 곡선 적용 (최대 약 30px)
              speed = -Math.max(2, Math.pow(dist / threshold, 1.5) * 35);
            } else if (currentY > sRect.bottom - threshold) {
              const dist = currentY - (sRect.bottom - threshold);
              // 지수 가속 곡선 적용 (최대 약 30px)
              speed = Math.max(2, Math.pow(dist / threshold, 1.5) * 35);
            }

            if (speed !== 0) {
              container.scrollTop += speed;
              // 스크롤 이동과 즉시 위치 동기화 (절대 좌표 시스템 덕분에 떨림 없음)
              updatePosition(currentY);
              scrollIntervalRef.current = requestAnimationFrame(scrollStep);
            } else {
              scrollIntervalRef.current = null;
            }
          };
          scrollIntervalRef.current = requestAnimationFrame(scrollStep);
        }
      } else {
        if (scrollIntervalRef.current) {
          cancelAnimationFrame(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
      }
    }
  }, [resizingBlock, draggingBlock, updatePosition]);

  const handleMouseUp = useCallback(() => {
    setDraggingBlock(null);
    setDragOffset(0);
    setResizingBlock(null);
    setResizeEdge(null);

    if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
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

        if (scrollIntervalRef.current) {
          cancelAnimationFrame(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
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