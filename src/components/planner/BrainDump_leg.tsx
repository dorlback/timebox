import React from 'react';
import { GripVertical, Plus, Trash2, ArrowUp } from 'lucide-react';
import { BrainDumpItem } from '@/types/planner';

interface BrainDumpProps {
  items: BrainDumpItem[];
  newItemText: string;
  onNewItemTextChange: (text: string) => void;
  onAddItem: () => void;
  onDeleteItem: (id: number) => void;
  onMoveToTodo: (item: BrainDumpItem) => void;
  onDragStart: (e: React.DragEvent, item: BrainDumpItem) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const BrainDump: React.FC<BrainDumpProps> = ({
  items,
  newItemText,
  onNewItemTextChange,
  onAddItem,
  onDeleteItem,
  onMoveToTodo,
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
      <h2 className="font-semibold mb-3 text-gray-700">BRAIN DUMP</h2>
      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => onDragStart(e, item)}
            className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200 cursor-move hover:bg-gray-100"
          >
            <GripVertical size={16} className="text-gray-400" />
            <span className="flex-1 text-sm">{item.text}</span>
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
        ))}
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