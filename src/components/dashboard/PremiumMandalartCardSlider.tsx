'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import { MandalartCell } from '@/types/mandalart';
import { Plus, MoreVertical, Edit3, Trash2, Circle, CheckCircle2 } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 번역 훅
  const t = useTranslations('slider');
  const tMandalart = useTranslations('mandalart');
  const locale = useLocale();
  const router = useRouter();
  
  // 전체 아이템 수 (카드 + 새 만다라트 카드)
  const totalItems = cells.length + 1;

  // 번역 초기화
  useEffect(() => {
    setTitle(t('create.form.title_placeholder'));
  }, [t]);


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
    setTitle(t('create.form.title_placeholder'));
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
                  {t('board.createNewMandalart')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {t('board.enterMandalartTitle')}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('common.title')}
                  </label>
                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder={t('board.newMandalart')}
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
                  >
                    {t('common.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={!title.trim() || isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    {isLoading ? t('common.creating') : t('common.create')}
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
            {t('board.createNewMandalart')}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {t('board.createNewMandalartDescription')}
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
    
    // 색상 테마
    const getThemeColors = (color?: string) => {
      if (color) {
        return {
          primary: color,
          light: `${color}15`,
          gradient: `linear-gradient(135deg, ${color} 0%, ${color}90 100%)`,
        };
      }
      
      const themes = [
        { 
          primary: '#6366f1', 
          light: '#6366f115', 
          gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        },
        { 
          primary: '#06b6d4', 
          light: '#06b6d415', 
          gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
        },
        { 
          primary: '#10b981', 
          light: '#10b98115', 
          gradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        },
        { 
          primary: '#f59e0b', 
          light: '#f59e0b15', 
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        }
      ];
      
      return themes[currentIndex % themes.length];
    };

    const theme = getThemeColors(cell.color);
    const progress = cell.progressInfo?.progressPercentage || 0;
    const completedTasks = cell.progressInfo?.completedCells || 0;
    const totalTasks = cell.progressInfo?.totalCells || 0;

    // 카드 클릭 핸들러
    const handleCardClick = () => {
      router.push(`/${locale}/app/cell/${cell.id}`);
    };

    // 모든 디바이스에서 새 만다라트 카드와 동일한 레이아웃 사용
    return (
      <div className="w-full relative group">
        {/* 내부 조명 효과 */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-60 group-active:opacity-60 transition-opacity duration-500 pointer-events-none -z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.primary}80 0%, ${theme.primary}50 30%, ${theme.primary}20 60%, transparent 80%)`,
            filter: 'blur(25px)',
            transform: 'scale(1.6)'
          }}
        />
        
        {/* 중간 글로우 효과 */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-40 group-active:opacity-40 transition-opacity duration-600 pointer-events-none -z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.primary}60 0%, ${theme.primary}25 50%, transparent 85%)`,
            filter: 'blur(40px)',
            transform: 'scale(2.2)'
          }}
        />
        
        {/* 외부 확산 조명 효과 */}
        <div 
          className="absolute inset-0 opacity-0 group-hover:opacity-25 group-active:opacity-25 transition-opacity duration-800 pointer-events-none -z-10"
          style={{
            background: `radial-gradient(ellipse at center, ${theme.primary}40 0%, ${theme.primary}15 40%, ${theme.primary}08 70%, transparent 90%)`,
            filter: 'blur(60px)',
            transform: 'scale(3.0)'
          }}
        />
        
        <div 
          className="relative w-full p-8 rounded-3xl border-2 border-gray-200 bg-white hover:border-blue-300 transition-all duration-300 min-h-[400px] flex flex-col items-center justify-center text-center shadow-sm hover:shadow-md cursor-pointer select-none"
          onClick={handleCardClick}
        >
          {/* 상단 액션 버튼들 */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-white hover:text-gray-800 transition-colors duration-200 flex items-center justify-center shadow-sm"
            >
              <MoreVertical size={14} />
            </button>
            
            {/* 드롭다운 메뉴 */}
            {showActions && (
              <div className="absolute right-0 top-10 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-30">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowActions(false);
                    onEdit?.(cell.id);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-gray-700"
                >
                  <Edit3 size={12} />
                  {tMandalart('board.edit')}
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowActions(false);
                    onDelete(cell.id, e);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
                >
                  <Trash2 size={12} />
                  {tMandalart('board.delete')}
                </button>
              </div>
            )}
          </div>

          {/* 상단 상태 표시 */}
          <div className="absolute top-4 left-4 z-20">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/80 backdrop-blur-sm">
              {cell.isCompleted ? (
                <CheckCircle2 size={12} className="text-green-600" />
              ) : (
                <Circle size={12} className="text-gray-400" />
              )}
              <span className="text-xs font-medium text-gray-700">
                {cell.isCompleted ? tMandalart('cell.completed') : tMandalart('cell.inProgress')}
              </span>
            </div>
          </div>

          {/* 헤더 - 그라디언트 배경 */}
          <div
            className="w-16 h-16 mb-6 rounded-full flex items-center justify-center shadow-xl"
            style={{ background: theme.gradient }}
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 7.26L18 4L14.74 8.91L20 10L14.74 11.09L18 16L13.09 12.74L12 18L10.91 12.74L6 16L9.26 11.09L4 10L9.26 8.91L6 4L10.91 7.26L12 2Z" />
            </svg>
          </div>
          
          {/* 제목 */}
          <h3 className="text-2xl font-bold text-gray-800 mb-3 line-clamp-2">
            {cell.topic || '제목 없음'}
          </h3>
          
          {/* 진행률 */}
          <div className="w-full max-w-xs mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>진행률</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${progress}%`,
                  background: theme.gradient
                }}
              />
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {completedTasks}/{totalTasks} 완료
            </div>
          </div>
          
          {/* 메모 (있을 경우) */}
          {cell.memo && (
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">
              {cell.memo}
            </p>
          )}

          {/* 통계 카드 */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-xs mt-4">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{totalTasks}</div>
              <div className="text-xs text-gray-500">{tMandalart('board.goals')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: theme.primary }}>{completedTasks}</div>
              <div className="text-xs text-gray-500">{tMandalart('cell.completed')}</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-500">{totalTasks - completedTasks}</div>
              <div className="text-xs text-gray-500">{tMandalart('board.remaining')}</div>
            </div>
          </div>
        </div>
      </div>
    );
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
              <div className="text-sm text-gray-600">{t('common.previous')}</div>
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
              <div className="text-sm text-gray-600">{t('common.next')}</div>
            </div>
          </div>
        </div>
      );
    }
    
    return previewCards;
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col select-none" ref={containerRef}>

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

      {/* 네비게이션 인디케이터 */}
      <div className="flex justify-center items-center space-x-3 py-8 pb-20 sm:pb-8">
        {Array.from({ length: totalItems }).map((_, index) => {
          const isActive = index === currentIndex;
          const isCreateCard = index === cells.length;
          
          // 현재 카드의 테마 색상 가져오기
          let activeColor = '#3b82f6'; // 기본 파란색
          if (isActive) {
            if (isCreateCard) {
              activeColor = '#6366f1'; // 새 카드용 보라색
            } else if (cells[index]?.color) {
              activeColor = cells[index].color;
            } else {
              // 인덱스 기반 기본 테마 색상
              const themes = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'];
              activeColor = themes[index % themes.length];
            }
          }
          
          return (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                isActive ? 'w-8' : 'hover:bg-gray-400'
              }`}
              style={{
                backgroundColor: isActive ? activeColor : '#d1d5db'
              }}
            />
          );
        })}
      </div>

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