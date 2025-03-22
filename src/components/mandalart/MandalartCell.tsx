import React from 'react';
import { MandalartCellProps } from '@/types/mandalart';
import { CELL_COLORS } from '@/lib/colors';

const MandalartCell: React.FC<MandalartCellProps> = ({
  cell,
  isCenter = false,
  onClick,
  className = '',
}) => {
  const { topic, color, imageUrl, isCompleted } = cell;
  
  // 이미지가 있는 경우 배경으로 설정
  const backgroundStyle = imageUrl ? {
    backgroundImage: `url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  } : {};
  
  // 색상 스타일 적용
  const colorStyle = {
    backgroundColor: color || CELL_COLORS.DEFAULT,
  };

  return (
    <div
      className={`
        aspect-square border border-gray-200 rounded p-1 relative
        flex items-center justify-center text-center
        ${isCenter ? 'font-semibold bg-blue-50' : ''}
        ${isCompleted ? 'border-green-500' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:brightness-95 transition-all' : ''}
        ${className}
      `}
      style={{...colorStyle, ...backgroundStyle}}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* 이미지가 있는 경우 반투명 오버레이 추가 */}
      {imageUrl && (
        <div className="absolute inset-0 bg-black bg-opacity-20 rounded" />
      )}
      
      {/* 완료 표시 */}
      {isCompleted && (
        <div className="absolute top-0.5 right-0.5">
          <svg className="w-3 h-3 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* 셀 내용 */}
      <span className={`
        ${imageUrl ? 'text-white drop-shadow-md' : 'text-gray-800'} 
        text-xs leading-tight break-words w-full max-w-full
        ${!topic ? 'text-gray-400 text-[10px] italic' : ''}
      `}>
        {topic || '클릭하여 입력하세요'}
      </span>
    </div>
  );
};

export default MandalartCell;
