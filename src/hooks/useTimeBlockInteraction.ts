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
  const isDraggingRef = useRef<number | null>(null);
  const isResizingRef = useRef<number | null>(null);

  const clearActiveBlock = useCallback(() => {
    setActiveBlockId(null);
  }, []);

  // 통합 위치 업데이트 로직 (절대 좌표 기반 + 하이브리드 스냅)
  const updatePosition = useCallback((
    clientY: number,
    snap: boolean = true,
    overrideDraggingId?: number | null,
    overrideResizingId?: number | null,
    overrideOffset?: number
  ) => {
    const dBlockId = overrideDraggingId !== undefined ? overrideDraggingId : draggingBlock;
    const rBlockId = overrideResizingId !== undefined ? overrideResizingId : resizingBlock;
    const offset = overrideOffset !== undefined ? overrideOffset : dragOffset;

    if (rBlockId === null && dBlockId === null) return;

    const scrollContainer = document.getElementById('planner-scroll-container');
    if (!scrollContainer) return;

    // 현재 스크롤 위치를 고려한 절대 Y 좌표 계산
    const absoluteY = clientY + scrollContainer.scrollTop - gridTopAbsoluteRef.current;

    if (rBlockId !== null) {
      // 모든 결과값에 Math.round 적용하여 소수점 제거
      const newMinutes = Math.round(snap ? Math.round(absoluteY / 10) * 10 : absoluteY);
      const block = timeBlocks.find(b => b.id === rBlockId);
      if (!block) return;

      if (resizeEdge === 'top') {
        const clampedStart = Math.max(0, Math.min(block.endTime - 10, newMinutes));
        const hasConflict = checkTimeConflict(timeBlocks, rBlockId, clampedStart, block.endTime);
        if (!hasConflict) updateBlockTime(rBlockId, Math.round(clampedStart), Math.round(block.endTime));
      } else if (resizeEdge === 'bottom') {
        const clampedEnd = Math.min(1440, Math.max(block.startTime + 10, newMinutes));
        const hasConflict = checkTimeConflict(timeBlocks, rBlockId, block.startTime, clampedEnd);
        if (!hasConflict) updateBlockTime(rBlockId, Math.round(block.startTime), Math.round(clampedEnd));
      }
    } else if (dBlockId !== null) {
      const relativeY = absoluteY - offset;
      const newStartMinutes = Math.round(snap ? Math.round(relativeY / 10) * 10 : relativeY);
      const clampedStart = Math.max(0, Math.min(1440, newStartMinutes));

      const block = timeBlocks.find(b => b.id === dBlockId);
      if (!block) return;

      const duration = block.endTime - block.startTime;
      const newEnd = clampedStart + duration;
      if (newEnd > 1440) return;

      const hasConflict = checkTimeConflict(timeBlocks, dBlockId, clampedStart, newEnd);
      if (!hasConflict) updateBlockTime(dBlockId, Math.round(clampedStart), Math.round(newEnd));
    }
  }, [resizingBlock, draggingBlock, timeBlocks, dragOffset, resizeEdge, updateBlockTime]);

  // 스크롤 루프 시작 로직 분리
  const startScrollIfNeeded = useCallback((clientY: number) => {
    const scrollContainer = document.getElementById('planner-scroll-container');
    if (!scrollContainer) return;

    const scrollRect = scrollContainer.getBoundingClientRect();
    const threshold = 60;

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
            speed = -Math.max(4, Math.pow(dist / threshold, 1.2) * 25);
          } else if (currentY > sRect.bottom - threshold) {
            const dist = currentY - (sRect.bottom - threshold);
            speed = Math.max(4, Math.pow(dist / threshold, 1.2) * 25);
          }

          if (speed !== 0) {
            container.scrollTop += speed;
            const shouldSnap = Math.abs(speed) < 10;
            updatePosition(currentY, shouldSnap);
            scrollIntervalRef.current = requestAnimationFrame(scrollStep);
          } else {
            scrollIntervalRef.current = null;
          }
        };
        scrollIntervalRef.current = requestAnimationFrame(scrollStep);
      }
    } else if (scrollIntervalRef.current) {
      cancelAnimationFrame(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
  }, [updatePosition]);

  const handleBlockMouseDown = useCallback((e: React.MouseEvent, block: TimeBlock) => {
    // 편집 모드 활성화 (모바일 롱프레스 등을 통해 호출될 때)
    setActiveBlockId(block.id);
    if ((e.target as HTMLElement).closest('.edit-button')) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const scrollContainer = document.getElementById('planner-scroll-container');
    const timeGrid = document.getElementById('time-grid');

    // 터치/마우스 시작 시점의 좌표 및 스크롤 정보 즉시 캐싱
    if (timeGrid && scrollContainer) {
      gridTopAbsoluteRef.current = timeGrid.getBoundingClientRect().top + scrollContainer.scrollTop;
      initialScrollTopRef.current = scrollContainer.scrollTop;
    }

    const offsetY = e.clientY - rect.top;
    const blockHeight = rect.height;
    lastClientYRef.current = e.clientY;

    // 모바일이고 편집 모드인 블록인 경우, 핸들이 보여지므로 리사이즈 감지 영역을 조금 더 넓게 설정(20px)
    const resizeThreshold = (activeBlockId === block.id) ? 20 : 10;

    if (offsetY <= resizeThreshold) {
      e.preventDefault();
      e.stopPropagation();
      setResizingBlock(block.id);
      setResizeEdge('top');
      isResizingRef.current = block.id;
      // 상태 업데이트 대기 없이 즉시 위치 갱신
      updatePosition(e.clientY, true, null, block.id, offsetY);
      startScrollIfNeeded(e.clientY);
      return;
    } else if (offsetY >= blockHeight - resizeThreshold) {
      e.preventDefault();
      e.stopPropagation();
      setResizingBlock(block.id);
      setResizeEdge('bottom');
      isResizingRef.current = block.id;
      // 상태 업데이트 대기 없이 즉시 위치 갱신
      updatePosition(e.clientY, true, null, block.id, offsetY);
      startScrollIfNeeded(e.clientY);
      return;
    }

    setDraggingBlock(block.id);
    setDragOffset(offsetY);
    isDraggingRef.current = block.id;

    // 상태 업데이트 대기 없이 즉시 위치 갱신 (모바일 롱프레스 즉시 드래그 연동 핵심)
    updatePosition(e.clientY, true, block.id, null, offsetY);
    startScrollIfNeeded(e.clientY);
  }, [activeBlockId, updatePosition, startScrollIfNeeded]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    // Ref를 사용하여 상태 업데이트 대기 없이 즉시 반응 가능 (모바일 롱프레스 연동 핵심)
    if (isResizingRef.current === null && isDraggingRef.current === null) return;

    // 기본 스크롤 동작 방지 (자동 스크롤 제어를 위해)
    if (e.cancelable) {
      e.preventDefault();
    }

    const clientY = 'touches' in e
      ? (e as TouchEvent).touches[0]?.clientY
      : (e as MouseEvent).clientY;

    if (clientY === undefined) return;
    lastClientYRef.current = clientY;

    // 마우스 이동 시에는 항상 스냅 적용해서 정교하게
    updatePosition(clientY, true);
    startScrollIfNeeded(clientY);
  }, [resizingBlock, draggingBlock, updatePosition, startScrollIfNeeded]);

  const handleMouseUp = useCallback(() => {
    setDraggingBlock(null);
    setDragOffset(0);
    setResizingBlock(null);
    setResizeEdge(null);
    isDraggingRef.current = null;
    isResizingRef.current = null;

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