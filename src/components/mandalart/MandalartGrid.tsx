import React from 'react';
import { MandalartGridProps, MandalartBlock, MandalartCell } from '@/types/mandalart';
import MandalartCellComponent from './MandalartCell';

const MandalartGrid: React.FC<MandalartGridProps> = ({
  mandalart,
  onCellClick,
  className = '',
}) => {
  const { centerBlock, surroundingBlocks } = mandalart;

  // 3x3 블록 배열로 구성
  const renderBlock = (block: MandalartBlock, isCenter: boolean = false) => {
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
        {topCells.map((cell) => (
          <MandalartCellComponent
            key={cell.id}
            cell={cell}
            onClick={() => onCellClick(cell.id)}
          />
        ))}
        
        {/* 중간 줄 (3, 중앙, 4) */}
        <MandalartCellComponent
          key={middleCells[0].id}
          cell={middleCells[0]}
          onClick={() => onCellClick(middleCells[0].id)}
        />
        <MandalartCellComponent
          key={middleCells[1].id}
          cell={middleCells[1]}
          isCenter={isCenter}
          className="font-medium border-blue-300"
          onClick={() => onCellClick(middleCells[1].id)}
        />
        <MandalartCellComponent
          key={middleCells[2].id}
          cell={middleCells[2]}
          onClick={() => onCellClick(middleCells[2].id)}
        />
        
        {/* 하단 줄 (5, 6, 7) */}
        {bottomCells.map((cell) => (
          <MandalartCellComponent
            key={cell.id}
            cell={cell}
            onClick={() => onCellClick(cell.id)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className={`w-full overflow-auto ${className}`}>
      <div className="grid grid-cols-3 grid-rows-3 gap-2 p-2">
        {/* 첫 번째 줄: 블록 0, 1, 2 */}
        {surroundingBlocks.slice(0, 3).map((block) => (
          <div key={block.id} className="border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
            {renderBlock(block)}
          </div>
        ))}
        
        {/* 두 번째 줄: 블록 3, 중앙, 4 */}
        <div className="border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
          {renderBlock(surroundingBlocks[3])}
        </div>
        <div className="border-2 border-blue-400 rounded-lg p-0.5 bg-white shadow-md">
          {renderBlock(centerBlock, true)}
        </div>
        <div className="border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
          {renderBlock(surroundingBlocks[4])}
        </div>
        
        {/* 세 번째 줄: 블록 5, 6, 7 */}
        {surroundingBlocks.slice(5, 8).map((block) => (
          <div key={block.id} className="border border-gray-200 rounded-lg p-0.5 bg-white shadow-sm">
            {renderBlock(block)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MandalartGrid;
