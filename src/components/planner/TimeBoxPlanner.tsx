import React, { useEffect, useState } from 'react';
import { BrainDumpItem, TodoItem, TimeBlock } from '@/types/planner';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useTimeBlockInteraction } from '@/hooks/useTimeBlockInteraction';
import { findAvailableSlot, checkTimeConflict } from '@/utils/timeUtils';
import { PASTEL_COLORS } from '@/utils/colorUtils';
import { BrainDump } from './BrainDump';
import { TodoList } from './TodoList';
import { TimePlan } from './TimePlan';
import { TimeBlockEditor } from './TimeBlockEditor';
import { ErrorToast } from './ErrorToast';
import { SuccessToast } from './SuccessToast';
import { usePlannerTestData } from '@/hooks/usePlannerTestData';
import { User } from '@/types/user';
import { usePlannerData } from '@/hooks/usePlannerDate';
import { useSuccessToast } from '@/hooks/useSuccessToast';
import Link from "next/link";

const TimeBoxPlanner = ({ CurrentUser }: { CurrentUser: User }) => {
  // 날짜를 적용할 스테이트
  const [date, setDate] = useState(new Date());
  const { errorMessage, showError } = useErrorToast();
  const { successMessage, showSuccess } = useSuccessToast();

  // 날짜에 맞게 덤프,투두,플래너 등을 불러올 커스텀훅


  const {
    brainDump,
    todoList,
    timeBlocks,
    setBrainDump,
    setTodoList,
    setTimeBlocks,
    loading, // 로딩 상태 추가
    handleSave,
    handleAutoSave,
  } = usePlannerData(date, CurrentUser.id, showSuccess, showError);

  // const {
  //   brainDump,
  //   todoList,
  //   timeBlocks,
  //   setBrainDump,
  //   setTodoList,
  //   setTimeBlocks
  // } = usePlannerTestData(date);

  const [newDumpText, setNewDumpText] = useState(''); // 브레인 덤프 입력창 상태
  const [draggedItem, setDraggedItem] = useState<any>(null); // 현재 드래그 중인 아이템
  const [dragSource, setDragSource] = useState<string | null>(null); // 드래그 시작 지점이 어디인지 ('brain-dump' 또는 'todo-list')
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null); // 수정 중인 타임 블록

  useEffect(() => {
    // 로딩 중일 때는 실행하지 않음
    if (loading) return;

    const timer = setTimeout(() => {
      // 데이터가 존재할 때만 자동 저장 실행
      handleAutoSave();
      console.log("자동 저장 완료!");
    }, 2000); // 사용자가 입력을 멈추고 2초 뒤 저장

    return () => clearTimeout(timer);
  }, [brainDump, todoList, timeBlocks]); // 데이터가 바뀔 때마다 타이머 리셋

  // 날짜 변경 핸들러
  const handleDateChange = (year: number, month: number, day: number) => {
    const newDate = new Date(year, month - 1, day);
    setDate(newDate);
  };

  const handleDayOfWeekClick = (targetDayIndex: number) => {
    const currentDayIndex = date.getDay();
    const diff = targetDayIndex - currentDayIndex;

    const newDate = new Date(date);
    newDate.setDate(date.getDate() + diff);
    setDate(newDate);
  };

  // TimeBlock 업데이트
  // 시간 블록의 시작/종료 시간 업데이트
  const updateBlockTime = (blockId: number, newStart: number, newEnd: number) => {
    if (!timeBlocks) return; // 데이터가 없으면 아무것도 안 함

    setTimeBlocks(timeBlocks.map(block =>
      block.id === blockId
        ? { ...block, startTime: newStart, endTime: newEnd }
        : block
    ));
  };

  // TimeBlock 상호작용 훅
  const {
    draggingBlock,
    resizingBlock,
    handleBlockMouseDown
  } = useTimeBlockInteraction(timeBlocks || [], updateBlockTime);

  // TimeBlock Editor 저장
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

  // Brain Dump 핸들러
  const addBrainDump = () => {
    if (newDumpText.trim()) {
      setBrainDump([...brainDump || [], {
        id: Date.now(),
        text: newDumpText,
        completed: false
      }]);
      setNewDumpText('');
    }
  };

  const deleteBrainDump = (id: number) => {
    // brainDump가 없으면 빈 배열로 치환한 뒤 필터링 진행
    setBrainDump((brainDump || []).filter(item => item.id !== id));
  };

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

  // 이동 핸들러
  const moveBrainDumpToTodo = (item: BrainDumpItem) => {
    if (!todoList) return;
    if (!timeBlocks) return;
    if (!brainDump) return;

    if (todoList.length >= 5) {
      showError('할 일 목록은 최대 5개까지만 추가할 수 있습니다.');
      return;
    }

    const slot = findAvailableSlot(timeBlocks, 60);
    if (!slot) {
      showError('타임 플랜에 사용 가능한 시간이 없습니다. 기존 일정을 조정해주세요.');
      return;
    }

    const newTodo = {
      id: item.id,
      text: item.text,
      completed: false
    };
    setTodoList([...todoList, newTodo]);
    setBrainDump(brainDump.filter(i => i.id !== item.id));

    const colorIndex = timeBlocks.length % PASTEL_COLORS.length;
    setTimeBlocks([...timeBlocks, {
      id: Date.now(),
      todoId: newTodo.id,
      text: newTodo.text,
      startTime: slot.startTime,
      endTime: slot.endTime,
      colorIndex
    }]);
  };

  const moveTodoToBrainDump = (item: TodoItem) => {
    const newBrainDumpItem = {
      id: item.id,
      text: item.text,
      completed: false
    };
    setBrainDump([...brainDump || [], newBrainDumpItem]);
    setTodoList((todoList || []).filter(i => i.id !== item.id));
    setTimeBlocks((timeBlocks || []).filter(block => block.todoId !== item.id));
  };

  // 드래그앤드롭 핸들러
  const handleDragStart = (e: React.DragEvent, item: any, source: string) => {
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

      const slot = findAvailableSlot(timeBlocks, 60);
      if (!slot) {
        showError('타임 플랜에 사용 가능한 시간이 없습니다. 기존 일정을 조정해주세요.');
        setDraggedItem(null);
        setDragSource(null);
        return;
      }

      const newTodo = {
        id: draggedItem.id,
        text: draggedItem.text,
        completed: false
      };
      setTodoList([...todoList, newTodo]);
      setBrainDump(brainDump.filter(item => item.id !== draggedItem.id));

      const colorIndex = timeBlocks.length % PASTEL_COLORS.length;
      setTimeBlocks([...timeBlocks, {
        id: Date.now(),
        todoId: newTodo.id,
        text: newTodo.text,
        startTime: slot.startTime,
        endTime: slot.endTime,
        colorIndex
      }]);
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
        completed: false
      };
      setBrainDump([...brainDump, newBrainDumpItem]);
      setTodoList(todoList.filter(item => item.id !== draggedItem.id));
      setTimeBlocks(timeBlocks.filter(block => block.todoId !== draggedItem.id));
    }
    setDraggedItem(null);
    setDragSource(null);
  };

  return (
    <div className="h-screen bg-gray-50 p-6 flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
          <div className="text-blue-500 font-bold">데이터 불러오는 중...</div>
        </div>
      )}
      {/* 상단 헤더 */}
      <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 mb-6 drop-shadow border border-gray-200 bg-white rounded-full flex-shrink-0">
          {/* 왼쪽: 타이틀 (두께와 자간 조절로 미니멀함 강조) */}

          <Link
            href="/"
          >
            <h1 className="text-sm font-bold tracking-tight text-gray-400 uppercase">
              Daily <span className="text-gray-900">Time Box</span>
            </h1>
          </Link>

          {/* 오른쪽: 저장 버튼 (포인트 컬러 #3B82F6 적용) */}
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold px-5 py-2 rounded-full transition-all shadow-sm active:scale-95"
          >
            {/* 저장 아이콘을 살짝 추가하면 더 직관적입니다 */}
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
            </svg>
            저장
          </button>
        </div>

        <ErrorToast message={errorMessage} />
        <SuccessToast message={successMessage} />

        <div className="grid grid-cols-3 gap-6 flex-grow overflow-hidden">
          {/* 왼쪽 사이드바 수정 영역 */}
          <div className="flex flex-col h-full overflow-hidden">
            {/* 상단: TodoList & BrainDump 묶음 */}
            <div className="flex-grow overflow-y-auto space-y-6 pr-2">

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <TodoList
                  items={todoList || []}
                  onToggleComplete={toggleTodoComplete}
                  onDeleteItem={deleteTodo}
                  onMoveToBrainDump={moveTodoToBrainDump}
                  onDragStart={(e, item) => handleDragStart(e, item, 'todo-list')}
                  onDragOver={handleDragOver}
                  onDrop={handleDropToTodo}
                />
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <BrainDump
                  items={brainDump || []}
                  newItemText={newDumpText}
                  onNewItemTextChange={setNewDumpText}
                  onAddItem={addBrainDump}
                  onDeleteItem={deleteBrainDump}
                  onMoveToTodo={moveBrainDumpToTodo}
                  onDragStart={(e, item) => handleDragStart(e, item, 'brain-dump')}
                  onDragOver={handleDragOver}
                  onDrop={handleDropToBrainDump}
                />
              </div>
            </div>
          </div>

          {/* 오른쪽 타임 플랜 (2개 컬럼 차지하게 하려면 col-span-2 추천) */}
          <div className="col-span-2 h-full overflow-hidden rounded-lg shadow border border-gray-200">
            <TimePlan
              date={date}
              timeBlocks={timeBlocks || []}
              draggingBlockId={draggingBlock}
              resizingBlockId={resizingBlock}
              onDateChange={handleDateChange}
              onDayOfWeekClick={handleDayOfWeekClick}
              onBlockMouseDown={handleBlockMouseDown}
              onBlockEdit={setEditingBlock}
            />
          </div>
          {editingBlock && (
            <TimeBlockEditor
              block={editingBlock}
              onSave={handleBlockEditorSave}
              onClose={() => setEditingBlock(null)}
            />
          )}
        </div>
      </div>
    </div >
  );
};

export default TimeBoxPlanner;