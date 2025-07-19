'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface CellPageLayoutProps {
  children: React.ReactNode;
  breadcrumbs?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

/**
 * 셀 페이지 공통 레이아웃 컴포넌트
 * 스켈레톤과 실제 컴포넌트가 동일한 구조를 사용하도록 합니다.
 */
const CellPageLayout: React.FC<CellPageLayoutProps> = ({
  children,
  breadcrumbs,
  sidebar,
  className
}) => {
  return (
    <div className={cn("flex lg:flex-row flex-col min-h-[100dvh]", className)}>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="container mx-auto px-0 py-0 sm:px-4 sm:py-2 h-full flex flex-col max-w-none 2xl:max-w-8xl overflow-hidden">
          
          {/* 브레드크럼 영역 */}
          {breadcrumbs && (
            <div className="flex-shrink-0">
              {breadcrumbs}
            </div>
          )}
          
          {/* 메인 콘텐츠 영역 */}
          <div className="flex-1 w-full flex items-start justify-center pt-8 sm:pt-4 pb-8 sm:pb-2 px-2 sm:p-4 min-h-0">
            <div className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto">
              
              {/* MandalartGrid와 동일한 래퍼 구조 */}
              <div className="relative h-full">
                <div className="flex flex-col h-full gap-6">
                  {children}
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* 데스크탑 사이드바 - lg 이상에서만 표시 */}
      {sidebar && (
        <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 p-6 bg-gray-50 dark:bg-gray-900 justify-center">
          {sidebar}
        </div>
      )}
    </div>
  );
};

export default CellPageLayout;