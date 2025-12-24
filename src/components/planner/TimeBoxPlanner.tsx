import React, { useState } from 'react';
import { BrainDumpItem, TodoItem, TimeBlock } from '@/types/planner';
import { usePlannerData } from '@/hooks/usePlannerData';
import { useErrorToast } from '@/hooks/useErrorToast';
import { useTimeBlockInteraction } from '@/hooks/useTimeBlockInteraction';
import { findAvailableSlot, checkTimeConflict } from '@/utils/timeUtils';
import { PASTEL_COLORS } from '@/utils/colorUtils';
import { BrainDump } from './BrainDump';
import { TodoList } from './TodoList';
import { TimePlan } from './TimePlan';
import { TimeBlockEditor } from './TimeBlockEditor';
import { ErrorToast } from './ErrorToast';

const TimeBoxPlanner = () => {
  const [date, setDate] = useState(new Date());
  const { errorMessage, showError } = useErrorToast();
  const {
    brainDump,
    todoList,
    timeBlocks,
    setBrainDump,
    setTodoList,
    setTimeBlocks
  } = usePlannerData(date);

  const [newDumpText, setNewDumpText] = useState('');
  const [draggedItem, setDraggedItem] = useState<any>(null);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<TimeBlock | null>(null);

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
  const updateBlockTime = (blockId: number, newStart: number, newEnd: number) => {
    setTimeBlocks(timeBlocks.map(block =>
      block.id === blockId ? { ...block, startTime: newStart, endTime: newEnd } : block
    ));
  };

  // TimeBlock 상호작용 훅
  const {
    draggingBlock,
    resizingBlock,
    handleBlockMouseDown
  } = useTimeBlockInteraction(timeBlocks, updateBlockTime);

  // TimeBlock Editor 저장
  const handleBlockEditorSave = (blockId: number, newStart: number, newEnd: number) => {
    const hasConflict = checkTimeConflict(timeBlocks, blockId, newStart, newEnd);

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
      setBrainDump([...brainDump, {
        id: Date.now(),
        text: newDumpText,
        completed: false
      }]);
      setNewDumpText('');
    }
  };

  const deleteBrainDump = (id: number) => {
    setBrainDump(brainDump.filter(item => item.id !== id));
  };

  // Todo 핸들러
  const deleteTodo = (id: number) => {
    setTodoList(todoList.filter(item => item.id !== id));
    setTimeBlocks(timeBlocks.filter(block => block.todoId !== id));
  };

  const toggleTodoComplete = (id: number) => {
    setTodoList(todoList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));

    const updatedTodo = todoList.find(item => item.id === id);
    if (updatedTodo) {
      setTimeBlocks(timeBlocks.map(block =>
        block.todoId === id ? { ...block, completed: !updatedTodo.completed } : block
      ));
    }
  };

  // 이동 핸들러
  const moveBrainDumpToTodo = (item: BrainDumpItem) => {
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
    setBrainDump([...brainDump, newBrainDumpItem]);
    setTodoList(todoList.filter(i => i.id !== item.id));
    setTimeBlocks(timeBlocks.filter(block => block.todoId !== item.id));
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-gray-700 text-white px-4 py-2 mb-6 rounded">
          <h1 className="text-lg font-semibold">DAILY TIME BOX PLANNER</h1>
        </div>

        <ErrorToast message={errorMessage} />

        <div className="grid grid-cols-3 gap-6">
          <div className="space-y-6">
            <TodoList
              items={todoList}
              onToggleComplete={toggleTodoComplete}
              onDeleteItem={deleteTodo}
              onMoveToBrainDump={moveTodoToBrainDump}
              onDragStart={(e, item) => handleDragStart(e, item, 'todo-list')}
              onDragOver={handleDragOver}
              onDrop={handleDropToTodo}
            />

            <BrainDump
              items={brainDump}
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

          <TimePlan
            date={date}
            timeBlocks={timeBlocks}
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
  );
};

export default TimeBoxPlanner;