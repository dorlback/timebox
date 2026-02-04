import React from 'react';
import { GripVertical, Trash2, ArrowDown } from 'lucide-react';
import { TodoItem } from '@/types/planner';

interface TodoListProps {
  items: TodoItem[];
  onToggleComplete: (id: number) => void;
  onDeleteItem: (id: number) => void;
  onMoveToBrainDump: (item: TodoItem) => void;
  onDragStart: (e: React.DragEvent, item: TodoItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent, targetId?: number) => void;
  onItemDoubleClick?: (item: TodoItem) => void;
  draggedItemId?: number | null;
}

export const TodoList: React.FC<TodoListProps> = React.memo(({
  items,
  onToggleComplete,
  onDeleteItem,
  onMoveToBrainDump,
  onDragStart,
  onDragOver,
  onDrop,
  onItemDoubleClick
}) => {
  return (
    <div
      className="todo-list-container bg-card rounded-lg shadow p-4 transition-colors border border-border min-h-[150px]"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e)}
    >
      <h2 className="font-semibold mb-3 text-muted-foreground">TO DO LIST</h2>
      <div className="text-xs text-muted-foreground mb-2">최대 5개</div>
      <div className="space-y-2">
        {items.map((item) => {
          let touchTimer: NodeJS.Timeout;

          const handleTouchStart = (e: React.TouchEvent) => {
            const touch = e.touches[0];
            const clientX = touch.clientX;
            const clientY = touch.clientY;

            touchTimer = setTimeout(() => {
              // 롱프레스 시 드래그 시작 시뮬레이션
              const dragEvent = {
                dataTransfer: {
                  effectAllowed: 'move',
                  setData: () => { },
                },
                clientX,
                clientY,
              } as unknown as React.DragEvent;
              onDragStart(dragEvent, item);

              // 시각적 피드백이나 진동 추가 가능
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
              className={`flex items-center gap-2 p-2 bg-muted/30 rounded border border-border cursor-move hover:bg-muted transition-colors select-none touch-none ${
                // 드래그 중인 아이템 강조
                false ? 'opacity-50 border-blue-500 bg-blue-50' : ''
                }`}
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
              <button
                onClick={(e) => { e.stopPropagation(); onMoveToBrainDump(item); }}
                className="text-orange-500 hover:text-orange-700"
                title="Brain Dump로 이동"
              >
                <ArrowDown size={14} />
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
        {items.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 border-2 border-dashed border-border rounded">
            Brain Dump에서 항목을 드래그하세요
          </div>
        )}
      </div>
    </div>
  );
});