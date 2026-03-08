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

  // 드래그 중 시각적 프리뷰 오프셋 (CSS transform용)
  const [dragPreviewOffset, setDragPreviewOffset] = useState<{ blockId: number; offsetY: number; type: 'drag' | 'resize-top' | 'resize-bottom' } | null>(null);

  const clearActiveBlock = useCallback(() => {
    setActiveBlockId(null);
  }, []);

  // 드래그 중 시각적 프리뷰 업데이트 (실제 데이터 변경 없음)
  const updateDragPreview = useCallback((
    clientY: number,
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
      // 리사이즈 프리뷰: 그리드 및 블록 최소 길이(10분) 제한
      const block = timeBlocks.find(b => b.id === rBlockId);
      if (block) {
        let clampedMinutes = Math.round(absoluteY);
        if (resizeEdge === 'top') {
          clampedMinutes = Math.max(0, Math.min(block.endTime - 10, clampedMinutes));
        } else {
          clampedMinutes = Math.min(1440, Math.max(block.startTime + 10, clampedMinutes));
        }
        setDragPreviewOffset({
          blockId: rBlockId,
          offsetY: clampedMinutes,
          type: resizeEdge === 'top' ? 'resize-top' : 'resize-bottom'
        });
      }
    } else if (dBlockId !== null) {
      // 드래그 프리뷰: 블록이 그리드를 벗어나지 않도록 클램핑
      const relativeY = absoluteY - offset;
      const newStartMinutes = Math.round(relativeY);

      const block = timeBlocks.find(b => b.id === dBlockId);
      if (block) {
        const duration = block.endTime - block.startTime;
        const clampedStart = Math.max(0, Math.min(1440 - duration, newStartMinutes));
        setDragPreviewOffset({
          blockId: dBlockId,
          offsetY: clampedStart,
          type: 'drag'
        });
      }
    }
  }, [resizingBlock, draggingBlock, dragOffset, resizeEdge]);


  // 고속 자동 스크롤 로직
  const startScrollIfNeeded = useCallback((clientY: number) => {
    const scrollContainer = document.getElementById('planner-scroll-container');
    if (!scrollContainer) return;

    const scrollRect = scrollContainer.getBoundingClientRect();
    const threshold = 80; // 임계값 확대 (60 -> 80)

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
            // 고속 스크롤: 최소 10px, 최대 40px, 급격한 가속 (1.8 지수)
            speed = -Math.max(10, Math.pow(dist / threshold, 1.8) * 40);
          } else if (currentY > sRect.bottom - threshold) {
            const dist = currentY - (sRect.bottom - threshold);
            // 고속 스크롤: 최소 10px, 최대 40px, 급격한 가속 (1.8 지수)
            speed = Math.max(10, Math.pow(dist / threshold, 1.8) * 40);
          }

          if (speed !== 0) {
            // 실제 스크롤 가능 여부 확인 (상단/하단 경계 도달 시 중단)
            const canScrollUp = container.scrollTop > 0;
            const canScrollDown = container.scrollTop < container.scrollHeight - container.clientHeight;

            if ((speed < 0 && canScrollUp) || (speed > 0 && canScrollDown)) {
              container.scrollTop += speed;
              updateDragPreview(currentY);
              scrollIntervalRef.current = requestAnimationFrame(scrollStep);
            } else {
              scrollIntervalRef.current = null;
            }
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
  }, [updateDragPreview]);

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

    // 모바일이고 편집 모드인 블록인 경우, 핸들이 보여지므로 리사이즈 감지 영역을 조금 더 넓게 설정(8px)
    // 일반 상태에서는 오클릭 방지를 위해 최소화(4px)
    // 타임블록 사이즈 조절
    const resizeThreshold = (activeBlockId === block.id) ? 6 : 4;

    if (offsetY <= resizeThreshold) {
      e.preventDefault();
      e.stopPropagation();
      setResizingBlock(block.id);
      setResizeEdge('top');
      isResizingRef.current = block.id;
      // 상태 업데이트 대기 없이 즉시 위치 갱신
      updateDragPreview(e.clientY, null, block.id, offsetY);
      startScrollIfNeeded(e.clientY);
      return;
    } else if (offsetY >= blockHeight - resizeThreshold) {
      e.preventDefault();
      e.stopPropagation();
      setResizingBlock(block.id);
      setResizeEdge('bottom');
      isResizingRef.current = block.id;
      // 상태 업데이트 대기 없이 즉시 위치 갱신
      updateDragPreview(e.clientY, null, block.id, offsetY);
      startScrollIfNeeded(e.clientY);
      return;
    }

    setDraggingBlock(block.id);
    setDragOffset(offsetY);
    isDraggingRef.current = block.id;

    // 상태 업데이트 대기 없이 즉시 위치 갱신 (모바일 롱프레스 즉시 드래그 연동 핵심)
    updateDragPreview(e.clientY, block.id, null, offsetY);
    startScrollIfNeeded(e.clientY);
  }, [activeBlockId, updateDragPreview, startScrollIfNeeded]);

  const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
    // Ref를 사용하여 상태 업데이트 대기 없이 즉시 반응 가능 (모바일 롱프레스 연동 핵심)
    const isInteracting = isResizingRef.current !== null || isDraggingRef.current !== null;

    if (!isInteracting) return;

    // 상호작용 중에는 브라우저의 기본 스크롤 동작을 즉시 차단
    if (e.cancelable) {
      e.preventDefault();
    }

    const clientY = 'touches' in e
      ? (e as TouchEvent).touches[0]?.clientY
      : (e as MouseEvent).clientY;

    if (clientY === undefined) return;
    lastClientYRef.current = clientY;

    // 드래그 중에는 프리뷰만 업데이트
    updateDragPreview(clientY);
    startScrollIfNeeded(clientY);
  }, [updateDragPreview, startScrollIfNeeded]);

  const handleMouseUp = useCallback(() => {
    // 릴리즈 시 dragPreviewOffset을 사용하여 10분 단위로 스냅
    if (dragPreviewOffset) {
      const { blockId, offsetY, type } = dragPreviewOffset;
      const block = timeBlocks.find(b => b.id === blockId);

      if (block) {
        if (type === 'drag') {
          // 드래그: 시작 위치를 10분 단위로 스냅
          const snappedStart = Math.max(0, Math.min(1440, Math.round(offsetY / 10) * 10));
          const duration = block.endTime - block.startTime;
          const snappedEnd = snappedStart + duration;

          if (snappedEnd <= 1440) {
            const hasConflict = checkTimeConflict(timeBlocks, blockId, snappedStart, snappedEnd);
            if (!hasConflict) {
              updateBlockTime(blockId, snappedStart, snappedEnd);
            }
          }
        } else if (type === 'resize-top') {
          // 상단 리사이즈: 시작 시간만 스냅
          const snappedStart = Math.max(0, Math.min(block.endTime - 10, Math.round(offsetY / 10) * 10));
          const hasConflict = checkTimeConflict(timeBlocks, blockId, snappedStart, block.endTime);
          if (!hasConflict) {
            updateBlockTime(blockId, snappedStart, block.endTime);
          }
        } else if (type === 'resize-bottom') {
          // 하단 리사이즈: 종료 시간만 스냅
          const snappedEnd = Math.min(1440, Math.max(block.startTime + 10, Math.round(offsetY / 10) * 10));
          const hasConflict = checkTimeConflict(timeBlocks, blockId, block.startTime, snappedEnd);
          if (!hasConflict) {
            updateBlockTime(blockId, block.startTime, snappedEnd);
          }
        }
      }
    }

    // 모든 상태 초기화
    setDragPreviewOffset(null);
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
  }, [dragPreviewOffset, timeBlocks, updateBlockTime]);

  useEffect(() => {
    const options = { passive: false };

    // 이벤트 리스너 상시 등록 (모바일 롱프레스 즉각 반응을 위함)
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
  }, [handleMouseMove, handleMouseUp]);

  return {
    draggingBlock,
    resizingBlock,
    activeBlockId,
    dragPreviewOffset,
    setActiveBlockId,
    handleBlockMouseDown,
    clearActiveBlock
  };
};