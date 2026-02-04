import React from 'react';
import { GripVertical, Plus, Trash2, ArrowUp, Clock, Check, X } from 'lucide-react';
import { BrainDumpItem } from '@/types/planner';

interface BrainDumpProps {
  items: BrainDumpItem[];
  itemsInTimePlan: number[]; // 시간표에 추가된 항목 ID 배열 추가
  newItemText: string;
  onNewItemTextChange: (text: string) => void;
  onAddItem: () => void;
  onDeleteItem: (id: number) => void;
  onToggleComplete: (id: number) => void;
  onMoveToTodo: (item: BrainDumpItem) => void;
  onAddToTimePlan: (item: BrainDumpItem) => void;
  onDragStart: (e: React.DragEvent, item: BrainDumpItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId?: number) => void;
  isMobile?: boolean;
  onOpenAddModal?: () => void;
  onItemDoubleClick?: (item: BrainDumpItem) => void;
  draggedItemId?: number | null;
}

export const BrainDump: React.FC<BrainDumpProps> = React.memo(({
  items,
  itemsInTimePlan,
  newItemText,
  onNewItemTextChange,
  onAddItem,
  onDeleteItem,
  onToggleComplete,
  onMoveToTodo,
  onAddToTimePlan,
  onDragStart,
  onDragOver,
  onDrop,
  isMobile = false,
  onOpenAddModal,
  onItemDoubleClick,
  draggedItemId = null
}) => {
  return (
    <div
      className="brain-dump-container p-4 bg-card rounded-lg shadow border border-border transition-colors min-h-[150px]"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e)}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold text-muted-foreground">BRAIN DUMP</h2>
        {isMobile && onOpenAddModal ? (
          <button
            onClick={onOpenAddModal}
            className="p-2 flex justify-center items-center rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            aria-label="새 항목 추가"
          >
            <Plus size={18} />
          </button>
        ) : null}
      </div>
      <div className="space-y-2 mb-3">
        {items.map((item) => {
          const isInTimePlan = itemsInTimePlan.includes(item.id);
          let touchTimer: NodeJS.Timeout;

          const handleTouchStart = (e: React.TouchEvent) => {
            const touch = e.touches[0];
            const clientX = touch.clientX;
            const clientY = touch.clientY;

            touchTimer = setTimeout(() => {
              const dragEvent = {
                dataTransfer: {
                  effectAllowed: 'move',
                  setData: () => { },
                },
                clientX,
                clientY,
              } as unknown as React.DragEvent;
              onDragStart(dragEvent, item);

              if ('vibrate' in navigator) navigator.vibrate(10);
            }, 600);
          };

          const handleTouchEnd = () => {
            clearTimeout(touchTimer);
          };

          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              onDoubleClick={() => onItemDoubleClick?.(item)}
              onDrop={(e) => { e.stopPropagation(); onDrop(e, item.id); }}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchMove={handleTouchEnd}
              onContextMenu={(e) => e.preventDefault()}
              className={`flex items-center gap-2 p-2 rounded border cursor-move transition-colors select-none touch-none ${isInTimePlan
                ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                : 'bg-muted/50 border-border hover:bg-muted'
                } ${item.id === draggedItemId ? 'opacity-40 border-blue-500 bg-blue-50/50 scale-[0.98]' : ''}`}
              style={{ WebkitUserSelect: 'none', WebkitTouchCallout: 'none' }}
            >
              <GripVertical size={16} className="text-gray-400" />
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => onToggleComplete(item.id)}
                className="w-4 h-4"
                onClick={(e) => e.stopPropagation()}
              />
              <span className={`flex-1 text-sm ${item.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                {item.text}
              </span>

              {isInTimePlan ? (
                <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  <Check size={12} />
                  시간표
                </span>
              ) : null}

              <button
                onClick={(e) => { e.stopPropagation(); onAddToTimePlan(item); }}
                className={`${isInTimePlan
                  ? 'text-red-500 hover:text-red-700'
                  : 'text-green-500 hover:text-green-700'
                  }`}
                title={isInTimePlan ? '시간표에서 제거' : '시간표에 추가'}
              >
                {isInTimePlan ? <Clock size={14} /> : <Clock size={14} />}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onMoveToTodo(item); }}
                className="text-blue-500 hover:text-blue-700"
                title="Todo List로 이동"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }}
                className="text-red-400 hover:text-red-600 p-1"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      {!isMobile ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => onNewItemTextChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onAddItem()}
            placeholder="새 항목 추가..."
            className="flex-1 px-3 py-2 border border-input rounded text-sm bg-card text-foreground placeholder-muted-foreground"
          />
          <button
            onClick={onAddItem}
            className="bg-primary text-primary-foreground px-3 py-2 rounded hover:opacity-90 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
      ) : null}
    </div>
  );
});