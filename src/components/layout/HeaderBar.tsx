import React from 'react';
import { HeaderBarProps } from '@/types/ui';
import Link from 'next/link';

const HeaderBar: React.FC<HeaderBarProps> = ({
  title,
  showBackButton = false,
  onBackClick,
  rightElement,
  href,
}) => {
  return (
    <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 justify-between sticky top-0 z-10">
      <div className="flex items-center">
        {showBackButton && (
          onBackClick ? (
            <button
              onClick={onBackClick}
              className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="뒤로 가기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <Link
              href={href || '/'}
              className="p-2 -ml-2 mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="뒤로 가기"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
          )
        )}
        <Link href="/" className="hover:text-gray-600">
          <h1 className="text-lg font-semibold text-gray-800 truncate">{title}</h1>
        </Link>
      </div>

      
      {rightElement && (
        <div className="flex items-center">
          {rightElement}
        </div>
      )}
    </header>
  );
};

export default HeaderBar; 