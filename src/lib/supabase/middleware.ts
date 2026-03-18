// lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // ⚠️ 환경변수명이 ANON_KEY인지 다시 확인하세요!
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // 1. 요청(Request) 쿠키 업데이트
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          // 2. 응답(Response) 객체 새로 생성
          supabaseResponse = NextResponse.next({
            request,
          });
          // 3. 응답 쿠키에 옵션(expires, httpOnly 등) 포함하여 설정
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 세션 새로고침 및 유저 정보 확인
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const hasVisited = request.cookies.get("has_visited");

  if (user) {
    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/timebox";
      return NextResponse.redirect(url);
    }

    if (pathname === "/") {
      if (!hasVisited) {
        const url = request.nextUrl.clone();
        // 타임박스 플래너 경로로 리다이렉트
        url.pathname = "/timebox";
        const response = NextResponse.redirect(url);
        response.cookies.set("has_visited", "true", {
          maxAge: 60 * 60 * 24 * 365,
          path: "/",
        });
        return response;
      }
      // visited 쿠키가 있으면 루트 접근 허용
    }
  } else {
    // 미인증 사용자 루트 접근 허용
    if (pathname === "/") {
      return supabaseResponse;
    }
  }

  // 로그인 없이 접근 가능한 페이지
  const publicRoutes = ["/", "/login", "/signin", "/auth", "/terms", "/privacy"];
  const isPublicRoute = publicRoutes.some((route) =>
    route === "/" ? pathname === "/" : pathname.startsWith(route)
  );

  // 로그인되지 않은 상태에서 보호된 페이지 접근 시 리다이렉트
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // 탈퇴 신청 계정 체크 및 보호 (프로필 정보 기반)
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin, deleted_at")
      .eq("id", user.id)
      .single();

    // 1. 탈퇴 신청 상태인 경우 /mypage 이외의 보호된 페이지 접근 차단
    if (profile?.deleted_at) {
      if (!isPublicRoute && pathname !== "/mypage") {
        const url = request.nextUrl.clone();
        url.pathname = "/mypage";
        return NextResponse.redirect(url);
      }
    }

    // 2. admin 페이지 접근 체크
    if (pathname.startsWith("/admin") && !profile?.is_admin) {
      const url = request.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}