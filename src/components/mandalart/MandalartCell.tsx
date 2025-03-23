import React from 'react';
import { MandalartCellProps } from '@/types/mandalart';
import { CELL_COLORS } from '@/lib/colors';

const MandalartCell: React.FC<MandalartCellProps> = ({
  cell,
  isCenter = false,
  onClick,
  onEdit,
  hasChildren = false,
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
        ${isCenter ? 'font-semibold bg-blue-50' : ''}
        ${isCompleted ? 'border-green-500' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-md hover:brightness-95 transition-all' : ''}
        ${className}
      `}
      style={{...colorStyle, ...backgroundStyle}}
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
      
      {/* 하위 셀 존재 표시 */}
      {hasChildren && (
        <div className="absolute bottom-0.5 right-0.5">
          <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {/* 셀 내용 */}
      <div 
        className={`
          ${imageUrl ? 'text-white drop-shadow-md' : 'text-gray-800'} 
          text-xs leading-tight break-words w-full max-w-full
          ${!topic ? 'text-gray-400 text-[10px] italic' : ''}
          flex flex-col h-full
        `}
        onClick={onClick}
      >
        <span className="flex-grow flex items-center justify-center text-center">
          <span className="truncate max-w-[80%]">
            {topic || '클릭하여 입력하세요'}
          </span>
          {hasChildren && (
            <span className="inline-block ml-1 flex-shrink-0 text-blue-500">
              <svg className="w-3 h-3 inline-block" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </span>
          )}
        </span>
      </div>
      
      {/* 편집 버튼 - 별도로 메모와 속성 편집 */}
      {onEdit && (
        <button
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white bg-opacity-70 rounded-full shadow-sm opacity-60 hover:opacity-100 flex items-center justify-center"
          onClick={(e) => {
            e.stopPropagation(); // 클릭 이벤트 전파 방지
            onEdit();
          }}
        >
          <svg className="w-3 h-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default MandalartCell;
