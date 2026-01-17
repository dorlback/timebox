import React, { useEffect, useState } from 'react';
import { BrainDumpItem, TodoItem, TimeBlock } from '@/types/planner';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useTimeBlockInteraction } from '@/hooks/useTimeBlockInteraction';
import { findAvailableSlot, findAvailableSlotAfterNow, checkTimeConflict } from '@/utils/timeUtils';
import { PASTEL_COLORS } from '@/utils/colorUtils';
import { BrainDump } from './BrainDump';
import { TodoList } from './TodoList';
import { TimeBlockEditor } from './TimeBlockEditor';
import { ErrorToast } from './ErrorToast';
import { SuccessToast } from './SuccessToast';
import { usePlannerTestData } from '@/hooks/usePlannerTestData';
import { User } from '@/types/user';
import { usePlannerData } from '@/hooks/usePlannerDate';
import { useSuccessToast } from '@/hooks/useSuccessToast';
import Link from "next/link";
import { TimePlan } from './TimePlan';


const TimeBoxPlanner = ({ CurrentUser }: { CurrentUser: User }) => {
  const [date, setDate] = useState(new Date());
  const { errorMessage, showError } = useErrorToast();
  const { successMessage, showSuccess } = useSuccessToast();

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
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      handleAutoSave();
      console.log("자동 저장 완료!");
    }, 2000);

    return () => clearTimeout(timer);
  }, [brainDump, todoList, timeBlocks]);

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

  const updateBlockTime = (blockId: number, newStart: number, newEnd: number) => {
    if (!timeBlocks) return;

    setTimeBlocks(timeBlocks.map(block =>
      block.id === blockId
        ? { ...block, startTime: newStart, endTime: newEnd }
        : block
    ));
  };

  const {
    draggingBlock,
    resizingBlock,
    handleBlockMouseDown
  } = useTimeBlockInteraction(timeBlocks || [], updateBlockTime);

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

  // Brain Dump 삭제
  const deleteBrainDump = (id: number) => {
    setBrainDump((brainDump || []).filter(item => item.id !== id));

    // Brain Dump에서 직접 추가된 타임블록도 제거
    if (timeBlocks) {
      setTimeBlocks(timeBlocks.filter(block =>
        !(block.todoId === id && block.isDirectFromBrainDump)
      ));
    }
  };

  // Brain Dump 체크박스 토글 추가
  const toggleBrainDumpComplete = (id: number) => {
    if (!brainDump) return;

    setBrainDump(brainDump.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));

    // Brain Dump에서 직접 추가된 타임블록도 체크 상태 동기화
    if (!timeBlocks) return;
    const updatedItem = brainDump.find(item => item.id === id);
    if (updatedItem) {
      setTimeBlocks(timeBlocks.map(block =>
        block.todoId === id && block.isDirectFromBrainDump
          ? { ...block, completed: !updatedItem.completed }
          : block
      ));
    }
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
    <div className="h-screen bg-gray-50 p-6 flex flex-col">
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-50 flex items-center justify-center">
          <div className="text-blue-500 font-bold">데이터 불러오는 중...</div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full flex flex-col flex-grow overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 mb-6 drop-shadow border border-gray-200 bg-white rounded-full flex-shrink-0">
          <Link href="/">
            <h1 className="text-sm font-bold tracking-tight text-gray-400 uppercase">
              Daily <span className="text-gray-900">Time Box</span>
            </h1>
          </Link>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-semibold px-5 py-2 rounded-full transition-all shadow-sm active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
            </svg>
            저장
          </button>
        </div>

        <ErrorToast message={errorMessage} />
        <SuccessToast message={successMessage} />

        <div className="grid grid-cols-3 gap-6 flex-grow overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
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
                  itemsInTimePlan={brainDumpItemsInTimePlan}
                  onNewItemTextChange={setNewDumpText}
                  onAddItem={addBrainDump}
                  onDeleteItem={deleteBrainDump}
                  onToggleComplete={toggleBrainDumpComplete}
                  onMoveToTodo={moveBrainDumpToTodo}
                  onAddToTimePlan={addBrainDumpToTimePlan}
                  onDragStart={(e, item) => handleDragStart(e, item, 'brain-dump')}
                  onDragOver={handleDragOver}
                  onDrop={handleDropToBrainDump}
                />
              </div>
            </div>
          </div>

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
    </div>
  );
};

export default TimeBoxPlanner;