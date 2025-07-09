import React from 'react';
import MobileLayout from '@/components/layout/MobileLayout';
import HeaderBar from '@/components/layout/HeaderBar';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
}

export default function AuthLayout({ 
  children, 
  title, 
  showBackButton = false, 
  onBackClick 
}: AuthLayoutProps) {
  return (
    <MobileLayout
      header={
        <HeaderBar 
          title={title} 
          showBackButton={showBackButton}
          onBackClick={onBackClick}
        />
      }
    >
      <div className="p-6 flex flex-col h-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">만다라트 플래너</h1>
          <p className="text-gray-600">
            {title === '로그인' ? '목표를 체계적으로 관리하는 만다라트 기법 플래너' : '새 계정 만들기'}
          </p>
        </div>
        {children}
      </div>
    </MobileLayout>
  );
}