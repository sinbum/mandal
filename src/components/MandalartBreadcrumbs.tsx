import React from 'react';
import Link from 'next/link';
import { MandalartCell } from '@/types/mandalart';

interface MandalartBreadcrumbsProps {
  path: MandalartCell[];
}

/**
 * 만다라트 경로 네비게이션 컴포넌트
 * 루트 셀부터 현재 셀까지의 경로를 표시합니다.
 */
const MandalartBreadcrumbs: React.FC<MandalartBreadcrumbsProps> = ({ path }) => {
  if (path.length === 0) {
    return null;
  }

  return (
    <nav className="flex mb-6 text-sm">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        {path.map((cell, index) => {
          const isLast = index === path.length - 1;
          
          return (
            <li key={cell.id} className="inline-flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-400">/</span>
              )}
              
              {isLast ? (
                <span className="font-medium text-blue-600">
                  {cell.topic || '무제 셀'}
                </span>
              ) : (
                <Link 
                  href={`/cell/${cell.id}`} 
                  className="text-gray-700 hover:text-blue-600"
                >
                  {cell.topic || '무제 셀'}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default MandalartBreadcrumbs; 