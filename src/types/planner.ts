import { UserResponse } from "@supabase/supabase-js";
import { User } from "./user";

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
  isDirectFromBrainDump?: boolean; // Brain Dump에서 직접 추가된 블록인지 구분
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

export interface PlannerResponse {
  id: string;
  user_id: string;
  date: Date;
  jsonb: string
  created_date: Date;
  updated_date: Date;
  user?: UserResponse;
}

export class Planner {
  constructor(
    public id: string,
    public user_id: string, // 유저 ID 추가
    public date: Date,
    public jsonb: string,
    public creted_date: Date,
    public updated_date: Date,
    public user?: User // 필요 시 Join된 유저 정보를 담는 용도 (선택 사항)
  ) { }

  static fromResponse(res: PlannerResponse): Planner {
    return new Planner(
      res.id,
      res.user_id,
      new Date(res.date),
      JSON.parse(res.jsonb),
      new Date(res.created_date),
      new Date(res.updated_date),
      // 만약 user 응답이 있으면 User 클래스의 fromSupabase 등을 활용해 인스턴스화
      // res.user ? User.fromSupabase(res.user, res.user.profile) : undefined
    );
  }

  /**
   * jsonb 문자열을 실제 DailyData 객체로 변환
   */
  get parsedData(): DailyData {
    try {
      return JSON.parse(this.jsonb);
    } catch (e) {
      return { brainDump: [], todoList: [], timeBlocks: [] };
    }
  }
}