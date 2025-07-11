'use client';

import { motion } from 'framer-motion';

const HomePageSkeleton = () => {
  return (
    <div className="relative w-full min-h-screen flex flex-col">
      {/* 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30" />

      {/* 메인 카드 영역 */}
      <div className="relative flex-1 flex items-center justify-center px-4 overflow-hidden">
        {/* 이전 카드 힌트 (위) */}
        <div className="absolute inset-x-0 top-0 pointer-events-none opacity-20 transform -translate-y-12 scale-90 blur-sm z-5">
          <div className="px-4">
            <div className="bg-white/60 rounded-3xl p-4 text-center h-32">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 카드 스켈레톤 */}
        <div className="relative z-20 w-full max-w-md">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-100">
            {/* 헤더 그라디언트 스켈레톤 */}
            <div className="h-24 relative bg-gray-100">

              {/* 상태 배지 스켈레톤 */}
              <div className="absolute top-3 left-3">
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/30">
                  <div className="w-3 h-3 bg-white/50 rounded-full animate-pulse"></div>
                  <div className="w-8 h-3 bg-white/50 rounded animate-pulse"></div>
                </div>
              </div>

              {/* 액션 버튼들 스켈레톤 */}
              <div className="absolute top-3 right-3 flex gap-2">
                <div className="w-8 h-8 rounded-full bg-white/30 animate-pulse"></div>
                <div className="w-8 h-8 rounded-full bg-white/30 animate-pulse"></div>
              </div>
            </div>

            {/* 메인 콘텐츠 스켈레톤 */}
            <div className="p-6 space-y-4">
              {/* 제목 */}
              <div className="space-y-2">
                <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
              </div>

              {/* 진행률 섹션 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div className="w-8 h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>

                {/* 진행률 바 */}
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="h-full bg-blue-300 rounded-full w-2/5"></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="w-12 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                    <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>

              {/* 통계 카드들 */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="text-center space-y-1"
                  >
                    <div className="h-6 bg-gray-200 rounded animate-pulse mx-auto w-8"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-12"></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 하단 액션 영역 */}
            <div className="px-6 pb-4">
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="w-8 h-3 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 다음 카드 힌트 (아래) */}
        <div className="absolute inset-x-0 bottom-0 pointer-events-none opacity-20 transform translate-y-12 scale-90 blur-sm z-5">
          <div className="px-4">
            <div className="bg-white/60 rounded-3xl p-4 text-center h-32">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse mx-auto w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse mx-auto w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 네비게이션 인디케이터 스켈레톤 */}
      <div className="flex justify-center items-center space-x-3 py-8">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className={`h-2 rounded-full bg-gray-300 ${
              index === 1 ? 'w-8' : 'w-2'
            }`}
          />
        ))}
      </div>

      {/* 진행률 표시 스켈레톤 */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
          <div className="w-12 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default HomePageSkeleton;