'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMostRecentMandalartCell } from '@/lib/utils';
import HamburgerIcon from '@/components/animations/HamburgerIcon';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
import AnimatedButton from '@/components/animations/AnimatedButton';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { signOut } from '@/lib/auth/utils';
import { toast } from "sonner";


// 최근 만다라트 데이터 가져오기 (쿠키에서)
// cell 경로로 요청 이동


const BottomBar: React.FC = () => {
  const router = useRouter();
  const [recentCellId, setRecentCellId] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const supabase = createClient();

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

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();

    // 인증 상태 변경 구독으로 실시간 동기화
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  // 만다라트 버튼 클릭 핸들러
  const handleMandalartClick = (e: React.MouseEvent) => {
    if (!recentCellId) {
      e.preventDefault();
      toast.error('최근 이용한 만다라트가 없습니다.');
      router.push('/');
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // 중복 클릭 방지
    
    try {
      setIsLoggingOut(true);
      
      // 즉시 UI 상태 초기화 (사용자 경험 개선)
      setUser(null);
      setDrawerOpen(false);
      
      // 기존 auth utils의 signOut 함수 사용 (에러 처리 포함)
      const result = await signOut();
      
      if (!result.success) {
        // 실패 시 사용자 상태 복원
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        toast.error(result.error || '로그아웃 중 오류가 발생했습니다');
        return;
      }
      
      toast.success('성공적으로 로그아웃되었습니다');
      router.push('/');
      
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 실패 시 사용자 상태 복원
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      toast.error('로그아웃 중 예상치 못한 오류가 발생했습니다');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-14 flex items-center justify-around">
        <Link href="/app" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="text-xs mt-1">대시보드</span>
        </Link>
        
        <Link 
          href={recentCellId ? `/app/cell/${recentCellId}` : '#'}
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          onClick={handleMandalartClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-xs mt-1">만다라트</span>
        </Link>

        <Link href="/app/profile" className="flex flex-col items-center text-gray-600 hover:text-blue-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-xs mt-1">프로필</span>
        </Link>

        <button 
          className="flex flex-col items-center text-gray-600 hover:text-blue-600"
          onClick={() => setDrawerOpen(!drawerOpen)}
        >
          <HamburgerIcon isOpen={drawerOpen} />
          <span className="text-xs mt-1">메뉴</span>
        </button>
      </nav>

      {/* 햄버거 메뉴 드로어 */}
      <SlideUpPanel isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} title="메뉴">
        <div className="flex flex-col gap-4">
          <AnimatedButton 
            onClick={() => {
              setDrawerOpen(false);
              router.push('/app/settings');
            }} 
            variant="secondary" 
            className="flex items-center gap-2"
          >
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            설정
          </AnimatedButton>
          {user && (
            <AnimatedButton 
              onClick={handleLogout} 
              variant="secondary" 
              className="flex items-center gap-2"
              disabled={isLoggingOut}
            >
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
            </AnimatedButton>
          )}
        </div>
      </SlideUpPanel>
    </>
  );
};

export default BottomBar; 