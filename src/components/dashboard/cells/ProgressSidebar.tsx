import React from 'react';
import { MandalartCell } from '@/types/mandalart';

interface ProgressSidebarProps {
  cells: MandalartCell[];
  className?: string;
}

/**
 * 데스크탑 진행 상황 사이드바 컴포넌트
 */
const ProgressSidebar: React.FC<ProgressSidebarProps> = ({ cells, className = "" }) => {
  const completedCount = cells.filter(cell => cell.isCompleted).length;
  const inProgressCount = cells.filter(cell => !cell.isCompleted && cell.topic).length;
  const emptyCount = 8 - cells.filter(cell => cell.topic && cell.topic.trim() !== '').length;
  const progressPercentage = Math.round((completedCount / 8) * 100);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm ${className}`}>
      <h3 className="text-lg font-semibold mb-4">진행 상황</h3>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-success rounded-full"></div>
          <span className="text-sm">완료: {completedCount}개</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
          <span className="text-sm">진행 중: {inProgressCount}개</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded-full"></div>
          <span className="text-sm">비어있음: {emptyCount}개</span>
        </div>
      </div>
      
      {/* 진행률 표시 */}
      <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
          <span>전체 진행률</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-success h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressSidebar;