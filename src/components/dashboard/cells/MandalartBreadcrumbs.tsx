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
import { MoreVertical, Trash2, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import BreadcrumbSkeleton from '@/components/skeleton/BreadcrumbSkeleton';

interface MandalartBreadcrumbsProps {
  path: MandalartCell[];
  onDeleteCell?: () => void;
  isDeleting?: boolean;
  isLoading?: boolean;
}

/**
 * 만다라트 경로 네비게이션 컴포넌트
 * 루트 셀부터 현재 셀까지의 경로를 표시합니다.
 * 경로가 4개 이상일 경우 처음과 마지막 두 개만 표시하고 나머지는 생략합니다.
 */
const MandalartBreadcrumbs: React.FC<MandalartBreadcrumbsProps> = ({
  path,
  onDeleteCell,
  isDeleting = false,
  isLoading = false
}) => {
  const t = useTranslations('common');
  const tMandalart = useTranslations('mandalart');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPathModalOpen, setIsPathModalOpen] = useState(false);
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

  // 로딩 중이거나 경로가 없을 때 스켈레톤 표시
  if (isLoading || (path.length === 0 && isLoading)) {
    return <BreadcrumbSkeleton />;
  }

  // 경로가 아직 로딩되지 않았을 때도 스켈레톤 표시
  if (path.length === 0) {
    return <BreadcrumbSkeleton />;
  }

  // 최대 3개까지만 표시: 루트 > ... > 현재
  const showCollapsed = path.length > 3;
  const visibleItems = showCollapsed
    ? [
        path[0], // 루트 셀
        path[path.length - 1] // 현재 셀
      ]
    : path;

  const handleDeleteClick = () => {
    setIsDropdownOpen(false);
    if (onDeleteCell) {
      onDeleteCell();
    }
  };

  return (
    <div className="flex items-center justify-between mb-4 mt-4 animate-in fade-in-50 duration-300">
      <div className="flex-1 min-w-0 mr-4">
        <Breadcrumb>
        <BreadcrumbList>
          {/* 루트 셀만 있을 때만 Home 아이콘 표시 */}
          {path.length === 1 && (
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/app" className="flex items-center">
                  <svg 
                    className="w-4 h-4" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
                  </svg>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
          )}
          
          {/* 경로 아이템들 */}
          {visibleItems.map((cell, index) => {
            const isLast = index === visibleItems.length - 1;
            const isFirst = index === 0;
            const showHomeSeparator = path.length === 1; // 홈 아이콘이 있을 때만 separator 표시
            
            return (
              <React.Fragment key={cell.id}>
                {(showHomeSeparator || !isFirst) && <BreadcrumbSeparator />}
                <BreadcrumbItem>
                  <div className="flex items-center">
                    {isLast ? (
                      <BreadcrumbPage>
                        {cell.topic || t('untitledCell')}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={`/app/cell/${cell.id}`}>
                          {cell.topic || t('untitledCell')}
                        </Link>
                      </BreadcrumbLink>
                    )}
                  </div>
                </BreadcrumbItem>
                
                {/* 루트 셀 다음에 ... 표시 (축약된 경우만) */}
                {showCollapsed && isFirst && !isLast && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <button 
                        onClick={() => setIsPathModalOpen(true)}
                        className="hover:text-blue-600 transition-colors"
                      >
                        <BreadcrumbEllipsis />
                      </button>
                    </BreadcrumbItem>
                  </>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* 드롭다운 메뉴 */}
      {onDeleteCell && (
        <div className="relative flex-shrink-0" ref={dropdownRef}>
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
                  {isDeleting ? t('deleting') : t('deleteCell')}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 전체 경로 모달 */}
      <AlertDialog open={isPathModalOpen} onOpenChange={setIsPathModalOpen}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center justify-between">
              <AlertDialogTitle>{t('fullPath')}</AlertDialogTitle>
              <button
                onClick={() => setIsPathModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X size={16} />
              </button>
            </div>
          </AlertDialogHeader>
          
          <div className="py-4">
            <div className="space-y-2">
              {path.map((cell, index) => (
                <div key={cell.id} className="flex items-center">
                  <div 
                    className="text-sm text-gray-500 mr-3"
                    style={{ marginLeft: `${index * 12}px` }}
                  >
                    {index + 1}.
                  </div>
                  <Link 
                    href={`/app/cell/${cell.id}`}
                    onClick={() => setIsPathModalOpen(false)}
                    className="text-blue-600 hover:text-blue-800 text-sm hover:underline flex-1"
                  >
                    {cell.topic || t('untitledCell')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MandalartBreadcrumbs; 