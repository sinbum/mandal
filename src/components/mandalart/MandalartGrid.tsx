import React from 'react';
import { MandalartGridProps, MandalartCell, MandalartHierarchical } from '@/types/mandalart';
import MandalartCellComponent from './MandalartCell';

const MandalartGrid: React.FC<MandalartGridProps> = ({
  mandalart,
  currentCell,
  onCellClick,
  onCellEdit,
  onCellToggleComplete,
  onNavigateBack,
  className = '',
  depth = 0,
}) => {
  // 현재 표시할 셀 및 그 자식들 결정
  const cellsToRender = React.useMemo(() => {
    const hierarchicalMandalart = mandalart as MandalartHierarchical;
    const current = currentCell || hierarchicalMandalart.rootCell;
    
    if (!current) return [];
    
    // 자식이 없거나 최소 1개라도 있으면 적절히 처리
    const childCells = current.children || [];
    
    // 자식이 8개 미만이면 빈 셀로 채움
    const children = [...childCells];
    while (children.length < 8) {
      children.push({
        id: `empty-${children.length}`,
        topic: '',
        depth: (current.depth || 0) + 1,
        position: children.length,
      });
    }
    
    // 표시할 때 position 기준으로 정렬
    return children.sort((a, b) => (a.position || 0) - (b.position || 0));
  }, [currentCell, mandalart]);
  
  // 새 구조에서 3x3 그리드 렌더링 (currentCell의 자식 8개 + 현재 셀)
  const renderGrid = () => {
    if (!currentCell) return null;
    
    // 현재 셀은 중앙에 위치, 자식들은 주변에 배치
    const centerCellToRender = currentCell;
    
    if (!cellsToRender || cellsToRender.length === 0) {
      // 자식이 없을 때
      return (
        <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full">
          {Array(9).fill(0).map((_, index) => {
            // 중앙은 현재 셀
            if (index === 4) {
              return (
                <div key={`center-${centerCellToRender.id}`} className="relative">
                  <MandalartCellComponent
                    cell={centerCellToRender}
                    isCenter={true}
                    className="border-blue-400"
                    onEdit={() => onCellEdit && onCellEdit(centerCellToRender.id)}
                    onToggleComplete={() => onCellToggleComplete && onCellToggleComplete(centerCellToRender.id)}
                  />
                </div>
              );
            }
            
            // 나머지는 빈 셀 (클릭 가능하도록 수정)
            const emptyId = `empty-${index}`;
            return (
              <div 
                key={`empty-cell-${index}`}
                className="bg-gray-50 border border-dashed border-gray-200 rounded aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                onClick={() => onCellEdit && onCellEdit(emptyId)}
              >
                <span className="text-xs text-gray-400 italic">빈 셀</span>
              </div>
            );
          })}
        </div>
      );
    }
    
    // 자식을 적절히 배치
    // 3x3 그리드에서 중앙을 제외한 위치들
    const positions = [0, 1, 2, 3, 5, 6, 7, 8];
    
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-1 h-full">
        {positions.map((pos, index) => {
          const child = cellsToRender[index];
          if (!child || child.id.startsWith('empty-')) {
            // 빈 셀 표시 (클릭 가능하도록 수정)
            const emptyId = child ? child.id : `empty-${index}`;
            return (
              <div 
                key={`pos-empty-${pos}`}
                className="bg-gray-50 border border-dashed border-gray-200 rounded aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-colors"
                onClick={() => onCellEdit && onCellEdit(emptyId)}
              >
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400 italic">빈 셀</span>
                  <span className="text-[10px] text-blue-400 mt-1">클릭하여 추가</span>
                </div>
              </div>
            );
          }
          
          // 실제 자식 셀 표시
          return (
            <div key={`child-${pos}-${child.id}`} className="relative">
              <MandalartCellComponent
                cell={child}
                hasChildren={'children' in child && Array.isArray(child.children) && child.children.length > 0}
                onClick={() => onCellClick(child.id)}
                onEdit={() => onCellEdit && onCellEdit(child.id)}
                onToggleComplete={() => onCellToggleComplete && onCellToggleComplete(child.id)}
              />
            </div>
          );
        })}
        
        {/* 중앙에 현재 셀 */}
        <div className="col-start-2 col-end-3 row-start-2 row-end-3">
          <div className="relative">
            <MandalartCellComponent
              cell={centerCellToRender}
              isCenter={true}
              className="border-blue-400"
              onEdit={() => onCellEdit && onCellEdit(centerCellToRender.id)}
              onToggleComplete={() => onCellToggleComplete && onCellToggleComplete(centerCellToRender.id)}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`w-full overflow-auto ${className}`}>
      {depth > 0 && onNavigateBack && (
        <button 
          onClick={onNavigateBack}
          className="mb-2 flex items-center text-sm text-blue-600 hover:text-blue-800"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          상위 셀로 돌아가기
        </button>
      )}
      
      <div className="border-2 border-blue-400 rounded-lg p-2 bg-white shadow-md">
        {renderGrid()}
      </div>
    </div>
  );
};

export default MandalartGrid;
