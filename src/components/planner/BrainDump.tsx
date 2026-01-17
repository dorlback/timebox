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
  onDrop: (e: React.DragEvent) => void;
}

export const BrainDump: React.FC<BrainDumpProps> = ({
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
  onDrop
}) => {
  return (
    <div
      className="p-4"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <h2 className="font-semibold mb-3 text-gray-700">BRAIN DUMP</h2>
      <div className="space-y-2 mb-3">
        {items.map((item) => {
          const isInTimePlan = itemsInTimePlan.includes(item.id);

          return (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => onDragStart(e, item)}
              className={`flex items-center gap-2 p-2 rounded border cursor-move transition-colors ${isInTimePlan
                ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
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

              {isInTimePlan && (
                <span className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                  <Check size={12} />
                  시간표
                </span>
              )}

              <button
                onClick={() => onAddToTimePlan(item)}
                className={`${isInTimePlan
                  ? 'text-red-500 hover:text-red-700'
                  : 'text-green-500 hover:text-green-700'
                  }`}
                title={isInTimePlan ? '시간표에서 제거' : '시간표에 추가'}
              >
                {isInTimePlan ? <Clock size={14} /> : <Clock size={14} />}
              </button>
              <button
                onClick={() => onMoveToTodo(item)}
                className="text-blue-500 hover:text-blue-700"
                title="Todo List로 이동"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => onDeleteItem(item.id)}
                className="text-red-400 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={newItemText}
          onChange={(e) => onNewItemTextChange(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onAddItem()}
          placeholder="새 항목 추가..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
        />
        <button
          onClick={onAddItem}
          className="bg-blue-500 text-white px-3 py-2 rounded hover:bg-blue-600"
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
};