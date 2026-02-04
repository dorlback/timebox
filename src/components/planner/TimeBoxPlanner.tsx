import React, { useEffect, useState, useCallback, useMemo } from 'react';
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


const TimeBoxPlanner = ({ CurrentUser }: { CurrentUser: User }) => {
  const { isDark, toggleDark, mounted } = useDarkMode();
  const [date, setDate] = useState(new Date());
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
    loading,
    handleSave,
    handleAutoSave,
  } = usePlannerData(date, CurrentUser.id, showSuccess, showError);

  const [newDumpText, setNewDumpText] = useState('');
  const [draggedItem, setDraggedItem] = useState<BrainDumpItem | TodoItem | null>(null);
  const [dragSource, setDragSource] = useState<'brain-dump' | 'todo-list' | null>(null);
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
    setActiveBlockId,
    handleBlockMouseDown
  } = useTimeBlockInteraction(timeBlocks || [], updateBlockTime);

  // 배경 클릭 시 편집 모드 해제
  const handleGridBackgroundClick = (e: React.MouseEvent) => {
    // 클릭된 요소가 타임블록 내부 요소가 아니면 해제
    const target = e.target as HTMLElement;
    if (!target.closest('.time-block-container')) {
      setActiveBlockId(null);
    }
  };

  const handleBlockEditorSave = (blockId: number, newStart: number, newEnd: number) => {
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
  };

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
  const deleteTodo = (id: number) => {
    setTodoList((todoList || []).filter(item => item.id !== id));
    setTimeBlocks((timeBlocks || []).filter(block => block.todoId !== id));
  };

  const toggleTodoComplete = (id: number) => {
    if (!todoList) return;
    setTodoList(todoList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));

    const updatedTodo = todoList.find(item => item.id === id);
    if (updatedTodo) {
      if (!timeBlocks) return;
      setTimeBlocks(timeBlocks.map(block =>
        block.todoId === id ? { ...block, completed: !updatedTodo.completed } : block
      ));
    }
  };

  const handleItemDetailSave = (updatedItem: any) => {
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
    } else if (updatedItem.type === 'brain-dump') {
      setBrainDump((prev: BrainDumpItem[] | null) =>
        (prev || []).map((item: BrainDumpItem) => item.id === updatedItem.id ? { ...item, text: updatedItem.text, notes: updatedItem.notes } : item)
      );
      // 타임플랜에 등록된 브레인덤프 연동 블록도 업데이트
      setTimeBlocks((prev: TimeBlock[] | null) =>
        (prev || []).map((block: TimeBlock) => block.todoId === updatedItem.id && block.isDirectFromBrainDump ? { ...block, text: updatedItem.text, notes: updatedItem.notes } : block)
      );
    } else if (updatedItem.type === 'todo-list') {
      setTodoList((prev: TodoItem[] | null) =>
        (prev || []).map((item: TodoItem) => item.id === updatedItem.id ? { ...item, text: updatedItem.text, notes: updatedItem.notes } : item)
      );
      // 연동된 타임블록들도 텍스트/메모 업데이트
      setTimeBlocks((prev: TimeBlock[] | null) =>
        (prev || []).map((block: TimeBlock) => block.todoId === updatedItem.id ? { ...block, text: updatedItem.text, notes: updatedItem.notes } : block)
      );
    }

    setIsDetailModalOpen(false);
    setSelectedItem(null);
  };

  // 이동 핸들러 - 체크 상태 유지 + 현재 시간 이후 배치
  const moveBrainDumpToTodo = (item: BrainDumpItem) => {
    if (!todoList) return;
    if (!timeBlocks) return;
    if (!brainDump) return;

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
  };

  const moveTodoToBrainDump = (item: TodoItem) => {
    const newBrainDumpItem = {
      id: item.id,
      text: item.text,
      completed: item.completed
    };
    setBrainDump([...brainDump || [], newBrainDumpItem]);
    setTodoList((todoList || []).filter(i => i.id !== item.id));

    // Todo에서 온 타임블록은 완전히 제거 (isDirectFromBrainDump가 false인 것)
    setTimeBlocks((timeBlocks || []).filter(block => block.todoId !== item.id));
  };

  // 드래그앤드롭 핸들러
  const handleDragStart = (e: React.DragEvent, item: BrainDumpItem | TodoItem, source: 'brain-dump' | 'todo-list') => {
    setDraggedItem(item);
    setDragSource(source);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDropToTodo = (e: React.DragEvent) => {
    if (!todoList) return;
    if (!timeBlocks) return;
    if (!brainDump) return;

    e.preventDefault();
    if (draggedItem && dragSource === 'brain-dump') {
      if (todoList.length >= 5) {
        showError('할 일 목록은 최대 5개까지만 추가할 수 있습니다.');
        setDraggedItem(null);
        setDragSource(null);
        return;
      }

      // Brain Dump에서 직접 추가된 기존 타임블록 제거
      const existingDirectBlock = timeBlocks.find(block =>
        block.todoId === draggedItem.id && block.isDirectFromBrainDump
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
        setDraggedItem(null);
        setDragSource(null);
        return;
      }

      const newTodo = {
        id: draggedItem.id,
        text: draggedItem.text,
        completed: draggedItem.completed
      };
      setTodoList([...todoList, newTodo]);
      setBrainDump(brainDump.filter(item => item.id !== draggedItem.id));

      const colorIndex = timeBlocks.length % PASTEL_COLORS.length;

      // 기존 Brain Dump 직접 추가 블록 제거하고 새로운 Todo 블록 생성
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
          isDirectFromBrainDump: false
        }
      ]);
    }
    setDraggedItem(null);
    setDragSource(null);
  };

  const handleDropToBrainDump = (e: React.DragEvent) => {
    if (!todoList) return;
    if (!timeBlocks) return;
    if (!brainDump) return;

    e.preventDefault();
    if (draggedItem && dragSource === 'todo-list') {
      const newBrainDumpItem = {
        id: draggedItem.id,
        text: draggedItem.text,
        completed: draggedItem.completed
      };
      setBrainDump([...brainDump, newBrainDumpItem]);
      setTodoList(todoList.filter(item => item.id !== draggedItem.id));

      // Todo에서 온 타임블록은 완전히 제거
      setTimeBlocks(timeBlocks.filter(block => block.todoId !== draggedItem.id));
    }
    setDraggedItem(null);
    setDragSource(null);
  };

  // Brain Dump를 타임플랜에 직접 추가 - 현재 시간 이후 배치
  const addBrainDumpToTimePlan = (item: BrainDumpItem) => {
    if (!timeBlocks) return;
    if (!brainDump) return;

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
  };

  const brainDumpItemsInTimePlan = React.useMemo(() => {
    if (!timeBlocks || !brainDump) return [];

    return timeBlocks
      .filter(block => block.isDirectFromBrainDump)
      .map(block => block.todoId)
      .filter(id => brainDump.some(item => item.id === id));
  }, [timeBlocks, brainDump]);


  return (
    <div className="h-screen bg-background transition-colors">
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-black/50 z-50 flex items-center justify-center">
          <div className="text-blue-500 font-bold">데이터 불러오는 중...</div>
        </div>
      )}

      {/* 모바일 UI */}
      {isMobile && (
        <>
          <ErrorToast message={errorMessage} />
          <SuccessToast message={successMessage} />
          <div className="h-[100svh] flex flex-col">
            <div className="relative flex-1 overflow-hidden">
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
                  />
                </div>
              </div>

              {/* 우측 뷰 (타임플랜) */}
              <div
                className={`absolute h-full top-0 left-0 right-0 transition-transform duration-300 ease-in-out ${activeView === 'right' ? 'translate-x-0' : 'translate-x-full'
                  }`}
              >
                {/* 여기 */}
                <div
                  className="h-full"
                  onClick={handleGridBackgroundClick}
                >
                  <TimePlan
                    date={date}
                    timeBlocks={timeBlocks || []}
                    draggingBlockId={draggingBlock}
                    resizingBlockId={resizingBlock}
                    onDateChange={handleDateChange}
                    onDayOfWeekClick={handleDayOfWeekClick}
                    onBlockMouseDown={handleBlockMouseDown}
                    onBlockEdit={(block) => {
                      setSelectedItem({ ...block, type: 'time-block' });
                      setIsDetailModalOpen(true);
                    }}
                    isMobile={true}
                    activeBlockId={activeBlockId}
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
            {/* 하단 네비게이션 바 (iOS 스타일) */}
            <nav className="h-[70px] bottom-0 left-0 right-0 bg-card/95 backdrop-blur-md border-t border-border z-50">
              <div className="relative flex items-center justify-around h-16 px-2">
                {/* 1. 홈 버튼 */}
                <Link href="/">
                  <button className="flex flex-col items-center justify-center gap-0.5 px-3 pb-2 rounded-lg transition-all text-muted-foreground hover:text-primary">
                    <div className="min-h-[22px] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium">홈</span>
                  </button>
                </Link>

                {/* 2. 다크모드 버튼 */}
                <button
                  onClick={toggleDark}
                  className="flex flex-col items-center justify-center gap-0.5 px-3 pb-2 rounded-lg transition-all text-muted-foreground hover:text-primary"
                >
                  <div className="min-h-[22px] flex items-center justify-center">
                    {isDark ? (
                      <Sun size={22} aria-hidden="true" />
                    ) : (
                      <Moon size={22} aria-hidden="true" />
                    )}
                  </div>
                  <span className="text-[10px] font-medium">테마</span>
                </button>

                {/* 3. 가운데: 원형 전환 버튼 (큰 원형, 상단 돌출) */}
                <button
                  onClick={() => setActiveView(activeView === 'left' ? 'right' : 'left')}
                  className="absolute left-1/2 -translate-x-1/2 -top-7 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg hover:shadow-xl active:scale-95 transition-all flex items-center justify-center"
                  style={{
                    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.4)'
                  }}
                >
                  {activeView === 'left' ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4"></path>
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                    </svg>
                  )}
                </button>

                {/* 4. 로그아웃 버튼 */}
                <Link href="/login">
                  <button className="flex flex-col items-center justify-center gap-0.5 px-3 pb-2 rounded-lg transition-all text-muted-foreground hover:text-primary">
                    <div className="min-h-[22px] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                      </svg>
                    </div>
                    <span className="text-[10px] font-medium">로그아웃</span>
                  </button>
                </Link>

                {/* 5. 저장 버튼 */}
                <button
                  onClick={handleSave}
                  className="flex flex-col items-center justify-center gap-0.5 px-3 pb-2 rounded-lg transition-all text-muted-foreground hover:text-primary"
                >
                  <div className="min-h-[22px] flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                  </div>
                  <span className="text-[10px] font-medium">저장</span>
                </button>
              </div>
            </nav>

          </div>

          {editingBlock && (
            <TimeBlockEditor
              block={editingBlock}
              onSave={handleBlockEditorSave}
              onClose={() => setEditingBlock(null)}
            />
          )}
        </>
      )}

      {/* 데스크톱 UI (기존) */}
      {!isMobile && (
        <div className="h-screen p-6 flex flex-col">
          <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 mb-6 drop-shadow border border-border bg-card rounded-full flex-shrink-0">
              <Link href="/">
                <h1 className="text-sm font-bold tracking-tight text-muted-foreground uppercase">
                  Daily <span className="text-foreground">Time Box</span>
                </h1>
              </Link>

              <div className="flex items-center gap-3">
                <DarkModeToggle />
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-primary hover:opacity-90 text-primary-foreground text-xs font-semibold px-5 py-2 rounded-full transition-all shadow-sm active:scale-95"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
                  </svg>
                  저장
                </button>
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
                  />
                </div>
              </div>

              <div className="col-span-2 h-full overflow-hidden rounded-lg shadow">
                <TimePlan
                  date={date}
                  timeBlocks={timeBlocks || []}
                  draggingBlockId={draggingBlock}
                  resizingBlockId={resizingBlock}
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

      {selectedItem && (
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
      )}

      {editingBlock && !isMobile && (
        <TimeBlockEditor
          block={editingBlock}
          onSave={handleBlockEditorSave}
          onClose={() => setEditingBlock(null)}
        />
      )}
    </div>
  );
};

export default TimeBoxPlanner;