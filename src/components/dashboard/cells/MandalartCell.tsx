import React from 'react';
import { MandalartCell as MandalartCellType } from '@/types/mandalart';
import { CELL_COLORS } from '@/lib/colors';
import { cn } from '@/lib/utils';
import { designUtils } from '@/design-system/utils';

interface MandalartCellProps {
  cell: MandalartCellType;
  isCenterCell?: boolean;
  onClick?: () => void;
  onUpdate?: (updates: Partial<MandalartCellType>) => void;
  onToggleComplete?: () => void;
  hasChildren?: boolean;
  className?: string;
  onEdit?: (cell: MandalartCellType) => void;
  // 접근성 개선
  'aria-label'?: string;
  'aria-describedby'?: string;
  // 모바일 최적화
  touchOptimized?: boolean;
  // 애니메이션 제어
  animationEnabled?: boolean;
  // 키보드 네비게이션
  onKeyDown?: (e: React.KeyboardEvent) => void;
  // 인덱스
  gridIndex?: number;
  // 상태
  isSelected?: boolean;
  isHighlighted?: boolean;
}

const MandalartCell: React.FC<MandalartCellProps> = ({
  cell,
  isCenterCell = false,
  onClick,
  onToggleComplete,
  hasChildren = false,
  className = '',
  onEdit,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
  touchOptimized = true,
  animationEnabled = true,
  onKeyDown,
  gridIndex,
  isSelected = false,
  isHighlighted = false,
}) => {
  const { topic, color, imageUrl, isCompleted } = cell || {};
  
  // 빈 셀인 경우 (id가 empty- 로 시작)
  const isEmpty = cell?.id?.startsWith('empty-');
  
  // 접근성 props 생성
  const a11yProps = designUtils.a11y.createAriaProps({
    label: ariaLabel || (isEmpty ? '만다라트 셀 추가' : `만다라트 셀: ${topic || '비어있음'}`),
    describedBy: ariaDescribedby,
    expanded: hasChildren,
    selected: isSelected,
  });
  
  // 키보드 이벤트 처리
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (onKeyDown) {
      onKeyDown(e);
      return;
    }
    
    // 기본 키보드 상호작용
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };
  
  // 빈 셀인 경우 기본 스타일로 표시
  if (isEmpty) {
    return (
      <div
        className={cn(
          // 기본 스타일
          "aspect-square border-2 border-dashed border-gray-300 rounded p-1 sm:p-2",
          "bg-gray-50 flex items-center justify-center",
          // 인터랙션 스타일
          onClick && [
            "cursor-pointer",
            "hover:bg-gray-100 hover:border-primary-400",
            "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "active:bg-gray-200",
          ],
          // 애니메이션
          animationEnabled && "transition-all duration-200",
          // 터치 최적화
          touchOptimized && "touch-target active-scale",
          // 상태
          isHighlighted && "border-primary-400 bg-primary-50",
          // 다크 모드
          "dark:bg-gray-800 dark:border-gray-600 dark:hover:bg-gray-700",
          // 모션 감소
          "motion-reduce:transition-none",
          className
        )}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={onClick ? 0 : -1}
        {...a11yProps}
      >
        <div className="flex flex-col items-center justify-center h-full text-center">
          <svg 
            className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 mb-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-gray-400 text-[9px] sm:text-[10px] leading-tight">
            클릭하여<br/>추가
          </span>
        </div>
      </div>
    );
  }
  
  // 이미지가 있는 경우 배경으로 설정
  const backgroundStyle = imageUrl ? {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};
  
  // 색상 스타일 적용
  const colorStyle = {
    backgroundColor: color || CELL_COLORS.DEFAULT,
  };

  return (
    <div
      className={cn(
        // 기본 스타일
        "aspect-square border border-gray-200 rounded p-1 sm:p-2 relative",
        "overflow-hidden", // 이미지 오버플로우 방지
        
        // 상태별 스타일
        isCenterCell && [
          "font-semibold",
          "bg-primary-50 border-primary-200",
          "dark:bg-primary-900/20 dark:border-primary-700",
        ],
        
        isCompleted && [
          "border-success",
          "bg-success-light/20",
          "dark:bg-success-dark/20",
        ],
        
        isSelected && [
          "ring-2 ring-primary/30",
          "border-primary",
        ],
        
        isHighlighted && [
          "bg-primary-50",
          "border-primary-300",
          "dark:bg-primary-900/30",
        ],
        
        // 인터랙션 스타일
        onClick && [
          "cursor-pointer",
          "hover:shadow-md hover:brightness-95",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
          "active:scale-98",
        ],
        
        // 애니메이션
        animationEnabled && "transition-all duration-200",
        
        // 터치 최적화
        touchOptimized && "touch-target active-scale",
        
        // 다크 모드
        "dark:border-gray-600 dark:hover:shadow-lg",
        
        // 모션 감소
        "motion-reduce:transition-none motion-reduce:transform-none",
        
        className
      )}
      style={{...colorStyle, ...backgroundStyle}}
      role={onClick ? "button" : "gridcell"}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      data-grid-index={gridIndex}
      {...a11yProps}
    >
      {/* 이미지가 있는 경우 반투명 오버레이 추가 */}
      {imageUrl && (
        <div className="absolute inset-0 bg-black/20 rounded" />
      )}
      
      {/* 상태 마커 컴타이너 */}
      <div className="absolute top-1 right-1 flex gap-1">
        {/* 완료 표시 */}
        {isCompleted && (
          <div className="bg-success/90 p-1 rounded-full shadow-sm">
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
        
        {/* 하위 셀 존재 표시 */}
        {hasChildren && (
          <div className="bg-primary/90 p-1 rounded-full shadow-sm">
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4 text-white" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* 셀 내용 */}
      <div 
        className={cn(
          // 기본 텍스트 스타일
          "flex flex-col h-full w-full",
          "text-[10px] sm:text-xs leading-tight break-words",
          
          // 색상 스타일
          imageUrl ? [
            "text-white",
            "drop-shadow-md",
            "font-medium", // 이미지 위에서 가독성 향상
          ] : [
            "text-gray-800",
            "dark:text-gray-200",
          ],
          
          // 빈 상태 스타일
          !topic && [
            "text-gray-400",
            "text-[9px] sm:text-[10px]",
            "italic",
            "dark:text-gray-500",
          ]
        )}
      >
        <span className="flex-grow flex items-center justify-center text-center p-1">
          <span className="truncate max-w-full" title={topic || '클릭하여 입력하세요'}>
            {topic || '클릭하여 입력하세요'}
          </span>
        </span>
        
        {/* 하위 셀 수 표시 */}
        {hasChildren && (
          <div className="text-center mt-1">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              "bg-primary/20 text-primary",
              "dark:bg-primary/30 dark:text-primary-300"
            )}>
              하위 셀 있음
            </span>
          </div>
        )}
      </div>
      
      {/* 액션 버튼 컴타이너 */}
      <div className="absolute bottom-1 left-1 flex gap-1">
        {/* 편집 버튼 */}
        {onEdit && (
          <button
            className={cn(
              // 기본 스타일
              "w-7 h-7 sm:w-8 sm:h-8",
              "bg-white/90 backdrop-blur-sm",
              "rounded-full shadow-sm",
              "flex items-center justify-center",
              
              // 인터랙션 스타일
              "opacity-70 hover:opacity-100",
              "focus:outline-none focus:ring-2 focus:ring-primary/20",
              "active:scale-95",
              
              // 터치 최적화
              "touch-target",
              
              // 애니메이션
              "transition-all duration-200",
              
              // 다크 모드
              "dark:bg-gray-800/90 dark:shadow-lg",
              
              // 모션 감소
              "motion-reduce:transition-none motion-reduce:transform-none"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cell);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onEdit(cell);
              }
            }}
            aria-label="셀 편집"
            title="셀 편집"
          >
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4 text-gray-600 dark:text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        )}
        
        {/* 완료 상태 토글 버튼 */}
        {onToggleComplete && (
          <button
            className={cn(
              // 기본 스타일
              "w-7 h-7 sm:w-8 sm:h-8",
              "backdrop-blur-sm rounded-full shadow-sm",
              "flex items-center justify-center",
              
              // 상태별 스타일
              isCompleted ? [
                "bg-success/90 text-white",
                "hover:bg-success",
                "focus:ring-success/20",
              ] : [
                "bg-white/90 text-gray-600",
                "hover:bg-gray-100",
                "focus:ring-gray-500/20",
                "dark:bg-gray-800/90 dark:text-gray-400",
              ],
              
              // 인터랙션 스타일
              "opacity-70 hover:opacity-100",
              "focus:outline-none focus:ring-2",
              "active:scale-95",
              
              // 터치 최적화
              "touch-target",
              
              // 애니메이션
              "transition-all duration-200",
              
              // 모션 감소
              "motion-reduce:transition-none motion-reduce:transform-none"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onToggleComplete();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                onToggleComplete();
              }
            }}
            aria-label={isCompleted ? '완료 상태 취소' : '완료 상태로 표시'}
            title={isCompleted ? '완료 상태 취소' : '완료 상태로 표시'}
          >
            <svg 
              className="w-3 h-3 sm:w-4 sm:h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default MandalartCell;
