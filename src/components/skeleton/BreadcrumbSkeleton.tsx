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
      "flex items-center justify-between mb-4 mt-4 animate-in fade-in-50 duration-300", // 실제 MandalartBreadcrumbs와 동일한 레이아웃
      className
    )}>
      {/* 브레드크럼 영역 - 실제 구조와 동일: flex-1 min-w-0 mr-4 */}
      <div className="flex-1 min-w-0 mr-4">
        <div className="flex items-center space-x-4">
        {/* 홈 아이콘 스켈레톤 */}
        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse flex-shrink-0" />
        
        {/* 구분자 아이콘 (ChevronRightIcon과 유사) */}
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse opacity-60 flex-shrink-0" />
        
        {/* 첫 번째 경로 */}
        <div className="w-16 sm:w-20 h-5 bg-gray-200 rounded animate-pulse flex-shrink-0" />
        
        {/* 구분자 아이콘 */}
        <div className="w-5 h-5 bg-gray-200 rounded animate-pulse opacity-60 flex-shrink-0" />
        
        {/* 현재 페이지 (반응형 크기) */}
        <div className="w-24 sm:w-32 md:w-40 h-5 bg-gray-200 rounded animate-pulse flex-shrink-0" />
        </div>
      </div>
      
      {/* 액션 버튼 스켈레톤 */}
      <div className="relative flex-shrink-0">
        <div className="w-8 h-8 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  );
};

export default BreadcrumbSkeleton;