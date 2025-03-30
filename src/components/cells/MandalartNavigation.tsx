import React from 'react';
import { MandalartNavigationProps } from '@/types/mandalart';

const MandalartNavigation: React.FC<MandalartNavigationProps> = ({ 
  path, 
  onNavigate 
}) => {
  // 수정된 방식의 브레드크럼 렌더링
  const renderBreadcrumbs = () => {
    // 경로가 없거나 한 개만 있으면 그대로 표시 (루트 경로)
    if (path.length <= 1) {
      return path.map((cell) => (
        <React.Fragment key={cell.id}>
          <button
            onClick={() => onNavigate(cell.id)}
            className={`
              text-xs font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors
              bg-blue-50 text-blue-700
            `}
          >
            {cell.topic || '무제 셀'}
          </button>
        </React.Fragment>
      ));
    }
    
    // 2뎁스 이상인 경우, 상위 셀과 현재 셀만 표시
    const parentCell = path[path.length - 2];
    const currentCell = path[path.length - 1];
    
    return (
      <>
        <button
          onClick={() => onNavigate(parentCell.id)}
          className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors text-gray-700"
        >
          ../{parentCell.topic || '무제 셀'}
        </button>
        <span className="text-gray-400">/</span>
        <button
          onClick={() => onNavigate(currentCell.id)}
          className="text-xs font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors bg-blue-50 text-blue-700"
        >
          {currentCell.topic || '무제 셀'}
        </button>
      </>
    );
  };

  return (
    <div className="flex items-center py-2 px-1 space-x-1 overflow-x-auto whitespace-nowrap bg-white rounded-md shadow-sm">
      {renderBreadcrumbs()}
    </div>
  );
};

export default MandalartNavigation; 