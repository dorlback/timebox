import Link from "next/link";

export default function NavBar({ user }: any) {
  return (
    <>
      <div className="w-full px-6 py-4 flex justify-between items-center">
        <Link href="/">
          <h1 className="text-sm font-bold tracking-tight text-gray-400 uppercase">
            Daily <span className="text-gray-900">Time Box</span>
          </h1>
        </Link>

        {user ? (
          <div className="flex items-center gap-2">
            {/* 구글 프로필 이미지 출력 부분 */}
            <Link href="/login">
              <span className="text-sm text-gray-600">{user.email}</span>
            </Link>
          </div>
        ) : (
          <div>
            <Link href="/login">
              <h1 className="text-sm font-medium">로그인</h1>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}