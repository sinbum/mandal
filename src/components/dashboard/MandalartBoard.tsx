import React from 'react';
import { MandalartCell } from '@/types/mandalart';
import MandalartGrid from './cells/MandalartGrid';
import { cellCache } from '@/utils/cellCache';

interface MandalartBoardProps {
  centerCell: MandalartCell;
  cells: MandalartCell[];
  onUpdateCell: (cellId: string, updates: Partial<MandalartCell>) => void;
  onToggleComplete: (cellId: string) => void;
  onCreateCell: (parentId: string, position: number) => void;
  onNavigate: (cellId: string) => void;
  onEditCell?: (cell: MandalartCell) => void;
  onLongPress?: (cell: MandalartCell) => void;
  onCellHover?: (cellId: string) => void;
  showProgressStats?: boolean;
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
  onEditCell,
  onLongPress,
  onCellHover,
  showProgressStats = true
}) => {
  console.log('🎯 [MandalartBoard] 렌더링:');
  console.log('  - centerCell:', centerCell?.id || 'null');
  console.log('  - cells.length:', cells.length);
  console.log('  - cells:', cells.map(c => `${c.id}(${c.topic})`).join(', '));
  console.log('  - showProgressStats:', showProgressStats);
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

  const handleCellHover = (cell: MandalartCell) => {
    // 빈 셀이 아닌 경우에만 프리로딩 실행
    if (!cell.id.startsWith('empty-')) {
      // 백그라운드에서 해당 셀의 자식 데이터를 미리 로딩
      cellCache.preloadCellChildren(cell.id);
      
      // 부모 컴포넌트의 hover 핸들러도 호출
      onCellHover?.(cell.id);
    }
  };

  const handleCellUpdate = (cellId: string, updates: Partial<MandalartCell>) => {
    onUpdateCell(cellId, updates);
  };

  const handleToggleComplete = (cellId: string) => {
    onToggleComplete(cellId);
  };

  return (
    <div className="w-full max-w-[min(90vw,calc(100vh-8rem))] sm:max-w-[min(85vw,calc(100vh-10rem))] md:max-w-[min(80vw,calc(100vh-8rem))] lg:max-w-[min(60vw,calc(100vh-10rem))] xl:max-w-[min(55vw,calc(100vh-10rem))] 2xl:max-w-[min(50vw,calc(100vh-10rem))] mx-auto">
      <MandalartGrid
        centerCell={centerCell}
        cells={cells}
        onCellClick={handleCellClick}
        onCellHover={handleCellHover}
        onCellUpdate={handleCellUpdate}
        onToggleComplete={handleToggleComplete}
        onEditCell={onEditCell}
        onLongPress={onLongPress}
        showProgressStats={showProgressStats}
      />
    </div>
  );
};

export default MandalartBoard; 