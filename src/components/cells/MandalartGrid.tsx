import React from 'react';
import { MandalartCell } from '@/types/mandalart';
import MandalartCellComponent from './MandalartCell';

interface MandalartGridProps {
  centerCell: MandalartCell;
  cells: MandalartCell[];
  onCellClick: (cell: MandalartCell) => void;
  onCellUpdate: (cellId: string, updates: Partial<MandalartCell>) => void;
  onToggleComplete: (cellId: string) => void;
  onEditCell?: (cell: MandalartCell) => void;
}

/**
 * 만다라트 그리드 컴포넌트
 * 9개의 셀(중앙 셀 1개 + 주변 셀 8개)을 3x3 그리드로 배치
 */
const MandalartGrid: React.FC<MandalartGridProps> = ({
  centerCell,
  cells,
  onCellClick,
  onCellUpdate,
  onToggleComplete,
  onEditCell
}) => {
  // 셀 배열이 8개 미만이면 빈 셀로 채움
  const filledCells = [...cells];
  
  // 현재 사용 중인 position 값들을 추적
  const usedPositions = new Set(cells.map(cell => cell.position));
  
  // 1부터 8까지의 모든 위치에 대해 빈 셀 생성
  const allCells = Array.from({ length: 8 }, (_, index) => {
    const position = index + 1;
    const existingCell = cells.find(cell => cell.position === position);
    
    if (existingCell) {
      return existingCell;
    }
    
    return {
      id: `empty-${position}`,
      topic: '',
      memo: '클릭하여 새 셀을 추가하세요',
      isCompleted: false,
      parentId: centerCell.id,
      depth: (centerCell.depth || 0) + 1,
      position: position
    };
  });
  
  // 위치에 따라 셀 정렬
  const sortedCells = allCells.sort((a, b) => a.position - b.position);
  
  // 3x3 그리드 레이아웃을 위해 셀 배치 (중앙에는 centerCell)
  const renderGrid = () => {
    // 그리드 위치와 position 매핑
    const gridToPosition: Record<number, number | null> = {
      0: 1, // 좌상
      1: 2, // 상
      2: 3, // 우상
      3: 4, // 좌
      4: null, // 중앙
      5: 5, // 우
      6: 6, // 좌하
      7: 7, // 하
      8: 8  // 우하
    };
    
    // 그리드 위치 계산 (순서: 좌상, 상, 우상, 좌, 중앙, 우, 좌하, 하, 우하)
    const gridPositions = [
      [0, 0], [0, 1], [0, 2],
      [1, 0], [1, 1], [1, 2],
      [2, 0], [2, 1], [2, 2]
    ];
    
    // 셀 배치
    return gridPositions.map(([row, col], index) => {
      // 중앙 셀 (1,1 위치)
      if (row === 1 && col === 1) {
        return (
          <div key="center" className="relative">
            <MandalartCellComponent
              cell={centerCell}
              onClick={() => {}} // 중앙 셀은 클릭할 수 없음
              onUpdate={(updates) => onCellUpdate(centerCell.id, updates)}
              onToggleComplete={() => onToggleComplete(centerCell.id)}
              onEdit={onEditCell ? () => onEditCell(centerCell) : undefined}
              isCenterCell={true}
            />
          </div>
        );
      }
      
      // 해당 그리드 위치의 position 값 가져오기
      const targetPosition = gridToPosition[index];
      
      // position에 해당하는 셀 찾기
      const displayCell = sortedCells.find(cell => cell.position === targetPosition) || 
        sortedCells[index > 4 ? index - 1 : index];
      
      // 각 그리드 위치별로 고유한 키 생성
      const gridKey = `grid-${row}-${col}`;
      
      return (
        <div key={gridKey} className="relative">
          <MandalartCellComponent
            cell={displayCell}
            onClick={() => onCellClick(displayCell)}
            onUpdate={(updates) => onCellUpdate(displayCell.id, updates)}
            onToggleComplete={() => onToggleComplete(displayCell.id)}
            onEdit={!displayCell.id.startsWith('empty-') && onEditCell ? () => onEditCell(displayCell) : undefined}
            isCenterCell={false}
          />
        </div>
      );
    });
  };
  
  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-3xl">
      {renderGrid()}
    </div>
  );
};

export default MandalartGrid;
