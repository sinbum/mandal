import React from 'react';
import Link from 'next/link';
import { MandalartCell } from '@/types/mandalart';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from '@/components/ui/breadcrumb';

interface MandalartBreadcrumbsProps {
  path: MandalartCell[];
}

/**
 * 만다라트 경로 네비게이션 컴포넌트
 * 루트 셀부터 현재 셀까지의 경로를 표시합니다.
 * 경로가 4개 이상일 경우 처음과 마지막 두 개만 표시하고 나머지는 생략합니다.
 */
const MandalartBreadcrumbs: React.FC<MandalartBreadcrumbsProps> = ({ path }) => {
  if (path.length === 0) {
    return null;
  }

  const showCollapsed = path.length >= 4;
  const visibleItems = showCollapsed
    ? [
        path[0],
        ...path.slice(-2)
      ]
    : path;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        {visibleItems.map((cell, index) => {
          const isLast = index === visibleItems.length - 1;
          const showEllipsis = showCollapsed && index === 0;
          
          return (
            <React.Fragment key={cell.id}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>
                    {cell.topic || '무제 셀'}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={`/cell/${cell.id}`}>
                      {cell.topic || '무제 셀'}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
              {showEllipsis && (
                <>
                  <BreadcrumbEllipsis />
                  <BreadcrumbSeparator />
                </>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default MandalartBreadcrumbs; 