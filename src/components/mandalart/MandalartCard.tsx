import React from 'react';
import { formatDate } from '@/lib/utils';

interface MandalartCardProps {
  mandalart: {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
  };
  onClick?: () => void;
}

const MandalartCard: React.FC<MandalartCardProps> = ({ mandalart, onClick }) => {
  const { title, createdAt, updatedAt } = mandalart;
  
  // 최근 업데이트 시간 표시
  const lastUpdated = updatedAt ? formatDate(updatedAt) : formatDate(createdAt);
  const isRecentlyUpdated = Date.now() - new Date(updatedAt || createdAt).getTime() < 7 * 24 * 60 * 60 * 1000; // 일주일 이내

  return (
    <div 
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow duration-200"
      onClick={onClick}
    >
      <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">{title}</h3>
      
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {isRecentlyUpdated ? '최근 업데이트: ' : '마지막 수정: '}{lastUpdated}
        </span>
        
        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default MandalartCard;
