'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { BrainDumpItem, TodoItem, TimeBlock } from '@/types/planner';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useTimeBlockInteraction } from '@/hooks/useTimeBlockInteraction';
import { findAvailableSlotAfterNow, checkTimeConflict } from '@/utils/timeUtils';
import { PASTEL_COLORS } from '@/utils/colorUtils';
import { BrainDump } from './BrainDump';
import { TodoList } from './TodoList';
import { TimeBlockEditor } from './TimeBlockEditor';
import { ErrorToast } from './ErrorToast';
import { SuccessToast } from './SuccessToast';
import { User } from '@/types/user';
import { usePlannerData } from '@/hooks/usePlannerDate';
import { useSuccessToast } from '@/hooks/useSuccessToast';
import Link from "next/link";
import { useDarkMode } from '@/hooks/useDarkMode';
import { Moon, Sun } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import { TimePlan } from './TimePlan';
import { BrainDumpAddModal } from './BrainDumpAddModal';
import { ItemDetailModal } from './ItemDetailModal';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useTranslation } from '@/contexts/LanguageContext';


const TimeBoxPlanner = ({ CurrentUser }: { CurrentUser: User }) => {
  const { t } = useTranslation();
  const { isDark, toggleDark, mounted } = useDarkMode();

  // URL에서 날짜 파라미터 가져오기
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');

  // 초기 날짜 설정 (파라미터가 있으면 해당 날짜로, 없으면 오늘로)
  const [date, setDate] = useState(() => {
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) return parsed;
    }
    return new Date();
  });

  // 파라미터가 변경될 때 날짜 업데이트
  useEffect(() => {
    if (dateParam) {
      const parsed = new Date(dateParam);
      if (!isNaN(parsed.getTime())) {
        setDate(parsed);
      }
    }
  }, [dateParam]);

  const { errorMessage, showError } = useErrorToast();
  const { successMessage, showSuccess } = useSuccessToast();

  // 모바일 화면 전환 상태
  const [activeView, setActiveView] = useState<'left' | 'right'>('left');
  const [isMobile, setIsMobile] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<{
    id: number;
    text: string;
    completed?: boolean;
    notes?: string;
    startTime?: number;
    endTime?: number;
    type: 'brain-dump' | 'todo-list' | 'time-block';
  } | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const {
    brainDump,
    todoList,
    timeBlocks,
    setBrainDump,
    setTodoList,
    setTimeBlocks,
    handleSave,
    handleAutoSave,
    loading,
    isSaving,
    lastSavedAt,
  } = usePlannerData(date, CurrentUser.id, showSuccess, showError);

  const [newDumpText, setNewDumpText] = useState('');
  const [draggedItem, setDraggedItem] = useState<BrainDumpItem | TodoItem | null>(null);
  const [dragSource, setDragSource] = useState<'brain-dump' | 'todo-list' | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);


  // 모바일 뷰포트 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 페이지 이탈 시 저장되지 않은 데이터 경고
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isSaving) {
        e.preventDefault();
        e.returnValue = ''; // 브라우저 표준 경고창 표시
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isSaving]);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      handleAutoSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [brainDump, todoList, timeBlocks, loading, handleAutoSave]);

  const handleDateChange = useCallback((year: number, month: number, day: number) => {
    const newDate = new Date(year, month - 1, day);
    setDate(newDate);
  }, []);

  const handleDayOfWeekClick = useCallback((targetDayIndex: number) => {
    const currentDayIndex = date.getDay();
    const diff = targetDayIndex - currentDayIndex;

    const newDate = new Date(date);
    newDate.setDate(date.getDate() + diff);
    setDate(newDate);
  }, [date]);

  const updateBlockTime = useCallback((blockId: number, newStart: number, newEnd: number) => {
    if (!timeBlocks) return;

    setTimeBlocks(timeBlocks.map(block =>
      block.id === blockId
        ? { ...block, startTime: newStart, endTime: newEnd }
        : block
    ));
  }, [timeBlocks, setTimeBlocks]);

  const {
    draggingBlock,
    resizingBlock,
    activeBlockId,
    dragPreviewOffset,
    setActiveBlockId,
    handleBlockMouseDown,
    clearActiveBlock
  } = useTimeBlockInteraction(timeBlocks || [], updateBlockTime);

  // 배경 클릭 시 편집 모드 해제
  const handleGridBackgroundClick = useCallback((e: React.MouseEvent) => {
    // 클릭된 요소가 타임블록 내부 요소가 아니면 해제
    const target = e.target as HTMLElement;
    if (!target.closest('.time-block-container')) {
      setActiveBlockId(null);
    }
  }, [setActiveBlockId]);

  const handleBlockEditorSave = useCallback((blockId: number, newStart: number, newEnd: number) => {
    const hasConflict = checkTimeConflict(timeBlocks || [], blockId, newStart, newEnd);

    if (hasConflict) {
      showError('다른 일정과 시간이 겹칩니다. 시간을 다시 설정해주세요.');
      return;
    }

    if (newEnd > 1440) {
      showError('종료 시간이 24시를 초과할 수 없습니다.');
      return;
    }

    updateBlockTime(blockId, newStart, newEnd);
    setEditingBlock(null);
  }, [timeBlocks, showError, updateBlockTime]);

  const addBrainDump = useCallback(() => {
    if (newDumpText.trim()) {
      setBrainDump([...brainDump || [], {
        id: Date.now(),
        text: newDumpText,
        completed: false
      }]);
      setNewDumpText('');
    }
  }, [newDumpText, brainDump, setBrainDump]);

  const deleteBrainDump = useCallback((id: number) => {
    setBrainDump((brainDump || []).filter(item => item.id !== id));

    if (timeBlocks) {
      setTimeBlocks(timeBlocks.filter(block =>
        !(block.todoId === id && block.isDirectFromBrainDump)
      ));
    }
  }, [brainDump, timeBlocks, setBrainDump, setTimeBlocks]);

  const toggleBrainDumpComplete = useCallback((id: number) => {
    if (!brainDump) return;

    setBrainDump(brainDump.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));

    if (!timeBlocks) return;
    const updatedItem = brainDump.find(item => item.id === id);
    if (updatedItem) {
      setTimeBlocks(timeBlocks.map(block =>
        block.todoId === id && block.isDirectFromBrainDump
          ? { ...block, completed: !updatedItem.completed }
          : block
      ));
    }
  }, [brainDump, timeBlocks, setBrainDump, setTimeBlocks]);

  // Todo 핸들러
  const deleteTodo = useCallback((id: number) => {
    setTodoList((prev: TodoItem[] | null) => (prev || []).filter(item => item.id !== id));
    setTimeBlocks((prev: TimeBlock[] | null) => (prev || []).filter(block => block.todoId !== id));
  }, [setTodoList, setTimeBlocks]);

  const toggleTodoComplete = useCallback((id: number) => {
    setTodoList((prev: TodoItem[] | null) => {
      const items = prev || [];
      const updated = items.map(item =>
        item.id === id ? { ...item, completed: !item.completed } : item
      );

      // 연동된 타임블록들도 함께 업데이트
      const targetItem = updated.find(i => i.id === id);
      if (targetItem) {
        setTimeBlocks((blocks: TimeBlock[] | null) =>
          (blocks || []).map(block =>
            block.todoId === id ? { ...block, completed: targetItem.completed } : block
          )
        );
      }

      return updated;
    });
  }, [setTodoList, setTimeBlocks]);

  const handleItemDetailSave = useCallback((updatedItem: any) => {
    if (!updatedItem) return;

    if (updatedItem.type === 'time-block') {
      const hasConflict = checkTimeConflict(timeBlocks || [], updatedItem.id, updatedItem.startTime, updatedItem.endTime);
      if (hasConflict) {
        showError('다른 일정과 시간이 겹칩니다. 시간을 다시 설정해주세요.');
        return;
      }

      setTimeBlocks((prev: TimeBlock[] | null) =>
        (prev || []).map((block: TimeBlock) =>
          block.id === updatedItem.id
            ? { ...block, text: updatedItem.text, notes: updatedItem.notes, startTime: updatedItem.startTime, endTime: updatedItem.endTime }
            : block
        )
      );

      // 연동된 원본 항목(Brain Dump 또는 Todo) 업데이트
      const targetBlock = (timeBlocks || []).find(b => b.id === updatedItem.id);
      if (targetBlock?.todoId) {
        if (targetBlock.isDirectFromBrainDump) {
          setBrainDump((prev: BrainDumpItem[] | null) =>
            (prev || []).map((item: BrainDumpItem) =>
              item.id === targetBlock.todoId ? { ...item, text: updatedItem.text, notes: updatedItem.notes } : item
            )
          );
        } else {
          setTodoList((prev: TodoItem[] | null) =>
            (prev || []).map((item: TodoItem) =>
              item.id === targetBlock.todoId ? { ...item, text: updatedItem.text, notes: updatedItem.notes } : item
            )
          );
        }

        // 동일한 todoId를 공유하는 다른 타임블록들도 함께 업데이트 (일관성 유지)
        setTimeBlocks((prev: TimeBlock[] | null) =>
          (prev || []).map((block: TimeBlock) =>
            block.todoId === targetBlock.todoId
              ? { ...block, text: updatedItem.text, notes: updatedItem.notes }
              : block
          )
        );
      }
    } else if (updatedItem.type === 'brain-dump') {
      setBrainDump((prev: BrainDumpItem[] | null) =>
        (prev || []).map((item: BrainDumpItem) => item.id === updatedItem.id ? { ...item, text: updatedItem.text, notes: updatedItem.notes } : item)
      );
      // 타임플랜에 등록된 연동 블록들도 전체 업데이트
      setTimeBlocks((prev: TimeBlock[] | null) =>
        (prev || []).map((block: TimeBlock) =>
          block.todoId === updatedItem.id ? { ...block, text: updatedItem.text, notes: updatedItem.notes } : block
        )
      );
    } else if (updatedItem.type === 'todo-list') {
      setTodoList((prev: TodoItem[] | null) =>
        (prev || []).map((item: TodoItem) => item.id === updatedItem.id ? { ...item, text: updatedItem.text, notes: updatedItem.notes } : item)
      );
      // 연동된 타임블록들도 전체 업데이트
      setTimeBlocks((prev: TimeBlock[] | null) =>
        (prev || []).map((block: TimeBlock) =>
          block.todoId === updatedItem.id ? { ...block, text: updatedItem.text, notes: updatedItem.notes } : block
        )
      );
    }

    setIsDetailModalOpen(false);
    setSelectedItem(null);
  }, [timeBlocks, setTimeBlocks, setBrainDump, setTodoList, showError]);

  // 이동 핸들러 - 체크 상태 유지 + 현재 시간 이후 배치
  const moveBrainDumpToTodo = useCallback((item: BrainDumpItem) => {
    if (!todoList || !timeBlocks || !brainDump) return;

    if (todoList.length >= 5) {
      showError('할 일 목록은 최대 5개까지만 추가할 수 있습니다.');
      return;
    }

    // Brain Dump에서 직접 추가된 기존 타임블록 제거
    const existingDirectBlock = timeBlocks.find(block =>
      block.todoId === item.id && block.isDirectFromBrainDump
    );

    // 현재 시간 이후 슬롯 찾기
    const slot = findAvailableSlotAfterNow(
      existingDirectBlock
        ? timeBlocks.filter(block => block.id !== existingDirectBlock.id)
        : timeBlocks,
      60
    );

    if (!slot) {
      showError('타임 플랜에 사용 가능한 시간이 없습니다. 기존 일정을 조정해주세요.');
      return;
    }

    const newTodo = {
      id: item.id,
      text: item.text,
      completed: item.completed
    };
    setTodoList([...todoList, newTodo]);
    setBrainDump(brainDump.filter(i => i.id !== item.id));

    const colorIndex = timeBlocks.length % PASTEL_COLORS.length;

    // 기존 Brain Dump 직접 추가 블록 제거하고 새로운 Todo 블록 생성
    setTimeBlocks([
      ...timeBlocks.filter(block => !(block.todoId === item.id && block.isDirectFromBrainDump)),
      {
        id: Date.now(),
        todoId: newTodo.id,
        text: newTodo.text,
        startTime: slot.startTime,
        endTime: slot.endTime,
        colorIndex,
        completed: item.completed,
        isDirectFromBrainDump: false
      }
    ]);
  }, [todoList, timeBlocks, brainDump, showError, setTodoList, setBrainDump, setTimeBlocks]);

  const moveTodoToBrainDump = useCallback((item: TodoItem) => {
    const newBrainDumpItem = {
      id: item.id,
      text: item.text,
      completed: item.completed
    };
    setBrainDump((prev: BrainDumpItem[] | null) => [...prev || [], newBrainDumpItem]);
    setTodoList((prev: TodoItem[] | null) => (prev || []).filter(i => i.id !== item.id));

    // Todo에서 온 타임블록은 완전히 제거 (isDirectFromBrainDump가 false인 것)
    setTimeBlocks((prev: TimeBlock[] | null) => (prev || []).filter(block => block.todoId !== item.id));
  }, [setBrainDump, setTodoList, setTimeBlocks]);

  // 드래그앤드롭 핸들러
  const handleDragStart = useCallback((e: React.DragEvent, item: BrainDumpItem | TodoItem, source: 'brain-dump' | 'todo-list') => {
    setDraggedItem(item);
    setDragSource(source);
    e.dataTransfer.effectAllowed = 'move';

    // 모바일 초기 좌표 설정
    if (e.clientX && e.clientY) {
      setTouchPos({ x: e.clientX, y: e.clientY });
    }
  }, [setDraggedItem, setDragSource, setTouchPos]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDropToTodo = useCallback((e: React.DragEvent, targetId?: number) => {
    if (!todoList || !timeBlocks || !brainDump) return;

    e.preventDefault();
    if (draggedItem) {
      if (dragSource === 'brain-dump') {
        // 다른 리스트에서 이동
        if (todoList.length >= 5) {
          showError('할 일 목록은 최대 5개까지만 추가할 수 있습니다.');
          setDraggedItem(null);
          setDragSource(null);
          return;
        }

        const existingDirectBlock = timeBlocks.find(block =>
          block.todoId === draggedItem.id && block.isDirectFromBrainDump
        );

        const slot = findAvailableSlotAfterNow(
          existingDirectBlock
            ? timeBlocks.filter(block => block.id !== existingDirectBlock.id)
            : timeBlocks,
          60
        );

        if (!slot) {
          showError('타임 플랜에 사용 가능한 시간이 없습니다. 기존 일정을 조정해주세요.');
          setDraggedItem(null);
          setDragSource(null);
          return;
        }

        const newTodo = { ...draggedItem }; // 모든 속성(notes 포함) 보존

        let newTodoList = [...todoList];
        if (targetId !== undefined) {
          const targetIndex = newTodoList.findIndex(item => item.id === targetId);
          newTodoList.splice(targetIndex, 0, newTodo);
        } else {
          newTodoList.push(newTodo);
        }

        setTodoList(newTodoList);
        setBrainDump(brainDump.filter(item => item.id !== draggedItem.id));

        const colorIndex = timeBlocks.length % PASTEL_COLORS.length;
        setTimeBlocks([
          ...timeBlocks.filter(block => !(block.todoId === draggedItem.id && block.isDirectFromBrainDump)),
          {
            id: Date.now(),
            todoId: newTodo.id,
            text: newTodo.text,
            startTime: slot.startTime,
            endTime: slot.endTime,
            colorIndex,
            completed: draggedItem.completed,
            isDirectFromBrainDump: false,
            notes: draggedItem.notes // 메모 보존
          }
        ]);
      } else if (dragSource === 'todo-list') {
        // 동일 리스트 내 순서 변경
        if (targetId === undefined || targetId === draggedItem.id) {
          setDraggedItem(null);
          setDragSource(null);
          return;
        }

        const newTodoList = [...todoList];
        const currentIndex = newTodoList.findIndex(item => item.id === draggedItem.id);
        const targetIndex = newTodoList.findIndex(item => item.id === targetId);

        if (currentIndex > -1 && targetIndex > -1) {
          const [movedItem] = newTodoList.splice(currentIndex, 1);
          newTodoList.splice(targetIndex, 0, movedItem);
          setTodoList(newTodoList);
        }
      }
    }
    setDraggedItem(null);
    setDragSource(null);
  }, [todoList, timeBlocks, brainDump, draggedItem, dragSource, showError, setTodoList, setBrainDump, setTimeBlocks]);

  const handleDropToBrainDump = useCallback((e: React.DragEvent, targetId?: number) => {
    if (!todoList || !timeBlocks || !brainDump) return;

    e.preventDefault();
    if (draggedItem) {
      if (dragSource === 'todo-list') {
        // 다른 리스트에서 이동
        const newBrainDumpItem = { ...draggedItem }; // 모든 속성 보존

        let newBrainDump = [...brainDump];
        if (targetId !== undefined) {
          const targetIndex = newBrainDump.findIndex(item => item.id === targetId);
          newBrainDump.splice(targetIndex, 0, newBrainDumpItem);
        } else {
          newBrainDump.push(newBrainDumpItem);
        }

        setBrainDump(newBrainDump);
        setTodoList(todoList.filter(item => item.id !== draggedItem.id));
        setTimeBlocks(timeBlocks.filter(block => block.todoId !== draggedItem.id));
      } else if (dragSource === 'brain-dump') {
        // 동일 리스트 내 순서 변경
        if (targetId === undefined || targetId === draggedItem.id) {
          setDraggedItem(null);
          setDragSource(null);
          return;
        }

        const newBrainDump = [...brainDump];
        const currentIndex = newBrainDump.findIndex(item => item.id === draggedItem.id);
        const targetIndex = newBrainDump.findIndex(item => item.id === targetId);

        if (currentIndex > -1 && targetIndex > -1) {
          const [movedItem] = newBrainDump.splice(currentIndex, 1);
          newBrainDump.splice(targetIndex, 0, movedItem);
          setBrainDump(newBrainDump);
        }
      }
    }
    setDraggedItem(null);
    setDragSource(null);
  }, [todoList, timeBlocks, brainDump, draggedItem, dragSource, setBrainDump, setTodoList, setTimeBlocks]);

  // Brain Dump를 타임플랜에 직접 추가 - 현재 시간 이후 배치
  const addBrainDumpToTimePlan = useCallback((item: BrainDumpItem) => {
    if (!timeBlocks || !brainDump) return;

    // 이미 시간표에 있는지 확인
    const existingBlock = timeBlocks.find(block =>
      block.todoId === item.id && block.isDirectFromBrainDump
    );

    if (existingBlock) {
      // 이미 있으면 제거
      setTimeBlocks(timeBlocks.filter(block => block.id !== existingBlock.id));
      showSuccess('시간표에서 제거되었습니다!');
      return;
    }

    // 현재 시간 이후 슬롯 찾기
    const slot = findAvailableSlotAfterNow(timeBlocks, 60);
    if (!slot) {
      showError('타임 플랜에 사용 가능한 시간이 없습니다. 기존 일정을 조정해주세요.');
      return;
    }

    const colorIndex = timeBlocks.length % PASTEL_COLORS.length;

    setTimeBlocks([...timeBlocks, {
      id: Date.now(),
      todoId: item.id,
      text: item.text,
      startTime: slot.startTime,
      endTime: slot.endTime,
      colorIndex,
      completed: item.completed,
      isDirectFromBrainDump: true
    }]);

    showSuccess('시간표에 추가되었습니다!');
  }, [timeBlocks, brainDump, setTimeBlocks, showSuccess, showError]);

  // 모바일 드래그 앤 드롭을 위한 전역 터치 핸들러
  useEffect(() => {
    if (!isMobile) return;

    const handleTouchMoveGlobal = (e: TouchEvent) => {
      if (!draggedItem || !dragSource) return;

      // 드래그 중에는 스크롤 방지
      e.preventDefault();

      const touch = e.touches[0];
      setTouchPos({ x: touch.clientX, y: touch.clientY });
    };

    const handleTouchEndGlobal = (e: TouchEvent) => {
      if (!draggedItem || !dragSource) return;

      const touch = e.changedTouches[0];
      const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);

      setTouchPos(null);

      if (!targetElement) {
        setDraggedItem(null);
        setDragSource(null);
        return;
      }

      // 드롭 대상 확인 (클래스 기반)
      const isTodoTarget = targetElement.closest('.todo-list-container');
      const isBrainDumpTarget = targetElement.closest('.brain-dump-container');

      if (dragSource === 'brain-dump' && isTodoTarget) {
        // Brain Dump -> Todo List 이동
        const fakeEvent = { preventDefault: () => { } } as React.DragEvent;
        handleDropToTodo(fakeEvent);
      } else if (dragSource === 'todo-list' && isBrainDumpTarget) {
        // Todo List -> Brain Dump 이동
        const fakeEvent = { preventDefault: () => { } } as React.DragEvent;
        handleDropToBrainDump(fakeEvent);
      } else {
        setDraggedItem(null);
        setDragSource(null);
      }
    };

    document.addEventListener('touchmove', handleTouchMoveGlobal, { passive: false });
    document.addEventListener('touchend', handleTouchEndGlobal);
    return () => {
      document.removeEventListener('touchmove', handleTouchMoveGlobal);
      document.removeEventListener('touchend', handleTouchEndGlobal);
    };
  }, [isMobile, draggedItem, dragSource, handleDropToTodo, handleDropToBrainDump]);


  const brainDumpItemsInTimePlan = React.useMemo(() => {
    if (!timeBlocks || !brainDump) return [];

    return timeBlocks
      .filter(block => block.isDirectFromBrainDump)
      .map(block => block.todoId)
      .filter(id => brainDump.some(item => item.id === id));
  }, [timeBlocks, brainDump]);


  return (
    <div className="h-[100dvh] bg-background transition-colors">
      {loading ? (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center">
          <div className="text-blue-500 font-bold">{t('common.loading')}</div>
        </div>
      ) : null}

      {isMobile ? (
        <div className="h-full flex flex-col pt-safe">
          <div className="flex items-center justify-end px-6 py-2 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
            <div className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full text-[10px] font-bold ${isSaving ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 'bg-green-100 text-green-700 dark:bg-green-900/30'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
              {isSaving ? 'Saving...' : lastSavedAt ? lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Ready'}
            </div>
          </div>
          <ErrorToast message={errorMessage} />
          <SuccessToast message={successMessage} />
          <div className="h-full relative flex-1 overflow-hidden">
            {/* 좌측 뷰 (할일/브레인덤프) */}
            <div
              className={`absolute h-full top-0 left-0 right-0 transition-transform duration-300 ease-in-out ${activeView === 'left' ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
              <div className="h-full overflow-y-auto p-4 space-y-4">
                <div className="bg-card rounded-ios-lg shadow-ios">
                  <TodoList
                    items={todoList || []}
                    onToggleComplete={toggleTodoComplete}
                    onDeleteItem={deleteTodo}
                    onMoveToBrainDump={moveTodoToBrainDump}
                    onDragStart={(e, item) => handleDragStart(e, item, 'todo-list')}
                    onDragOver={handleDragOver}
                    onDrop={handleDropToTodo}
                    onItemDoubleClick={(item) => {
                      setSelectedItem({ ...item, type: 'todo-list' });
                      setIsDetailModalOpen(true);
                    }}
                    draggedItemId={draggedItem?.id}
                  />
                </div>

                <BrainDump
                  items={brainDump || []}
                  itemsInTimePlan={brainDumpItemsInTimePlan}
                  newItemText={newDumpText}
                  onNewItemTextChange={setNewDumpText}
                  onAddItem={addBrainDump}
                  onDeleteItem={deleteBrainDump}
                  onToggleComplete={toggleBrainDumpComplete}
                  onMoveToTodo={moveBrainDumpToTodo}
                  onAddToTimePlan={addBrainDumpToTimePlan}
                  onDragStart={(e, item) => handleDragStart(e, item, 'brain-dump')}
                  onDragOver={handleDragOver}
                  onDrop={handleDropToBrainDump}
                  isMobile={true}
                  onOpenAddModal={() => setIsAddModalOpen(true)}
                  onItemDoubleClick={(item) => {
                    setSelectedItem({ ...item, type: 'brain-dump' });
                    setIsDetailModalOpen(true);
                  }}
                  draggedItemId={draggedItem?.id}
                />
              </div>
            </div>

            {/* 우측 뷰 (타임플랜) */}
            <div
              className={`absolute h-full top-0 left-0 right-0 transition-transform duration-300 ease-in-out ${activeView === 'right' ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
              <div
                className="h-full"
                onClick={handleGridBackgroundClick}
              >
                <TimePlan
                  date={date}
                  timeBlocks={timeBlocks || []}
                  draggingBlockId={draggingBlock}
                  resizingBlockId={resizingBlock}
                  dragPreviewOffset={dragPreviewOffset}
                  onDateChange={handleDateChange}
                  onDayOfWeekClick={handleDayOfWeekClick}
                  onBlockMouseDown={handleBlockMouseDown}
                  onBlockEdit={(block) => {
                    setSelectedItem({ ...block, type: 'time-block' });
                    setIsDetailModalOpen(true);
                  }}
                  isMobile={true}
                  activeBlockId={activeBlockId}
                  activeView={activeView}
                />
              </div>
            </div>

            {/* Brain Dump 추가 모달 */}
            <BrainDumpAddModal
              isOpen={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
              onAdd={(text) => {
                if (!brainDump) return;
                const newItem: BrainDumpItem = {
                  id: Date.now(),
                  text: text,
                  completed: false
                };
                setBrainDump([...brainDump, newItem]);
              }}
            />
          </div>
          {/* 하단 네비게이션 바 (통합 컴포넌트) */}
          <MobileBottomNav
            activeView={activeView}
            onViewToggle={() => setActiveView(activeView === 'left' ? 'right' : 'left')}
          />
        </div>
      ) : (
        <div className="h-screen p-4 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow overflow-hidden">
            <div className="flex items-center px-4 py-1 mb-3">
              <div className="flex items-center gap-2 text-[10px] font-bold py-1 px-3 rounded-full bg-muted/50 border border-border/50 shadow-sm">
                <div className={`w-1.5 h-1.5 rounded-full ${isSaving ? 'bg-orange-500 animate-pulse' : 'bg-green-500'}`} />
                <span className="text-muted-foreground uppercase tracking-tighter">
                  {isSaving ? 'Saving...' : lastSavedAt ? `Saved ${lastSavedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Ready'}
                </span>
              </div>
            </div>

            <ErrorToast message={errorMessage} />
            <SuccessToast message={successMessage} />

            <div className="grid grid-cols-3 gap-6 flex-grow overflow-hidden">
              <div className="flex flex-col h-full overflow-hidden">
                <div className="flex-grow overflow-y-auto space-y-6 pr-2">
                  <div className="bg-card rounded-lg shadow-sm">
                    <TodoList
                      items={todoList || []}
                      onToggleComplete={toggleTodoComplete}
                      onDeleteItem={deleteTodo}
                      onMoveToBrainDump={moveTodoToBrainDump}
                      onDragStart={(e, item) => handleDragStart(e, item, 'todo-list')}
                      onDragOver={handleDragOver}
                      onDrop={handleDropToTodo}
                      onItemDoubleClick={(item) => {
                        setSelectedItem({ ...item, type: 'todo-list' });
                        setIsDetailModalOpen(true);
                      }}
                      draggedItemId={draggedItem?.id}
                    />
                  </div>

                  <BrainDump
                    items={brainDump || []}
                    itemsInTimePlan={brainDumpItemsInTimePlan}
                    newItemText={newDumpText}
                    onNewItemTextChange={setNewDumpText}
                    onAddItem={addBrainDump}
                    onDeleteItem={deleteBrainDump}
                    onToggleComplete={toggleBrainDumpComplete}
                    onMoveToTodo={moveBrainDumpToTodo}
                    onAddToTimePlan={addBrainDumpToTimePlan}
                    onDragStart={(e, item) => handleDragStart(e, item, 'brain-dump')}
                    onDragOver={handleDragOver}
                    onDrop={handleDropToBrainDump}
                    onItemDoubleClick={(item) => {
                      setSelectedItem({ ...item, type: 'brain-dump' });
                      setIsDetailModalOpen(true);
                    }}
                    draggedItemId={draggedItem?.id}
                  />
                </div>
              </div>

              <div className="col-span-2 h-full overflow-hidden rounded-lg shadow">
                <TimePlan
                  date={date}
                  timeBlocks={timeBlocks || []}
                  draggingBlockId={draggingBlock}
                  resizingBlockId={resizingBlock}
                  dragPreviewOffset={dragPreviewOffset}
                  onDateChange={handleDateChange}
                  onDayOfWeekClick={handleDayOfWeekClick}
                  onBlockMouseDown={handleBlockMouseDown}
                  onBlockEdit={(block) => {
                    setSelectedItem({ ...block, type: 'time-block' });
                    setIsDetailModalOpen(true);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedItem ? (
        <ItemDetailModal
          isOpen={isDetailModalOpen}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSelectedItem(null);
          }}
          item={selectedItem}
          onSave={handleItemDetailSave}
          isMobile={isMobile}
          timeBlocks={timeBlocks || []}
          onDelete={(id: number) => {
            if (selectedItem?.type === 'brain-dump') {
              deleteBrainDump(id);
            } else if (selectedItem?.type === 'todo-list') {
              deleteTodo(id);
            } else if (selectedItem?.type === 'time-block') {
              setTimeBlocks((prev: TimeBlock[] | null) => (prev || []).filter((b: TimeBlock) => b.id !== id));
            }
          }}
        />
      ) : null}

      {editingBlock && !isMobile ? (
        <TimeBlockEditor
          block={editingBlock}
          onSave={handleBlockEditorSave}
          onClose={() => setEditingBlock(null)}
        />
      ) : null}

      {/* 모바일 드래그 프리뷰 (Ghost) */}
      {isMobile && draggedItem && touchPos ? (
        <div
          className="fixed pointer-events-none z-[9999] opacity-70 p-3 bg-card border-2 border-primary rounded-xl shadow-2xl scale-105"
          style={{
            left: touchPos.x,
            top: touchPos.y,
            transform: 'translate(-50%, -100%) rotate(2deg)',
            width: '200px',
            maxWidth: '80vw'
          }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-sm font-semibold truncate text-foreground">{draggedItem.text}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default TimeBoxPlanner;