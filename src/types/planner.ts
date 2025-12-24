export interface BrainDumpItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface TodoItem {
  id: number;
  text: string;
  completed: boolean;
}

export interface TimeBlock {
  id: number;
  todoId: number;
  text: string;
  startTime: number;
  endTime: number;
  colorIndex: number;
  completed?: boolean;
}

export interface DailyData {
  brainDump?: BrainDumpItem[];
  todoList?: TodoItem[];
  timeBlocks?: TimeBlock[];
}

export interface PastelColor {
  bg: string;
  border: string;
  text: string;
}
