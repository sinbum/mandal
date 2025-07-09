import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '대시보드',
  description: '나의 만다라트 목표들을 관리하고 진행상황을 확인하세요',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-white">
      {children}
    </main>
  );
}
