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
  onDrop: (e: React.DragEvent) => void;
}

export const TodoList: React.FC<TodoListProps> = ({
  items,
  onToggleComplete,
  onDeleteItem,
  onMoveToBrainDump,
  onDragStart,
  onDragOver,
  onDrop
}) => {
  return (
    <div
      className="bg-white rounded-lg shadow p-4"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h2 className="font-semibold mb-3 text-gray-700">TO DO LIST</h2>
      <div className="text-xs text-gray-500 mb-2">최대 5개</div>
      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-move hover:bg-gray-100"
          >
            <GripVertical size={16} className="text-gray-400" />
            <input
              type="checkbox"
              checked={item.completed}
              onChange={() => onToggleComplete(item.id)}
              className="w-4 h-4"
              onClick={(e) => e.stopPropagation()}
            />
            <span className={`flex-1 text-sm ${item.completed ? 'line-through text-gray-400' : ''}`}>
              {item.text}
            </span>
            <button
              onClick={() => onMoveToBrainDump(item)}
              className="text-orange-500 hover:text-orange-700"
              title="Brain Dump로 이동"
            >
              <ArrowDown size={14} />
            </button>
            <button
              onClick={() => onDeleteItem(item.id)}
              className="text-red-400 hover:text-red-600"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-center text-gray-400 text-sm py-8 border-2 border-dashed border-gray-300 rounded">
            Brain Dump에서 항목을 드래그하세요
          </div>
        )}
      </div>
    </div>
  );
};