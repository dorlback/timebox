'use client'
import TimeBoxPlanner from "@/components/planner/TimeBoxPlanner";
import { useUser } from "@/hooks/useUser";

export default function Page() {
  const { user } = useUser();
  console.log(user?.id);
  return (
    <>
      {user ? <TimeBoxPlanner CurrentUser={user} /> : <div>로그인 하세요</div>}
    </>
  )
}