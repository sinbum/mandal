import React, { useState, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { MandalartCell } from '@/types/mandalart';
import MandalartCellComponent from './MandalartCell';
import { cn } from '@/lib/utils';
import { designUtils } from '@/design-system/utils';

interface MandalartGridProps {
  centerCell: MandalartCell;
  cells: MandalartCell[];
  onCellClick: (cell: MandalartCell) => void;
  onCellHover?: (cell: MandalartCell) => void;
  onCellUpdate: (cellId: string, updates: Partial<MandalartCell>) => void;
  onToggleComplete: (cellId: string) => void;
  onEditCell?: (cell: MandalartCell) => void;
  onLongPress?: (cell: MandalartCell) => void;
  // 접근성 및 UX 개선
  className?: string;
  disabled?: boolean;
  loading?: boolean;
  // 키보드 네비게이션
  enableKeyboardNavigation?: boolean;
  // 애니메이션 제어
  animationEnabled?: boolean;
  // 모바일 최적화
  touchOptimized?: boolean;
  // 그리드 제목 (접근성)
  gridTitle?: string;
  // 진행 상황 표시 제어
  showProgressStats?: boolean;
}

/**
 * 만다라트 그리드 컴포넌트
 * 9개의 셀(중앙 셀 1개 + 주변 셀 8개)을 3x3 그리드로 배치
 * 접근성과 모바일 UX를 고려한 향상된 그리드 시스템
 */
const MandalartGrid: React.FC<MandalartGridProps> = ({
  centerCell,
  cells,
  onCellClick,
  onCellHover,
  onCellUpdate,
  onToggleComplete,
  onEditCell,
  onLongPress,
  className,
  disabled = false,
  loading = false,
  enableKeyboardNavigation = true,
  animationEnabled = true,
  touchOptimized = true,
  gridTitle = "만다라트 그리드",
  showProgressStats = true
}) => {
  const t = useTranslations('mandalart');

  // 키보드 네비게이션을 위한 포커스 상태
  const [focusedCellIndex, setFocusedCellIndex] = useState<number | null>(null);
  const [selectedCellIndex, setSelectedCellIndex] = useState<number | null>(null);
  
  // 그리드 위치와 position 매핑
  const gridToPosition = useMemo(() => ({
    0: 1, // 좌상
    1: 2, // 상
    2: 3, // 우상
    3: 4, // 좌
    4: null, // 중앙
    5: 5, // 우
    6: 6, // 좌하
    7: 7, // 하
    8: 8  // 우하
  }), []);
  
  // 셀 배열이 8개 미만이면 빈 셀로 채움
  const allCells = Array.from({ length: 8 }, (_, index) => {
    const position = index + 1;
    const existingCell = cells.find(cell => cell.position === position);
    
    if (existingCell) {
      return existingCell;
    }
    
    return {
      id: `empty-${position}`,
      topic: '',
      memo: t('cell.addCellHint'),
      isCompleted: false,
      parentId: centerCell.id,
      depth: (centerCell.depth || 0) + 1,
      position: position
    };
  });
  
  // 위치에 따라 셀 정렬
  const sortedCells = allCells.sort((a, b) => a.position - b.position);
  
  // 키보드 네비게이션 핸들러
  const handleKeyDown = useCallback((e: React.KeyboardEvent, cellIndex: number) => {
    if (!enableKeyboardNavigation) return;
    
    let newFocusIndex = cellIndex;
    
    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        if (cellIndex >= 3) newFocusIndex = cellIndex - 3;
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (cellIndex <= 5) newFocusIndex = cellIndex + 3;
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (cellIndex % 3 !== 0) newFocusIndex = cellIndex - 1;
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (cellIndex % 3 !== 2) newFocusIndex = cellIndex + 1;
        break;
      case 'Home':
        e.preventDefault();
        newFocusIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newFocusIndex = 8;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        handleCellClick(cellIndex);
        break;
      case 'Escape':
        setFocusedCellIndex(null);
        setSelectedCellIndex(null);
        break;
    }
    
    if (newFocusIndex !== cellIndex) {
      setFocusedCellIndex(newFocusIndex);
      // 포커스를 해당 셀로 이동
      const gridElement = document.querySelector(`[data-grid-index="${newFocusIndex}"]`) as HTMLElement;
      if (gridElement) {
        gridElement.focus();
      }
    }
  }, [enableKeyboardNavigation]);
  
  // 셀 클릭 핸들러
  const handleCellClick = useCallback((cellIndex: number) => {
    if (disabled || loading) return;
    
    // 중앙 셀은 클릭할 수 없음
    if (cellIndex === 4) return;
    
    const targetPosition = gridToPosition[cellIndex as keyof typeof gridToPosition];
    if (targetPosition === null) return;
    
    const displayCell = sortedCells.find(cell => cell.position === targetPosition) || 
      sortedCells[cellIndex > 4 ? cellIndex - 1 : cellIndex];
    
    if (displayCell) {
      setSelectedCellIndex(cellIndex);
      onCellClick(displayCell);
    }
  }, [disabled, loading, sortedCells, gridToPosition, onCellClick]);

  // 셀 호버 핸들러
  const handleCellHover = useCallback((cellIndex: number) => {
    if (disabled || loading || !onCellHover) return;
    
    // 중앙 셀은 호버 처리하지 않음
    if (cellIndex === 4) return;
    
    const targetPosition = gridToPosition[cellIndex as keyof typeof gridToPosition];
    if (targetPosition === null) return;
    
    const displayCell = sortedCells.find(cell => cell.position === targetPosition) || 
      sortedCells[cellIndex > 4 ? cellIndex - 1 : cellIndex];
    
    if (displayCell) {
      onCellHover(displayCell);
    }
  }, [disabled, loading, sortedCells, gridToPosition, onCellHover]);
  
  // 그리드 렌더링
  const renderGrid = () => {
    // 그리드 위치 계산 (순서: 좌상, 상, 우상, 좌, 중앙, 우, 좌하, 하, 우하)
    const gridPositions = [
      [0, 0], [0, 1], [0, 2],
      [1, 0], [1, 1], [1, 2],
      [2, 0], [2, 1], [2, 2]
    ];
    
    // 셀 배치
    return gridPositions.map(([row, col], index) => {
      const isCenterCell = row === 1 && col === 1;
      const isSelected = selectedCellIndex === index;
      const isFocused = focusedCellIndex === index;
      
      // 중앙 셀 (1,1 위치)
      if (isCenterCell) {
        return (
          <div key="center" className="relative">
            <MandalartCellComponent
              cell={centerCell}
              onClick={() => {}} // 중앙 셀은 클릭할 수 없음
              onUpdate={(updates) => onCellUpdate(centerCell.id, updates)}
              onToggleComplete={() => onToggleComplete(centerCell.id)}
              onEdit={onEditCell ? () => onEditCell(centerCell) : undefined}
              onLongPress={onLongPress}
              onKeyDown={(e) => handleKeyDown(e, index)}
              isCenterCell={true}
              isSelected={isSelected}
              isHighlighted={isFocused}
              gridIndex={index}
              touchOptimized={touchOptimized}
              animationEnabled={animationEnabled}
              aria-label={t('cell.centerCellLabel', { topic: centerCell.topic || t('cell.common.empty') })}
              aria-describedby={`center-cell-description`}
            />
            {/* 중앙 셀 설명 (스크린 리더용) */}
            <div id="center-cell-description" className="sr-only">
              {t('cell.centerCellDescription')}
            </div>
          </div>
        );
      }
      
      // 해당 그리드 위치의 position 값 가져오기
      const targetPosition = gridToPosition[index as keyof typeof gridToPosition];
      
      // position에 해당하는 셀 찾기
      const displayCell = sortedCells.find(cell => cell.position === targetPosition) || 
        sortedCells[index > 4 ? index - 1 : index];
      
      // 각 그리드 위치별로 고유한 키 생성
      const gridKey = `grid-${row}-${col}`;
      const isEmpty = displayCell?.id?.startsWith('empty-');
      
      return (
        <div 
          key={gridKey} 
          className="relative"
          onMouseEnter={() => handleCellHover(index)}
        >
          <MandalartCellComponent
            cell={displayCell}
            onClick={() => handleCellClick(index)}
            onUpdate={(updates) => onCellUpdate(displayCell.id, updates)}
            onToggleComplete={() => onToggleComplete(displayCell.id)}
            onEdit={!isEmpty && onEditCell ? () => onEditCell(displayCell) : undefined}
            onLongPress={!isEmpty ? onLongPress : undefined}
            onKeyDown={(e) => handleKeyDown(e, index)}
            isCenterCell={false}
            isSelected={isSelected}
            isHighlighted={isFocused}
            gridIndex={index}
            touchOptimized={touchOptimized}
            animationEnabled={animationEnabled}
            aria-label={t('cell.gridPositionLabel', { index: index + 1, topic: displayCell.topic || t('cell.common.empty') })}
            aria-describedby={`cell-${index}-description`}
          />
          {/* 셀 설명 (스크린 리더용) */}
          <div id={`cell-${index}-description`} className="sr-only">
            {isEmpty 
              ? t('cell.emptyCellDescription')
              : t('cell.filledCellDescription', { topic: displayCell.topic, status: displayCell.isCompleted ? t('cell.completed') : t('cell.inProgress') })
            }
          </div>
        </div>
      );
    });
  };
  
  // 접근성 props 생성
  const a11yProps = designUtils.a11y.createAriaProps({
    label: gridTitle,
    describedBy: 'grid-description',
  });
  
  return (
    <div className={cn("relative h-full", className)}>
      
      {/* 로딩 상태 */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 z-10 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <svg 
              className="animate-spin-slow w-6 h-6 text-primary" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4" 
                fill="none" 
                strokeDasharray="32" 
                strokeDashoffset="32"
              />
            </svg>
            <span className="text-sm text-muted-foreground">{t('common.loading')}</span>
          </div>
        </div>
      )}
      
      {/* 메인 컨테이너 */}
      <div className="flex flex-col h-full gap-6">
        
        {/* 그리드 영역 */}
        <div className="flex-1 flex flex-col">
          {/* 그리드 통계 정보 - 데스크탑 사이드바가 없을 때만 표시 */}
          {showProgressStats && (
          <div className="mb-4 sm:mb-4 md:mb-4 lg:hidden text-center flex-shrink-0">
            <div className="flex items-center justify-center gap-2 sm:gap-4 text-sm sm:text-[clamp(0.875rem,1.5vw,2rem)] text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-[clamp(0.75rem,1.2vw,1.5rem)] sm:h-[clamp(0.75rem,1.2vw,1.5rem)] bg-success rounded-full"></div>
                <span>{t('cell.progress.completed', { count: cells.filter(cell => cell.isCompleted).length })}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-[clamp(0.75rem,1.2vw,1.5rem)] sm:h-[clamp(0.75rem,1.2vw,1.5rem)] bg-gray-300 rounded-full"></div>
                <span>{t('cell.progress.inProgress', { count: cells.filter(cell => !cell.isCompleted && cell.topic).length })}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 sm:w-[clamp(0.75rem,1.2vw,1.5rem)] sm:h-[clamp(0.75rem,1.2vw,1.5rem)] border-2 border-dashed border-gray-300 rounded-full"></div>
                <span>{t('cell.progress.empty', { count: 8 - cells.filter(cell => cell.topic && cell.topic.trim() !== '').length })}</span>
              </div>
            </div>
            
            {/* 진행률 표시 */}
            <div className="mt-4 pt-2 sm:mt-4 max-w-xs sm:max-w-[clamp(20rem,30vw,40rem)] mx-auto">
              <div className="flex items-center justify-between text-xs sm:text-[clamp(0.75rem,1.2vw,1.25rem)] text-muted-foreground mb-1 sm:mb-[0.5vh]">
                <span>{t('cell.progressRate')}</span>
                <span>{Math.round((cells.filter(cell => cell.isCompleted).length / 8) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-[clamp(0.5rem,1vh,1.5rem)]">
                <div 
                  className="bg-success h-2 sm:h-[clamp(0.5rem,1vh,1.5rem)] rounded-full transition-all duration-500"
                  style={{ width: `${(cells.filter(cell => cell.isCompleted).length / 8) * 100}%` }}
                />
              </div>
            </div>
          </div>
          )}

          {/* 그리드 컨테이너 */}
          <div className="flex-1 flex items-center justify-center pt-4 mt-4 sm:pt-0 sm:mt-0">
            <div 
              className={cn(
                // 기본 그리드 스타일
                "grid grid-cols-3 w-full",
                "max-w-[min(90vw,calc(100vh-8rem))] sm:max-w-[min(85vw,calc(100vh-10rem))] md:max-w-[min(80vw,calc(100vh-8rem))] lg:max-w-[min(60vw,calc(100vh-10rem))] xl:max-w-[min(55vw,calc(100vh-10rem))] 2xl:max-w-[min(50vw,calc(100vh-10rem))]",
                "max-h-[min(90vw,calc(100vh-8rem))] sm:max-h-[min(85vw,calc(100vh-10rem))] md:max-h-[min(80vw,calc(100vh-8rem))] lg:max-h-[min(60vw,calc(100vh-10rem))] xl:max-h-[min(55vw,calc(100vh-10rem))] 2xl:max-h-[min(50vw,calc(100vh-10rem))]",
                "aspect-square", // 정사각형 비율 유지
                
                // 간격 설정
                "gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6 2xl:gap-8",
                
                // 반응형 크기 조정
                "text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl",
                
                // 상태별 스타일
                disabled && "opacity-50 pointer-events-none",
                
                // 애니메이션
                animationEnabled && "transition-all duration-300",
                
                // 터치 최적화
                touchOptimized && "touch-manipulation",
                
                // 다크 모드 지원
                "dark:bg-gray-800",
                
                // 모션 감소 설정
                "motion-reduce:transition-none"
              )}
              role="grid"
              aria-rowcount={3}
              aria-colcount={3}
              {...a11yProps}
            >
              {renderGrid()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MandalartGrid;