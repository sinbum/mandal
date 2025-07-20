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
    <div className={cn("flex lg:flex-row flex-col h-full w-full", className)}>
      
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        <div className="container mx-auto px-0 py-0 sm:px-4 sm:py-2 flex flex-col max-w-none 2xl:max-w-8xl h-full">
          
          {/* 브레드크럼 영역 */}
          {breadcrumbs && (
            <div className="flex-shrink-0">
              {breadcrumbs}
            </div>
          )}
          
          {/* 메인 콘텐츠 영역 - 홈페이지처럼 고정된 레이아웃 */}
          <div className="flex-1 w-full flex items-center justify-center py-2 min-[481px]:py-3 min-[601px]:py-4 sm:py-6 lg:py-8 px-2 sm:px-4 overflow-hidden">
            <div className="w-full max-w-3xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mx-auto h-full">
              
              {/* MandalartGrid 콘텐츠 래퍼 */}
              <div className="flex flex-col gap-4 sm:gap-6 h-full">
                {children}
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