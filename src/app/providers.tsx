// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export default function Providers({ children }: { children: React.ReactNode }) {
  // useState를 사용하여 클라이언트 사이드에서 단 한 번만 QueryClient가 생성되도록 합니다.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 창을 다시 포커스했을 때 자동으로 데이터를 가져오는 설정 (선택)
            refetchOnWindowFocus: false,
            // 데이터가 '상했다고' 판단하는 시간 (5분)
            staleTime: 60 * 1000 * 5,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}