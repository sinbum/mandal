import React, { useState, useRef, useEffect } from 'react';
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
import { MoreVertical, Trash2 } from 'lucide-react';

interface MandalartBreadcrumbsProps {
  path: MandalartCell[];
  onDeleteCell?: () => void;
  isDeleting?: boolean;
}

/**
 * 만다라트 경로 네비게이션 컴포넌트
 * 루트 셀부터 현재 셀까지의 경로를 표시합니다.
 * 경로가 4개 이상일 경우 처음과 마지막 두 개만 표시하고 나머지는 생략합니다.
 */
const MandalartBreadcrumbs: React.FC<MandalartBreadcrumbsProps> = ({ 
  path, 
  onDeleteCell, 
  isDeleting = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 드롭다운 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleDeleteClick = () => {
    setIsDropdownOpen(false);
    if (onDeleteCell) {
      onDeleteCell();
    }
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <Breadcrumb>
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
                      <Link href={`/app/cell/${cell.id}`}>
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

      {/* 드롭다운 메뉴 */}
      {onDeleteCell && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md"
            aria-label="셀 옵션"
          >
            <MoreVertical size={20} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 z-10 animate-in fade-in-90 duration-200">
              <div className="py-2">
                <button
                  onClick={handleDeleteClick}
                  disabled={isDeleting}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 size={16} className="mr-3" />
                  {isDeleting ? '삭제 중...' : '셀 삭제'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MandalartBreadcrumbs; 