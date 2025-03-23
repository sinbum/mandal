import React from 'react';
import { MandalartGridProps, MandalartCell, MandalartBlock, MandalartLegacy, MandalartHierarchical } from '@/types/mandalart';
import MandalartCellComponent from './MandalartCell';

// 타입 가드 함수 추가
const isLegacyMandalart = (mandalart: any): mandalart is MandalartLegacy => {
  return 'centerBlock' in mandalart && 'surroundingBlocks' in mandalart;
};

const isHierarchicalMandalart = (mandalart: any): mandalart is MandalartHierarchical => {
  return 'rootCell' in mandalart;
};

const MandalartGrid: React.FC<MandalartGridProps> = ({
  mandalart,
  currentCell,
  onCellClick,
  onCellEdit,
  onNavigateBack,
  isExpanded = false,
  className = '',
  depth = 0,
}) => {
  // 레거시 구조 지원 (이전 코드와의 호환성)
  const isLegacyStructure = isLegacyMandalart(mandalart);

  // 현재 표시할 셀 및 그 자식들 결정
  const cellsToRender = React.useMemo(() => {
    if (isLegacyStructure) {
      // 이전 구조는 기존 로직대로 처리
      return null;
    } else {
      // 새 구조에서는 currentCell이 없으면 rootCell 사용
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
    }
  }, [isLegacyStructure, currentCell, mandalart]);

  // 레거시 3x3 블록 렌더링 코드
  const renderLegacyBlock = (block: MandalartBlock, isCenter = false) => {
    const { centerCell, surroundingCells } = block;
    
    // 주변 셀 위치별 렌더링 (9개 셀이 3x3 그리드에 정확하게 배치되도록)
    const topCells = surroundingCells.slice(0, 3);
    const middleCells = [
      surroundingCells[3],
      centerCell,
      surroundingCells[4]
    ];
    const bottomCells = surroundingCells.slice(5, 8);
    
    return (
      <div className="grid grid-cols-3 grid-rows-3 gap-0.5 h-full">
        {/* 상단 줄 (0, 1, 2) */}
        {topCells.map((cell: MandalartCell, index: number) => (
          <MandalartCellComponent
            key={`top-${block.id}-${index}-${cell.id}`}
            cell={cell}
            onClick={() => onCellClick(cell.id)}
            onEdit={() => onCellEdit && onCellEdit(cell.id)}
          />
        ))}
        
        {/* 중간 줄 (3, 중앙, 4) */}
        <MandalartCellComponent
          key={`middle-left-${block.id}-${middleCells[0].id}`}
          cell={middleCells[0]}
          onClick={() => onCellClick(middleCells[0].id)}
          onEdit={() => onCellEdit && onCellEdit(middleCells[0].id)}
        />
        <MandalartCellComponent
          key={`middle-center-${block.id}-${middleCells[1].id}`}
          cell={middleCells[1]}
          isCenter={isCenter}
          className="font-medium border-blue-300"
          onClick={() => onCellClick(middleCells[1].id)}
          onEdit={() => onCellEdit && onCellEdit(middleCells[1].id)}
        />
        <MandalartCellComponent
          key={`middle-right-${block.id}-${middleCells[2].id}`}
          cell={middleCells[2]}
          onClick={() => onCellClick(middleCells[2].id)}
          onEdit={() => onCellEdit && onCellEdit(middleCells[2].id)}
        />
        
        {/* 하단 줄 (5, 6, 7) */}
        {bottomCells.map((cell: MandalartCell, index: number) => (
          <MandalartCellComponent
            key={`bottom-${block.id}-${index}-${cell.id}`}
            cell={cell}
            onClick={() => onCellClick(cell.id)}
            onEdit={() => onCellEdit && onCellEdit(cell.id)}
          />
        ))}
      </div>
    );
  };
  
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
                <MandalartCellComponent
                  key={`center-${centerCellToRender.id}`}
                  cell={centerCellToRender}
                  isCenter={true}
                  className="border-blue-400"
                  onEdit={() => onCellEdit && onCellEdit(centerCellToRender.id)}
                />
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
            <MandalartCellComponent
              key={`child-${pos}-${child.id}`}
              cell={child}
              hasChildren={'children' in child && Array.isArray(child.children) && child.children.length > 0}
              onClick={() => onCellClick(child.id)}
              onEdit={() => onCellEdit && onCellEdit(child.id)}
            />
          );
        })}
        
        {/* 중앙에 현재 셀 */}
        <div className="col-start-2 col-end-3 row-start-2 row-end-3">
          <MandalartCellComponent
            key={`center-main-${centerCellToRender.id}`}
            cell={centerCellToRender}
            isCenter={true}
            className="border-blue-400"
            onEdit={() => onCellEdit && onCellEdit(centerCellToRender.id)}
          />
        </div>
      </div>
    );
  };

  // 레거시 렌더링
  if (isLegacyStructure) {
    const legacyMandalart = mandalart as MandalartLegacy;
    const { centerBlock, surroundingBlocks } = legacyMandalart;
    
    // 확장 모드가 아닐 때는 중앙 블록만 렌더링
    if (!isExpanded) {
      return (
        <div className={`w-full overflow-auto ${className}`}>
          <div className="w-full max-w-md mx-auto">
            <div className="border-2 border-blue-400 rounded-lg p-1 bg-white shadow-md">
              {centerBlock && renderLegacyBlock(centerBlock, true)} 
            </div>
          </div>
        </div>
      );
    }

    // 확장 모드일 때는 전체 9x9 그리드 렌더링
    return (
      <div className={`w-full overflow-auto ${className}`}>
        <div className="grid grid-cols-3 grid-rows-3 gap-2 p-2">
          {/* 첫 번째 줄: 블록 0, 1, 2 */}
          {surroundingBlocks?.slice(0, 3).map((block: MandalartBlock) => (
            <div key={block.id} className="border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
              {renderLegacyBlock(block)}
            </div>
          ))}
          
          {/* 두 번째 줄: 블록 3, 중앙, 4 */}
          <div className="border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
            {surroundingBlocks && surroundingBlocks[3] && renderLegacyBlock(surroundingBlocks[3])}
          </div>
          <div className="border-2 border-blue-400 rounded-lg p-0.5 bg-white shadow-md">
            {centerBlock && renderLegacyBlock(centerBlock, true)}
          </div>
          <div className="border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
            {surroundingBlocks && surroundingBlocks[4] && renderLegacyBlock(surroundingBlocks[4])}
          </div>
          
          {/* 세 번째 줄: 블록 5, 6, 7 */}
          {surroundingBlocks?.slice(5, 8).map((block: MandalartBlock) => (
            <div key={block.id} className="border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
              {renderLegacyBlock(block)}
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // 새 계층 구조 렌더링
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
