'use client';

import { useParams } from 'next/navigation';

interface LocaleProviderProps {
  children: React.ReactNode;
}

export function LocaleProvider({ children }: LocaleProviderProps) {
  // DOM 조작을 제거하여 하이드레이션 불일치 방지
  // 로케일 정보는 서버 컴포넌트에서 이미 적절히 설정됨
  return <>{children}</>;
}