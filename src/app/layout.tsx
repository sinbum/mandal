import React from 'react';
import '@/app/globals.css';

// 루트 레이아웃은 최소한의 구조만 제공하고 리다이렉트 처리
// 실제 HTML 구조는 [locale]/layout.tsx에서 담당하여 하이드레이션 충돌 방지
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}