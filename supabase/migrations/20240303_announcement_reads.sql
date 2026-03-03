-- 공지사항 읽음 처리 테이블
CREATE TABLE public.announcement_reads (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  announcement_id uuid NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  read_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (user_id, announcement_id)
);

-- RLS 활성화
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;

-- 자신의 읽음 기록만 조회 가능
CREATE POLICY "Users can view own read records" ON public.announcement_reads
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 자신의 읽음 기록만 추가 가능
CREATE POLICY "Users can insert own read records" ON public.announcement_reads
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
