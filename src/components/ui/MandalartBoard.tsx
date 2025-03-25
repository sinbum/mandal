import React from 'react';
import { MandalartCell } from '@/types/mandalart';
import MandalartGrid from '../cells/MandalartGrid';

interface MandalartBoardProps {
  centerCell: MandalartCell;
  cells: MandalartCell[];
  onUpdateCell: (cellId: string, updates: Partial<MandalartCell>) => void;
  onToggleComplete: (cellId: string) => void;
  onCreateCell: (parentId: string, position: number) => void;
  onNavigate: (cellId: string) => void;
  onEditCell?: (cell: MandalartCell) => void;
}

/**
 * 만다라트 보드 컴포넌트
 * 중앙 셀과 자식 셀들을 그리드 형태로 보여줍니다.
 */
const MandalartBoard: React.FC<MandalartBoardProps> = ({
  centerCell,
  cells,
  onUpdateCell,
  onToggleComplete,
  onCreateCell,
  onNavigate,
  onEditCell
}) => {
  const handleCellClick = (cell: MandalartCell) => {
    // 빈 셀이면 새 셀 생성
    if (cell.id.startsWith('empty-')) {
      const position = parseInt(cell.id.replace('empty-', ''), 10);
      onCreateCell(centerCell.id, position);
    } else {
      // 일반 셀이면 네비게이션
      onNavigate(cell.id);
    }
  };

  const handleCellUpdate = (cellId: string, updates: Partial<MandalartCell>) => {
    onUpdateCell(cellId, updates);
  };

  const handleToggleComplete = (cellId: string) => {
    onToggleComplete(cellId);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full my-8">
      <h1 className="text-2xl font-bold mb-6">{centerCell.topic || '무제 셀'}</h1>
      <MandalartGrid
        centerCell={centerCell}
        cells={cells}
        onCellClick={handleCellClick}
        onCellUpdate={handleCellUpdate}
        onToggleComplete={handleToggleComplete}
        onEditCell={onEditCell}
      />
    </div>
  );
};

export default MandalartBoard; 