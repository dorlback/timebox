import { Planner, DailyData } from "@/types/planner";
import { createClient } from "../supabase/client";

const supabase = createClient();

export async function fetchPlanner(): Promise<Planner | null> {

  return null
}

export async function fetchAllPlannerData(userId: string): Promise<{ planned_date: string; payload: DailyData }[]> {
  const { data, error } = await supabase
    .from('timebox')
    .select('planned_date, payload')
    .eq('user_id', userId)
    .order('planned_date', { ascending: false });

  if (error) {
    console.error('Error fetching all planner data:', error);
    return [];
  }

  return (data || []) as { planned_date: string; payload: DailyData }[];
}