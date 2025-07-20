'use client';

import { cn } from '@/lib/utils';
import BreadcrumbSkeleton from './BreadcrumbSkeleton';
import CellPageLayout from '@/components/layout/CellPageLayout';

const CellPageSkeleton = () => {

  return (
    <CellPageLayout
      breadcrumbs={<BreadcrumbSkeleton />}
      sidebar={
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* 사이드바 제목 */}
          <div className="h-7 w-20 bg-gray-200 rounded animate-pulse mb-4"></div>
          
          {/* 진행 상황 스켈레톤 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-success rounded-full animate-pulse"></div>
              <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded-full animate-pulse"></div>
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* 진행률 표시 스켈레톤 */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
              <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-5 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-success h-3 rounded-full w-2/5 transition-all duration-500"></div>
            </div>
          </div>
        </div>
      }
    >
      {/* 그리드 영역 */}
      <div className="flex-1 flex flex-col">
        {/* 그리드 통계 정보 - 데스크탑 사이드바가 없을 때만 표시, 브레드크럼과 간격 조정 */}
        <div className="mb-1 min-[481px]:mb-1.5 min-[601px]:mb-2 sm:mb-2 md:mb-2 lg:hidden text-center flex-shrink-0">
          <div className="flex items-center justify-center gap-1 min-[481px]:gap-2 sm:gap-4 text-xs min-[481px]:text-sm sm:text-[clamp(0.875rem,1.5vw,2rem)] text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-[clamp(0.75rem,1.2vw,1.5rem)] sm:h-[clamp(0.75rem,1.2vw,1.5rem)] bg-success rounded-full animate-pulse"></div>
              <div className="w-12 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-[clamp(0.75rem,1.2vw,1.5rem)] sm:h-[clamp(0.75rem,1.2vw,1.5rem)] bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 sm:w-[clamp(0.75rem,1.2vw,1.5rem)] sm:h-[clamp(0.75rem,1.2vw,1.5rem)] border-2 border-dashed border-gray-300 rounded-full animate-pulse"></div>
              <div className="w-16 h-5 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* 진행률 표시 */}
          <div className="mt-1.5 pt-0.5 min-[481px]:mt-2 min-[481px]:pt-1 min-[601px]:mt-3 min-[601px]:pt-1.5 sm:mt-3 max-w-xs sm:max-w-[clamp(20rem,30vw,40rem)] mx-auto">
            <div className="flex items-center justify-between text-xs sm:text-[clamp(0.75rem,1.2vw,1.25rem)] text-muted-foreground mb-1 sm:mb-[0.5vh]">
              <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-6 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 sm:h-[clamp(0.5rem,1vh,1.5rem)]">
              <div className="bg-success h-2 sm:h-[clamp(0.5rem,1vh,1.5rem)] rounded-full w-2/5 transition-all duration-500"></div>
            </div>
          </div>
        </div>

        {/* 그리드 컨테이너 - 브레드크럼과의 간격 최적화 */}
        <div className="flex-1 flex items-center justify-center pt-0 mt-0 min-[481px]:pt-0.5 min-[481px]:mt-0.5 min-[601px]:pt-1 min-[601px]:mt-1 sm:pt-0 sm:mt-0 md:pt-0.5 md:mt-0.5">
          <div className="grid grid-cols-3 w-full gap-1 min-[481px]:gap-1.5 min-[601px]:gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8 max-w-[min(95vw,90vh)] max-h-[min(95vw,90vh)] min-[481px]:max-w-[min(92vw,85vh)] min-[481px]:max-h-[min(92vw,85vh)] min-[601px]:max-w-[min(90vw,80vh)] min-[601px]:max-h-[min(90vw,80vh)] md:max-w-[min(85vw,75vh)] md:max-h-[min(85vw,75vh)] lg:max-w-[min(70vw,80vh)] lg:max-h-[min(70vw,80vh)] xl:max-w-[min(65vw,75vh)] xl:max-h-[min(65vw,75vh)] 2xl:max-w-[min(60vw,70vh)] 2xl:max-h-[min(60vw,70vh)] aspect-square">
            {Array.from({ length: 9 }, (_, index) => {
              const isCenterCell = index === 4;
              // 고정된 패턴으로 빈 셀 표시 (위치 1, 6, 8을 빈 셀로)
              const isEmpty = [1, 6, 8].includes(index);
              
              if (isEmpty && !isCenterCell) {
                // 빈 셀 스켈레톤 (실제 MandalartCell의 빈 셀과 동일한 스타일)
                return (
                  <div
                    key={index}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded p-1 sm:p-2 bg-gray-50 flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-14 xl:h-14 2xl:w-16 2xl:h-16 bg-gray-300 rounded mb-1 animate-pulse"></div>
                      <div className="w-8 h-3 sm:w-10 sm:h-4 bg-gray-300 rounded animate-pulse"></div>
                    </div>
                  </div>
                );
              }
              
              // 일반 셀 스켈레톤 (실제 MandalartCell과 동일한 스타일)
              return (
                <div
                  key={index}
                  className={cn(
                    // 기본 스타일 (실제 MandalartCell과 동일)
                    "aspect-square border border-gray-200 rounded-lg p-2 sm:p-3 relative shadow-sm overflow-hidden",
                    
                    // 중앙 셀 스타일
                    isCenterCell && [
                      "bg-primary-50 border-primary-300 shadow-lg"
                    ],
                    
                    // 일반 셀 배경
                    !isCenterCell && "bg-white"
                  )}
                >
                  {/* 셀 내용 스켈레톤 */}
                  <div className="h-full flex flex-col">
                    {/* 상단 - 제목 영역 */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div className={`h-3 sm:h-4 rounded animate-pulse mb-1 ${
                        isCenterCell ? 'bg-primary-200' : 'bg-gray-200'
                      }`}></div>
                      <div className={`h-2 sm:h-3 w-3/4 rounded animate-pulse ${
                        isCenterCell ? 'bg-primary-200' : 'bg-gray-200'
                      }`}></div>
                    </div>
                    
                    {/* 하단 - 상태 및 액션 */}
                    <div className="flex justify-between items-center mt-2">
                      <div className={`h-2 w-8 rounded animate-pulse ${
                        isCenterCell ? 'bg-primary-200' : 'bg-gray-200'
                      }`}></div>
                      <div className={`w-4 h-4 rounded-full animate-pulse ${
                        isCenterCell ? 'bg-primary-200' : 'bg-gray-200'
                      }`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </CellPageLayout>
  );
};

export default CellPageSkeleton;