'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { MandalartCell } from '@/types/mandalart';
import MandalartCard from './MandalartCard';
import MandalartCardDesktop from './MandalartCardDesktop';
import { ChevronUp, ChevronDown, Plus } from 'lucide-react';

interface PremiumMandalartCardSliderProps {
  cells: MandalartCell[];
  onDelete: (cellId: string, event: React.MouseEvent) => void;
  onEdit?: (cellId: string) => void;
  onCreateNew: (title: string) => Promise<void>;
}

const PremiumMandalartCardSlider: React.FC<PremiumMandalartCardSliderProps> = ({ 
  cells, 
  onDelete, 
  onEdit, 
  onCreateNew 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('새 만다라트');
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 전체 아이템 수 (카드 + 새 만다라트 카드)
  const totalItems = cells.length + 1;

  // 디바이스 감지
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // 카드 전환 애니메이션 (단순화)
  const [springProps, api] = useSpring(() => ({
    transform: 'translateY(0px)',
    opacity: 1,
    config: {
      tension: 400,
      friction: 35,
      mass: 0.8,
    },
  }));

  // 다음/이전 카드로 이동 (즉시 반응)
  const goToNext = useCallback(() => {
    if (currentIndex >= totalItems - 1) return;
    
    // 애니메이션 시작
    api.start({
      transform: 'translateY(-100px)',
      opacity: 0,
      config: { tension: 500, friction: 40, mass: 0.5 },
      onRest: () => {
        // 즉시 다음 카드로 변경
        setCurrentIndex(prev => prev + 1);
        // 아래에서 올라오는 애니메이션
        api.set({ transform: 'translateY(100px)', opacity: 0 });
        api.start({ transform: 'translateY(0px)', opacity: 1 });
      }
    });
  }, [currentIndex, totalItems, api]);

  const goToPrevious = useCallback(() => {
    if (currentIndex <= 0) return;
    
    // 애니메이션 시작
    api.start({
      transform: 'translateY(100px)',
      opacity: 0,
      config: { tension: 500, friction: 40, mass: 0.5 },
      onRest: () => {
        // 즉시 이전 카드로 변경
        setCurrentIndex(prev => prev - 1);
        // 위에서 내려오는 애니메이션
        api.set({ transform: 'translateY(-100px)', opacity: 0 });
        api.start({ transform: 'translateY(0px)', opacity: 1 });
      }
    });
  }, [currentIndex, api]);

  // 특정 인덱스로 이동
  const goToIndex = useCallback((index: number) => {
    if (index === currentIndex || index < 0 || index >= totalItems) return;
    
    const isNext = index > currentIndex;
    
    api.start({
      transform: isNext ? 'translateY(-100px)' : 'translateY(100px)',
      opacity: 0,
      config: { tension: 500, friction: 40, mass: 0.5 },
      onRest: () => {
        setCurrentIndex(index);
        api.set({ 
          transform: isNext ? 'translateY(100px)' : 'translateY(-100px)', 
          opacity: 0 
        });
        api.start({ transform: 'translateY(0px)', opacity: 1 });
      }
    });
  }, [currentIndex, totalItems, api]);

  // 드래그 제스처 설정 (더 반응적)
  const bind = useDrag(({ 
    last, 
    velocity: [, vy], 
    direction: [, dy], 
    movement: [, my],
    active
  }) => {
    if (!active && Math.abs(my) < 5) return;

    if (last) {
      const threshold = 40; // 더 낮은 임계값
      const velocityThreshold = 0.2; // 더 낮은 속도 임계값
      
      if (Math.abs(my) > threshold || Math.abs(vy) > velocityThreshold) {
        if (dy > 0) {
          goToPrevious();
        } else {
          goToNext();
        }
      } else {
        // 원래 위치로 복원
        api.start({ transform: 'translateY(0px)', opacity: 1 });
      }
    }
  }, {
    axis: 'y',
    filterTaps: true,
    threshold: 5,
  });

  // 마우스 휠 이벤트 (데스크탑 및 모바일 레이아웃)
  useEffect(() => {
    // 모바일 레이아웃이거나 실제 모바일일 때 휠 이벤트 활성화
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      if (e.deltaY > 5) {
        goToNext();
      } else if (e.deltaY < -5) {
        goToPrevious();
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [goToNext, goToPrevious]);

  // 키보드 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        goToPrevious();
      } else if (e.key === 'ArrowDown') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrevious]);

  // 새 만다라트 폼 이벤트 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsLoading(true);
    try {
      await onCreateNew(title.trim());
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsFormOpen(false);
    setTitle('새 만다라트');
  };

  // 새 만다라트 카드 렌더링 (폼 통합)
  const renderCreateCard = () => {

    if (isFormOpen) {
      return (
        <div className="w-full">
          <div className="relative group w-full p-8 rounded-3xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-purple-50 transition-all duration-300 min-h-[400px] flex flex-col items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mb-4 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <Plus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  새 만다라트 만들기
                </h3>
                <p className="text-gray-600 text-sm">
                  만다라트의 제목을 입력해주세요
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    제목
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="새 만다라트"
                    maxLength={50}
                    required
                    autoFocus
                  />
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim() || isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isLoading ? '생성 중...' : '생성'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div
          onClick={() => setIsFormOpen(true)}
          className="relative group w-full p-8 rounded-3xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 transition-all duration-300 cursor-pointer min-h-[400px] flex flex-col items-center justify-center text-center"
        >
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-xl transform hover:scale-110 transition-transform duration-200">
            <Plus className="w-10 h-10 text-white" />
          </div>
          
          <h3 className="text-2xl font-bold text-gray-800 mb-3">
            새 만다라트 생성
          </h3>
          <p className="text-gray-600 leading-relaxed">
            새로운 목표를 설정하고<br />꿈을 현실로 만들어보세요
          </p>
        </div>
      </div>
    );
  };

  // 현재 카드 렌더링
  const renderCurrentCard = () => {
    if (currentIndex >= cells.length) {
      return renderCreateCard();
    }

    const cell = cells[currentIndex];
    
    if (isMobile) {
      return (
        <div className="min-h-[500px] w-full">
          <MandalartCard
            cell={cell}
            index={currentIndex}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      );
    } else if (isTablet) {
      return (
        <div className="min-h-[400px] w-full">
          <MandalartCard
            cell={cell}
            index={currentIndex}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      );
    } else {
      return (
        <div className="w-full max-w-md mx-auto">
          <MandalartCardDesktop
            cell={cell}
            index={currentIndex}
            onDelete={onDelete}
            onEdit={onEdit}
          />
        </div>
      );
    }
  };

  // 간단한 프리뷰 카드들 (렌더링 최소화)
  const renderPreviewCards = () => {
    const previewCards = [];
    
    // 이전 카드 (위에)
    if (currentIndex > 0) {
      previewCards.push(
        <div
          key={`prev-${currentIndex - 1}`}
          className="absolute inset-x-0 top-0 pointer-events-none opacity-20 transform -translate-y-12 scale-90 blur-sm"
          style={{ zIndex: 5 }}
        >
          <div className="px-4">
            <div className="bg-white/60 rounded-3xl p-4 text-center">
              <div className="text-sm text-gray-600">이전</div>
            </div>
          </div>
        </div>
      );
    }
    
    // 다음 카드 (아래)
    if (currentIndex < totalItems - 1) {
      previewCards.push(
        <div
          key={`next-${currentIndex + 1}`}
          className="absolute inset-x-0 bottom-0 pointer-events-none opacity-20 transform translate-y-12 scale-90 blur-sm"
          style={{ zIndex: 5 }}
        >
          <div className="px-4">
            <div className="bg-white/60 rounded-3xl p-4 text-center">
              <div className="text-sm text-gray-600">다음</div>
            </div>
          </div>
        </div>
      );
    }
    
    return previewCards;
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col" ref={containerRef}>
      {/* 단순한 배경 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30" />

      {/* 메인 카드 영역 */}
      <div 
        className="relative flex-1 flex items-center justify-center px-4 overflow-hidden"
        {...bind()}
        style={{ touchAction: 'pan-x pinch-zoom' }}
      >
        {/* 간단한 프리뷰 카드들 */}
        {renderPreviewCards()}

        {/* 현재 카드 (애니메이션 적용) */}
        <animated.div 
          style={springProps}
          className="relative z-20 w-full max-w-md"
        >
          {renderCurrentCard()}
        </animated.div>
      </div>

      {/* 단순한 네비게이션 인디케이터 */}
      <div className="flex justify-center items-center space-x-3 py-8">
        {Array.from({ length: totalItems }).map((_, index) => (
          <button
            key={index}
            onClick={() => goToIndex(index)}
            className={`w-2 h-2 rounded-full transition-all duration-200 ${
              index === currentIndex 
                ? 'bg-blue-500 w-8' 
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>

      {/* 단순한 스와이프 힌트 */}
      {isMobile && totalItems > 1 && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center">
          <div className="text-gray-500 text-sm">
            <ChevronUp className="w-4 h-4 mx-auto mb-1" />
            <div className="text-xs">위로 스와이프 → 다음</div>
            <div className="text-xs">아래로 스와이프 → 이전</div>
            <ChevronDown className="w-4 h-4 mx-auto mt-1" />
          </div>
        </div>
      )}

      {/* 진행률 표시 */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
        <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
          <span className="text-sm font-medium text-gray-700">
            {currentIndex + 1} / {totalItems}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PremiumMandalartCardSlider;