'use client';

import { motion } from 'framer-motion';

const CellPageSkeleton = () => {
  return (
    <div className="flex lg:flex-row flex-col h-[100dvh] sm:h-screen overflow-hidden">
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="container mx-auto px-0 py-0 sm:px-4 sm:py-2 h-full flex flex-col max-w-none 2xl:max-w-8xl overflow-hidden">
          
          {/* 브레드크럼 스켈레톤 */}
          <div className="flex-shrink-0 p-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-2 h-4 bg-gray-200 rounded animate-pulse"></div>
              <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* 만다라트 보드 스켈레톤 */}
          <div className="flex-1 w-full flex items-start justify-center pt-8 sm:pt-4 pb-8 sm:pb-2 px-2 sm:p-4 min-h-0">
            <div className="w-full max-w-[min(90vw,calc(100vh-8rem))] sm:max-w-[min(85vw,calc(100vh-10rem))] md:max-w-[min(80vw,calc(100vh-8rem))] lg:max-w-[min(60vw,calc(100vh-10rem))] xl:max-w-[min(55vw,calc(100vh-10rem))] 2xl:max-w-[min(50vw,calc(100vh-10rem))] mx-auto">
              <div className="flex flex-col h-full gap-6">
                
                {/* 그리드 영역 */}
                <div className="flex-1 flex flex-col">
                  {/* 그리드 통계 정보 - 데스크탑 사이드바가 없을 때만 표시 */}
                  <div className="mb-4 sm:mb-4 md:mb-4 lg:hidden text-center flex-shrink-0">
                    <div className="flex items-center justify-center gap-2 sm:gap-4 text-sm sm:text-base text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-200 rounded-full animate-pulse"></div>
                        <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-full animate-pulse"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-dashed border-gray-300 rounded-full animate-pulse"></div>
                        <div className="w-16 h-4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    
                    {/* 진행률 표시 */}
                    <div className="mt-4 pt-2 sm:mt-4 max-w-xs sm:max-w-[clamp(20rem,30vw,40rem)] mx-auto">
                      <div className="flex items-center justify-between text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                        <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-6 h-3 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3">
                        <div className="bg-green-300 h-2 sm:h-3 rounded-full w-2/5 transition-all duration-500"></div>
                      </div>
                    </div>
                  </div>

                  {/* 그리드 컨테이너 */}
                  <div className="flex-1 flex items-center justify-center pt-4 mt-4 sm:pt-0 sm:mt-0">
                    <div className="grid grid-cols-3 w-full gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8 max-w-[min(90vw,calc(100vh-8rem))] sm:max-w-[min(85vw,calc(100vh-10rem))] md:max-w-[min(80vw,calc(100vh-8rem))] lg:max-w-[min(60vw,calc(100vh-10rem))] xl:max-w-[min(55vw,calc(100vh-10rem))] 2xl:max-w-[min(50vw,calc(100vh-10rem))] max-h-[min(90vw,calc(100vh-8rem))] sm:max-h-[min(85vw,calc(100vh-10rem))] md:max-h-[min(80vw,calc(100vh-8rem))] lg:max-h-[min(60vw,calc(100vh-10rem))] xl:max-h-[min(55vw,calc(100vh-10rem))] 2xl:max-h-[min(50vw,calc(100vh-10rem))] aspect-square">
                {Array.from({ length: 9 }, (_, index) => (
                  <div
                    key={index}
                    className={`
                      relative rounded-xl overflow-hidden
                      ${index === 4 
                        ? 'bg-blue-50 border border-blue-100' 
                        : 'bg-gray-50 border border-gray-100'
                      }
                    `}
                  >
                    {/* 셀 내용 스켈레톤 */}
                    <div className="p-2 sm:p-4 h-full flex flex-col justify-between">
                      {/* 상단 - 제목 */}
                      <div className="space-y-2">
                        <div className={`h-3 sm:h-4 rounded animate-pulse ${
                          index === 4 ? 'bg-blue-200' : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-2 sm:h-3 w-3/4 rounded animate-pulse ${
                          index === 4 ? 'bg-blue-200' : 'bg-gray-200'
                        }`}></div>
                      </div>
                      
                      {/* 중앙 - 아이콘 영역 */}
                      <div className="flex justify-center">
                        <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full animate-pulse ${
                          index === 4 ? 'bg-blue-200' : 'bg-gray-200'
                        }`}></div>
                      </div>
                      
                      {/* 하단 - 상태 */}
                      <div className="flex justify-between items-center">
                        <div className={`h-2 w-8 rounded animate-pulse ${
                          index === 4 ? 'bg-blue-200' : 'bg-gray-200'
                        }`}></div>
                        <div className={`w-4 h-4 rounded-full animate-pulse ${
                          index === 4 ? 'bg-blue-200' : 'bg-gray-200'
                        }`}></div>
                      </div>
                    </div>
                  </div>
                ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 데스크탑 사이드바 스켈레톤 - lg 이상에서만 표시 */}
      <div className="hidden lg:flex lg:flex-col lg:w-80 xl:w-96 p-6 bg-gray-50 dark:bg-gray-900 justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* 사이드바 제목 */}
          <div className="h-6 w-16 bg-gray-200 rounded animate-pulse mb-4"></div>
          
          {/* 진행 상황 스켈레톤 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-green-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-dashed border-gray-200 rounded-full animate-pulse"></div>
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
          
          {/* 진행률 표시 스켈레톤 */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-4 w-8 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div className="bg-green-300 h-3 rounded-full w-2/5"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CellPageSkeleton;