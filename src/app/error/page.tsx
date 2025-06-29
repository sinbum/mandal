'use client'

import HeaderBar from '@/components/layout/HeaderBar';
import MobileLayout from '@/components/layout/MobileLayout';
import BottomBar from '@/components/layout/BottomBar';
import { Button } from '@/components/ui/Button';

export default function ErrorPage() {
  return (
    <MobileLayout
      header={
        <HeaderBar
          title="오류"
          showBackButton
          href="/"
        />
      }
      footer={<div className="sm:hidden"><BottomBar /></div>}
    >
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md mx-auto">
          <div className="text-red-500 mb-4">
            <svg width="64" height="64" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="mx-auto">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-800 mb-4">문제가 발생했습니다</h1>
          <p className="text-gray-600 mb-6">죄송합니다. 예상치 못한 오류가 발생했습니다.</p>
          <Button onClick={() => window.location.href = '/'}>
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </MobileLayout>
  );
}