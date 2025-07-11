'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { MandalartCell } from '@/types/mandalart';
import MandalartCard from './MandalartCard';
import MandalartCardDesktop from './MandalartCardDesktop';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface MandalartCardSliderProps {
  cells: MandalartCell[];
  onDelete: (cellId: string, event: React.MouseEvent) => void;
  onEdit?: (cellId: string) => void;
  onCreateNew: () => void;
}

const MandalartCardSlider: React.FC<MandalartCardSliderProps> = ({ 
  cells, 
  onDelete, 
  onEdit, 
  onCreateNew 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragConstraints, setDragConstraints] = useState({ left: 0, right: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  // 디바이스 감지
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640); // sm breakpoint
      setIsTablet(width >= 640 && width < 1024); // sm to lg breakpoint
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 전체 아이템 수 (카드 + 새 만다라트 카드)
  const totalItems = cells.length + 1;

  // 인덱스 범위 체크
  const isValidIndex = (index: number) => index >= 0 && index < totalItems;

  // 다음/이전 카드로 이동
  const goToNext = useCallback(() => {
    setCurrentIndex(prev => Math.min(prev + 1, totalItems - 1));
  }, [totalItems]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => Math.max(prev - 1, 0));
  }, []);

  // 특정 인덱스로 이동
  const goToIndex = useCallback((index: number) => {
    if (isValidIndex(index)) {
      setCurrentIndex(index);
    }
  }, [totalItems]);

  // 마우스 휠 이벤트 (데스크탑 반응형)
  useEffect(() => {
    if (isMobile) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [isMobile, goToNext, goToPrevious]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // 드래그 제약 업데이트
  useEffect(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      setDragConstraints({
        left: -containerWidth * 0.3,
        right: containerWidth * 0.3
      });
    }
  }, [currentIndex]);

  // 드래그 종료 핸들러
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.x > threshold) {
      goToPrevious();
    } else if (info.offset.x < -threshold) {
      goToNext();
    }
  };

  // 새 만다라트 카드 렌더링
  const renderCreateCard = () => (
    <motion.div
      key="create-new"
      className="w-full flex-shrink-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <div
        onClick={onCreateNew}
        className="w-full p-8 rounded-2xl border-2 border-dashed border-gray-300 bg-transparent hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 cursor-pointer min-h-[400px] flex flex-col items-center justify-center text-center"
      >
        <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
          <Plus className="w-8 h-8 text-gray-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">새 만다라트</h3>
        <p className="text-sm text-gray-500">새로운 목표를 설정해보세요</p>
      </div>
    </motion.div>
  );

  if (totalItems === 0) {
    return renderCreateCard();
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* 모바일: 한 개씩 보기 */}
      {isMobile && (
        <div className="relative overflow-hidden">
          <motion.div
            className="flex"
            drag="x"
            dragConstraints={dragConstraints}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={{ x: `-${currentIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {cells.map((cell, index) => (
              <motion.div
                key={cell.id}
                className="w-full flex-shrink-0 px-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="min-h-[500px]">
                  <MandalartCard
                    cell={cell}
                    index={index}
                    onDelete={onDelete}
                    onEdit={onEdit}
                  />
                </div>
              </motion.div>
            ))}
            {/* 새 만다라트 카드 */}
            <div className="w-full flex-shrink-0 px-4">
              {renderCreateCard()}
            </div>
          </motion.div>

          {/* 인디케이터 */}
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalItems }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* 스와이프 힌트 */}
          {totalItems > 1 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              좌우로 스와이프하여 다른 만다라트를 확인하세요
            </div>
          )}
        </div>
      )}

      {/* 태블릿: 2개씩 보기 */}
      {isTablet && (
        <div className="relative">
          <div className="grid grid-cols-2 gap-6">
            {cells.slice(currentIndex, currentIndex + 2).map((cell, index) => (
              <MandalartCard
                key={cell.id}
                cell={cell}
                index={index}
                onDelete={onDelete}
                onEdit={onEdit}
              />
            ))}
            {/* 새 만다라트 카드 (마지막에만 표시) */}
            {currentIndex + 2 >= cells.length && currentIndex < totalItems - 1 && (
              <div className="col-span-1">
                {renderCreateCard()}
              </div>
            )}
          </div>

          {/* 네비게이션 버튼 */}
          {totalItems > 2 && (
            <div className="flex justify-center mt-6 space-x-4">
              <button
                onClick={goToPrevious}
                disabled={currentIndex === 0}
                className="p-2 rounded-full bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={goToNext}
                disabled={currentIndex >= totalItems - 2}
                className="p-2 rounded-full bg-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 데스크탑: 기존 그리드 유지하되 휠 스크롤로 페이지네이션 */}
      {!isMobile && !isTablet && (
        <div className="relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8"
            >
              {cells.slice(currentIndex * 3, (currentIndex + 1) * 3).map((cell, index) => (
                <MandalartCardDesktop
                  key={cell.id}
                  cell={cell}
                  index={index}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
              {/* 새 만다라트 카드 */}
              {currentIndex * 3 + 3 >= cells.length && (
                <div>
                  {renderCreateCard()}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* 페이지 인디케이터 */}
          {Math.ceil(totalItems / 3) > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.ceil(totalItems / 3) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index * 3)}
                  className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                    Math.floor(currentIndex / 3) === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}

          {/* 마우스 휠 힌트 */}
          {Math.ceil(totalItems / 3) > 1 && (
            <div className="text-center mt-4 text-sm text-gray-500">
              마우스 휠을 사용하여 다른 만다라트를 확인하세요
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MandalartCardSlider;