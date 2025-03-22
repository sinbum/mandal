import React from 'react';
import { MandalartNavigationProps } from '@/types/mandalart';

const MandalartNavigation: React.FC<MandalartNavigationProps> = ({ 
  path, 
  onNavigate 
}) => {
  return (
    <div className="flex items-center py-2 px-1 space-x-1 overflow-x-auto whitespace-nowrap bg-white rounded-md shadow-sm">
      {path.map((cell, index) => (
        <React.Fragment key={cell.id}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <button
            onClick={() => onNavigate(cell.id)}
            className={`
              text-xs font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors
              ${index === path.length - 1 ? 'bg-blue-50 text-blue-700' : 'text-gray-700'}
            `}
          >
            {cell.topic || '무제 셀'}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default MandalartNavigation; 