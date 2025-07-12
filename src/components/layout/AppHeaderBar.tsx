'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import HeaderBar from '@/components/layout/HeaderBar';
import AnimatedButton from '@/components/animations/AnimatedButton';
import HamburgerIcon from '@/components/animations/HamburgerIcon';
import SlideUpPanel from '@/components/ui/SlideUpPanel';
import { signOut } from '@/lib/auth/utils';
import { toast } from "sonner";
import { getRecentMandalartCell } from '@/utils/cookies';
import { useUser } from '@/hooks/useAuth';

interface AppHeaderBarProps {
  showBackButton?: boolean;
  backHref?: string;
}

const AppHeaderBar: React.FC<AppHeaderBarProps> = ({
  showBackButton = false,
  backHref = "/app"
}) => {
  const user = useUser(); // 전역 인증 상태 사용
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

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

  const handleProfileNavigation = () => {
    router.push('/app/profile');
  };

  return (
    <>
      <HeaderBar
        showBackButton={showBackButton}
        href={backHref}
        title={
          <div className="flex items-center gap-2">
            <span className="sm:inline text-lg font-semibold text-gray-800 truncate">만월</span>
          </div>
        }
        rightElement={
          <div className="flex items-center gap-6">
            {/* 네비게이션 메뉴 (모바일 레이아웃 벗어나면서 표시) */}
            <nav className="hidden sm:flex items-center gap-6">
              <button 
                onClick={() => router.push('/app')}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="text-sm font-medium">대시보드</span>
              </button>
              
              <button 
                onClick={() => {
                  // 쿠키에서 최근 만다라트로 이동 로직
                  const recentCellId = getRecentMandalartCell();
                  if (recentCellId) {
                    router.push(`/app/cell/${recentCellId}`);
                  } else {
                    router.push('/app');
                  }
                }}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="text-sm font-medium">만다라트</span>
              </button>

              <button 
                onClick={handleProfileNavigation}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-sm font-medium">프로필</span>
              </button>

              <button 
                onClick={() => setDrawerOpen(!drawerOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors rounded-lg hover:bg-gray-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span className="text-sm font-medium">메뉴</span>
              </button>
            </nav>

            {/* 햄버거 메뉴 (모바일에서만 표시) */}
            <div className="flex sm:hidden items-center">
              <HamburgerIcon 
                isOpen={drawerOpen} 
                onClick={() => setDrawerOpen(!drawerOpen)}
              />
            </div>
          </div>
        }
      />
      
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

export default AppHeaderBar;