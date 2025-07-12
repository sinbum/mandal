import React from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbSkeletonProps {
  className?: string;
}

/**
 * 브레드크럼 로딩 스켈레톤 컴포넌트
 * 네비게이션 경로 로딩 중 레이아웃 시프트를 방지합니다.
 */
const BreadcrumbSkeleton: React.FC<BreadcrumbSkeletonProps> = ({ 
  className 
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between mb-4 mt-4", // 실제 MandalartBreadcrumbs와 동일한 레이아웃
      className
    )}>
      {/* 브레드크럼 영역 */}
      <div className="flex items-center gap-2">
        {/* 첫 번째 경로 */}
        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        
        {/* 구분자 */}
        <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
        
        {/* 두 번째 경로 (더 길게) */}
        <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
        
        {/* 구분자 */}
        <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
        
        {/* 현재 페이지 (가장 길게) */}
        <div className="w-32 h-4 bg-gray-200 rounded animate-pulse" />
      </div>
      
      {/* 액션 버튼 스켈레톤 */}
      <div className="relative">
        <div className="w-8 h-8 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
};

export default BreadcrumbSkeleton;