-- 공지사항 테이블 생성
CREATE TABLE public.announcements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  category text NOT NULL, -- 'notice'(공지), 'user_notice'(유저공지), 'patch_note'(패치노트), 'others'(기타)
  title text NOT NULL,
  content text NOT NULL, -- HTML 내용
  target_user_ids uuid[], -- 유저공지일 경우 대상 유저 ID 목록
  author_id uuid REFERENCES public.profiles(id),
  CONSTRAINT announcements_pkey PRIMARY KEY (id)
);

-- RLS 활성화
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 관리자는 모든 권한을 가짐
CREATE POLICY "Admins can manage announcements" ON public.announcements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true));

-- 일반 유저는 본인에게 해당되는 공지 또는 전체 공지만 조회 가능
CREATE POLICY "Users can read announcements" ON public.announcements
  FOR SELECT TO authenticated
  USING (
    category != 'user_notice' OR 
    (target_user_ids @> ARRAY[auth.uid()])
  );
