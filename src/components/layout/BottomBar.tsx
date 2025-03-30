'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMostRecentMandalartCell } from '@/lib/utils';


// 최근 만다라트 데이터 가져오기 (쿠키에서)
// cell 경로로 요청 이동


const BottomBar: React.FC = () => {
  const router = useRouter();
  const [recentCellId, setRecentCellId] = useState<string | null>(null);

  // 브라우저 환경에서만 실행되도록 useEffect 사용
  useEffect(() => {
    try {
      // 최근 만다라트 셀 ID를 로컬 스토리지에서 가져오기
      const storedCellId = getMostRecentMandalartCell();
      if (storedCellId) {
        setRecentCellId(storedCellId);
      }
    } catch (error) {
      console.error('로컬스토리지 접근 오류:', error);
    }
  }, []);

  // 만다라트 버튼 클릭 핸들러
  const handleMandalartClick = (e: React.MouseEvent) => {
    if (!recentCellId) {
      e.preventDefault();
      alert('최근 이용한 만다라트가 없습니다.');
      router.push('/');
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-14 flex items-center justify-around z-10">
      <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span className="text-xs mt-1">홈</span>
      </Link>
      
      <Link 
        href={recentCellId ? `/cell/${recentCellId}` : '#'}
        className="flex flex-col items-center text-gray-600 hover:text-blue-600"
        onClick={handleMandalartClick}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        <span className="text-xs mt-1">만다라트</span>
      </Link>

      <Link href="/profile" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-xs mt-1">프로필</span>
      </Link>
    </nav>
  );
};

export default BottomBar; 