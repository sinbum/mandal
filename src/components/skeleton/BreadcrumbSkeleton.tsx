import React from 'react';
import { cn } from '@/lib/utils';

interface BreadcrumbSkeletonProps {
  className?: string;
}

/**
 * 브레드크럼 로딩 스켈레톤 컴포넌트
 * 실제 MandalartBreadcrumbs와 정확히 동일한 구조로 레이아웃 시프트를 방지합니다.
 */
const BreadcrumbSkeleton: React.FC<BreadcrumbSkeletonProps> = ({ 
  className 
}) => {
  return (
    <div className={cn(
      "flex items-center justify-between mb-4 mt-4 animate-in fade-in-50 duration-300",
      className
    )}>
      {/* 브레드크럼 영역 - MandalartBreadcrumbs와 동일한 구조 */}
      <div className="flex-1 min-w-0 mr-4">
        {/* shadcn/ui Breadcrumb 구조를 모방 */}
        <nav aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 break-words text-sm text-muted-foreground sm:gap-2.5">
            {/* 홈 아이콘 스켈레톤 */}
            <li className="inline-flex items-center gap-1.5">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse flex-shrink-0" />
            </li>
            
            {/* 구분자 스켈레톤 */}
            <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
              <div className="w-3.5 h-3.5 bg-gray-200 rounded animate-pulse opacity-60 flex-shrink-0" />
            </li>
            
            {/* 첫 번째 경로 스켈레톤 */}
            <li className="inline-flex items-center gap-1.5">
              <div className="w-16 sm:w-20 h-5 bg-gray-200 rounded animate-pulse flex-shrink-0" />
            </li>
            
            {/* 구분자 스켈레톤 */}
            <li role="presentation" aria-hidden="true" className="[&>svg]:size-3.5">
              <div className="w-3.5 h-3.5 bg-gray-200 rounded animate-pulse opacity-60 flex-shrink-0" />
            </li>
            
            {/* 현재 페이지 스켈레톤 (반응형 크기) */}
            <li className="inline-flex items-center gap-1.5">
              <div className="w-24 sm:w-32 md:w-40 h-5 bg-gray-200 rounded animate-pulse flex-shrink-0" />
            </li>
          </ol>
        </nav>
      </div>
      
      {/* 액션 버튼 스켈레톤 - MoreVertical 버튼과 동일한 크기 */}
      <div className="relative flex-shrink-0">
        <div className="w-9 h-9 bg-gray-200 rounded-md animate-pulse" />
      </div>
    </div>
  );
};

export default BreadcrumbSkeleton;